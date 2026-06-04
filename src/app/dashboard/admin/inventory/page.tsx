"use client";
import React, { useState } from "react";
import {
  QrCode,
  Search,
  Grid3X3,
  List,
  Filter,
  Shirt,
  Download,
  Printer,
  Eye,
  Package,
  CheckCircle,
  X,
  Tag,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

// ─── Mock Data ────────────────────────────────────────────────────────────────

interface InventoryItem {
  id: string;
  nama: string;
  kategori: string;
  kondisi: "Baik" | "Fair";
  donatur: string;
  hasQR: boolean;
  status: "gudang" | "siap" | "tersalurkan";
  tanggalMasuk: string;
  ukuran: string;
}

const MOCK_ITEMS: InventoryItem[] = [
  { id: "INV-001", nama: "Jaket Denim Biru", kategori: "Jaket", kondisi: "Baik", donatur: "Rina Amelia", hasQR: true, status: "siap", tanggalMasuk: "2026-05-28", ukuran: "M" },
  { id: "INV-002", nama: "Kaos Polos Putih", kategori: "Atasan", kondisi: "Baik", donatur: "Budi Santoso", hasQR: true, status: "gudang", tanggalMasuk: "2026-05-29", ukuran: "L" },
  { id: "INV-003", nama: "Celana Jeans Hitam", kategori: "Bawahan", kondisi: "Fair", donatur: "Siti Nurhaliza", hasQR: false, status: "gudang", tanggalMasuk: "2026-05-30", ukuran: "32" },
  { id: "INV-004", nama: "Kemeja Flanel Merah", kategori: "Atasan", kondisi: "Baik", donatur: "Ahmad Fauzi", hasQR: true, status: "tersalurkan", tanggalMasuk: "2026-05-25", ukuran: "XL" },
  { id: "INV-005", nama: "Hoodie Abu-abu", kategori: "Jaket", kondisi: "Baik", donatur: "Dewi Kartika", hasQR: false, status: "gudang", tanggalMasuk: "2026-05-31", ukuran: "M" },
  { id: "INV-006", nama: "Rok Midi Coklat", kategori: "Bawahan", kondisi: "Fair", donatur: "Lina Marlina", hasQR: true, status: "siap", tanggalMasuk: "2026-05-27", ukuran: "S" },
  { id: "INV-007", nama: "Blazer Hitam Formal", kategori: "Jaket", kondisi: "Baik", donatur: "Hendra Wijaya", hasQR: false, status: "gudang", tanggalMasuk: "2026-06-01", ukuran: "L" },
  { id: "INV-008", nama: "Kaos Lengan Panjang", kategori: "Atasan", kondisi: "Fair", donatur: "Maya Sari", hasQR: true, status: "gudang", tanggalMasuk: "2026-06-02", ukuran: "M" },
  { id: "INV-009", nama: "Celana Pendek Kargo", kategori: "Bawahan", kondisi: "Baik", donatur: "Rizky Pratama", hasQR: false, status: "gudang", tanggalMasuk: "2026-06-02", ukuran: "34" },
  { id: "INV-010", nama: "Cardigan Rajut Cream", kategori: "Atasan", kondisi: "Baik", donatur: "Anisa Putri", hasQR: true, status: "siap", tanggalMasuk: "2026-05-26", ukuran: "S" },
];

const KATEGORI_OPTIONS = ["Semua", "Jaket", "Atasan", "Bawahan"];
const KONDISI_OPTIONS = ["Semua", "Baik", "Fair"];
const ITEMS_PER_PAGE = 6;

// ─── QR Code SVG (mock) ──────────────────────────────────────────────────────

function MockQRCode() {
  const pattern = [
    [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1,0,0,1,0,1,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,0,0,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,0,0,1,1,1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1,0,1,0,0,1,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,1,1,1,0,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1],
    [0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0],
    [1,0,1,0,1,1,1,1,0,0,1,0,1,1,0,1,0,1,1],
    [0,1,0,1,0,0,0,1,1,0,1,1,0,0,1,0,1,0,0],
    [1,1,0,0,1,1,1,0,0,1,0,0,1,0,1,1,0,0,1],
    [0,0,0,0,0,0,0,0,1,0,1,0,0,1,0,0,1,1,0],
    [1,1,1,1,1,1,1,0,0,1,0,1,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,1,0,1,0,1,0,0,1,0,1,1,1,0],
    [1,0,1,1,1,0,1,0,1,1,0,1,1,0,0,0,1,0,1],
    [1,0,1,1,1,0,1,0,0,0,1,0,1,1,0,1,0,1,0],
    [1,0,1,1,1,0,1,0,1,0,0,1,0,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,1,1,0,1,0,1,0,0,1,0],
    [1,1,1,1,1,1,1,0,1,0,1,1,0,1,0,1,0,0,1],
  ];
  const size = 6;
  return (
    <svg width={19 * size} height={19 * size} viewBox={`0 0 ${19 * size} ${19 * size}`} className="mx-auto">
      {pattern.map((row, y) =>
        row.map((cell, x) =>
          cell ? (
            <rect key={`${y}-${x}`} x={x * size} y={y * size} width={size} height={size} fill="#18181b" rx={1} />
          ) : null
        )
      )}
    </svg>
  );
}

// ─── Clothing Placeholder ────────────────────────────────────────────────────

function ClothingPlaceholder({ kategori }: { kategori: string }) {
  const bgColors: Record<string, string> = {
    Jaket: "from-blue-50 to-blue-100",
    Atasan: "from-emerald-50 to-emerald-100",
    Bawahan: "from-amber-50 to-amber-100",
  };
  const iconColors: Record<string, string> = {
    Jaket: "text-blue-400",
    Atasan: "text-emerald-400",
    Bawahan: "text-amber-400",
  };
  return (
    <div className={`w-full h-44 bg-gradient-to-br ${bgColors[kategori] ?? "from-stone-50 to-stone-100"} flex items-center justify-center`}>
      <Shirt size={48} className={`${iconColors[kategori] ?? "text-stone-300"} opacity-70`} />
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(MOCK_ITEMS);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("Semua");
  const [kondisiFilter, setKondisiFilter] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);

  // QR modal state
  const [qrModal, setQrModal] = useState<InventoryItem | null>(null);

  // ── Filtering ────────────────────────────────────────────────────────────
  const filtered = items.filter((item) => {
    const matchSearch =
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.donatur.toLowerCase().includes(search.toLowerCase());
    const matchKategori = kategoriFilter === "Semua" || item.kategori === kategoriFilter;
    const matchKondisi = kondisiFilter === "Semua" || item.kondisi === kondisiFilter;
    return matchSearch && matchKategori && matchKondisi;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // reset page when filters change
  const updateFilter = (setter: React.Dispatch<React.SetStateAction<string>>, val: string) => {
    setter(val);
    setCurrentPage(1);
  };

  // ── Stats ────────────────────────────────────────────────────────────────
  const totalGudang = items.length;
  const siapSalurkan = items.filter((i) => i.status === "siap").length;
  const menungguQR = items.filter((i) => !i.hasQR).length;
  const tersalurkan = items.filter((i) => i.status === "tersalurkan").length;

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleGenerateQR = (item: InventoryItem) => {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, hasQR: true } : i)));
    setQrModal({ ...item, hasQR: true });
  };

  const handleMarkSiap = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status: "siap" } : i)));
  };

  const statusLabel = (s: string) => {
    switch (s) {
      case "siap": return "Siap Disalurkan";
      case "tersalurkan": return "Tersalurkan";
      default: return "Di Gudang";
    }
  };

  const statusBadgeColor = (s: string): "green" | "blue" | "stone" => {
    switch (s) {
      case "siap": return "green";
      case "tersalurkan": return "blue";
      default: return "stone";
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-stone-900">Inventory &amp; Katalog</h1>
        <p className="text-stone-500">Kelola stok gudang, generate QR code, dan tandai barang siap disalurkan.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { title: "Total Item di Gudang", val: totalGudang, icon: <Package size={24} />, color: "text-purple-600", bg: "bg-purple-100" },
          { title: "Siap Disalurkan", val: siapSalurkan, icon: <CheckCircle size={24} />, color: "text-green-600", bg: "bg-green-100" },
          { title: "Menunggu QR", val: menungguQR, icon: <QrCode size={24} />, color: "text-orange-600", bg: "bg-orange-100" },
          { title: "Sudah Tersalurkan", val: tersalurkan, icon: <Truck size={24} />, color: "text-blue-600", bg: "bg-blue-100" },
        ].map((s, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow duration-200">
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

      {/* Toolbar: Search + Filters + View Toggle */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-5">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 w-full lg:max-w-sm">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Cari item, ID, atau donatur..."
              value={search}
              onChange={(e) => updateFilter(setSearch, e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {/* Category filter */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-stone-400" />
              <select
                value={kategoriFilter}
                onChange={(e) => updateFilter(setKategoriFilter, e.target.value)}
                className="px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-all cursor-pointer"
              >
                {KATEGORI_OPTIONS.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>

            {/* Condition filter */}
            <div className="flex items-center gap-2">
              <Tag size={16} className="text-stone-400" />
              <select
                value={kondisiFilter}
                onChange={(e) => updateFilter(setKondisiFilter, e.target.value)}
                className="px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-all cursor-pointer"
              >
                {KONDISI_OPTIONS.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>

            {/* View toggle */}
            <div className="flex items-center bg-stone-100 rounded-xl p-1 ml-auto">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all duration-200 ${viewMode === "grid" ? "bg-white shadow-sm text-green-600" : "text-stone-400 hover:text-stone-600"}`}
              >
                <Grid3X3 size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all duration-200 ${viewMode === "list" ? "bg-white shadow-sm text-green-600" : "text-stone-400 hover:text-stone-600"}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-3 text-xs text-stone-400 font-semibold">
          Menampilkan {paginated.length} dari {filtered.length} item
        </div>
      </div>

      {/* Content Area */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-16 text-center">
          <Package size={48} className="mx-auto mb-4 text-stone-300" />
          <p className="font-semibold text-stone-500">Tidak ada item yang cocok</p>
          <p className="text-sm text-stone-400 mt-1">Coba ubah filter atau kata kunci pencarian Anda.</p>
        </div>
      ) : viewMode === "grid" ? (
        /* ── Grid View ─────────────────────────────────────────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginated.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
            >
              {/* Image placeholder */}
              <div className="relative overflow-hidden">
                <ClothingPlaceholder kategori={item.kategori} />
                {/* QR indicator overlay */}
                <div className="absolute top-3 right-3">
                  {item.hasQR ? (
                    <div className="bg-green-500 text-white p-1.5 rounded-lg shadow-md">
                      <QrCode size={16} />
                    </div>
                  ) : (
                    <div className="bg-orange-400 text-white p-1.5 rounded-lg shadow-md animate-pulse">
                      <QrCode size={16} />
                    </div>
                  )}
                </div>
                {/* Status badge overlay */}
                <div className="absolute top-3 left-3">
                  <Badge color={statusBadgeColor(item.status)}>{statusLabel(item.status)}</Badge>
                </div>
              </div>

              {/* Card content */}
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display font-bold text-stone-900 leading-tight">{item.nama}</h3>
                    <p className="text-xs text-stone-400 mt-0.5 font-mono">{item.id}</p>
                  </div>
                  <Badge color={item.kondisi === "Baik" ? "green" : "yellow"}>{item.kondisi}</Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-stone-500">
                  <span className="flex items-center gap-1">
                    <Shirt size={12} /> {item.kategori}
                  </span>
                  <span>Ukuran {item.ukuran}</span>
                </div>

                <div className="text-xs text-stone-400">
                  Donatur: <span className="text-stone-600 font-semibold">{item.donatur}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-stone-100">
                  {item.hasQR ? (
                    <Button variant="outline" size="sm" className="flex-1 !text-xs" onClick={() => setQrModal(item)}>
                      <Eye size={14} /> Lihat QR
                    </Button>
                  ) : (
                    <Button variant="primary" size="sm" className="flex-1 !text-xs" onClick={() => handleGenerateQR(item)}>
                      <QrCode size={14} /> Generate QR
                    </Button>
                  )}
                  {item.status === "gudang" && (
                    <Button variant="ghost" size="sm" className="!text-xs" onClick={() => handleMarkSiap(item.id)}>
                      <CheckCircle size={14} /> Siap
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── List View ─────────────────────────────────────────────────────── */
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-stone-200">
                  <th className="p-5 text-xs font-bold text-stone-400 uppercase tracking-wider">Item</th>
                  <th className="p-5 text-xs font-bold text-stone-400 uppercase tracking-wider">Kategori</th>
                  <th className="p-5 text-xs font-bold text-stone-400 uppercase tracking-wider">Kondisi</th>
                  <th className="p-5 text-xs font-bold text-stone-400 uppercase tracking-wider">Donatur</th>
                  <th className="p-5 text-xs font-bold text-stone-400 uppercase tracking-wider">Status</th>
                  <th className="p-5 text-xs font-bold text-stone-400 uppercase tracking-wider">QR</th>
                  <th className="p-5 text-xs font-bold text-stone-400 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((item) => (
                  <tr key={item.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400">
                          <Shirt size={18} />
                        </div>
                        <div>
                          <div className="font-bold text-stone-800 text-sm">{item.nama}</div>
                          <div className="text-xs text-stone-400 font-mono">{item.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-sm text-stone-600">{item.kategori}</td>
                    <td className="p-5">
                      <Badge color={item.kondisi === "Baik" ? "green" : "yellow"}>{item.kondisi}</Badge>
                    </td>
                    <td className="p-5 text-sm text-stone-600">{item.donatur}</td>
                    <td className="p-5">
                      <Badge color={statusBadgeColor(item.status)}>{statusLabel(item.status)}</Badge>
                    </td>
                    <td className="p-5">
                      {item.hasQR ? (
                        <span className="inline-flex items-center gap-1 text-green-600 text-xs font-bold">
                          <CheckCircle size={14} /> Ada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-orange-500 text-xs font-bold">
                          <QrCode size={14} /> Belum
                        </span>
                      )}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2">
                        {item.hasQR ? (
                          <Button variant="ghost" size="sm" className="!text-xs" onClick={() => setQrModal(item)}>
                            <Eye size={14} /> Lihat QR
                          </Button>
                        ) : (
                          <Button variant="primary" size="sm" className="!text-xs" onClick={() => handleGenerateQR(item)}>
                            <QrCode size={14} /> Generate
                          </Button>
                        )}
                        {item.status === "gudang" && (
                          <Button variant="ghost" size="sm" className="!text-xs" onClick={() => handleMarkSiap(item.id)}>
                            <CheckCircle size={14} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="disabled:opacity-40"
          >
            ← Sebelumnya
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 rounded-xl text-sm font-bold transition-all duration-200 ${
                page === currentPage
                  ? "bg-green-600 text-white shadow-md shadow-green-600/20"
                  : "text-stone-500 hover:bg-stone-100"
              }`}
            >
              {page}
            </button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="disabled:opacity-40"
          >
            Selanjutnya →
          </Button>
        </div>
      )}

      {/* ── QR Code Modal ──────────────────────────────────────────────────── */}
      {qrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setQrModal(null)} />

          {/* Modal card */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[fadeIn_0.2s_ease]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                  <QrCode size={20} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-stone-900">QR Code Item</h3>
                  <p className="text-xs text-stone-400">{qrModal.id}</p>
                </div>
              </div>
              <button
                onClick={() => setQrModal(null)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* QR Code */}
            <div className="p-8 flex flex-col items-center">
              <div className="p-6 bg-white border-2 border-stone-200 rounded-2xl shadow-inner">
                <MockQRCode />
              </div>
              <p className="mt-4 text-xs text-stone-400 font-mono text-center select-all">
                RW-{qrModal.id}-{qrModal.kategori.toUpperCase().slice(0, 3)}-2026
              </p>
            </div>

            {/* Item details */}
            <div className="mx-6 mb-6 bg-stone-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">Nama Item</span>
                <span className="font-bold text-stone-800">{qrModal.nama}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">Kategori</span>
                <span className="font-semibold text-stone-600">{qrModal.kategori}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">Kondisi</span>
                <Badge color={qrModal.kondisi === "Baik" ? "green" : "yellow"}>{qrModal.kondisi}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">Ukuran</span>
                <span className="font-semibold text-stone-600">{qrModal.ukuran}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">Donatur</span>
                <span className="font-semibold text-stone-600">{qrModal.donatur}</span>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex gap-3 p-6 border-t border-stone-100 bg-stone-50/50">
              <Button variant="outline" size="sm" className="flex-1">
                <Printer size={16} /> Cetak QR
              </Button>
              <Button variant="primary" size="sm" className="flex-1">
                <Download size={16} /> Download QR
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
