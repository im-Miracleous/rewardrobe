"use client";
import React, { useState } from "react";
import {
  Megaphone,
  Plus,
  Target,
  Users,
  Banknote,
  Package,
  Calendar,
  TrendingUp,
  Eye,
  X,
  Upload,
  CheckCircle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

/* ── Types ─────────────────────────────────────────── */
interface Kampanye {
  id: number;
  judul: string;
  deskripsi: string;
  status: "aktif" | "selesai";
  target_dana: number | null;
  terkumpul_dana: number;
  target_barang: number | null;
  terkumpul_barang: number;
  jumlah_partisipan: number;
  tanggal_dibuat: string;
  gradient: string;
}

/* ── Mock Data ─────────────────────────────────────── */
const initialKampanye: Kampanye[] = [
  {
    id: 1,
    judul: "Baju Hangat untuk Cianjur",
    deskripsi:
      "Kampanye donasi pakaian hangat untuk korban bencana gempa Cianjur. Kami mengumpulkan jaket, sweater, dan selimut layak pakai untuk disalurkan ke pengungsi.",
    status: "aktif",
    target_dana: 5000000,
    terkumpul_dana: 2500000,
    target_barang: 100,
    terkumpul_barang: 45,
    jumlah_partisipan: 32,
    tanggal_dibuat: "2026-04-15",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: 2,
    judul: "Donasi Lebaran 2024",
    deskripsi:
      "Berbagi kebahagiaan di hari raya dengan menyumbangkan pakaian layak pakai kepada keluarga kurang mampu di seluruh Indonesia.",
    status: "aktif",
    target_dana: 10000000,
    terkumpul_dana: 7800000,
    target_barang: 200,
    terkumpul_barang: 156,
    jumlah_partisipan: 89,
    tanggal_dibuat: "2026-03-01",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    id: 3,
    judul: "Seragam untuk Panti Asuhan Kasih",
    deskripsi:
      "Mengumpulkan seragam sekolah bekas layak pakai untuk anak-anak di Panti Asuhan Kasih, Bandung. Ukuran SD hingga SMA.",
    status: "aktif",
    target_dana: null,
    terkumpul_dana: 0,
    target_barang: 50,
    terkumpul_barang: 28,
    jumlah_partisipan: 15,
    tanggal_dibuat: "2026-05-10",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    id: 4,
    judul: "Pakaian Bayi untuk Posyandu",
    deskripsi:
      "Donasi pakaian bayi dan balita untuk dibagikan melalui jaringan Posyandu di daerah pedesaan Jawa Barat. Prioritas pakaian baru atau kondisi sangat baik.",
    status: "aktif",
    target_dana: 3000000,
    terkumpul_dana: 1200000,
    target_barang: 80,
    terkumpul_barang: 34,
    jumlah_partisipan: 22,
    tanggal_dibuat: "2026-05-20",
    gradient: "from-pink-500 to-rose-600",
  },
  {
    id: 5,
    judul: "Kampanye Musim Hujan 2025",
    deskripsi:
      "Pengumpulan jas hujan, payung, dan jaket anti-air untuk masyarakat terdampak banjir di kawasan Jakarta Utara.",
    status: "selesai",
    target_dana: 8000000,
    terkumpul_dana: 8000000,
    target_barang: 150,
    terkumpul_barang: 163,
    jumlah_partisipan: 74,
    tanggal_dibuat: "2025-11-01",
    gradient: "from-sky-500 to-blue-600",
  },
  {
    id: 6,
    judul: "Baju Kerja untuk Pencari Kerja",
    deskripsi:
      "Menyediakan pakaian formal layak pakai bagi para pencari kerja dari keluarga kurang mampu agar tampil percaya diri saat wawancara.",
    status: "selesai",
    target_dana: 4000000,
    terkumpul_dana: 4500000,
    target_barang: 60,
    terkumpul_barang: 60,
    jumlah_partisipan: 41,
    tanggal_dibuat: "2025-09-15",
    gradient: "from-stone-500 to-stone-700",
  },
];

/* ── Helpers ────────────────────────────────────────── */
function formatRupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function formatTanggal(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function persen(current: number, target: number) {
  if (target === 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
}

/* ── Component ─────────────────────────────────────── */
export default function KelolaKampanyePage() {
  const [kampanyeList, setKampanyeList] = useState<Kampanye[]>(initialKampanye);
  const [activeTab, setActiveTab] = useState<"semua" | "aktif" | "selesai">("semua");
  const [showModal, setShowModal] = useState(false);

  /* form state */
  const [formJudul, setFormJudul] = useState("");
  const [formDeskripsi, setFormDeskripsi] = useState("");
  const [formTargetDana, setFormTargetDana] = useState("");
  const [formTargetBarang, setFormTargetBarang] = useState("");

  /* derived data */
  const filtered =
    activeTab === "semua"
      ? kampanyeList
      : kampanyeList.filter((k) => k.status === activeTab);

  const aktifCount = kampanyeList.filter((k) => k.status === "aktif").length;
  const totalDana = kampanyeList.reduce((s, k) => s + k.terkumpul_dana, 0);
  const totalBarang = kampanyeList.reduce((s, k) => s + k.terkumpul_barang, 0);

  const tabs: { key: "semua" | "aktif" | "selesai"; label: string }[] = [
    { key: "semua", label: "Semua" },
    { key: "aktif", label: "Aktif" },
    { key: "selesai", label: "Selesai" },
  ];

  /* actions */
  const toggleStatus = (id: number) => {
    setKampanyeList((prev) =>
      prev.map((k) =>
        k.id === id
          ? { ...k, status: k.status === "aktif" ? "selesai" : "aktif" }
          : k
      )
    );
  };

  const handleCreate = () => {
    if (!formJudul.trim()) return;
    const gradients = [
      "from-emerald-500 to-teal-600",
      "from-amber-500 to-orange-600",
      "from-violet-500 to-purple-600",
      "from-pink-500 to-rose-600",
      "from-sky-500 to-blue-600",
      "from-cyan-500 to-teal-600",
    ];
    const newK: Kampanye = {
      id: Date.now(),
      judul: formJudul.trim(),
      deskripsi: formDeskripsi.trim() || "Tidak ada deskripsi.",
      status: "aktif",
      target_dana: formTargetDana ? Number(formTargetDana) : null,
      terkumpul_dana: 0,
      target_barang: formTargetBarang ? Number(formTargetBarang) : null,
      terkumpul_barang: 0,
      jumlah_partisipan: 0,
      tanggal_dibuat: new Date().toISOString().split("T")[0],
      gradient: gradients[Math.floor(Math.random() * gradients.length)],
    };
    setKampanyeList((prev) => [newK, ...prev]);
    setFormJudul("");
    setFormDeskripsi("");
    setFormTargetDana("");
    setFormTargetBarang("");
    setShowModal(false);
  };

  /* ── Stats ─────────────────────────────────────── */
  const stats = [
    {
      title: "Kampanye Aktif",
      value: String(aktifCount),
      icon: <Megaphone size={24} />,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Total Kampanye",
      value: String(kampanyeList.length),
      icon: <Target size={24} />,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Total Dana Terkumpul",
      value: formatRupiah(totalDana),
      icon: <Banknote size={24} />,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      title: "Total Barang Terkumpul",
      value: `${totalBarang} Item`,
      icon: <Package size={24} />,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease]">
      {/* ── Header ─────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-stone-900">
            Kelola Kampanye
          </h1>
          <p className="text-stone-500">
            Buat, kelola, dan pantau kampanye donasi pakaian.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          Buat Kampanye Baru
        </Button>
      </div>

      {/* ── Stat Cards ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow duration-200"
          >
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center ${s.bg} ${s.color}`}
            >
              {s.icon}
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-display font-extrabold text-stone-900 truncate">
                {s.value}
              </div>
              <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mt-1">
                {s.title}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs ───────────────────────────────────── */}
      <div className="flex items-center gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
              activeTab === t.key
                ? "bg-green-600 text-white shadow-md shadow-green-600/20"
                : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Campaign Grid ──────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-16 text-center">
          <Megaphone
            size={48}
            className="mx-auto mb-4 text-stone-300"
          />
          <p className="font-semibold text-stone-500">
            Tidak ada kampanye ditemukan.
          </p>
          <p className="text-sm text-stone-400 mt-1">
            Coba ubah filter atau buat kampanye baru.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((k, idx) => (
            <div
              key={k.id}
              className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              {/* Hero Image Area */}
              <div
                className={`relative h-44 bg-gradient-to-br ${k.gradient} overflow-hidden`}
              >
                {/* Decorative shapes */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/30" />
                  <div className="absolute bottom-4 left-8 w-24 h-24 rounded-full bg-white/20" />
                  <div className="absolute top-12 left-1/2 w-16 h-16 rounded-lg rotate-45 bg-white/15" />
                </div>

                {/* Status badge */}
                <div className="absolute top-4 right-4">
                  <Badge color={k.status === "aktif" ? "green" : "stone"}>
                    {k.status === "aktif" ? "Aktif" : "Selesai"}
                  </Badge>
                </div>

                {/* Icon */}
                <div className="absolute bottom-4 left-6 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                    <Megaphone size={22} />
                  </div>
                  <div className="text-white">
                    <div className="text-lg font-display font-bold leading-tight drop-shadow-md">
                      {k.judul}
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Description */}
                <p className="text-sm text-stone-600 leading-relaxed line-clamp-2">
                  {k.deskripsi}
                </p>

                {/* Progress Bars */}
                <div className="space-y-4">
                  {k.target_dana !== null && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Banknote size={13} />
                          Target Dana
                        </span>
                        <span className="text-xs font-bold text-green-600">
                          {persen(k.terkumpul_dana, k.target_dana)}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-600 rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${persen(k.terkumpul_dana, k.target_dana)}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-stone-500 mt-1.5 font-semibold">
                        {formatRupiah(k.terkumpul_dana)}{" "}
                        <span className="text-stone-400">/ {formatRupiah(k.target_dana)}</span>
                      </p>
                    </div>
                  )}

                  {k.target_barang !== null && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                          <Package size={13} />
                          Target Barang
                        </span>
                        <span className="text-xs font-bold text-green-600">
                          {persen(k.terkumpul_barang, k.target_barang)}%
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-600 rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${persen(k.terkumpul_barang, k.target_barang)}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-stone-500 mt-1.5 font-semibold">
                        {k.terkumpul_barang} Item{" "}
                        <span className="text-stone-400">
                          / {k.target_barang} Item
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-5 pt-1 text-xs text-stone-400 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    {formatTanggal(k.tanggal_dibuat)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users size={13} />
                    {k.jumlah_partisipan} Partisipan
                  </span>
                  {k.status === "selesai" && (
                    <span className="flex items-center gap-1.5 text-green-600">
                      <CheckCircle size={13} />
                      Tercapai
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2 border-t border-stone-100">
                  <Button variant="outline" size="sm">
                    <Eye size={15} />
                    Lihat Detail
                  </Button>
                  {k.status === "aktif" ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStatus(k.id)}
                    >
                      <CheckCircle size={15} />
                      Tutup Kampanye
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStatus(k.id)}
                    >
                      <RotateCcw size={15} />
                      Reaktivasi
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Creation Modal ─────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
            onClick={() => setShowModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-[fadeIn_0.3s_ease] border border-stone-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <div>
                <h2 className="text-lg font-display font-bold text-stone-900">
                  Buat Kampanye Baru
                </h2>
                <p className="text-sm text-stone-500 mt-0.5">
                  Isi detail kampanye donasi yang ingin dibuat.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Judul */}
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                  Judul Kampanye <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formJudul}
                  onChange={(e) => setFormJudul(e.target.value)}
                  placeholder="Contoh: Baju Hangat untuk Cianjur"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-all"
                />
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                  Deskripsi
                </label>
                <textarea
                  value={formDeskripsi}
                  onChange={(e) => setFormDeskripsi(e.target.value)}
                  placeholder="Jelaskan tujuan dan latar belakang kampanye..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-all resize-none"
                />
              </div>

              {/* Target Dana & Barang */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                    Target Dana (Rp)
                  </label>
                  <input
                    type="number"
                    value={formTargetDana}
                    onChange={(e) => setFormTargetDana(e.target.value)}
                    placeholder="Opsional"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                    Target Barang (Item)
                  </label>
                  <input
                    type="number"
                    value={formTargetBarang}
                    onChange={(e) => setFormTargetBarang(e.target.value)}
                    placeholder="Opsional"
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-all"
                  />
                </div>
              </div>

              {/* Upload Foto */}
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                  Upload Foto Kampanye
                </label>
                <div className="border-2 border-dashed border-stone-200 rounded-xl p-6 text-center hover:border-green-400 hover:bg-green-50/30 transition-colors cursor-pointer group">
                  <Upload
                    size={28}
                    className="mx-auto mb-2 text-stone-400 group-hover:text-green-500 transition-colors"
                  />
                  <p className="text-sm font-semibold text-stone-600">
                    Klik atau seret foto ke sini
                  </p>
                  <p className="text-xs text-stone-400 mt-1">
                    PNG, JPG, WEBP (maks. 2MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-stone-100">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setShowModal(false)}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleCreate}
                disabled={!formJudul.trim()}
              >
                <TrendingUp size={16} />
                Buat Kampanye
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
