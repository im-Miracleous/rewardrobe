"use client";
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Search, Shirt, X, Loader2, Package, MapPin, CheckCircle } from 'lucide-react';

interface BarangItem {
    id: number;
    kategori: string | null;
    kondisi_user: string;
    deskripsi: string;
    foto_url: string | null;
    berat_kg: number | null;
    donatur: { id: number; nama: string; kota: string | null };
}

function getKondisiBadge(kondisi: string) {
    if (kondisi === 'baik') return <Badge color="green">Baik</Badge>;
    if (kondisi === 'fair') return <Badge color="yellow">Fair</Badge>;
    return <Badge color="stone">Perlu Perbaikan</Badge>;
}

export default function PenerimaDash() {
    const [barangList, setBarangList] = useState<BarangItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [kategoriFilter, setKategoriFilter] = useState('');
    const [selectedBarang, setSelectedBarang] = useState<BarangItem | null>(null);
    const [pesan, setPesan] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    // barang_id yang sudah pernah diminta (menunggu/diterima) — diisi dari API saat mount
    const [requestedIds, setRequestedIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            try {
                const [barangRes, userStr] = await Promise.all([
                    fetch('/api/barang-donasi?status=terkirim'),
                    Promise.resolve(typeof window !== 'undefined' ? localStorage.getItem('user') : null),
                ]);

                const barangJson = await barangRes.json();
                if (barangJson.data) setBarangList(barangJson.data);

                if (userStr) {
                    const user = JSON.parse(userStr);
                    if (user?.id) {
                        const permintaanRes = await fetch(`/api/permintaan?penerima_id=${user.id}`);
                        const permintaanJson = await permintaanRes.json();
                        if (permintaanJson.data) {
                            const activeIds = new Set<number>(
                                permintaanJson.data
                                    .filter((p: { status: string; barang: { id: number } }) =>
                                        p.status === 'menunggu' || p.status === 'diterima'
                                    )
                                    .map((p: { barang: { id: number } }) => p.barang.id)
                            );
                            setRequestedIds(activeIds);
                        }
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, []);

    const filtered = barangList.filter((item) => {
        const q = searchQuery.toLowerCase();
        const matchSearch = !q || item.kategori?.toLowerCase().includes(q) || item.deskripsi.toLowerCase().includes(q) || item.donatur.kota?.toLowerCase().includes(q);
        const matchKategori = !kategoriFilter || item.kategori === kategoriFilter;
        return matchSearch && matchKategori;
    });

    const kategoriOptions = Array.from(new Set(barangList.map(b => b.kategori).filter(Boolean))) as string[];

    const handleRequest = async () => {
        if (!selectedBarang) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/permintaan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ barang_id: selectedBarang.id, pesan }),
            });
            const json = await res.json();
            if (res.ok) {
                setRequestedIds(prev => new Set(prev).add(selectedBarang.id));
                setSelectedBarang(null);
                setPesan('');
            } else {
                alert(json.error || 'Gagal mengajukan permintaan');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 animate-[fadeIn_0.3s_ease]">
            <div>
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-display font-bold text-stone-900">Katalog Donasi</h1>
                    <Badge color="blue">Batas Pengajuan: 3 Barang / 7 Hari</Badge>
                </div>
                <p className="text-stone-500 mt-1">Pilih barang yang sesuai dengan kebutuhan Anda.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari pakaian..."
                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    />
                </div>
                <select
                    value={kategoriFilter}
                    onChange={(e) => setKategoriFilter(e.target.value)}
                    className="rounded-xl border border-stone-200 px-4 py-3 text-sm font-semibold text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 cursor-pointer"
                >
                    <option value="">Semua Kategori</option>
                    {kategoriOptions.map(k => <option key={k} value={k}>{k}</option>)}
                </select>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-stone-400">
                    <Loader2 size={40} className="animate-spin mb-3" />
                    <p className="text-sm font-semibold">Memuat katalog...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-stone-400">
                    <Package size={40} className="mb-3" />
                    <p className="text-sm font-semibold">Tidak ada barang tersedia saat ini.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filtered.map((item) => (
                        <div key={item.id} className="bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group">
                            <div className="h-44 bg-stone-50 flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                                {item.foto_url ? (
                                    <img src={item.foto_url} alt={item.kategori || 'barang'} className="w-full h-full object-cover" />
                                ) : (
                                    <Shirt size={48} className="text-stone-300" />
                                )}
                            </div>
                            <div className="p-5 flex flex-col flex-1 border-t border-stone-100">
                                <div className="mb-2">{getKondisiBadge(item.kondisi_user)}</div>
                                <h3 className="font-bold text-stone-900 mb-1">{item.kategori || 'Pakaian'}</h3>
                                <div className="text-xs text-stone-500 mb-1 flex items-center gap-1">
                                    <MapPin size={11} />
                                    {item.donatur.kota || 'Lokasi tidak tersedia'}
                                </div>
                                <div className="mt-auto">
                                    {requestedIds.has(item.id) ? (
                                        <div className="flex items-center gap-2 justify-center py-2 text-green-600 text-sm font-bold">
                                            <CheckCircle size={16} /> Sudah Diminta
                                        </div>
                                    ) : (
                                        <Button className="w-full" onClick={() => { setSelectedBarang(item); setPesan(''); }}>
                                            Minta Barang
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Request Modal */}
            {selectedBarang && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedBarang(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border border-stone-200 animate-[fadeIn_0.2s_ease]">
                        <div className="flex items-center justify-between p-6 border-b border-stone-100">
                            <div>
                                <h2 className="text-lg font-display font-bold text-stone-900">Ajukan Permintaan</h2>
                                <p className="text-sm text-stone-500 mt-0.5">{selectedBarang.kategori || 'Pakaian'} • {selectedBarang.donatur.kota}</p>
                            </div>
                            <button onClick={() => setSelectedBarang(null)} className="w-9 h-9 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-100 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-stone-50 rounded-xl p-4 text-sm text-stone-600">
                                <p className="font-semibold text-stone-800 mb-1">Detail Barang</p>
                                <p>{selectedBarang.deskripsi}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                                    Pesan (Opsional)
                                </label>
                                <textarea
                                    value={pesan}
                                    onChange={(e) => setPesan(e.target.value)}
                                    placeholder="Ceritakan kebutuhan Anda atau informasi tambahan..."
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-all resize-none"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-stone-100">
                            <Button variant="ghost" size="md" onClick={() => setSelectedBarang(null)} disabled={isSubmitting}>Batal</Button>
                            <Button variant="primary" size="md" onClick={handleRequest} disabled={isSubmitting}>
                                {isSubmitting ? <><Loader2 size={15} className="animate-spin" /> Mengirim...</> : 'Kirim Permintaan'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
