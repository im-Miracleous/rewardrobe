"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Shirt, Info, Clock, Truck, ShieldCheck, Package, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { STATUS_BARANG_BADGE, STATUS_BARANG_LABEL, type StatusBarang } from '@/lib/statusBarang';

export default function ClothingDetailPage() {
    const router = useRouter();
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [barang, setBarang] = useState<any | null>(null);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    // Konfirmasi Pengiriman (2.6) State
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [shipMetode, setShipMetode] = useState<'drop_off' | 'kurir'>('drop_off');
    const [shipKurir, setShipKurir] = useState('');
    const [shipResi, setShipResi] = useState('');
    const [shipSubmitting, setShipSubmitting] = useState(false);
    const [shipError, setShipError] = useState('');

    const fetchDetail = async () => {
        setIsLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/barang-donasi/${id}`);
            const result = await res.json();
            if (!res.ok) {
                setError(result.error || 'Gagal memuat rincian donasi pakaian.');
                return;
            }
            setBarang(result.data);
        } catch (err) {
            console.error(err);
            setError('Terjadi kesalahan koneksi internet.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchDetail();
    }, [id]);

    const pendingShipment = (barang?.pengiriman || []).find(
        (p: any) => p.tipe === 'donatur_ke_admin' && p.status === 'disiapkan'
    );

    const openConfirm = () => {
        setShipMetode('drop_off');
        setShipKurir('');
        setShipResi('');
        setShipError('');
        setConfirmOpen(true);
    };

    const submitConfirm = async () => {
        if (!pendingShipment) return;
        setShipSubmitting(true);
        setShipError('');
        try {
            const res = await fetch(`/api/donatur/pengiriman/${pendingShipment.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    metode: shipMetode,
                    kurir: shipMetode === 'kurir' ? shipKurir : undefined,
                    resi: shipMetode === 'kurir' ? shipResi : undefined,
                }),
            });
            const json = await res.json();
            if (!res.ok) {
                setShipError(json.error || 'Gagal mengonfirmasi pengiriman.');
                return;
            }
            setConfirmOpen(false);
            await fetchDetail();
        } catch {
            setShipError('Terjadi kesalahan koneksi.');
        } finally {
            setShipSubmitting(false);
        }
    };

    const getStatusBadge = (status: StatusBarang) => {
        return (
            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black border uppercase tracking-wider ${STATUS_BARANG_BADGE[status] ?? ''}`}>
                {STATUS_BARANG_LABEL[status] ?? status}
            </span>
        );
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatKondisi = (val: string) => {
        switch (val) {
            case 'baik': return 'Baik / Layak Pakai';
            case 'fair': return 'Fair / Cukup Layak';
            case 'rusak': return 'Perlu Daur Ulang / Perbaikan';
            default: return val;
        }
    };

    if (isLoading) {
        return (
            <div className="text-center py-20 bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center justify-center">
                <Clock className="text-green-600 animate-spin mb-4" size={40} />
                <p className="text-stone-500 font-medium">Memuat rincian pakaian...</p>
            </div>
        );
    }

    if (error || !barang) {
        return (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center text-red-800 flex flex-col items-center justify-center max-w-xl mx-auto">
                <Info size={40} className="mb-3 text-red-500" />
                <h3 className="font-bold text-lg mb-1">Rincian Tidak Ditemukan</h3>
                <p className="text-sm text-red-600 mb-4">{error || 'Data donasi pakaian tidak tersedia.'}</p>
                <Link href="/dashboard/donatur/donasi-saya">
                    <Button variant="outline" size="sm">Kembali ke Donasi Saya</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-[fadeIn_0.3s_ease]">
            {/* Header */}
            <div>
                <Link
                    href="/dashboard/donatur/donasi-saya"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-stone-500 hover:text-stone-800 transition-colors mb-4"
                >
                    <ArrowLeft size={16} /> Kembali ke Donasi Saya
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-display font-bold text-stone-900 flex items-center gap-2">
                            <Shirt className="text-green-600" size={24} /> Rincian Donasi Pakaian
                        </h1>
                        <p className="text-stone-500 mt-1">ID Donasi: #{barang.id}</p>
                    </div>
                    <div>
                        {getStatusBadge(barang.status)}
                    </div>
                </div>
            </div>

            {/* Content Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Visual Image Preview */}
                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col items-center justify-center min-h-[300px] h-full relative group">
                    {barang.foto_url ? (
                        <>
                            <img src={barang.foto_url} alt="Foto Pakaian" className="absolute inset-0 w-full h-full object-cover" />
                            <button 
                                onClick={() => setIsImageModalOpen(true)}
                                type="button"
                                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 shadow-sm hover:text-green-600 hover:border-green-300 transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100 flex items-center gap-1.5"
                            >
                                Lihat Gambar
                            </button>
                        </>
                    ) : (
                        <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center text-stone-400">
                            <Shirt size={40} />
                        </div>
                    )}
                </div>

                {/* Text Metadata */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6">
                        <div>
                            <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">Informasi Barang</div>
                            <h2 className="text-xl font-display font-extrabold text-stone-900 mt-1">
                                {barang.judul || `Pakaian - ${barang.kategori}`}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-3 bg-stone-50 border border-stone-100 rounded-xl">
                                <div className="text-[10px] font-bold text-stone-400 uppercase">Tipe/Kategori Pakaian</div>
                                <div className="text-sm font-bold text-stone-800 mt-0.5">{barang.kategori || '-'}</div>
                            </div>
                            <div className="p-3 bg-stone-50 border border-stone-100 rounded-xl">
                                <div className="text-[10px] font-bold text-stone-400 uppercase">Kondisi (Donatur)</div>
                                <div className="text-sm font-bold text-stone-800 mt-0.5">{formatKondisi(barang.kondisi_user)}</div>
                            </div>
                            <div className="p-3 bg-stone-50 border border-stone-100 rounded-xl">
                                <div className="text-[10px] font-bold text-stone-400 uppercase">Perkiraan Berat</div>
                                <div className="text-sm font-bold text-stone-800 mt-0.5">{barang.berat_kg ? `${barang.berat_kg} Kg` : 'Belum diukur'}</div>
                            </div>
                            <div className="p-3 bg-stone-50 border border-stone-100 rounded-xl">
                                <div className="text-[10px] font-bold text-stone-400 uppercase">Tanggal Diajukan</div>
                                <div className="text-sm font-bold text-stone-800 mt-0.5">{formatDate(barang.created_at)}</div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">Deskripsi / Catatan Donasi</div>
                            <p className="text-sm text-stone-600 leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-150">
                                {barang.deskripsi}
                            </p>
                        </div>

                        {/* Verification Info */}
                        {barang.verified_by && (
                            <div className="p-4 bg-stone-50 border border-stone-200/50 rounded-xl flex items-center gap-3">
                                <ShieldCheck className="text-green-600 shrink-0" size={24} />
                                <div>
                                    <div className="text-xs font-bold text-stone-700">Diverifikasi oleh {barang.verifier?.nama}</div>
                                    <div className="text-xs text-stone-400">Status verifikasi diselesaikan pada {formatDate(barang.verified_at)}</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Logistics Timeline */}
                    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h3 className="font-display font-extrabold text-stone-900 text-base flex items-center gap-2">
                                <Truck className="text-green-600" size={20} /> Status Logistik & Pengiriman
                            </h3>
                            {pendingShipment && (
                                <Button size="sm" onClick={openConfirm} className="shrink-0">
                                    <span className="inline-flex items-center gap-1.5"><Truck size={14} /> Konfirmasi Pengiriman</span>
                                </Button>
                            )}
                        </div>
                        {pendingShipment && (
                            <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                                <Info size={14} className="mt-0.5 shrink-0" />
                                <span>Sudah mengirim barang ini ke ReWardrobe? Konfirmasikan agar admin dapat memprosesnya.</span>
                            </div>
                        )}

                        {barang.pengiriman && barang.pengiriman.length > 0 ? (
                            <div className="relative pl-6 space-y-6 border-l-2 border-stone-100">
                                {barang.pengiriman.map((ship: any) => (
                                    <div key={ship.id} className="relative">
                                        {/* Timeline Dot */}
                                        <span className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 bg-white ${ship.status === 'terkirim' ? 'border-green-500 bg-green-50' : 'border-blue-500 bg-blue-50'}`} />

                                        <div className="p-4 bg-stone-50 border border-stone-100 rounded-xl space-y-2">
                                            <div className="flex flex-wrap justify-between items-center gap-2">
                                                <div className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                                                    <Package size={14} className="text-stone-500" />
                                                    {ship.tipe === 'donatur_ke_admin' ? 'Pengiriman ke Gudang Admin' : 'Penyaluran ke Penerima Manfaat'}
                                                </div>
                                                <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${ship.status === 'terkirim' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {ship.status === 'terkirim' ? 'Terkirim' : ship.status === 'dalam_pengiriman' ? 'Dalam Pengiriman' : 'Disiapkan'}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-xs text-stone-500">
                                                <div>Kurir: <span className="font-bold text-stone-700">{ship.kurir || '-'}</span></div>
                                                <div>No Resi: <span className="font-bold text-stone-700">{ship.resi || '-'}</span></div>
                                            </div>
                                            
                                            <div className="text-[10px] text-stone-400">
                                                Pembaruan Terakhir: {formatDate(ship.updated_at)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 border border-dashed border-stone-200 rounded-xl bg-stone-50/50 text-center text-sm text-stone-500 flex flex-col items-center justify-center">
                                <Clock size={28} className="text-stone-300 mb-2" />
                                <div className="font-bold text-stone-700">Belum ada pengiriman diproses</div>
                                <p className="text-xs text-stone-400 mt-1">Menunggu tim admin memverifikasi kelayakan pakaian untuk menentukan kurir penjemputan.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Konfirmasi Pengiriman Modal (2.6) */}
            {confirmOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease]"
                    onClick={() => !shipSubmitting && setConfirmOpen(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-md p-6 space-y-5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                                <CheckCircle2 size={20} />
                            </div>
                            <div>
                                <h3 className="font-display font-bold text-lg text-stone-900">Konfirmasi Pengiriman</h3>
                                <p className="text-sm text-stone-500 mt-0.5">
                                    Konfirmasi bahwa Anda telah mengirim barang ini ke ReWardrobe.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider">Metode Pengiriman</div>
                            <div className="grid grid-cols-2 gap-2">
                                {([
                                    { key: 'drop_off', label: 'Antar Sendiri / Drop-off' },
                                    { key: 'kurir', label: 'Kirim via Kurir' },
                                ] as const).map((m) => (
                                    <button
                                        key={m.key}
                                        type="button"
                                        onClick={() => setShipMetode(m.key)}
                                        className={`px-3 py-2.5 rounded-xl text-sm font-bold border transition-all ${shipMetode === m.key ? 'border-green-600 bg-green-50 text-green-700' : 'border-stone-200 text-stone-600 hover:border-stone-300'}`}
                                    >
                                        {m.label}
                                    </button>
                                ))}
                            </div>

                            {shipMetode === 'kurir' && (
                                <div className="space-y-3 pt-1">
                                    <div>
                                        <label className="text-xs font-semibold text-stone-500">Nama Kurir (opsional)</label>
                                        <input
                                            type="text"
                                            value={shipKurir}
                                            onChange={(e) => setShipKurir(e.target.value)}
                                            placeholder="mis. JNE, J&T, GoSend"
                                            className="mt-1 w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-stone-50 focus:bg-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-stone-500">No. Resi (opsional)</label>
                                        <input
                                            type="text"
                                            value={shipResi}
                                            onChange={(e) => setShipResi(e.target.value)}
                                            placeholder="mis. JNE1234567890"
                                            className="mt-1 w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-stone-50 focus:bg-white"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {shipError && (
                            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{shipError}</div>
                        )}

                        <div className="flex justify-end gap-2 pt-1">
                            <Button variant="outline" size="sm" onClick={() => setConfirmOpen(false)} disabled={shipSubmitting}>
                                Batal
                            </Button>
                            <Button size="sm" onClick={submitConfirm} disabled={shipSubmitting}>
                                {shipSubmitting ? 'Menyimpan...' : 'Konfirmasi Kirim'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Modal */}
            {isImageModalOpen && (
                <div 
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease]"
                    onClick={() => setIsImageModalOpen(false)}
                >
                    <div className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-xl border border-white/10 shadow-2xl bg-stone-900 flex items-center justify-center">
                        <button 
                            className="absolute top-4 right-4 bg-stone-900/60 hover:bg-stone-900/80 backdrop-blur-md px-4 py-2 rounded-full text-white font-bold transition-colors text-xs z-10"
                            onClick={(e) => { e.stopPropagation(); setIsImageModalOpen(false); }}
                        >
                            Tutup
                        </button>
                        <img 
                            src={barang.foto_url} 
                            alt="Foto Pakaian Full" 
                            className="w-auto h-auto max-w-full max-h-[85vh] object-contain"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
