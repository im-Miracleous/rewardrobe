"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Wallet, Calendar, Tag, Info, CheckCircle2, Clock, ShieldCheck, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

type StatusType = 'menunggu_verifikasi' | 'disetujui' | 'ditolak' | 'tersalurkan';

export default function MoneyDetailPage() {
    const router = useRouter();
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [donasi, setDonasi] = useState<any | null>(null);
    const [zoomPhoto, setZoomPhoto] = useState(false);

    useEffect(() => {
        const fetchDetail = async () => {
            setIsLoading(true);
            setError('');
            try {
                const res = await fetch(`/api/donasi-uang/${id}`);
                const result = await res.json();
                if (!res.ok) {
                    setError(result.error || 'Gagal memuat rincian donasi uang.');
                    return;
                }
                setDonasi(result.data);
            } catch (err) {
                console.error(err);
                setError('Terjadi kesalahan koneksi internet.');
            } finally {
                setIsLoading(false);
            }
        };
        if (id) fetchDetail();
    }, [id]);

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
            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black border uppercase tracking-wider ${styles[status]}`}>
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

    if (isLoading) {
        return (
            <div className="text-center py-20 bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center justify-center">
                <Clock className="text-green-600 animate-spin mb-4" size={40} />
                <p className="text-stone-500 font-medium">Memuat rincian donasi...</p>
            </div>
        );
    }

    if (error || !donasi) {
        return (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center text-red-800 flex flex-col items-center justify-center max-w-xl mx-auto">
                <Info size={40} className="mb-3 text-red-500" />
                <h3 className="font-bold text-lg mb-1">Rincian Tidak Ditemukan</h3>
                <p className="text-sm text-red-600 mb-4">{error || 'Data donasi uang tidak tersedia.'}</p>
                <Link href="/dashboard/donatur/history">
                    <Button variant="outline" size="sm">Kembali ke Riwayat</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-[fadeIn_0.3s_ease]">
            {/* Header */}
            <div>
                <Link
                    href="/dashboard/donatur/history"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-stone-500 hover:text-stone-800 transition-colors mb-4"
                >
                    <ArrowLeft size={16} /> Kembali ke Riwayat
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-display font-bold text-stone-900 flex items-center gap-2">
                            <Wallet className="text-green-600" size={24} /> Rincian Donasi Finansial
                        </h1>
                        <p className="text-stone-500 mt-1">ID Transaksi: #{donasi.id}</p>
                    </div>
                    <div>
                        {getStatusBadge(donasi.status)}
                    </div>
                </div>
            </div>

            {/* Content Details */}
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                            <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">Nominal Donasi</div>
                            <h2 className="text-3xl font-display font-black text-green-700 mt-1">
                                Rp {donasi.nominal.toLocaleString('id-ID')}
                            </h2>
                        </div>
                        {donasi.bukti_transfer && (
                            <Button 
                                variant="outline" 
                                onClick={() => setZoomPhoto(true)}
                                className="flex items-center gap-2 shrink-0 border-stone-300 shadow-sm hover:bg-stone-50"
                            >
                                <FileText size={16} className="text-stone-500" /> Lihat Bukti Transfer
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-3 bg-stone-50 border border-stone-100 rounded-xl">
                            <div className="text-[10px] font-bold text-stone-400 uppercase">Mata Uang</div>
                            <div className="text-sm font-bold text-stone-800 mt-0.5">Rupiah (IDR)</div>
                        </div>
                        <div className="p-3 bg-stone-50 border border-stone-100 rounded-xl">
                            <div className="text-[10px] font-bold text-stone-400 uppercase">Tanggal Transfer</div>
                            <div className="text-sm font-bold text-stone-800 mt-0.5">{formatDate(donasi.created_at)}</div>
                        </div>
                    </div>

                    {donasi.campaign && (
                        <div className="p-4 bg-green-50/50 border border-green-100 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <Tag className="text-green-600 shrink-0" size={20} />
                                <div>
                                    <div className="text-[10px] font-bold text-green-700 uppercase">Kampanye Terhubung</div>
                                    <div className="text-sm font-bold text-green-950 font-display">{donasi.campaign.judul}</div>
                                </div>
                            </div>
                            <Link href={`/dashboard/donatur/impact/${donasi.campaign.id}`}>
                                <Button size="sm" variant="outline" className="w-full sm:w-auto">Lihat Detail Kampanye</Button>
                            </Link>
                        </div>
                    )}

                    <div className="space-y-2">
                        <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">Pesan Dari Donatur</div>
                        <p className="text-sm text-stone-600 leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-150 min-h-16">
                            {donasi.catatan ? `"${donasi.catatan}"` : 'Tidak ada pesan tertulis.'}
                        </p>
                    </div>

                    {/* Verification Info */}
                    {donasi.verified_by && (
                        <div className="p-4 bg-stone-50 border border-stone-200/50 rounded-xl flex items-center gap-3">
                            <ShieldCheck className="text-green-600 shrink-0" size={24} />
                            <div>
                                <div className="text-xs font-bold text-stone-700">Diverifikasi oleh {donasi.verifier?.nama}</div>
                                <div className="text-xs text-stone-400">Verifikasi administratif selesai pada {formatDate(donasi.verified_at)}</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Penyaluran Dampak Timeline */}
                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6">
                    <h3 className="font-display font-extrabold text-stone-900 text-base flex items-center gap-2">
                        <FileText className="text-green-600" size={20} /> Alur Verifikasi & Penyaluran Dana
                    </h3>

                    <div className="relative pl-6 space-y-6 border-l-2 border-stone-100">
                        {/* Step 1: Submission */}
                        <div className="relative">
                            <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 bg-green-500 border-green-500" />
                            <div className="p-4 bg-stone-50 border border-stone-100 rounded-xl">
                                <div className="text-xs font-bold text-stone-850">Donasi Diajukan</div>
                                <p className="text-xs text-stone-500 mt-1">Pengajuan donasi dana sebesar Rp {donasi.nominal.toLocaleString('id-ID')} dengan bukti transfer telah dikirim oleh donatur.</p>
                                <div className="text-[10px] text-stone-400 mt-2">{formatDate(donasi.created_at)}</div>
                            </div>
                        </div>

                        {/* Step 2: Verification */}
                        <div className="relative">
                            <span className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 bg-white ${donasi.status !== 'menunggu_verifikasi' ? 'bg-green-500 border-green-500' : 'bg-amber-100 border-amber-500'}`} />
                            <div className="p-4 bg-stone-50 border border-stone-100 rounded-xl">
                                <div className="text-xs font-bold text-stone-850 flex justify-between items-center">
                                    <span>Proses Verifikasi Rekening</span>
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${donasi.status === 'disetujui' || donasi.status === 'tersalurkan' ? 'bg-green-100 text-green-700' : donasi.status === 'ditolak' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {donasi.status === 'disetujui' || donasi.status === 'tersalurkan' ? 'Disetujui' : donasi.status === 'ditolak' ? 'Ditolak' : 'Menunggu Peninjauan'}
                                    </span>
                                </div>
                                <p className="text-xs text-stone-500 mt-1">
                                    {donasi.status === 'menunggu_verifikasi' && 'Bukti transfer sedang dicocokkan dengan rekening koran yayasan.'}
                                    {donasi.status === 'disetujui' && 'Selesai. Dana telah diverifikasi masuk ke kas keuangan yayasan.'}
                                    {donasi.status === 'tersalurkan' && 'Selesai. Dana telah diverifikasi masuk ke kas keuangan yayasan.'}
                                    {donasi.status === 'ditolak' && 'Gagal. Bukti transfer tidak valid atau tidak cocok dengan mutasi rekening.'}
                                </p>
                                {donasi.verified_at && (
                                    <div className="text-[10px] text-stone-400 mt-2">{formatDate(donasi.verified_at)}</div>
                                )}
                            </div>
                        </div>

                        {/* Step 3: Allocation / Impact */}
                        {(donasi.status === 'disetujui' || donasi.status === 'tersalurkan') && (
                            <div className="relative">
                                <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 bg-green-500 border-green-500" />
                                <div className="p-4 bg-stone-50 border border-stone-100 rounded-xl">
                                    <div className="text-xs font-bold text-stone-850 flex items-center gap-1">
                                        <CheckCircle size={14} className="text-green-600" /> Dana Dialokasikan
                                    </div>
                                    <p className="text-xs text-stone-500 mt-1">
                                        {donasi.campaign 
                                            ? `Dana dialokasikan khusus untuk operasional dan kebutuhan kampanye "${donasi.campaign.judul}".`
                                            : 'Dana dialokasikan untuk operasional umum dan pemberdayaan ekosistem ReWardrobe.'
                                        }
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Receipt Modal Zoom */}
            {zoomPhoto && (
                <div 
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease]"
                    onClick={() => setZoomPhoto(false)}
                >
                    <div className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-xl border border-white/10 shadow-2xl bg-stone-900 flex items-center justify-center">
                        <img src={donasi.bukti_transfer} alt="Zoom Bukti Transfer" className="max-w-full max-h-[80vh] object-contain" />
                        <button 
                            onClick={() => setZoomPhoto(false)}
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
