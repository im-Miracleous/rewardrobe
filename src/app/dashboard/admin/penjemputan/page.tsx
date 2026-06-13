"use client";
import React, { useState, useEffect } from "react";
import {
  Truck,
  MapPin,
  Clock,
  User,
  Phone,
  Package,
  CheckCircle,
  Calendar,
  Navigation,
  Plus,
  X,
  Loader2,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

// ─── Types ───────────────────────────────────────────────────────
type StatusPenjemputan = "disiapkan" | "dalam_pengiriman" | "terkirim";

interface ItemDonasi {
  jenis: string;
  jumlah: string;
}

interface Penjemputan {
  id: number;
  barang_id: number;
  donatur: { id: number; nama: string; kota: string | null; alamat_lengkap: string | null; no_telpon: string | null };
  barang_info: {
      kategori: string;
      jumlah: string;
  };
  kurir: string | null;
  resi: string | null;
  status: StatusPenjemputan;
  waktu_request: string;
  waktu_update: string;
}

// ─── Helpers ─────────────────────────────────────────────────────
const statusConfig: Record<
  StatusPenjemputan,
  { label: string; badgeColor: "yellow" | "blue" | "green"; borderColor: string }
> = {
  disiapkan: {
    label: "Menunggu Dijemput",
    badgeColor: "yellow",
    borderColor: "border-l-orange-400",
  },
  dalam_pengiriman: {
    label: "Sedang Dijemput",
    badgeColor: "blue",
    borderColor: "border-l-blue-400",
  },
  terkirim: {
    label: "Selesai (Di Gudang)",
    badgeColor: "green",
    borderColor: "border-l-green-500",
  },
};

type TabKey = "semua" | "disiapkan" | "dalam_pengiriman" | "terkirim";

const tabs: { key: TabKey; label: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "disiapkan", label: "Menunggu Dijemput" },
  { key: "dalam_pengiriman", label: "Sedang Dijemput" },
  { key: "terkirim", label: "Selesai" },
];

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

// ─── Page Component ──────────────────────────────────────────────
export default function PenjemputanBarangPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("semua");
  const [data, setData] = useState<Penjemputan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Modal form state
  const [formKurir, setFormKurir] = useState("");
  const [formTanggal, setFormTanggal] = useState("");
  const [formCatatan, setFormCatatan] = useState("");

  const fetchData = async () => {
    try {
        setIsLoading(true);
        const res = await fetch('/api/admin/penjemputan');
        const json = await res.json();
        if (json.data) setData(json.data);
    } catch (err) {
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Stats ──────────────────────────────────────────────────────
  const totalHariIni = data.length;
  const menungguCount = data.filter((p) => p.status === "disiapkan").length;
  const sedangCount = data.filter((p) => p.status === "dalam_pengiriman").length;
  const selesaiCount = data.filter((p) => p.status === "terkirim").length;

  const stats = [
    {
      title: "Total Penjemputan Hari Ini",
      value: isLoading ? "..." : totalHariIni,
      icon: <Truck size={24} />,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Menunggu Dijemput",
      value: isLoading ? "..." : menungguCount,
      icon: <Clock size={24} />,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
    {
      title: "Sedang Dijemput",
      value: isLoading ? "..." : sedangCount,
      icon: <Navigation size={24} />,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Selesai Dijemput",
      value: isLoading ? "..." : selesaiCount,
      icon: <CheckCircle size={24} />,
      color: "text-green-600",
      bg: "bg-green-100",
    },
  ];

  // ── Filtered List ──────────────────────────────────────────────
  const filteredData =
    activeTab === "semua" ? data : data.filter((p) => p.status === activeTab);

  // ── Actions ────────────────────────────────────────────────────
  const openScheduleModal = (id: number) => {
    setSelectedId(id);
    setFormKurir("");
    setFormTanggal("");
    setFormCatatan("");
    setModalOpen(true);
  };

  const handleScheduleSubmit = async () => {
    if (!selectedId || !formKurir) return;
    setIsProcessing(true);
    try {
        const res = await fetch(`/api/admin/penjemputan/${selectedId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kurir: formKurir, status: 'dalam_pengiriman', catatan: formCatatan })
        });
        if (res.ok) {
            await fetchData();
            setModalOpen(false);
        }
    } catch (err) {
        console.error(err);
    } finally {
        setIsProcessing(false);
    }
  };

  const markAsPickedUp = async (id: number) => {
    setIsProcessing(true);
    try {
        const res = await fetch(`/api/admin/penjemputan/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'terkirim' })
        });
        if (res.ok) await fetchData();
    } catch (err) {
        console.error(err);
    } finally {
        setIsProcessing(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-stone-900">
            Penjemputan Barang
          </h1>
          <p className="text-stone-500 mt-1">
            Kelola jadwal penjemputan donasi pakaian dari rumah donatur.
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, i) => (
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
                {s.value}
              </div>
              <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-0.5">
                {s.title}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Map Placeholder + Tabs & Cards — 2-col layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Map Placeholder */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-5 border-b border-stone-100">
              <h3 className="font-display font-bold text-stone-900 flex items-center gap-2">
                <Navigation size={18} className="text-green-600" />
                Peta Rute Penjemputan
              </h3>
            </div>
            <div className="flex-1 min-h-[320px] bg-gradient-to-br from-stone-100 via-stone-50 to-green-50 flex flex-col items-center justify-center p-6 gap-4">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <MapPin size={36} className="text-green-600" />
              </div>
              <div className="text-center">
                <p className="font-display font-bold text-stone-700">
                  Peta Rute Penjemputan
                </p>
                <p className="text-sm text-stone-400 mt-1">
                  Integrasi peta akan ditampilkan di sini
                </p>
              </div>
              {/* Route summary mini */}
              <div className="w-full mt-2 space-y-2">
                {data
                  .filter((p) => p.status === "dalam_pengiriman")
                  .map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 bg-white/80 backdrop-blur rounded-xl px-4 py-3 border border-stone-200/60"
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-stone-700 truncate">
                          {p.donatur?.nama}
                        </p>
                        <p className="text-xs text-stone-400 truncate">
                          {p.donatur?.alamat_lengkap || p.donatur?.kota || "-"}
                        </p>
                      </div>
                    </div>
                  ))}
                {data.filter((p) => p.status === "dalam_pengiriman").length ===
                  0 && (
                  <p className="text-xs text-stone-400 text-center">
                    Tidak ada penjemputan aktif saat ini.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Tab filter + Pickup Cards */}
        <div className="xl:col-span-2 space-y-5">
          {/* Filter Dropdown */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 flex flex-wrap items-center gap-3">
              <Filter size={18} className="text-stone-400" />
              <span className="text-sm font-semibold text-stone-600">Filter Status:</span>
              <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value as TabKey)}
                  className="px-4 py-2 rounded-xl border border-stone-200 bg-stone-50 text-sm font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all cursor-pointer min-w-[200px]"
              >
                  {tabs.map((tab) => (
                      <option key={tab.key} value={tab.key}>
                          {tab.label}
                      </option>
                  ))}
              </select>
          </div>

          {/* Card List */}
          <div className="space-y-4">
            {isLoading ? (
                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-12 text-center">
                    <Loader2 size={48} className="mx-auto mb-4 text-stone-300 animate-spin" />
                    <p className="font-semibold text-stone-500">Memuat data...</p>
                </div>
            ) : filteredData.length === 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-12 text-center">
                <Package size={48} className="mx-auto mb-4 text-stone-300" />
                <p className="font-semibold text-stone-500">
                  Tidak ada penjemputan dengan status ini.
                </p>
              </div>
            ) : (
                filteredData.map((item, idx) => {
                  const cfg = statusConfig[item.status];
                  return (
                    <div
                      key={item.id}
                      className={`bg-white rounded-2xl border border-stone-200 shadow-sm border-l-4 ${cfg.borderColor} hover:shadow-md transition-all duration-200`}
                      style={{ animationDelay: `${idx * 60}ms` }}
                    >
                      <div className="p-5">
                        {/* Top row: donatur + badge */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                              <User size={18} className="text-stone-500" />
                            </div>
                            <div>
                              <h4 className="font-display font-bold text-stone-900">
                                {item.donatur?.nama}
                              </h4>
                              <div className="flex items-center gap-1.5 text-sm text-stone-500 mt-0.5">
                                <MapPin size={13} />
                                <span>
                                  {item.donatur?.alamat_lengkap || item.donatur?.kota || "-"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-sm text-stone-400 mt-0.5">
                                <Phone size={13} />
                                <span>{item.donatur?.no_telpon || "-"}</span>
                              </div>
                            </div>
                          </div>
                          <Badge color={cfg.badgeColor}>{cfg.label}</Badge>
                        </div>
    
                        {/* Items + Schedule info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Items to pick up */}
                          <div className="bg-stone-50 rounded-xl p-4">
                            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                              Barang yang Dijemput
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span
                                  className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg text-sm font-medium text-stone-700 border border-stone-200"
                                >
                                  <Package size={13} className="text-stone-400" />
                                  {item.barang_info.kategori}
                                  <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md ml-0.5">
                                    {item.barang_info.jumlah}
                                  </span>
                                </span>
                            </div>
                          </div>
    
                          {/* Time preference + Kurir */}
                          <div className="bg-stone-50 rounded-xl p-4 space-y-2">
                            {item.kurir && (
                              <div>
                                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">
                                  Kurir
                                </p>
                                <div className="flex items-center gap-1.5 text-sm font-semibold text-stone-700">
                                  <Truck size={14} className="text-green-600" />
                                  {item.kurir}
                                </div>
                              </div>
                            )}
                            <p className="text-xs text-stone-400">
                              Waktu Permintaan: {formatDate(item.waktu_request)}
                            </p>
                            {item.resi && (
                              <p className="text-xs font-bold text-stone-500 bg-white border border-stone-200 px-2 py-1 rounded inline-block mt-1">
                                Resi: {item.resi}
                              </p>
                            )}
                          </div>
                        </div>
    
                        {/* Action buttons */}
                        {item.status !== "terkirim" && (
                          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-stone-100">
                            {item.status === "disiapkan" && (
                              <Button
                                variant="primary"
                                size="sm"
                                disabled={isProcessing}
                                onClick={() => openScheduleModal(item.id)}
                              >
                                <Truck size={15} />
                                Tugaskan Kurir
                              </Button>
                            )}
                            {item.status === "dalam_pengiriman" && (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isProcessing}
                                onClick={() => markAsPickedUp(item.id)}
                              >
                                <CheckCircle size={15} />
                                Tandai Selesai
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
            }))}
          </div>
        </div>
      </div>

      {/* ── Modal: Jadwalkan Penjemputan ──────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-stone-200 animate-[fadeIn_0.25s_ease]">
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <div>
                <h3 className="font-display font-bold text-lg text-stone-900">
                  Jadwalkan Penjemputan
                </h3>
                <p className="text-sm text-stone-500 mt-0.5">
                  {selectedId
                    ? `Untuk ID #${selectedId}`
                    : "Buat jadwal penjemputan baru"}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-stone-100 transition-colors"
              >
                <X size={18} className="text-stone-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                  Nama Kurir / Driver
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                  />
                  <input
                    type="text"
                    value={formKurir}
                    onChange={(e) => setFormKurir(e.target.value)}
                    placeholder="Contoh: GoSend - Budi, atau kurir internal"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                  Catatan Tambahan (Resi/Detail)
                </label>
                <textarea
                  value={formCatatan}
                  onChange={(e) => setFormCatatan(e.target.value)}
                  placeholder="Catatan opsional..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 pt-0">
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleScheduleSubmit}
                disabled={!formKurir || isProcessing}
              >
                <Truck size={15} />
                Jadwalkan Penjemputan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
