// CODE-CITE:
//   Title: Admin Dashboard - Antrian Moderasi Real-time
//   Type: ai
//   Value: Claude (claude.ai/code)
//   Notes: Dashboard admin dengan fetch data real dari API, stat cards dinamis, tabel moderasi, dan tombol setujui/tolak
//   Lines Range: 1-245
"use client";
import React, { useEffect, useState } from 'react';
import { ShieldCheck, Truck, CheckCircle, User, Image as ImageIcon, Loader2 } from 'lucide-react';
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
            return <Badge color="yellow">Menunggu</Badge>;
        case 'disetujui':
            return <Badge color="green">Disetujui</Badge>;
        case 'ditolak':
            return <Badge color="stone">Ditolak</Badge>;
        case 'tersalurkan':
            return <Badge color="blue">Tersalurkan</Badge>;
        default:
            return <Badge color="stone">{status}</Badge>;
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

export default function AdminDash() {
    const [barangList, setBarangList] = useState<BarangDonasi[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState<number | null>(null);

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

    const handleUpdateStatus = async (barangId: number, newStatus: string) => {
        setActionLoading(barangId);
        try {
            const response = await fetch(`/api/barang-donasi/${barangId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            const result = await response.json();
            if (!response.ok) {
                setError(result.error || 'Gagal mengubah status.');
                return;
            }

            // Refresh the list
            await fetchBarang();
        } catch (err) {
            console.error('Update status error:', err);
            setError('Gagal mengubah status.');
        } finally {
            setActionLoading(null);
        }
    };

    // Compute stats from real data
    const menungguCount = barangList.filter((b) => b.status === 'menunggu_verifikasi').length;
    const disetujuiCount = barangList.filter((b) => b.status === 'disetujui').length;
    const tersalurkanCount = barangList.filter((b) => b.status === 'tersalurkan').length;
    const pendingItems = barangList.filter((b) => b.status === 'menunggu_verifikasi');

    return (
        <div className="space-y-8 animate-[fadeIn_0.3s_ease]">
            <div>
                <h1 className="text-2xl font-display font-bold text-stone-900">Ringkasan Sistem</h1>
                <p className="text-stone-500">Pantau aktivitas platform ReWardrobe hari ini.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { title: 'Menunggu Verifikasi', val: String(menungguCount), icon: <ShieldCheck size={24} />, color: 'text-orange-600', bg: 'bg-orange-100' },
                    { title: 'Disetujui', val: String(disetujuiCount), icon: <Truck size={24} />, color: 'text-blue-600', bg: 'bg-blue-100' },
                    { title: 'Total Tersalurkan', val: String(tersalurkanCount), icon: <CheckCircle size={24} />, color: 'text-green-600', bg: 'bg-green-100' },
                    { title: 'Total Donasi', val: String(barangList.length), icon: <User size={24} />, color: 'text-purple-600', bg: 'bg-purple-100' },
                ].map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${s.bg} ${s.color}`}>
                            {s.icon}
                        </div>
                        <div>
                            <div className="text-3xl font-display font-extrabold text-stone-900">{s.val}</div>
                            <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mt-1">{s.title}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                    <h3 className="font-display font-bold text-stone-900">Antrian Moderasi</h3>
                    <Button variant="outline" size="sm" onClick={fetchBarang}>Refresh</Button>
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
                ) : pendingItems.length === 0 ? (
                    <div className="p-12 text-center text-stone-400">
                        <ShieldCheck size={48} className="mx-auto mb-4 opacity-30" />
                        <p className="font-semibold">Tidak ada barang menunggu verifikasi.</p>
                        <p className="text-sm mt-1">Semua donasi sudah diproses.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white border-b border-stone-200">
                                    <th className="p-5 text-xs font-bold text-stone-400 uppercase tracking-wider">Donatur</th>
                                    <th className="p-5 text-xs font-bold text-stone-400 uppercase tracking-wider">Barang</th>
                                    <th className="p-5 text-xs font-bold text-stone-400 uppercase tracking-wider">Kondisi / Status</th>
                                    <th className="p-5 text-xs font-bold text-stone-400 uppercase tracking-wider">Bukti Foto</th>
                                    <th className="p-5 text-xs font-bold text-stone-400 uppercase tracking-wider">Waktu Masuk</th>
                                    <th className="p-5 text-xs font-bold text-stone-400 uppercase tracking-wider text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingItems.map((item) => (
                                    <tr key={item.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                                        <td className="p-5 font-bold text-stone-800">{item.donatur?.nama ?? '-'}</td>
                                        <td className="p-5 text-stone-600">{item.judul ?? 'Donasi tanpa nama'}</td>
                                        <td className="p-5">
                                            <div className="flex flex-col gap-1">
                                                {getKondisiBadge(item.kondisi_user)}
                                                {getStatusBadge(item.status)}
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            {item.foto_url ? (
                                                <img src={item.foto_url} alt={item.judul ?? 'Donasi'} className="w-14 h-14 object-cover rounded-lg border border-stone-200" />
                                            ) : (
                                                <div className="w-14 h-14 bg-stone-100 rounded-lg border border-stone-200 flex items-center justify-center text-stone-400">
                                                    <ImageIcon size={20} />
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-5 text-sm font-semibold text-stone-500">{timeAgo(item.created_at)}</td>
                                        <td className="p-5 text-right">
                                            <div className="flex gap-2 justify-end items-center">
                                                <Button
                                                    size="sm"
                                                    disabled={actionLoading === item.id}
                                                    onClick={() => handleUpdateStatus(item.id, 'disetujui')}
                                                >
                                                    {actionLoading === item.id ? 'Proses...' : 'Setujui'}
                                                </Button>
                                                <button
                                                    className="text-sm font-semibold text-stone-500 hover:text-stone-800 px-3 disabled:opacity-50"
                                                    disabled={actionLoading === item.id}
                                                    onClick={() => handleUpdateStatus(item.id, 'ditolak')}
                                                >
                                                    Tolak
                                                </button>
                                            </div>
                                        </td>
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