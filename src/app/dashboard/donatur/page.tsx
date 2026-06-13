"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shirt, Leaf, Trophy, Upload, CheckCircle, Clock, XCircle, ArrowRight, Sparkles, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ComposedChart } from 'recharts';

export default function DonaturDash() {
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        total_poin: 0,
        total_limbah_kg: 0,
        total_pakaian_item: 0,
        peringkat: '-',
    });
    const [latestDonations, setLatestDonations] = useState<any[]>([]);
    const [monthlyStats, setMonthlyStats] = useState<any[]>([]);

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
                    if (statsResult.data.monthly_stats) {
                        setMonthlyStats(statsResult.data.monthly_stats);
                    }
                }

                // Fetch history to get latest donation
                const historyRes = await fetch(`/api/donatur/history?donatur_id=${donaturId}`);
                const historyResult = await historyRes.json();
                if (historyResult.data) {
                    const combined = (historyResult.data.barang || [])
                        .map((b: any) => ({ ...b, type: 'pakaian' }))
                        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

                    if (combined.length > 0) {
                        setLatestDonations(combined.slice(0, 3));
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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'menunggu_pengiriman':
                return <span className="text-[10px] uppercase font-extrabold text-yellow-700 bg-yellow-100 px-2.5 py-0.5 rounded-full">Menunggu Pengiriman</span>;
            case 'terkirim':
                return <span className="text-[10px] uppercase font-extrabold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">Terkirim</span>;
            case 'tersalurkan':
                return <span className="text-[10px] uppercase font-extrabold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">Selesai</span>;
            case 'ditolak':
                return <span className="text-[10px] uppercase font-extrabold text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full">Ditolak</span>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-5 animate-[fadeIn_0.3s_ease]">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-linear-to-br from-green-600 to-green-800 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden flex flex-col justify-center min-h-32">
                    <div className="relative z-10">
                        <div className="text-green-100 text-xs font-semibold mb-1">Total Poin Kamu</div>
                        <div className="text-4xl font-display font-extrabold mb-3">
                            {isLoading ? '...' : stats.total_poin.toLocaleString('id-ID')}
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 border border-white/30 rounded-full text-xs font-bold">
                            <Trophy size={14} /> Peringkat #{isLoading ? '-' : stats.peringkat}
                        </div>
                    </div>
                    <Trophy className="absolute -bottom-6 -right-6 text-white/10" size={120} />
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-center min-h-32 relative overflow-hidden">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-3">
                        <Leaf size={20} className="text-green-500" />
                    </div>
                    <div className="text-stone-500 text-xs font-bold mb-1">Limbah Diselamatkan</div>
                    <div className="text-2xl font-display font-extrabold text-stone-900">
                        {isLoading ? '...' : stats.total_limbah_kg.toFixed(1)} Kg
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-center min-h-32 relative overflow-hidden">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
                        <Shirt size={20} className="text-blue-500" />
                    </div>
                    <div className="text-stone-500 text-sm font-bold mb-1">Kontribusi Donasi</div>
                    <div className="text-3xl font-display font-extrabold text-stone-900">
                        {isLoading ? '...' : `${stats.total_pakaian_item} Item`}
                    </div>
                </div>
            </div>

            {/* Summary Graph */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart2 className="text-green-600" size={20} />
                    <h3 className="font-display font-bold text-stone-900">Statistik Kontribusi 6 Bulan Terakhir</h3>
                </div>
                
                {isLoading ? (
                    <div className="h-44 flex items-center justify-center text-stone-400">Memuat grafik...</div>
                ) : monthlyStats.length === 0 ? (
                    <div className="h-44 flex items-center justify-center text-stone-400">Belum ada data kontribusi.</div>
                ) : (
                    <div className="h-52 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#78716c' }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: '#78716c' }} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any) => [`${value} Item`, 'Donasi Pakaian']}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                <Bar dataKey="pakaian" name="pakaian" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Latest Donation Tracker */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
                <h3 className="font-display font-bold text-stone-900 mb-6">Status Donasi Terakhir</h3>

                {isLoading ? (
                    <div className="text-center py-6 text-stone-400">Memuat status donasi...</div>
                ) : latestDonations.length === 0 ? (
                    <div className="text-center py-8 border border-stone-100 rounded-xl bg-stone-50/30 flex flex-col items-center">
                        <Sparkles className="text-green-500 mb-2" size={28} />
                        <div className="font-bold text-stone-700">Belum ada donasi</div>
                        <div className="text-xs text-stone-500 mt-1 max-w-sm">Mulai langkah pertamamu dengan menyumbangkan pakaian layak pakai.</div>
                        <Link href="/dashboard/donatur/donate" className="mt-3">
                            <Button size="sm">Ayo Donasi Sekarang</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {latestDonations.map((donation) => (
                            <div key={`${donation.type}-${donation.id}`} className="flex border border-stone-100 rounded-xl p-3 gap-3 items-center bg-stone-50 hover:bg-stone-100/50 transition-colors">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl shadow-xs border border-stone-200">
                                    🧥
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-stone-900 flex items-center gap-2 text-sm">
                                        {donation.judul || `Pakaian - ${donation.kategori}`}
                                        <span className="text-[9px] uppercase font-extrabold text-stone-500 bg-stone-200/50 px-2 py-0.5 rounded-full border border-stone-200/50">
                                            pakaian
                                        </span>
                                        {getStatusBadge(donation.status)}
                                    </div>
                                </div>
                                <Link href={`/dashboard/donatur/history/${donation.type}/${donation.id}`} className="text-xs font-bold text-stone-500 hover:text-green-600 transition-colors flex items-center gap-1 shrink-0 bg-white px-3 py-1.5 rounded-lg border border-stone-200 hover:border-green-300">
                                    Detail
                                </Link>
                            </div>
                        ))}
                        
                        {latestDonations.length > 0 && (
                            <div className="pt-2 text-center">
                                <Link href="/dashboard/donatur/history" className="text-xs font-bold text-green-600 hover:text-green-700 transition-colors inline-flex items-center gap-1">
                                    Lihat Semua Riwayat <ArrowRight size={14} />
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}