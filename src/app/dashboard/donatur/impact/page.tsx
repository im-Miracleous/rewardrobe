"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, Sparkles, Globe, Heart, Flame, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function ImpactPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [statsError, setStatsError] = useState('');

    const [stats, setStats] = useState<any>({
        total_poin: 0,
        total_limbah_kg: 0,
        total_pakaian_item: 0,
        peringkat: '-',
        leaderboard: []
    });
    const [currentUser, setCurrentUser] = useState<any>(null);

    const loadData = async () => {
        setIsLoading(true);
        setStatsError('');
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                router.replace('/auth/login');
                return;
            }
            const user = JSON.parse(userStr);
            setCurrentUser(user);
            const userId = user.id;

            // Fetch Stats & Leaderboard
            const statsRes = await fetch(`/api/donatur/stats?donatur_id=${userId}`);
            const statsResult = await statsRes.json();
            if (statsResult.data) {
                setStats(statsResult.data);
            }
        } catch (err) {
            console.error('Gagal memuat data dampak:', err);
            setStatsError('Gagal memuat data dari server.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [router]);

    return (
        <div className="space-y-8 animate-[fadeIn_0.3s_ease]">
            {/* Header banner */}
            <div className="bg-linear-to-r from-stone-900 via-stone-800 to-green-950 text-white rounded-2xl p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="space-y-2 z-10 text-center md:text-left">
                    <div className="inline-flex items-center gap-1 bg-green-500/20 text-green-300 border border-green-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                        <Flame size={12} className="fill-green-300" /> Ekosistem Berkelanjutan ReWardrobe
                    </div>
                    <h1 className="text-3xl font-display font-extrabold tracking-tight">Dampak Sosial Anda</h1>
                    <p className="text-stone-300 max-w-xl text-sm leading-relaxed">
                        Lihat kontribusimu terhadap lingkungan dan posisimu di papan peringkat para donatur.
                    </p>
                </div>
                <div className="shrink-0 flex flex-wrap gap-4 z-10">
                    <Link href="/dashboard/donatur/donate">
                        <Button variant="white" className="shadow-lg"><Plus size={16} /> Donasi Sekarang</Button>
                    </Link>
                </div>
                <Globe className="absolute -bottom-16 -right-16 text-white/5" size={240} />
            </div>

            {statsError && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center text-sm text-red-700">{statsError}</div>
            )}

            {/* Statistics Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                    <div className="text-xs font-bold text-stone-400 uppercase">Poin Dikumpulkan</div>
                    <div className="text-2xl font-display font-black text-stone-900 mt-1">
                        {isLoading ? '...' : stats.total_poin.toLocaleString('id-ID')}
                    </div>
                    <div className="text-[10px] text-green-600 font-semibold mt-1 flex items-center gap-0.5">
                        <Sparkles size={10} /> Tukarkan dengan reward nanti
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                    <div className="text-xs font-bold text-stone-400 uppercase">Tekstil Diselamatkan</div>
                    <div className="text-2xl font-display font-black text-stone-900 mt-1">
                        {isLoading ? '...' : `${stats.total_limbah_kg.toFixed(1)} Kg`}
                    </div>
                    <div className="text-[10px] text-stone-500 mt-1">
                        Dari {isLoading ? '...' : stats.total_pakaian_item} pakaian tersalurkan
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                    <div className="text-xs font-bold text-stone-400 uppercase">Peringkat Global</div>
                    <div className="text-2xl font-display font-black text-stone-900 mt-1">
                        {isLoading ? '...' : `#${stats.peringkat}`}
                    </div>
                    <div className="text-[10px] text-stone-500 mt-1">Di antara semua donatur</div>
                </div>
            </div>

            {/* Leaderboard */}
            <div className="space-y-6">
                <h2 className="font-display font-bold text-stone-900 text-lg flex items-center gap-2 border-b border-stone-200 pb-3">
                    <Trophy className="text-amber-500" size={20} /> Papan Peringkat (Top 10)
                </h2>

                {isLoading ? (
                    <div className="text-center py-10 text-stone-400">Memuat peringkat...</div>
                ) : stats.leaderboard.length === 0 ? (
                    <div className="bg-white border border-stone-200 rounded-2xl p-6 text-center text-stone-500 text-sm">
                        Belum ada papan peringkat tersedia.
                    </div>
                ) : (
                    <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
                        <div className="divide-y divide-stone-100">
                            {stats.leaderboard.map((user: any, index: number) => {
                                const isSelf = currentUser && user.id === currentUser.id;
                                return (
                                    <div
                                        key={user.id}
                                        className={`p-4 flex items-center justify-between gap-3 transition-colors ${isSelf ? 'bg-green-50/50' : 'hover:bg-stone-50/30'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${index === 0 ? 'bg-amber-100 text-amber-700' : index === 1 ? 'bg-stone-200 text-stone-800' : index === 2 ? 'bg-orange-100 text-orange-800' : 'text-stone-400'}`}>
                                                {index + 1}
                                            </span>
                                            <div className="w-9 h-9 rounded-full bg-stone-100 border border-stone-200/60 flex items-center justify-center text-stone-500 font-bold font-display text-sm shrink-0">
                                                {user.nama.substring(0, 1)}
                                            </div>
                                            <div>
                                                <span className={`text-sm font-bold text-stone-800 ${isSelf ? 'text-green-800' : ''}`}>
                                                    {user.nama} {isSelf && '(Kamu)'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="text-xs font-black text-stone-900">{user.total_poin.toLocaleString('id-ID')} Poin</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Fun note */}
                <div className="bg-amber-50 border border-amber-200/50 rounded-2xl p-5 text-amber-800 text-xs space-y-2 max-w-xl">
                    <div className="font-bold flex items-center gap-1"><Sparkles size={12} /> Cara Mendapatkan Poin</div>
                    <ul className="list-disc pl-4 space-y-1.5 text-amber-900/80 leading-relaxed">
                        <li>Setiap donasi pakaian yang tersalurkan mendapatkan <strong>50 Poin</strong>.</li>
                        <li>Semakin banyak kontribusimu, semakin tinggi peringkatmu!</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
