"use client";
import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader2, Package, Eye, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface Permintaan {
    id: number;
    status: "menunggu" | "diterima" | "ditolak";
    pesan: string | null;
    created_at: string;
    barang: {
        id: number;
        kategori: string | null;
        kondisi_user: string;
        deskripsi: string;
        foto_url: string | null;
        donatur: { nama: string; kota: string | null };
    };
    penerima: { id: number; nama: string; kota: string | null; tipe: string | null };
}

function formatTanggal(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Baru saja";
    if (mins < 60) return `${mins} menit lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} jam lalu`;
    return `${Math.floor(hours / 24)} hari lalu`;
}

function getStatusBadge(status: string) {
    if (status === "menunggu") return <Badge color="yellow">Menunggu</Badge>;
    if (status === "diterima") return <Badge color="green">Diterima</Badge>;
    return <Badge color="stone">Ditolak</Badge>;
}

export default function AdminPermintaanPage() {
    const [list, setList] = useState<Permintaan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"menunggu" | "diterima" | "ditolak" | "semua">("menunggu");
    const [isProcessing, setIsProcessing] = useState(false);
    const [rejectingId, setRejectingId] = useState<number | null>(null);
    const [alasan, setAlasan] = useState("");
    const [selectedItem, setSelectedItem] = useState<Permintaan | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/permintaan");
            const json = await res.json();
            if (json.data) setList(json.data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filtered = list.filter((item) => activeTab === "semua" || item.status === activeTab);

    const handleApprove = async (id: number) => {
        setIsProcessing(true);
        try {
            const res = await fetch(`/api/permintaan/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "diterima" }),
            });
            if (res.ok) await fetchData();
        } catch (err) {
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReject = async (id: number) => {
        if (!alasan.trim()) return;
        setIsProcessing(true);
        try {
            const res = await fetch(`/api/permintaan/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "ditolak", alasan }),
            });
            if (res.ok) {
                setRejectingId(null);
                setAlasan("");
                await fetchData();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const menungguCount = list.filter((i) => i.status === "menunggu").length;

    return (
        <div className="space-y-8 animate-[fadeIn_0.3s_ease]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-stone-900">Permintaan Penerima</h1>
                    <p className="text-stone-500">Review dan setujui permintaan barang dari panti, komunitas, atau pengrajin.</p>
                </div>
                {menungguCount > 0 && (
                    <span className="self-start sm:self-auto inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full">
                        {menungguCount} Menunggu Persetujuan
                    </span>
                )}
            </div>

            {/* Filter Dropdown */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 flex flex-wrap items-center gap-3">
                <Filter size={18} className="text-stone-400" />
                <span className="text-sm font-semibold text-stone-600">Filter Status:</span>
                <select
                    value={activeTab}
                    onChange={(e) => setActiveTab(e.target.value as any)}
                    className="px-4 py-2 rounded-xl border border-stone-200 bg-stone-50 text-sm font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all cursor-pointer min-w-[200px]"
                >
                    <option value="semua">Semua Permintaan</option>
                    <option value="menunggu">Menunggu{menungguCount > 0 ? ` (${menungguCount})` : ""}</option>
                    <option value="diterima">Diterima</option>
                    <option value="ditolak">Ditolak</option>
                </select>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-16 flex flex-col items-center text-stone-400">
                    <Loader2 size={40} className="animate-spin mb-3" />
                    <p className="text-sm font-semibold">Memuat data permintaan...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-16 flex flex-col items-center text-stone-400">
                    <Package size={40} className="mb-3" />
                    <p className="text-sm font-semibold">Tidak ada permintaan ditemukan.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-stone-100 bg-stone-50/70">
                                    <th className="text-left p-4 text-[10px] font-extrabold text-stone-400 uppercase tracking-wider">No</th>
                                    <th className="text-left p-4 text-[10px] font-extrabold text-stone-400 uppercase tracking-wider">Penerima</th>
                                    <th className="text-left p-4 text-[10px] font-extrabold text-stone-400 uppercase tracking-wider">Barang</th>
                                    <th className="text-left p-4 text-[10px] font-extrabold text-stone-400 uppercase tracking-wider">Pesan</th>
                                    <th className="text-left p-4 text-[10px] font-extrabold text-stone-400 uppercase tracking-wider">Status</th>
                                    <th className="text-left p-4 text-[10px] font-extrabold text-stone-400 uppercase tracking-wider">Waktu</th>
                                    <th className="text-left p-4 text-[10px] font-extrabold text-stone-400 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((item, idx) => (
                                    <React.Fragment key={item.id}>
                                        <tr className="border-b border-stone-100 hover:bg-stone-50/70 transition-colors">
                                            <td className="p-4 text-stone-500 font-semibold">{idx + 1}</td>
                                            <td className="p-4">
                                                <p className="font-bold text-stone-900">{item.penerima.nama}</p>
                                                <p className="text-xs text-stone-400">{item.penerima.kota} • {item.penerima.tipe || '-'}</p>
                                            </td>
                                            <td className="p-4">
                                                <p className="font-bold text-stone-900">{item.barang.kategori || 'Pakaian'}</p>
                                                <p className="text-xs text-stone-400">Kondisi: {item.barang.kondisi_user}</p>
                                            </td>
                                            <td className="p-4 max-w-[200px]">
                                                <p className="text-xs text-stone-600 line-clamp-2">{item.pesan || '-'}</p>
                                            </td>
                                            <td className="p-4">{getStatusBadge(item.status)}</td>
                                            <td className="p-4">
                                                <p className="text-xs font-semibold text-stone-600">{timeAgo(item.created_at)}</p>
                                                <p className="text-xs text-stone-400">{formatTanggal(item.created_at)}</p>
                                            </td>
                                            <td className="p-4">
                                                {item.status === "menunggu" ? (
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="primary"
                                                            size="sm"
                                                            onClick={() => handleApprove(item.id)}
                                                            disabled={isProcessing}
                                                        >
                                                            <CheckCircle size={13} />
                                                            Setujui
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => { setRejectingId(rejectingId === item.id ? null : item.id); setAlasan(""); }}
                                                            disabled={isProcessing}
                                                        >
                                                            <XCircle size={13} />
                                                            Tolak
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <button onClick={() => setSelectedItem(item)} className="flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors">
                                                        <Eye size={14} /> Detail
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                        {rejectingId === item.id && (
                                            <tr className="bg-red-50/60 border-b border-red-100">
                                                <td colSpan={7} className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="text"
                                                            placeholder="Tulis alasan penolakan..."
                                                            value={alasan}
                                                            onChange={(e) => setAlasan(e.target.value)}
                                                            className="flex-1 px-4 py-2.5 rounded-xl border border-red-200 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white transition-all"
                                                        />
                                                        <Button variant="ghost" size="sm" onClick={() => handleReject(item.id)} disabled={!alasan.trim() || isProcessing}>
                                                            Konfirmasi Tolak
                                                        </Button>
                                                        <button onClick={() => setRejectingId(null)} className="text-stone-400 hover:text-stone-700">
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedItem(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border border-stone-200 animate-[fadeIn_0.2s_ease]">
                        <div className="flex items-center justify-between p-6 border-b border-stone-100">
                            <h2 className="text-lg font-display font-bold text-stone-900">Detail Permintaan</h2>
                            <button onClick={() => setSelectedItem(null)} className="w-9 h-9 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-100 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Penerima</p>
                                <p className="font-bold text-stone-900">{selectedItem.penerima.nama}</p>
                                <p className="text-sm text-stone-500">{selectedItem.penerima.kota} • {selectedItem.penerima.tipe}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Barang</p>
                                <p className="font-bold text-stone-900">{selectedItem.barang.kategori || 'Pakaian'}</p>
                                <p className="text-sm text-stone-500">{selectedItem.barang.deskripsi}</p>
                            </div>
                            {selectedItem.pesan && (
                                <div>
                                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Pesan</p>
                                    <p className="text-sm text-stone-700 bg-stone-50 rounded-xl p-3">{selectedItem.pesan}</p>
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Status</p>
                                    {getStatusBadge(selectedItem.status)}
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Waktu</p>
                                    <p className="text-sm font-semibold text-stone-700">{formatTanggal(selectedItem.created_at)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
