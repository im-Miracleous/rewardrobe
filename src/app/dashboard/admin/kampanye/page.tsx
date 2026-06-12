"use client";
import React, { useState, useEffect } from "react";
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
  Loader2
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
  requirement: string | null;
  verification_required: boolean;
  created_at: string;
  gradient: string;
}

const gradientsList = [
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-violet-500 to-purple-600",
  "from-pink-500 to-rose-600",
  "from-sky-500 to-blue-600",
  "from-cyan-500 to-teal-600",
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

function persen(current: number, target: number | null) {
  if (!target || target === 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
}

/* ── Component ─────────────────────────────────────── */
export default function KelolaKampanyePage() {
  const [kampanyeList, setKampanyeList] = useState<Kampanye[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<"semua" | "aktif" | "selesai">("semua");
  const [showModal, setShowModal] = useState(false);

  /* form state */
  const [formJudul, setFormJudul] = useState("");
  const [formDeskripsi, setFormDeskripsi] = useState("");
  const [formTargetDana, setFormTargetDana] = useState("");
  const [formTargetBarang, setFormTargetBarang] = useState("");
  const [formRequirement, setFormRequirement] = useState("");
  const [formVerificationRequired, setFormVerificationRequired] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/campaigns');
      const json = await res.json();
      if (json.data) {
        // assign random gradient for UI purpose, backend doesn't store this
        const mapped = json.data.map((c: any, i: number) => ({
           ...c,
           jumlah_partisipan: 0, // In backend we didn't fetch fully, keeping it 0 or mock
           gradient: gradientsList[i % gradientsList.length]
        }));
        setKampanyeList(mapped);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
  const toggleStatus = async (id: number, currentStatus: string) => {
    setIsProcessing(true);
    try {
        const newStatus = currentStatus === 'aktif' ? 'selesai' : 'aktif';
        const res = await fetch(`/api/campaigns/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) {
            await fetchData();
        }
    } catch (err) {
        console.error(err);
    } finally {
        setIsProcessing(false);
    }
  };

  const handleCreate = async () => {
    if (!formJudul.trim()) return;
    
    setIsProcessing(true);
    try {
        const payload = {
            judul: formJudul.trim(),
            deskripsi: formDeskripsi.trim() || "Tidak ada deskripsi.",
            target_dana: formTargetDana ? Number(formTargetDana) : null,
            target_barang: formTargetBarang ? Number(formTargetBarang) : null,
            requirement: formRequirement.trim() || null,
            verification_required: formVerificationRequired,
        };

        const res = await fetch('/api/campaigns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            setFormJudul("");
            setFormDeskripsi("");
            setFormTargetDana("");
            setFormTargetBarang("");
            setFormRequirement("");
            setFormVerificationRequired(false);
            setShowModal(false);
            await fetchData();
        } else {
            const data = await res.json();
            alert(`Gagal membuat kampanye: ${data.error}`);
        }
    } catch (err) {
        console.error(err);
    } finally {
        setIsProcessing(false);
    }
  };

  /* ── Stats ─────────────────────────────────────── */
  const stats = [
    {
      title: "Kampanye Aktif",
      value: isLoading ? "..." : String(aktifCount),
      icon: <Megaphone size={24} />,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Total Kampanye",
      value: isLoading ? "..." : String(kampanyeList.length),
      icon: <Target size={24} />,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Total Dana Terkumpul",
      value: isLoading ? "..." : formatRupiah(totalDana),
      icon: <Banknote size={24} />,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      title: "Total Barang Terkumpul",
      value: isLoading ? "..." : `${totalBarang} Item`,
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
              <div className="text-xl lg:text-2xl font-display font-extrabold text-stone-900 truncate">
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
      {isLoading ? (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-16 text-center">
             <Loader2 size={48} className="mx-auto mb-4 text-stone-300 animate-spin" />
             <p className="font-semibold text-stone-500">Memuat data kampanye...</p>
          </div>
      ) : filtered.length === 0 ? (
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
              className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group flex flex-col"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              {/* Hero Image Area */}
              <div
                className={`relative h-44 bg-gradient-to-br ${k.gradient} overflow-hidden shrink-0`}
              >
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/30" />
                  <div className="absolute bottom-4 left-8 w-24 h-24 rounded-full bg-white/20" />
                  <div className="absolute top-12 left-1/2 w-16 h-16 rounded-lg rotate-45 bg-white/15" />
                </div>

                <div className="absolute top-4 right-4">
                  <Badge color={k.status === "aktif" ? "green" : "stone"}>
                    {k.status === "aktif" ? "Aktif" : "Selesai"}
                  </Badge>
                </div>

                <div className="absolute bottom-4 left-6 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                    <Megaphone size={22} />
                  </div>
                  <div className="text-white">
                    <div className="text-lg font-display font-bold leading-tight drop-shadow-md pr-4 line-clamp-2">
                      {k.judul}
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 flex flex-col flex-1">
                <p className="text-sm text-stone-600 leading-relaxed line-clamp-2 mb-4">
                  {k.deskripsi}
                </p>

                <div className="space-y-4 mb-4">
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

                {/* Requirement info */}
                {k.requirement && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Persyaratan Pakaian</p>
                    <p className="text-xs text-amber-800 leading-relaxed">{k.requirement}</p>
                  </div>
                )}
                {k.verification_required && (
                  <div className="mb-3">
                    <Badge color="yellow">Verifikasi Admin Wajib</Badge>
                  </div>
                )}

                {/* Meta row */}
                <div className="flex items-center gap-5 pt-1 text-xs text-stone-400 font-semibold mb-3">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    {formatTanggal(k.created_at)}
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
                <div className="flex items-center gap-3 pt-4 border-t border-stone-100 mt-auto">
                  <Button variant="outline" size="sm">
                    <Eye size={15} />
                    Lihat Detail
                  </Button>
                  {k.status === "aktif" ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isProcessing}
                      onClick={() => toggleStatus(k.id, k.status)}
                    >
                      <CheckCircle size={15} />
                      Tutup Kampanye
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isProcessing}
                      onClick={() => toggleStatus(k.id, k.status)}
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
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
            onClick={() => setShowModal(false)}
          />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-[fadeIn_0.3s_ease] border border-stone-200">
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

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
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

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
                  Persyaratan Pakaian
                </label>
                <textarea
                  value={formRequirement}
                  onChange={(e) => setFormRequirement(e.target.value)}
                  placeholder="Contoh: Pakaian harus bersih, layak pakai, bukan pakaian dalam. Opsional — kosongkan jika bebas."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-all resize-none"
                />
              </div>

              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <input
                  type="checkbox"
                  id="verif-required"
                  checked={formVerificationRequired}
                  onChange={(e) => setFormVerificationRequired(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="verif-required" className="cursor-pointer">
                  <p className="text-sm font-bold text-amber-800">Verifikasi Admin Wajib</p>
                  <p className="text-xs text-amber-700 mt-0.5">Centang ini jika admin perlu memeriksa setiap donasi sebelum masuk katalog (misal: kampanye bantu korban bencana).</p>
                </label>
              </div>

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

            <div className="flex items-center justify-end gap-3 p-6 border-t border-stone-100">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setShowModal(false)}
                disabled={isProcessing}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleCreate}
                disabled={!formJudul.trim() || isProcessing}
              >
                <TrendingUp size={16} />
                {isProcessing ? 'Menyimpan...' : 'Buat Kampanye'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
