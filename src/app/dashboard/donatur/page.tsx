"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shirt, Leaf, Trophy, Upload, CheckCircle, Clock, XCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function DonaturDash() {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        total_poin: 0,
        total_limbah_kg: 0,
        total_pakaian_item: 0,
        total_uang_donasi: 0,
        peringkat: '-',
    });
    const [latestDonation, setLatestDonation] = useState<any | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const userStr = localStorage.getItem('user');
                if (!userStr) return;
                const user = JSON.parse(userStr);
                const donaturId = user.id;

                if (!donaturId) return;

                // Fetch stats
                const statsRes = await fetch(`/api/donatur/stats?donatur_id=${donaturId}`);
                const statsResult = await statsRes.json();
                if (statsResult.data) {
                    setStats(statsResult.data);
                }

                // Fetch history to get latest donation
                const historyRes = await fetch(`/api/donatur/history?donatur_id=${donaturId}`);
                const historyResult = await historyRes.json();
                if (historyResult.data) {
                    const combined = [
                        ... (historyResult.data.barang || []).map((b: any) => ({ ...b, type: 'pakaian' })),
                        ... (historyResult.data.uang || []).map((u: any) => ({ ...u, type: 'uang' }))
                    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

                    if (combined.length > 0) {
                        setLatestDonation(combined[0]);
                    }
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const getStatusStep = (status: string) => {
        // 'menunggu_verifikasi', 'disetujui', 'ditolak', 'tersalurkan'
        switch (status) {
            case 'menunggu_verifikasi':
                return 1;
            case 'disetujui':
                return 2;
            case 'tersalurkan':
                return 3;
            case 'ditolak':
                return 0; // custom state
            default:
                return 1;
        }
    };

    return (
        <div className="space-y-8 animate-[fadeIn_0.3s_ease]">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-display font-bold text-stone-900">Halo, Donatur!</h1>
                    <p className="text-stone-500">Terima kasih telah berkontribusi untuk bumi yang lebih baik.</p>
                </div>
                <Link href="/dashboard/donatur/donate">
                    <Button className="shadow-lg shadow-green-600/20"><Upload size={18} /> Donasi Baru</Button>
                </Link>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-linear-to-br from-green-600 to-green-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-center min-h-40">
                    <div className="relative z-10">
                        <div className="text-green-100 text-sm font-semibold mb-2">Total Poin Kamu</div>
                        <div className="text-5xl font-display font-extrabold mb-4">
                            {isLoading ? '...' : stats.total_poin.toLocaleString('id-ID')}
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 border border-white/30 rounded-full text-xs font-bold">
                            <Trophy size={14} /> Peringkat #{isLoading ? '-' : stats.peringkat}
                        </div>
                    </div>
                    <Trophy className="absolute -bottom-6 -right-6 text-white/10" size={140} />
                </div>

                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-center min-h-40 relative overflow-hidden">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                        <Leaf size={24} className="text-green-500" />
                    </div>
                    <div className="text-stone-500 text-sm font-bold mb-1">Limbah Diselamatkan</div>
                    <div className="text-3xl font-display font-extrabold text-stone-900">
                        {isLoading ? '...' : stats.total_limbah_kg.toFixed(1)} Kg
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-center min-h-40 relative overflow-hidden">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                        <Shirt size={24} className="text-blue-500" />
                    </div>
                    <div className="text-stone-500 text-sm font-bold mb-1">Kontribusi Donasi</div>
                    <div className="text-3xl font-display font-extrabold text-stone-900">
                        {isLoading ? '...' : `${stats.total_pakaian_item} Item`}
                    </div>
                    {stats.total_uang_donasi > 0 && (
                        <div className="mt-1 text-xs font-semibold text-green-600">
                            & Rp {stats.total_uang_donasi.toLocaleString('id-ID')} Dana
                        </div>
                    )}
                </div>
            </div>

            {/* Latest Donation Tracker */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
                <h3 className="font-display font-bold text-stone-900 mb-8">Status Donasi Terakhir</h3>

                {isLoading ? (
                    <div className="text-center py-10 text-stone-400">Memuat status donasi...</div>
                ) : !latestDonation ? (
                    <div className="text-center py-10 border border-stone-100 rounded-xl bg-stone-50/30 flex flex-col items-center">
                        <Sparkles className="text-green-500 mb-2" size={32} />
                        <div className="font-bold text-stone-700">Belum ada donasi</div>
                        <div className="text-sm text-stone-500 mt-1 max-w-sm">Mulai langkah pertamamu dengan menyumbangkan pakaian layak pakai atau dana finansial.</div>
                        <Link href="/dashboard/donatur/donate" className="mt-4">
                            <Button size="sm">Ayo Donasi Sekarang</Button>
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Progress Tracker (Only show standard progress if not rejected) */}
                        {latestDonation.status !== 'ditolak' ? (
                            <div className="relative flex justify-between items-center mb-10 max-w-2xl mx-auto">
                                <div className="absolute top-1/2 left-0 w-full h-1 bg-stone-100 -z-10 -translate-y-1/2 rounded-full"></div>
                                <div 
                                    className="absolute top-1/2 left-0 h-1 bg-green-500 -z-10 -translate-y-1/2 rounded-full transition-all duration-500"
                                    style={{ width: latestDonation.status === 'tersalurkan' ? '100%' : latestDonation.status === 'disetujui' ? '50%' : '0%' }}
                                ></div>

                                {[
                                    { label: 'Verifikasi', step: 1 },
                                    { label: 'Penjemputan / Proses', step: 2 },
                                    { label: 'Tersalurkan / Selesai', step: 3 },
                                ].map((step) => {
                                    const currentStep = getStatusStep(latestDonation.status);
                                    const isDone = currentStep >= step.step;
                                    return (
                                        <div key={step.step} className="flex flex-col items-center gap-3 bg-white px-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${isDone ? 'bg-green-500 border-green-500 text-white shadow-md shadow-green-500/20' : 'bg-white border-stone-200 text-stone-400'}`}>
                                                <CheckCircle size={16} />
                                            </div>
                                            <div className={`text-xs font-bold ${isDone ? 'text-green-600' : 'text-stone-400'}`}>{step.label}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="max-w-2xl mx-auto bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 text-red-700 mb-8">
                                <XCircle className="shrink-0" size={24} />
                                <div>
                                    <div className="font-bold text-sm">Donasi Ditolak</div>
                                    <div className="text-xs text-red-600">Donasi Anda tidak memenuhi kriteria kelayakan ReWardrobe. Silakan ajukan kembali donasi lainnya.</div>
                                </div>
                            </div>
                        )}

                        <div className="flex border border-stone-100 rounded-xl p-5 gap-5 items-center bg-stone-50/50">
                            <div className="w-16 h-16 bg-stone-200/60 rounded-xl flex items-center justify-center text-3xl">
                                {latestDonation.type === 'pakaian' ? '🧥' : '💵'}
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-stone-900 mb-1 flex items-center gap-2">
                                    {latestDonation.type === 'pakaian' 
                                        ? (latestDonation.judul || `Pakaian - ${latestDonation.kategori}`) 
                                        : `Dana Finansial: Rp ${latestDonation.nominal.toLocaleString('id-ID')}`
                                    }
                                    <span className="text-[10px] uppercase font-extrabold text-stone-400 bg-stone-200/50 px-2 py-0.5 rounded-full">
                                        {latestDonation.type}
                                    </span>
                                </div>
                                <div className="text-sm text-stone-500">
                                    {latestDonation.status === 'menunggu_verifikasi' && 'Sedang dalam antrean verifikasi bukti transfer/foto oleh admin.'}
                                    {latestDonation.status === 'disetujui' && 'Telah diverifikasi. Donasi Anda siap disalurkan/dikirim kepada komunitas penerima.'}
                                    {latestDonation.status === 'tersalurkan' && 'Berhasil disalurkan penuh ke penerima manfaat. Dampak sosial Anda telah aktif!'}
                                    {latestDonation.status === 'ditolak' && 'Donasi dibatalkan/ditolak setelah verifikasi administratif.'}
                                </div>
                            </div>
                            <Link href="/dashboard/donatur/history" className="text-sm font-bold text-stone-600 hover:text-green-600 transition-colors flex items-center gap-1 shrink-0">
                                Semua Riwayat <ArrowRight size={14} />
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}