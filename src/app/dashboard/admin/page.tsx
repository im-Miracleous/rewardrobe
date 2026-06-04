// CODE-CITE:
//   Title: Admin Dashboard - Command Center with Quick Actions
//   Type: ai
//   Value: Claude (claude.ai/code)
//   Notes: Redesigned admin dashboard with stat cards, quick actions grid, recent donations preview, and activity feed
//   Lines Range: 1-300
"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    ShieldCheck, Truck, CheckCircle, User, Image as ImageIcon,
    Loader2, Package, QrCode, Megaphone, ArrowRight, Clock,
    TrendingUp, AlertCircle, Shirt, Banknote, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface Donatur {
    id: number;
    nama: string;
    kota: string | null;
}

interface BarangDonasi {
    id: number;
    judul: string | null;
    deskripsi: string;
    kondisi_user: string;
    kategori: string | null;
    berat_kg: number | null;
    foto_url: string | null;
    label_ai: string | null;
    status: string;
    donatur_id: number;
    verified_by: number | null;
    verified_at: string | null;
    created_at: string;
    updated_at: string;
    donatur: Donatur;
}

function getKondisiBadge(kondisi: string) {
    switch (kondisi) {
        case 'baik':
            return <Badge color="green">Baik</Badge>;
        case 'fair':
            return <Badge color="yellow">Fair</Badge>;
        case 'rusak':
            return <Badge color="stone">Rusak</Badge>;
        default:
            return <Badge color="blue">{kondisi}</Badge>;
    }
}

function getStatusBadge(status: string) {
    switch (status) {
        case 'menunggu_verifikasi':
            return <span className="text-[10px] uppercase font-extrabold text-yellow-700 bg-yellow-100 px-2.5 py-0.5 rounded-full">Menunggu</span>;
        case 'disetujui':
            return <span className="text-[10px] uppercase font-extrabold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">Disetujui</span>;
        case 'ditolak':
            return <span className="text-[10px] uppercase font-extrabold text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full">Ditolak</span>;
        case 'tersalurkan':
            return <span className="text-[10px] uppercase font-extrabold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">Tersalurkan</span>;
        default:
            return null;
    }
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Baru saja';
    if (mins < 60) return `${mins} Menit lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} Jam lalu`;
    const days = Math.floor(hours / 24);
    return `${days} Hari lalu`;
}

const quickActions = [
    {
        href: '/dashboard/admin/verifikasi',
        icon: <ShieldCheck size={24} />,
        title: 'Verifikasi Donasi',
        desc: 'Review dan moderasi donasi masuk',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        hoverBg: 'hover:bg-amber-50',
    },
    {
        href: '/dashboard/admin/penjemputan',
        icon: <Truck size={24} />,
        title: 'Penjemputan Barang',
        desc: 'Jadwalkan penjemputan dari donatur',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        hoverBg: 'hover:bg-blue-50',
    },
    {
        href: '/dashboard/admin/inventory',
        icon: <QrCode size={24} />,
        title: 'Inventory (QR)',
        desc: 'Kelola stok gudang & generate QR',
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        hoverBg: 'hover:bg-purple-50',
    },
    {
        href: '/dashboard/admin/kampanye',
        icon: <Megaphone size={24} />,
        title: 'Kelola Kampanye',
        desc: 'Buat & monitor kampanye donasi',
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        hoverBg: 'hover:bg-green-50',
    },
];

export default function AdminDash() {
    const [barangList, setBarangList] = useState<BarangDonasi[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchBarang = async () => {
        try {
            const response = await fetch('/api/barang-donasi');
            const result = await response.json();
            if (result.data) {
                setBarangList(result.data);
            } else {
                setError(result.error || 'Gagal memuat data');
            }
        } catch (err) {
            console.error('Fetch barang error:', err);
            setError('Gagal memuat data dari server.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBarang();
    }, []);

    // Compute stats from real data
    const menungguCount = barangList.filter((b) => b.status === 'menunggu_verifikasi').length;
    const disetujuiCount = barangList.filter((b) => b.status === 'disetujui').length;
    const tersalurkanCount = barangList.filter((b) => b.status === 'tersalurkan').length;
    const recentItems = barangList
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

    return (
        <div className="space-y-8 animate-[fadeIn_0.3s_ease]">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-display font-bold text-stone-900">Ringkasan Sistem</h1>
                <p className="text-stone-500">Pantau donasi baru dan penjemputan yang perlu dijadwalkan hari ini.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                {[
                    {
                        title: 'Menunggu Verifikasi',
                        val: String(menungguCount),
                        icon: <AlertCircle size={22} />,
                        color: 'text-amber-600',
                        bg: 'bg-amber-100',
                        accent: menungguCount > 0 ? 'ring-2 ring-amber-200' : '',
                    },
                    {
                        title: 'Disetujui',
                        val: String(disetujuiCount),
                        icon: <CheckCircle size={22} />,
                        color: 'text-green-600',
                        bg: 'bg-green-100',
                        accent: '',
                    },
                    {
                        title: 'Total Tersalurkan',
                        val: String(tersalurkanCount),
                        icon: <Package size={22} />,
                        color: 'text-blue-600',
                        bg: 'bg-blue-100',
                        accent: '',
                    },
                    {
                        title: 'Total Donasi',
                        val: String(barangList.length),
                        icon: <TrendingUp size={22} />,
                        color: 'text-purple-600',
                        bg: 'bg-purple-100',
                        accent: '',
                    },
                ].map((s, i) => (
                    <div key={i} className={`bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md ${s.accent}`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.bg} ${s.color}`}>
                            {s.icon}
                        </div>
                        <div>
                            <div className="text-2xl font-display font-extrabold text-stone-900">{isLoading ? '...' : s.val}</div>
                            <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mt-0.5">{s.title}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-sm font-bold tracking-widest text-stone-400 uppercase mb-4">Aksi Cepat</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action, i) => (
                        <Link key={i} href={action.href} className={`group bg-white p-5 rounded-2xl border border-stone-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${action.hoverBg}`}>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.bg} ${action.color} mb-4 group-hover:scale-110 transition-transform`}>
                                {action.icon}
                            </div>
                            <h3 className="font-display font-bold text-stone-900 text-sm mb-1">{action.title}</h3>
                            <p className="text-xs text-stone-500">{action.desc}</p>
                            <div className="flex items-center gap-1 mt-3 text-xs font-bold text-green-600 group-hover:gap-2 transition-all">
                                Buka <ArrowRight size={14} />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Donations Table */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <h3 className="font-display font-bold text-stone-900">Donasi Masuk Terbaru</h3>
                        {menungguCount > 0 && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-700">
                                <AlertCircle size={12} /> {menungguCount} perlu ditinjau
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={fetchBarang}>Refresh</Button>
                        <Link href="/dashboard/admin/verifikasi">
                            <Button variant="ghost" size="sm">Lihat Semua <ArrowRight size={14} /></Button>
                        </Link>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-16 text-stone-400 gap-3">
                        <Loader2 size={24} className="animate-spin" />
                        <span className="text-sm font-semibold">Memuat data...</span>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center text-sm text-red-600 bg-red-50">
                        {error}
                    </div>
                ) : recentItems.length === 0 ? (
                    <div className="p-12 text-center text-stone-400">
                        <ShieldCheck size={48} className="mx-auto mb-4 opacity-30" />
                        <p className="font-semibold">Belum ada donasi masuk.</p>
                        <p className="text-sm mt-1">Saat donatur mengirim donasi, data akan muncul di sini.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-stone-50/50 border-b border-stone-200">
                                    <th className="p-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Donatur</th>
                                    <th className="p-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Tipe</th>
                                    <th className="p-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Kondisi</th>
                                    <th className="p-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Status</th>
                                    <th className="p-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Bukti</th>
                                    <th className="p-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Waktu</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentItems.map((item) => (
                                    <tr key={item.id} className="border-b border-stone-100 hover:bg-stone-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-stone-800 text-sm">{item.donatur?.nama ?? '-'}</div>
                                            <div className="text-xs text-stone-400">{item.donatur?.kota ?? ''}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1.5 text-sm font-semibold text-stone-700">
                                                <Shirt size={14} className="text-stone-400" />
                                                {item.kategori ?? 'Pakaian'}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {getKondisiBadge(item.kondisi_user)}
                                        </td>
                                        <td className="p-4">
                                            {getStatusBadge(item.status)}
                                        </td>
                                        <td className="p-4">
                                            {item.foto_url ? (
                                                <img src={item.foto_url} alt={item.judul ?? 'Donasi'} className="w-10 h-10 object-cover rounded-lg border border-stone-200" />
                                            ) : (
                                                <div className="w-10 h-10 bg-stone-100 rounded-lg border border-stone-200 flex items-center justify-center text-stone-400">
                                                    <ImageIcon size={16} />
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-xs font-semibold text-stone-500">{timeAgo(item.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}