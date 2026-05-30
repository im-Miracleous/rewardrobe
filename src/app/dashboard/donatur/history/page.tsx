"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { History, Shirt, DollarSign, Calendar, Tag, AlertCircle, Info, ExternalLink, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

type StatusType = 'menunggu_verifikasi' | 'disetujui' | 'ditolak' | 'tersalurkan';

export default function DonationHistoryPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<'semua' | 'pakaian' | 'uang'>('semua');
    
    const [clothesList, setClothesList] = useState<any[]>([]);
    const [moneyList, setMoneyList] = useState<any[]>([]);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

    const fetchHistory = async () => {
        setIsLoading(true);
        setError('');
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                router.replace('/auth/login');
                return;
            }
            const user = JSON.parse(userStr);
            const donaturId = user.id;

            if (!donaturId) {
                setError('ID Pengguna tidak ditemukan.');
                setIsLoading(false);
                return;
            }

            const response = await fetch(`/api/donatur/history?donatur_id=${donaturId}`);
            const result = await response.json();

            if (!response.ok) {
                setError(result.error || 'Gagal memuat riwayat donasi.');
                return;
            }

            if (result.data) {
                setClothesList(result.data.barang || []);
                setMoneyList(result.data.uang || []);
            }
        } catch (err) {
            console.error('Fetch history error:', err);
            setError('Terjadi kesalahan koneksi internet.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [router]);

    const getStatusBadge = (status: StatusType) => {
        const styles = {
            menunggu_verifikasi: 'bg-amber-50 text-amber-700 border-amber-200',
            disetujui: 'bg-green-50 text-green-700 border-green-200',
            ditolak: 'bg-red-50 text-red-700 border-red-200',
            tersalurkan: 'bg-blue-50 text-blue-700 border-blue-200',
        };

        const labels = {
            menunggu_verifikasi: 'Menunggu Verifikasi',
            disetujui: 'Disetujui',
            ditolak: 'Ditolak',
            tersalurkan: 'Tersalurkan',
        };

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${styles[status]}`}>
                {labels[status]}
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

    // Combine and sort both lists
    const combinedHistory = [
        ...clothesList.map(item => ({ ...item, type: 'pakaian' as const })),
        ...moneyList.map(item => ({ ...item, type: 'uang' as const }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const filteredHistory = combinedHistory.filter(item => {
        if (filter === 'semua') return true;
        return item.type === filter;
    });

    return (
        <div className="space-y-8 animate-[fadeIn_0.3s_ease]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-stone-900 flex items-center gap-2">
                        <History className="text-green-600" size={24} /> Riwayat Donasi Anda
                    </h1>
                    <p className="text-stone-500 mt-1">Pantau status verifikasi dan penyaluran kontribusi sosial Anda.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={fetchHistory}
                        disabled={isLoading}
                        className="p-3 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors text-stone-600 disabled:opacity-50"
                        title="Segarkan data"
                    >
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <Link href="/dashboard/donatur/donate">
                        <Button className="shadow-lg shadow-green-600/20">Donasi Baru</Button>
                    </Link>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-stone-200 pb-px">
                {(['semua', 'pakaian', 'uang'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`pb-3 px-4 text-sm font-bold font-display border-b-2 transition-all capitalize -mb-px ${filter === tab ? 'border-green-600 text-green-700' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
                    >
                        {tab === 'semua' ? 'Semua Donasi' : tab === 'pakaian' ? 'Donasi Pakaian' : 'Donasi Uang'}
                    </button>
                ))}
            </div>

            {/* Content States */}
            {isLoading ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center justify-center">
                    <RefreshCw size={40} className="text-green-600 animate-spin mb-4" />
                    <p className="text-stone-500 font-medium">Memuat riwayat donasi...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center text-red-800 flex flex-col items-center justify-center">
                    <AlertCircle size={40} className="mb-3 text-red-500" />
                    <h3 className="font-bold text-lg mb-1">Gagal Memuat Riwayat</h3>
                    <p className="text-sm text-red-600 mb-4">{error}</p>
                    <Button variant="outline" size="sm" onClick={fetchHistory}>Coba Lagi</Button>
                </div>
            ) : filteredHistory.length === 0 ? (
                <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-16 text-center max-w-xl mx-auto flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-6">
                        <History size={28} className="text-stone-400" />
                    </div>
                    <h3 className="font-display font-bold text-lg text-stone-900 mb-2">Belum Ada Riwayat Donasi</h3>
                    <p className="text-stone-500 text-sm mb-8">
                        Anda belum melakukan donasi {filter !== 'semua' ? filter : ''} dalam akun ini. Mulai bagikan kebaikan sekarang juga!
                    </p>
                    <Link href="/dashboard/donatur/donate">
                        <Button>Mulai Donasi Pertamamu</Button>
                    </Link>
                </div>
            ) : (
                /* History List */
                <div className="grid grid-cols-1 gap-6">
                    {filteredHistory.map((item) => (
                        <Link 
                            key={`${item.type}-${item.id}`} 
                            href={`/dashboard/donatur/history/${item.type}/${item.id}`}
                            className="bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md hover:border-green-300 transition-all overflow-hidden flex flex-col md:flex-row group"
                        >
                            {/* Visual Preview */}
                            <div className="w-full md:w-48 h-40 md:h-auto bg-stone-100 relative shrink-0">
                                {item.type === 'pakaian' ? (
                                    item.foto_url ? (
                                        <img 
                                            src={item.foto_url} 
                                            alt={item.kategori || 'Pakaian'} 
                                            className="w-full h-full object-cover cursor-pointer"
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedPhoto(item.foto_url); }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-stone-400">
                                            <Shirt size={40} />
                                        </div>
                                    )
                                ) : (
                                    item.bukti_transfer ? (
                                        <img 
                                            src={item.bukti_transfer} 
                                            alt="Bukti Transfer" 
                                            className="w-full h-full object-cover cursor-pointer"
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedPhoto(item.bukti_transfer); }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-stone-400">
                                            <DollarSign size={40} />
                                        </div>
                                    )
                                )}
                                <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
                                    {item.type === 'pakaian' ? (
                                        <><Shirt size={10} /> Pakaian</>
                                    ) : (
                                        <><DollarSign size={10} /> Dana</>
                                    )}
                                </div>
                            </div>

                            {/* Details Content */}
                            <div className="p-6 flex-1 flex flex-col justify-between">
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 text-stone-400 text-xs font-semibold">
                                            <Calendar size={14} />
                                            {formatDate(item.created_at)}
                                        </div>
                                        {getStatusBadge(item.status)}
                                    </div>

                                    <div>
                                        {item.type === 'pakaian' ? (
                                            <h3 className="font-display font-bold text-stone-900 text-lg group-hover:text-green-700 transition-colors">
                                                {item.judul || `Donasi Pakaian - ${item.kategori || 'Lainnya'}`}
                                            </h3>
                                        ) : (
                                            <h3 className="font-display font-extrabold text-green-700 text-xl group-hover:text-green-800 transition-colors">
                                                Rp {item.nominal.toLocaleString('id-ID')}
                                            </h3>
                                        )}

                                        {item.campaign && (
                                            <div className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2.5 py-0.5 rounded-md border border-green-100">
                                                <Tag size={12} /> Kampanye: {item.campaign.judul}
                                            </div>
                                        )}
                                    </div>

                                    {/* Description / Notes */}
                                    <p className="text-stone-600 text-sm line-clamp-2 bg-stone-50/50 p-3 rounded-lg border border-stone-100">
                                        {item.type === 'pakaian' ? (
                                            item.deskripsi
                                        ) : (
                                            item.catatan ? `Pesan: "${item.catatan}"` : 'Donasi finansial tanpa catatan tambahan.'
                                        )}
                                    </p>
                                </div>

                                {/* Bottom Info Footer */}
                                {item.status === 'menunggu_verifikasi' && (
                                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-1.5 text-stone-400 text-xs">
                                        <Info size={12} /> Menunggu tim ReWardrobe meninjau donasi Anda.
                                    </div>
                                )}
                                {item.status === 'disetujui' && (
                                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-1.5 text-green-600 text-xs font-semibold">
                                        <CheckCircle size={12} className="text-green-500" /> Donasi telah diverifikasi dan siap disalurkan. Terima kasih!
                                    </div>
                                )}
                                {item.status === 'tersalurkan' && (
                                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-1.5 text-blue-600 text-xs font-semibold">
                                        <CheckCircle size={12} className="text-blue-500" /> Donasi telah disalurkan penuh kepada penerima manfaat.
                                    </div>
                                )}
                                {item.status === 'ditolak' && (
                                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center gap-1.5 text-red-600 text-xs font-semibold">
                                        <AlertCircle size={12} className="text-red-500" /> Pengajuan donasi ditolak. Silakan periksa kembali ketetapan kelayakan.
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Photo Modal Preview */}
            {selectedPhoto && (
                <div 
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease]"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <div className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-xl border border-white/10 shadow-2xl bg-stone-900 flex items-center justify-center">
                        <img src={selectedPhoto} alt="Pratinjau penuh" className="max-w-full max-h-[80vh] object-contain" />
                        <button 
                            onClick={() => setSelectedPhoto(null)}
                            className="absolute top-4 right-4 bg-white/25 hover:bg-white/40 transition-colors text-white font-bold px-3 py-1.5 rounded-full text-xs"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
