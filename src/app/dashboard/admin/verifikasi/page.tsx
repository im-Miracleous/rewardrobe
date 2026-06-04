"use client";
import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Image as ImageIcon,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Banknote,
  Shirt,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

// ── Types ───────────────────────────────────────────────────────────────────
type DonationStatus = "menunggu_verifikasi" | "disetujui" | "ditolak" | "tersalurkan";
type DonationType = "pakaian" | "uang";

interface Donation {
  id: number;
  donatur: { id: number; nama: string; kota: string | null; email: string };
  tipe: DonationType;
  detail: string;
  kondisi?: string; 
  deskripsi: string;
  nominal?: number;
  bukti_foto: string | null;
  status: DonationStatus;
  campaign: string | null;
  waktu_masuk: string;
  created_at: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────
const TABS = [
  { key: "semua", label: "Semua" },
  { key: "menunggu_verifikasi", label: "Menunggu Verifikasi" },
  { key: "disetujui", label: "Disetujui" },
  { key: "ditolak", label: "Ditolak" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function formatCurrency(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

function getStatusBadge(status: DonationStatus) {
  switch (status) {
    case "menunggu_verifikasi":
      return <Badge color="yellow">Menunggu</Badge>;
    case "disetujui":
      return <Badge color="green">Disetujui</Badge>;
    case "tersalurkan":
      return <Badge color="blue">Tersalurkan</Badge>;
    case "ditolak":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-display bg-red-100 text-red-700">
          Ditolak
        </span>
      );
    default:
      return <Badge color="stone">{status}</Badge>;
  }
}

function getKondisiBadge(kondisi: string) {
  switch (kondisi) {
    case "baik":
      return <Badge color="green">Baik</Badge>;
    case "fair":
      return <Badge color="yellow">Fair</Badge>;
    case "rusak":
      return <Badge color="stone">Rusak</Badge>;
    default:
      return <Badge color="blue">{kondisi}</Badge>;
  }
}

// ── Page Component ──────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 6;

export default function VerifikasiDonasiPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [activeTab, setActiveTab] = useState<TabKey>("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchData = async () => {
    try {
        setIsLoading(true);
        const res = await fetch('/api/admin/verifikasi');
        const json = await res.json();
        if (json.data) setDonations(json.data);
    } catch (err) {
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Stats ───────────────────────────────────────────────────────────────
  const stats = {
    total: donations.length,
    menunggu: donations.filter((d) => d.status === "menunggu_verifikasi").length,
    disetujui: donations.filter((d) => d.status === "disetujui" || d.status === "tersalurkan").length,
    ditolak: donations.filter((d) => d.status === "ditolak").length,
  };

  // ── Filtered list ───────────────────────────────────────────────────────
  const filtered = donations.filter((d) => {
    const matchTab = activeTab === "semua" || d.status === activeTab || (activeTab === "disetujui" && d.status === "tersalurkan");
    const matchSearch =
      searchQuery.trim() === "" ||
      d.donatur?.nama?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ── Handlers ────────────────────────────────────────────────────────────
  async function handleApprove(id: number, tipe: DonationType) {
    setIsProcessing(true);
    try {
        const res = await fetch('/api/admin/verifikasi', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, tipe, status: 'disetujui' })
        });
        if (res.ok) await fetchData();
    } catch (err) {
        console.error(err);
    } finally {
        setIsProcessing(false);
    }
  }

  async function handleReject(id: number, tipe: DonationType) {
    if (!rejectReason.trim()) return;
    setIsProcessing(true);
    try {
        const res = await fetch('/api/admin/verifikasi', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, tipe, status: 'ditolak', alasan_penolakan: rejectReason })
        });
        if (res.ok) {
            setRejectingId(null);
            setRejectReason("");
            await fetchData();
        }
    } catch (err) {
        console.error(err);
    } finally {
        setIsProcessing(false);
    }
  }

  function handleTabChange(tab: TabKey) {
    setActiveTab(tab);
    setCurrentPage(1);
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease]">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
            <ShieldCheck size={22} />
          </div>
          <h1 className="text-2xl font-display font-bold text-stone-900">
            Verifikasi Donasi
          </h1>
        </div>
        <p className="text-stone-500 ml-[52px]">
          Tinjau, setujui, atau tolak donasi masuk dari para donatur.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            title: "Total Masuk",
            val: isLoading ? "..." : stats.total,
            icon: <Filter size={22} />,
            color: "text-blue-600",
            bg: "bg-blue-100",
          },
          {
            title: "Menunggu Verifikasi",
            val: isLoading ? "..." : stats.menunggu,
            icon: <ShieldCheck size={22} />,
            color: "text-yellow-600",
            bg: "bg-yellow-100",
          },
          {
            title: "Disetujui & Tersalurkan",
            val: isLoading ? "..." : stats.disetujui,
            icon: <CheckCircle size={22} />,
            color: "text-green-600",
            bg: "bg-green-100",
          },
          {
            title: "Ditolak",
            val: isLoading ? "..." : stats.ditolak,
            icon: <XCircle size={22} />,
            color: "text-red-600",
            bg: "bg-red-100",
          },
        ].map((s, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow duration-200"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.bg} ${s.color}`}
            >
              {s.icon}
            </div>
            <div>
              <div className="text-2xl font-display font-extrabold text-stone-900">
                {s.val}
              </div>
              <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                {s.title}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters: Tabs + Search */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm">
        <div className="p-5 border-b border-stone-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.key
                    ? "bg-white text-stone-900 shadow-sm"
                    : "text-stone-500 hover:text-stone-700 hover:bg-white/50"
                }`}
              >
                {tab.label}
                {tab.key === "menunggu_verifikasi" && stats.menunggu > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-yellow-400 text-white text-[10px] font-bold">
                    {stats.menunggu}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              type="text"
              placeholder="Cari nama donatur..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full lg:w-72 pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-all duration-200"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/60">
                <th className="p-4 pl-6 text-xs font-bold text-stone-400 uppercase tracking-wider w-12">No</th>
                <th className="p-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Donatur</th>
                <th className="p-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Tipe</th>
                <th className="p-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Detail</th>
                <th className="p-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Kondisi / Nominal</th>
                <th className="p-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Bukti Foto</th>
                <th className="p-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Waktu Masuk</th>
                <th className="p-4 pr-6 text-xs font-bold text-stone-400 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                  <tr>
                      <td colSpan={9} className="p-12 text-center">
                          <Loader2 size={40} className="mx-auto mb-3 text-stone-300 animate-spin" />
                          <p className="text-stone-400 font-semibold text-sm">Memuat data...</p>
                      </td>
                  </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center">
                    <ShieldCheck
                      size={40}
                      className="mx-auto mb-3 text-stone-300"
                    />
                    <p className="text-stone-400 font-semibold text-sm">
                      Tidak ada data donasi ditemukan.
                    </p>
                  </td>
                </tr>
              ) : (
                paginated.map((item, idx) => (
                  <React.Fragment key={item.id + item.tipe}>
                    <tr
                      className="border-b border-stone-100 hover:bg-stone-50/70 transition-colors duration-150 cursor-pointer group"
                      onClick={() =>
                        setSelectedDonation(
                          selectedDonation?.id === item.id ? null : item
                        )
                      }
                    >
                      <td className="p-4 pl-6 text-sm font-semibold text-stone-400">
                        {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-stone-800 text-sm">
                          {item.donatur?.nama}
                        </div>
                        <div className="text-xs text-stone-400 mt-0.5">
                          {item.donatur?.kota || "-"}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {item.tipe === "pakaian" ? (
                            <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                              <Shirt size={14} />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                              <Banknote size={14} />
                            </div>
                          )}
                          <span className="text-sm font-semibold text-stone-700 capitalize">
                            {item.tipe}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 max-w-[200px]">
                        <p className="text-sm text-stone-600 truncate">
                          {item.deskripsi}
                        </p>
                      </td>
                      <td className="p-4">
                        {item.tipe === "pakaian" && item.kondisi ? (
                          getKondisiBadge(item.kondisi)
                        ) : item.kondisi ? (
                          <span className="text-sm font-bold text-emerald-700">
                            {formatCurrency(item.kondisi as any)}
                          </span>
                        ) : (
                          <span className="text-sm text-stone-400">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        {item.bukti_foto ? (
                          <div className="w-11 h-11 bg-stone-100 rounded-lg border border-stone-200 flex items-center justify-center overflow-hidden group-hover:border-green-300 transition-colors">
                              <img src={item.bukti_foto} alt="bukti" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-11 h-11 bg-stone-50 rounded-lg border border-dashed border-stone-200 flex items-center justify-center">
                            <ImageIcon size={16} className="text-stone-300" />
                          </div>
                        )}
                      </td>
                      <td className="p-4">{getStatusBadge(item.status)}</td>
                      <td className="p-4">
                        <div className="text-sm text-stone-700 font-medium">
                          {timeAgo(item.created_at)}
                        </div>
                        <div className="text-[11px] text-stone-400 mt-0.5">
                          {formatDate(item.created_at)}
                        </div>
                      </td>
                      <td
                        className="p-4 pr-6"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {item.status === "menunggu_verifikasi" ? (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleApprove(item.id, item.tipe)}
                              disabled={isProcessing}
                              className="!px-3 !py-1.5 !text-xs !rounded-lg"
                            >
                              <CheckCircle size={13} />
                              Setujui
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                setRejectingId(
                                  rejectingId === item.id ? null : item.id
                                );
                                setRejectReason("");
                              }}
                              disabled={isProcessing}
                              className="!px-3 !py-1.5 !text-xs !rounded-lg"
                            >
                              <XCircle size={13} />
                              Tolak
                            </Button>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              setSelectedDonation(
                                selectedDonation?.id === item.id ? null : item
                              )
                            }
                            className="flex items-center gap-1.5 text-xs font-semibold text-stone-400 hover:text-green-600 transition-colors"
                          >
                            <Eye size={14} />
                            Detail
                          </button>
                        )}
                      </td>
                    </tr>
                    {rejectingId === item.id && (
                      <tr className="bg-red-50/60 animate-[fadeIn_0.2s_ease]">
                        <td colSpan={9} className="px-6 py-4">
                          <div className="flex items-center gap-3 max-w-xl">
                            <input
                              type="text"
                              placeholder="Tulis alasan penolakan..."
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleReject(item.id, item.tipe);
                              }}
                              className="flex-1 px-4 py-2.5 rounded-xl border border-red-200 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-300 transition-all"
                              autoFocus
                            />
                            <Button
                              variant="danger"
                              size="sm"
                              disabled={!rejectReason.trim() || isProcessing}
                              onClick={() => handleReject(item.id, item.tipe)}
                              className="!rounded-xl"
                            >
                              Konfirmasi Tolak
                            </Button>
                            <button
                              onClick={() => {
                                setRejectingId(null);
                                setRejectReason("");
                              }}
                              className="p-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-5 border-t border-stone-100 flex items-center justify-between">
          <p className="text-sm text-stone-400">
            Menampilkan{" "}
            <span className="font-bold text-stone-600">
              {filtered.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>
            -
            <span className="font-bold text-stone-600">
              {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
            </span>{" "}
            dari{" "}
            <span className="font-bold text-stone-600">{filtered.length}</span>{" "}
            donasi
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  currentPage === page
                    ? "bg-green-600 text-white shadow-sm"
                    : "text-stone-500 hover:bg-stone-100 hover:text-stone-700"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedDonation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
          onClick={() => setSelectedDonation(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden animate-[fadeIn_0.25s_ease]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedDonation.tipe === "pakaian" ? "bg-purple-100 text-purple-600" : "bg-emerald-100 text-emerald-600"}`}>
                  {selectedDonation.tipe === "pakaian" ? <Shirt size={20} /> : <Banknote size={20} />}
                </div>
                <div>
                  <h3 className="font-display font-bold text-stone-900">Detail Donasi</h3>
                  <p className="text-xs text-stone-400">ID #{selectedDonation.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedDonation(null)} className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="w-full h-48 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden">
                {selectedDonation.bukti_foto ? (
                  <img src={selectedDonation.bukti_foto} alt="Foto Bukti" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-stone-300">
                    <ImageIcon size={40} />
                    <span className="text-xs font-medium">Tidak ada foto</span>
                  </div>
                )}
              </div>
              {selectedDonation.status === "ditolak" && selectedDonation.deskripsi.includes("ALASAN PENOLAKAN") && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3">
                  <XCircle size={20} className="text-red-500 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-red-800">Alasan Penolakan</h4>
                    <p className="text-sm text-red-600 mt-1">
                      {selectedDonation.deskripsi.split("ALASAN PENOLAKAN:")[1]}
                    </p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Donatur</div>
                  <div className="text-sm font-semibold text-stone-800">{selectedDonation.donatur?.nama}</div>
                  <div className="text-xs text-stone-500">{selectedDonation.donatur?.email}</div>
                  <div className="text-xs text-stone-500">{selectedDonation.donatur?.kota || "-"}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Status</div>
                  <div className="mt-1">{getStatusBadge(selectedDonation.status)}</div>
                  <div className="text-xs text-stone-400 mt-1.5">{formatDate(selectedDonation.created_at)}</div>
                </div>
              </div>
              <div className="pt-4 border-t border-stone-100">
                <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Deskripsi Donasi</div>
                <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">
                  {selectedDonation.deskripsi.split("ALASAN PENOLAKAN")[0]}
                </p>
              </div>
            </div>
            {selectedDonation.status === "menunggu_verifikasi" && (
              <div className="p-6 bg-stone-50 border-t border-stone-100 flex items-center justify-end gap-3">
                <Button variant="ghost" onClick={() => setSelectedDonation(null)}>Tutup</Button>
                <Button variant="danger" disabled={isProcessing} onClick={() => {
                  setRejectingId(selectedDonation.id);
                  setSelectedDonation(null);
                }}>
                  Tolak
                </Button>
                <Button variant="primary" disabled={isProcessing} onClick={() => {
                  handleApprove(selectedDonation.id, selectedDonation.tipe);
                  setSelectedDonation(null);
                }}>
                  Setujui Donasi
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
