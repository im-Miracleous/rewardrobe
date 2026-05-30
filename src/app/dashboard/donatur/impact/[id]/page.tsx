"use client";
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Globe, Heart, Tag, Clock, Calendar, CheckCircle2, DollarSign, Shirt, Users, AlertCircle, ArrowUpRight, Award } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function CampaignDetailPage() {
    const router = useRouter();
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [camp, setCamp] = useState<any | null>(null);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [joinLoading, setJoinLoading] = useState(false);

    const fetchDetail = async () => {
        setIsLoading(true);
        setError('');
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                router.replace('/auth/login');
                return;
            }
            const user = JSON.parse(userStr);
            setCurrentUser(user);

            const res = await fetch(`/api/campaigns/${id}?userId=${user.id}`);
            const result = await res.json();
            if (!res.ok) {
                setError(result.error || 'Gagal memuat rincian kampanye.');
                return;
            }
            setCamp(result.data);
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

    const handleJoinLeave = async () => {
        if (!currentUser || !camp) return;
        setJoinLoading(true);
        try {
            const response = await fetch('/api/campaigns/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: currentUser.id,
                    campaign_id: camp.id,
                    action: camp.joined ? 'leave' : 'join'
                })
            });

            if (response.ok) {
                // Update local state
                setCamp((prev: any) => ({
                    ...prev,
                    joined: !prev.joined,
                    total_partisipan: prev.joined ? prev.total_partisipan - 1 : prev.total_partisipan + 1
                }));
            } else {
                const resData = await response.json();
                alert(resData.error || 'Gagal memproses keikutsertaan.');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setJoinLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <div className="text-center py-20 bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center justify-center">
                <Clock className="text-green-600 animate-spin mb-4" size={40} />
                <p className="text-stone-500 font-medium">Memuat rincian kampanye...</p>
            </div>
        );
    }

    if (error || !camp) {
        return (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center text-red-800 flex flex-col items-center justify-center max-w-xl mx-auto">
                <AlertCircle size={40} className="mb-3 text-red-500" />
                <h3 className="font-bold text-lg mb-1">Kampanye Tidak Ditemukan</h3>
                <p className="text-sm text-red-600 mb-4">{error || 'Data rincian kampanye tidak tersedia.'}</p>
                <Link href="/dashboard/donatur/impact">
                    <Button variant="outline" size="sm">Kembali ke Halaman Dampak</Button>
                </Link>
            </div>
        );
    }

    const hasDana = camp.target_dana !== null && camp.target_dana > 0;
    const hasBarang = camp.target_barang !== null && camp.target_barang > 0;
    const percentDana = hasDana ? Math.min(100, (camp.terkumpul_dana / camp.target_dana) * 100) : 0;
    const percentBarang = hasBarang ? Math.min(100, (camp.terkumpul_barang / camp.target_barang) * 100) : 0;

    return (
        <div className="space-y-8 animate-[fadeIn_0.3s_ease]">
            {/* Header */}
            <div>
                <Link
                    href="/dashboard/donatur/impact"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-stone-500 hover:text-stone-800 transition-colors mb-4"
                >
                    <ArrowLeft size={16} /> Kembali ke Halaman Dampak
                </Link>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-display font-extrabold text-stone-900 leading-tight">
                            {camp.judul}
                        </h1>
                        <p className="text-stone-500 mt-1 flex items-center gap-2 text-sm">
                            <Calendar size={14} /> Dibuat pada {formatDate(camp.created_at)}
                        </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black uppercase border tracking-wider ${camp.status === 'aktif' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-stone-55 text-stone-500 border-stone-200'}`}>
                            {camp.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Layout Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (2/3): Image, Description, Progress, and Feed */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Big Banner Image */}
                    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm h-64 md:h-96 relative">
                        {camp.foto_url ? (
                            <img src={camp.foto_url} alt={camp.judul} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-300">
                                <Globe size={64} />
                            </div>
                        )}
                        {camp.joined && (
                            <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-black px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                                <CheckCircle2 size={12} /> Anda Berpartisipasi
                            </div>
                        )}
                    </div>

                    {/* Campaign Description */}
                    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
                        <h3 className="font-display font-extrabold text-stone-900 text-lg flex items-center gap-2 border-b border-stone-100 pb-3">
                            <Heart className="text-red-500 fill-red-100" size={20} /> Tentang Kampanye Ini
                        </h3>
                        <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-wrap">
                            {camp.deskripsi}
                        </p>
                    </div>

                    {/* Progress Visuals */}
                    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-6">
                        <h3 className="font-display font-extrabold text-stone-900 text-lg border-b border-stone-100 pb-3">
                            Target Pencapaian Kampanye
                        </h3>
                        
                        <div className="space-y-6">
                            {/* Money Target */}
                            {hasDana && (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end text-sm">
                                        <div>
                                            <span className="font-bold text-stone-800 block">Donasi Dana Finansial</span>
                                            <span className="text-xs text-stone-500">Membantu pendanaan program/alat</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-black text-green-700 text-base block">
                                                Rp {camp.terkumpul_dana.toLocaleString('id-ID')}
                                            </span>
                                            <span className="text-[10px] text-stone-400 font-bold">
                                                Target: Rp {camp.target_dana.toLocaleString('id-ID')} ({percentDana.toFixed(0)}%)
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-green-500 rounded-full transition-all duration-700"
                                            style={{ width: `${percentDana}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {/* Clothes Target */}
                            {hasBarang && (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end text-sm">
                                        <div>
                                            <span className="font-bold text-stone-800 block">Pakaian Layak Pakai</span>
                                            <span className="text-xs text-stone-500">Pakaian disumbangkan langsung ke target</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-black text-blue-600 text-base block">
                                                {camp.terkumpul_barang} Pakaian
                                            </span>
                                            <span className="text-[10px] text-stone-400 font-bold">
                                                Target: {camp.target_barang} Pakaian ({percentBarang.toFixed(0)}%)
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-blue-500 rounded-full transition-all duration-700"
                                            style={{ width: `${percentBarang}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Social Feed (Recent Contributors) */}
                    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4">
                        <h3 className="font-display font-extrabold text-stone-900 text-lg border-b border-stone-100 pb-3 flex items-center gap-2">
                            <Award className="text-amber-500" size={20} /> Kontributor Terbaru Kampanye
                        </h3>

                        {camp.recent_contributions && camp.recent_contributions.length > 0 ? (
                            <div className="divide-y divide-stone-100">
                                {camp.recent_contributions.map((contr: any, idx: number) => (
                                    <div key={idx} className="py-3 flex justify-between items-center text-sm gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center font-display font-bold text-stone-600 text-xs shrink-0">
                                                {contr.donatur.substring(0, 1)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-stone-850">{contr.donatur}</div>
                                                <div className="text-[10px] text-stone-400">{formatDate(contr.created_at)}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-xs font-black px-2.5 py-0.5 rounded-full inline-block ${contr.type === 'pakaian' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                                                {contr.type === 'pakaian' ? `🧥 Pakaian (${contr.detail})` : `💵 Uang (${contr.detail})`}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 border border-dashed border-stone-200 rounded-xl text-center text-sm text-stone-500">
                                Belum ada kontribusi yang disetujui untuk kampanye ini. Jadilah yang pertama memberikan dampak!
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column (1/3): Action widgets */}
                <div className="space-y-6">
                    {/* Join / Donate actions */}
                    <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-6 space-y-4">
                        <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">Partisipasi Anda</div>
                        
                        <div className="p-4 bg-stone-50 border border-stone-100 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="text-stone-500" size={20} />
                                <div>
                                    <div className="text-[10px] font-bold text-stone-400 uppercase">Partisipan Aktif</div>
                                    <div className="text-sm font-black text-stone-800">{camp.total_partisipan} Donatur</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <button
                                type="button"
                                onClick={handleJoinLeave}
                                disabled={joinLoading}
                                className={`w-full py-3 px-4 rounded-xl text-xs font-bold font-display border transition-all text-center ${camp.joined ? 'bg-white border-stone-300 text-stone-500 hover:bg-stone-50' : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100/50'}`}
                            >
                                {joinLoading ? 'Memproses...' : camp.joined ? 'Batal Ikuti Tantangan' : 'Ikuti Tantangan Ini'}
                            </button>

                            {camp.status === 'aktif' && (
                                <div className="grid grid-cols-1 gap-2 pt-2 border-t border-stone-100">
                                    {hasBarang && (
                                        <Link href={`/dashboard/donatur/donate?campaignId=${camp.id}`}>
                                            <button className="w-full py-3 px-4 rounded-xl bg-stone-900 text-white text-xs font-bold font-display hover:bg-stone-800 transition-all flex items-center justify-center gap-1.5 shadow-sm">
                                                <Shirt size={14} /> Donasi Pakaian <ArrowUpRight size={12} />
                                            </button>
                                        </Link>
                                    )}

                                    {hasDana && (
                                        <Link href={`/dashboard/donatur/donate?campaignId=${camp.id}`}>
                                            <button className="w-full py-3 px-4 rounded-xl bg-green-600 text-white text-xs font-bold font-display hover:bg-green-700 transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-green-600/10">
                                                <DollarSign size={14} /> Donasi Uang <ArrowUpRight size={12} />
                                            </button>
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Green Motivation Tips */}
                    <div className="bg-green-950 text-green-100 rounded-2xl p-5 shadow-xs space-y-3 relative overflow-hidden">
                        <div className="relative z-10 space-y-2">
                            <div className="text-xs font-bold text-green-300 uppercase tracking-widest flex items-center gap-1.5">
                                <Award size={14} className="fill-green-300" /> Tahukah Anda?
                            </div>
                            <p className="text-xs text-green-200/90 leading-relaxed">
                                Mendaur ulang atau mendonasikan 1 kg pakaian bekas layak pakai dapat menghemat hingga <strong>6.000 liter air</strong> bersih dan mencegah emisi gas rumah kaca sebesar <strong>3,6 kg CO₂</strong>.
                            </p>
                            <p className="text-xs text-green-300 font-bold">
                                Kontribusi sekecil apa pun sangat berarti untuk bumi kita.
                            </p>
                        </div>
                        <Globe className="absolute -bottom-10 -right-10 text-white/5" size={120} />
                    </div>
                </div>
            </div>
        </div>
    );
}
