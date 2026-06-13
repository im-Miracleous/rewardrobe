"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Package, Loader2, Shirt, MapPin, Truck, CheckCircle2, X } from 'lucide-react';

interface Pengiriman {
    id: number;
    kurir: string | null;
    resi: string | null;
    status: 'disiapkan' | 'dalam_pengiriman' | 'terkirim';
    created_at: string;
    updated_at: string;
}

interface PermintaanItem {
    id: number;
    status: 'menunggu' | 'diterima' | 'ditolak';
    pesan: string | null;
    created_at: string;
    barang: {
        id: number;
        kategori: string | null;
        kondisi_user: string;
        deskripsi: string;
        foto_url: string | null;
        donatur: { id: number; nama: string; kota: string | null };
        pengiriman: Pengiriman[];
    };
}

function StatusBadge({ status }: { status: PermintaanItem['status'] }) {
    if (status === 'menunggu') return <Badge color="yellow">Menunggu</Badge>;
    if (status === 'diterima') return <Badge color="green">Diterima</Badge>;
    return <Badge color="red">Ditolak</Badge>;
}

function ShipmentStatusBadge({ status }: { status: Pengiriman['status'] }) {
    if (status === 'terkirim') return <Badge color="green">Terkirim</Badge>;
    if (status === 'dalam_pengiriman') return <Badge color="blue">Dalam Pengiriman</Badge>;
    return <Badge color="stone">Disiapkan</Badge>;
}

export default function PenerimaPermintaanPage() {
    const [list, setList] = useState<PermintaanItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [tabFilter, setTabFilter] = useState<'semua' | 'menunggu' | 'diterima' | 'ditolak'>('semua');
    const [cancellingId, setCancellingId] = useState<number | null>(null);
    const [confirmingId, setConfirmingId] = useState<number | null>(null);

    const fetchPermintaan = useCallback(async () => {
        setIsLoading(true);
        try {
            const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
            const user = userStr ? JSON.parse(userStr) : null;
            if (!user?.id) return;

            const res = await fetch(`/api/permintaan?penerima_id=${user.id}`);
            const json = await res.json();
            if (json.data) setList(json.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPermintaan();
    }, [fetchPermintaan]);

    const handleCancel = async (id: number) => {
        if (!confirm('Yakin ingin membatalkan permintaan ini?')) return;
        setCancellingId(id);
        try {
            const res = await fetch(`/api/permintaan/${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (res.ok) {
                setList(prev => prev.filter(p => p.id !== id));
            } else {
                alert(json.error || 'Gagal membatalkan permintaan');
            }
        } catch {
            alert('Terjadi kesalahan');
        } finally {
            setCancellingId(null);
        }
    };

    const handleKonfirmasi = async (id: number) => {
        setConfirmingId(id);
        try {
            const res = await fetch(`/api/permintaan/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ konfirmasi: true }),
            });
            const json = await res.json();
            if (res.ok) {
                // Refresh list to get updated pesan
                await fetchPermintaan();
            } else {
                alert(json.error || 'Gagal mengkonfirmasi penerimaan');
            }
        } catch {
            alert('Terjadi kesalahan');
        } finally {
            setConfirmingId(null);
        }
    };

    const filtered = tabFilter === 'semua' ? list : list.filter(p => p.status === tabFilter);

    const tabs: { key: typeof tabFilter; label: string }[] = [
        { key: 'semua', label: 'Semua' },
        { key: 'menunggu', label: 'Menunggu' },
        { key: 'diterima', label: 'Diterima' },
        { key: 'ditolak', label: 'Ditolak' },
    ];

    return (
        <div className="space-y-8 animate-[fadeIn_0.3s_ease]">
            <div>
                <h1 className="text-2xl font-display font-bold text-stone-900">Permintaan Saya</h1>
                <p className="text-stone-500 mt-1">Riwayat dan status permintaan barang yang Anda ajukan.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-stone-200">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setTabFilter(tab.key)}
                        className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                            tabFilter === tab.key
                                ? 'border-green-600 text-green-700'
                                : 'border-transparent text-stone-500 hover:text-stone-800'
                        }`}
                    >
                        {tab.label}
                        {tab.key !== 'semua' && (
                            <span className="ml-1.5 text-xs bg-stone-100 text-stone-600 rounded-full px-1.5 py-0.5">
                                {list.filter(p => p.status === tab.key).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-stone-400">
                    <Loader2 size={40} className="animate-spin mb-3" />
                    <p className="text-sm font-semibold">Memuat permintaan...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-stone-400">
                    <Package size={40} className="mb-3" />
                    <p className="text-sm font-semibold">Belum ada permintaan.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((item) => {
                        const shipment = item.barang.pengiriman[0] ?? null;
                        const isRejected = item.status === 'ditolak';
                        const adminNoteMatch = item.pesan?.split('CATATAN ADMIN: ');
                        const adminNote = adminNoteMatch && adminNoteMatch.length > 1 ? adminNoteMatch[1].trim() : undefined;
                        const sudahDikonfirmasi = item.pesan?.includes('DIKONFIRMASI PENERIMA:') ?? false;
                        const isDelivered = shipment?.status === 'terkirim';

                        return (
                            <div key={item.id} className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
                                <div className="flex gap-4 p-5">
                                    {/* Foto */}
                                    <div className="w-20 h-20 flex-shrink-0 rounded-xl bg-stone-50 flex items-center justify-center overflow-hidden border border-stone-100">
                                        {item.barang.foto_url ? (
                                            <img src={item.barang.foto_url} alt={item.barang.kategori || 'barang'} className="w-full h-full object-cover" />
                                        ) : (
                                            <Shirt size={28} className="text-stone-300" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h3 className="font-bold text-stone-900 truncate">
                                                {item.barang.kategori || 'Pakaian'}
                                            </h3>
                                            <StatusBadge status={item.status} />
                                        </div>
                                        <div className="text-xs text-stone-500 flex items-center gap-1 mb-1">
                                            <MapPin size={11} />
                                            {item.barang.donatur.kota || 'Lokasi tidak tersedia'}
                                        </div>
                                        <p className="text-xs text-stone-500">
                                            Diajukan: {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                {/* Catatan penolakan */}
                                {isRejected && adminNote && (
                                    <div className="mx-5 mb-4 bg-red-50 border border-red-100 rounded-xl p-3">
                                        <p className="text-xs font-bold text-red-700 mb-0.5">Alasan Penolakan</p>
                                        <p className="text-xs text-red-600">{adminNote}</p>
                                    </div>
                                )}

                                {/* Info pengiriman */}
                                {item.status === 'diterima' && shipment && (
                                    <div className="mx-5 mb-4 bg-stone-50 border border-stone-100 rounded-xl p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Truck size={14} className="text-stone-500" />
                                            <p className="text-xs font-bold text-stone-700">Info Pengiriman</p>
                                            <ShipmentStatusBadge status={shipment.status} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-stone-600">
                                            <span className="text-stone-400">Kurir</span>
                                            <span className="font-medium">{shipment.kurir || '—'}</span>
                                            <span className="text-stone-400">No. Resi</span>
                                            <span className="font-medium font-mono">{shipment.resi || '—'}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Diterima tapi belum ada pengiriman */}
                                {item.status === 'diterima' && !shipment && (
                                    <div className="mx-5 mb-4 bg-green-50 border border-green-100 rounded-xl p-3">
                                        <p className="text-xs text-green-700 font-medium">Permintaan diterima — Admin sedang menyiapkan pengiriman.</p>
                                    </div>
                                )}

                                {/* Action buttons */}
                                {(item.status === 'menunggu' || (item.status === 'diterima' && isDelivered && !sudahDikonfirmasi)) && (
                                    <div className="px-5 pb-4 flex gap-2 justify-end">
                                        {item.status === 'menunggu' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleCancel(item.id)}
                                                disabled={cancellingId === item.id}
                                            >
                                                {cancellingId === item.id ? (
                                                    <><Loader2 size={14} className="animate-spin" /> Membatalkan...</>
                                                ) : (
                                                    <><X size={14} /> Batalkan</>
                                                )}
                                            </Button>
                                        )}
                                        {item.status === 'diterima' && isDelivered && !sudahDikonfirmasi && (
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => handleKonfirmasi(item.id)}
                                                disabled={confirmingId === item.id}
                                            >
                                                {confirmingId === item.id ? (
                                                    <><Loader2 size={14} className="animate-spin" /> Mengkonfirmasi...</>
                                                ) : (
                                                    <><CheckCircle2 size={14} /> Konfirmasi Terima</>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {/* Sudah dikonfirmasi */}
                                {sudahDikonfirmasi && (
                                    <div className="px-5 pb-4 flex justify-end">
                                        <div className="flex items-center gap-1.5 text-green-600 text-xs font-bold">
                                            <CheckCircle2 size={14} /> Barang sudah diterima
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
