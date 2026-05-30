"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, ShieldAlert, Sparkles, CheckCircle2, DollarSign, Shirt, Globe, Heart, ArrowUpRight, Flame, Plus, LogOut } from 'lucide-react';
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
        total_uang_donasi: 0,
        peringkat: '-',
        leaderboard: []
    });
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'all' | 'joined'>('all');
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [joinLoading, setJoinLoading] = useState<number | null>(null);

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

            // Fetch Campaigns with user join state
            const campaignsRes = await fetch(`/api/campaigns?userId=${userId}`);
            const campaignsResult = await campaignsRes.json();
            if (campaignsResult.data) {
                setCampaigns(campaignsResult.data);
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

    const handleJoinLeave = async (campaignId: number, currentJoined: boolean) => {
        if (!currentUser) return;
        setJoinLoading(campaignId);
        try {
            const response = await fetch('/api/campaigns/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: currentUser.id,
                    campaign_id: campaignId,
                    action: currentJoined ? 'leave' : 'join'
                })
            });

            if (response.ok) {
                // Update state locally
                setCampaigns(prev => prev.map(c => {
                    if (c.id === campaignId) {
                        return { ...c, joined: !currentJoined };
                    }
                    return c;
                }));
            } else {
                const resData = await response.json();
                alert(resData.error || 'Gagal memproses keikutsertaan kampanye.');
            }
        } catch (err) {
            console.error('Error join/leave campaign:', err);
        } finally {
            setJoinLoading(null);
        }
    };

    const filteredCampaigns = campaigns.filter(c => {
        if (activeTab === 'all') return true;
        return c.joined;
    });

    return (
        <div className="space-y-8 animate-[fadeIn_0.3s_ease]">
            {/* Header banner */}
            <div className="bg-linear-to-r from-stone-900 via-stone-800 to-green-950 text-white rounded-2xl p-8 shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="space-y-2 z-10 text-center md:text-left">
                    <div className="inline-flex items-center gap-1 bg-green-500/20 text-green-300 border border-green-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                        <Flame size={12} className="fill-green-300" /> Ekosistem Berkelanjutan ReWardrobe
                    </div>
                    <h1 className="text-3xl font-display font-extrabold tracking-tight">Dampak Sosial & Tantangan</h1>
                    <p className="text-stone-300 max-w-xl text-sm leading-relaxed">
                        Lihat kontribusimu terhadap lingkungan, ikuti berbagai tantangan hijau, dan donasikan pakaian atau dana langsung ke kampanye aktif.
                    </p>
                </div>
                <div className="shrink-0 flex flex-wrap gap-4 z-10">
                    <Link href="/dashboard/donatur/donate">
                        <Button variant="white" className="shadow-lg"><Plus size={16} /> Donasi Sekarang</Button>
                    </Link>
                </div>
                <Globe className="absolute -bottom-16 -right-16 text-white/5" size={240} />
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                        Dari {isLoading ? '...' : stats.total_pakaian_item} pakaian disetujui
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                    <div className="text-xs font-bold text-stone-400 uppercase">Donasi Finansial</div>
                    <div className="text-2xl font-display font-black text-green-700 mt-1">
                        {isLoading ? '...' : `Rp ${stats.total_uang_donasi.toLocaleString('id-ID')}`}
                    </div>
                    <div className="text-[10px] text-stone-500 mt-1">Dana logistik tervalidasi</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                    <div className="text-xs font-bold text-stone-400 uppercase">Peringkat Global</div>
                    <div className="text-2xl font-display font-black text-stone-900 mt-1">
                        {isLoading ? '...' : `#${stats.peringkat}`}
                    </div>
                    <div className="text-[10px] text-stone-500 mt-1">Di antara semua donatur</div>
                </div>
            </div>

            {/* Layout Column: Challenges vs Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Columns (2/3): Campaigns and Challenges */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-3">
                        <h2 className="font-display font-bold text-stone-900 text-lg flex items-center gap-2">
                            <Heart className="text-red-500" size={20} /> Kampanye & Tantangan Aktif
                        </h2>
                        <div className="flex bg-stone-100 p-0.5 rounded-lg text-xs font-bold">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-4 py-1.5 rounded-md transition-all ${activeTab === 'all' ? 'bg-white text-stone-800 shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}
                            >
                                Semua Tantangan
                            </button>
                            <button
                                onClick={() => setActiveTab('joined')}
                                className={`px-4 py-1.5 rounded-md transition-all ${activeTab === 'joined' ? 'bg-white text-stone-800 shadow-xs' : 'text-stone-500 hover:text-stone-800'}`}
                            >
                                Diikuti ({campaigns.filter(c => c.joined).length})
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-20 text-stone-400">Memuat kampanye...</div>
                    ) : filteredCampaigns.length === 0 ? (
                        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center text-stone-500">
                            {activeTab === 'joined' 
                                ? 'Anda belum mengikuti tantangan apapun. Klik tab "Semua Tantangan" untuk bergabung.'
                                : 'Saat ini belum ada kampanye aktif.'
                            }
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredCampaigns.map((camp) => {
                                // Progress calculations
                                const hasDana = camp.target_dana !== null && camp.target_dana > 0;
                                const hasBarang = camp.target_barang !== null && camp.target_barang > 0;

                                const percentDana = hasDana ? Math.min(100, (camp.terkumpul_dana / camp.target_dana) * 100) : 0;
                                const percentBarang = hasBarang ? Math.min(100, (camp.terkumpul_barang / camp.target_barang) * 100) : 0;

                                return (
                                    <div key={camp.id} className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                                        <Link href={`/dashboard/donatur/impact/${camp.id}`} className="block group">
                                            {/* Photo Header */}
                                            <div className="h-44 bg-stone-100 relative overflow-hidden">
                                                {camp.foto_url ? (
                                                    <img src={camp.foto_url} alt={camp.judul} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-stone-300 group-hover:scale-105 transition-transform duration-500">
                                                        <Globe size={48} />
                                                    </div>
                                                )}
                                                {camp.joined && (
                                                    <div className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                                        <CheckCircle2 size={10} /> Diikuti
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="p-5 space-y-4">
                                                <div>
                                                    <h3 className="font-display font-bold text-stone-900 text-base leading-snug group-hover:text-green-700 transition-colors">{camp.judul}</h3>
                                                    <p className="text-stone-500 text-xs mt-1 line-clamp-3 leading-relaxed">{camp.deskripsi}</p>
                                                </div>

                                                {/* Progress Bars */}
                                                <div className="space-y-3 pt-2 border-t border-stone-100">
                                                    {/* Cash Donation Progress */}
                                                    {hasDana && (
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-stone-500 font-semibold flex items-center gap-1"><DollarSign size={12} className="text-green-600" /> Target Dana</span>
                                                                <span className="text-stone-900 font-bold">
                                                                    Rp {camp.terkumpul_dana.toLocaleString('id-ID')} / Rp {camp.target_dana.toLocaleString('id-ID')}
                                                                </span>
                                                            </div>
                                                            <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                                                                <div 
                                                                    className="h-full bg-green-500 rounded-full transition-all"
                                                                    style={{ width: `${percentDana}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Clothes Donation Progress */}
                                                    {hasBarang && (
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-stone-500 font-semibold flex items-center gap-1"><Shirt size={12} className="text-blue-500" /> Target Pakaian</span>
                                                                <span className="text-stone-900 font-bold">
                                                                    {camp.terkumpul_barang} / {camp.target_barang} pcs
                                                                </span>
                                                            </div>
                                                            <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                                                                <div 
                                                                    className="h-full bg-blue-500 rounded-full transition-all"
                                                                    style={{ width: `${percentBarang}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>

                                        {/* Actions */}
                                        <div className="px-5 pb-5 pt-2 flex gap-3 border-t border-stone-50 bg-stone-50/20">
                                            <button
                                                type="button"
                                                onClick={() => handleJoinLeave(camp.id, camp.joined)}
                                                disabled={joinLoading === camp.id}
                                                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold font-display border transition-all text-center ${camp.joined ? 'bg-white border-stone-300 text-stone-500 hover:bg-stone-50' : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100/50'}`}
                                            >
                                                {joinLoading === camp.id 
                                                    ? 'Memproses...' 
                                                    : camp.joined 
                                                        ? 'Batal Ikuti' 
                                                        : 'Ikuti Tantangan'
                                                }
                                            </button>
                                            <Link 
                                                href={`/dashboard/donatur/donate?campaignId=${camp.id}`}
                                                className="flex-1"
                                            >
                                                <button
                                                    type="button"
                                                    className="w-full py-2 px-3 rounded-lg text-xs font-bold font-display bg-stone-900 text-white hover:bg-stone-800 transition-all flex items-center justify-center gap-1"
                                                >
                                                    Donasi <ArrowUpRight size={12} />
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right Column (1/3): Leaderboard Standings */}
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
                                                {/* Rank Placement badge */}
                                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${index === 0 ? 'bg-amber-100 text-amber-700' : index === 1 ? 'bg-stone-200 text-stone-800' : index === 2 ? 'bg-orange-100 text-orange-800' : 'text-stone-400'}`}>
                                                    {index + 1}
                                                </span>

                                                {/* User Profile Avatar */}
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
                    <div className="bg-amber-50 border border-amber-200/50 rounded-2xl p-5 text-amber-800 text-xs space-y-2">
                        <div className="font-bold flex items-center gap-1"><Sparkles size={12} /> Cara Mendapatkan Poin</div>
                        <ul className="list-disc pl-4 space-y-1.5 text-amber-900/80 leading-relaxed">
                            <li>Setiap donasi pakaian disetujui mendapatkan <strong>50 Poin</strong>.</li>
                            <li>Tantangan yang diselesaikan memberikan bonus poin spesial!</li>
                            <li>Donasi finansial dikonversi ke poin kemitraan (10 Poin setiap kelipatan Rp 10.000).</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
