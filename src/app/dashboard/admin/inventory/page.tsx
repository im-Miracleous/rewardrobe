"use client";
import React, { useState, useEffect } from "react";
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
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { STATUS_BARANG_LABEL, STATUS_BARANG_BADGE, type StatusBarang } from '@/lib/statusBarang';

// ─── Data Types ────────────────────────────────────────────────────────────────

interface InventoryItem {
  id: number;
  judul: string | null;
  kategori: string | null;
  kondisi: string | null;
  deskripsi: string;
  foto_url: string | null;
  donatur: { id: number; nama: string };
  status: "menunggu_pengiriman" | "terkirim" | "ditolak" | "tersalurkan";
  created_at: string;
  updated_at: string;
  qr_code?: string;
}

const KATEGORI_OPTIONS = ["Semua", "Pakaian Pria", "Pakaian Wanita", "Pakaian Anak", "Sepatu", "Aksesoris"];
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

function ClothingPlaceholder({ kategori, foto_url }: { kategori: string | null; foto_url: string | null }) {
  if (foto_url) {
      return (
          <div className="w-full h-44 bg-stone-100 flex items-center justify-center overflow-hidden">
              <img src={foto_url} alt="Foto Barang" className="w-full h-full object-cover" />
          </div>
      );
  }

  const bgColors: Record<string, string> = {
    "Pakaian Pria": "from-blue-50 to-blue-100",
    "Pakaian Wanita": "from-emerald-50 to-emerald-100",
    "Pakaian Anak": "from-amber-50 to-amber-100",
  };
  const iconColors: Record<string, string> = {
    "Pakaian Pria": "text-blue-400",
    "Pakaian Wanita": "text-emerald-400",
    "Pakaian Anak": "text-amber-400",
  };
  return (
    <div className={`w-full h-44 bg-gradient-to-br ${kategori ? (bgColors[kategori] ?? "from-stone-50 to-stone-100") : "from-stone-50 to-stone-100"} flex items-center justify-center`}>
      <Shirt size={48} className={`${kategori ? (iconColors[kategori] ?? "text-stone-300") : "text-stone-300"} opacity-70`} />
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);

  // QR modal state
  const [qrModal, setQrModal] = useState<InventoryItem | null>(null);

  const fetchData = async () => {
    try {
        setIsLoading(true);
        const res = await fetch('/api/admin/inventory');
        const json = await res.json();
        if (json.data) {
            setItems(json.data);
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

  // ── Filtering ────────────────────────────────────────────────────────────
  const filtered = items.filter((item) => {
    const matchSearch =
      (item.judul || "").toLowerCase().includes(search.toLowerCase()) ||
      item.id.toString().includes(search.toLowerCase()) ||
      item.donatur?.nama?.toLowerCase().includes(search.toLowerCase());
    const matchKategori = kategoriFilter === "Semua" || item.kategori === kategoriFilter;
    const matchStatus = statusFilter === "Semua" || item.status === statusFilter;
    return matchSearch && matchKategori && matchStatus;
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
  const siapSalurkan = items.filter((i) => i.status === "terkirim").length; // Di gudang artinya sudah terkirim ke admin
  const tersalurkan = items.filter((i) => i.status === "tersalurkan").length;

  const getStatusBadge = (status: string) => {
    const s = status as StatusBarang;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border ${STATUS_BARANG_BADGE[s] ?? ''}`}>
        {STATUS_BARANG_LABEL[s] ?? status}
      </span>
    );
  };

  const kondisiBadgeColor = (s: string | null) => {
      switch (s?.toLowerCase()) {
          case 'baik': return 'green';
          case 'cukup': return 'yellow';
          case 'kurang': return 'red';
          default: return 'stone';
      }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-stone-900">Inventory &amp; Katalog Gudang</h1>
        <p className="text-stone-500">Kelola stok gudang, lihat QR code item siap disalurkan dan tersalurkan.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { title: "Total Item", val: isLoading ? "..." : totalGudang, icon: <Package size={24} />, color: "text-purple-600", bg: "bg-purple-100" },
          { title: "Siap Disalurkan", val: isLoading ? "..." : siapSalurkan, icon: <CheckCircle size={24} />, color: "text-green-600", bg: "bg-green-100" },
          { title: "Sudah Tersalurkan", val: isLoading ? "..." : tersalurkan, icon: <Truck size={24} />, color: "text-blue-600", bg: "bg-blue-100" },
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

            {/* Status filter */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-stone-400" />
              <select
                value={statusFilter}
                onChange={(e) => updateFilter(setStatusFilter, e.target.value)}
                className="px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-all cursor-pointer"
              >
                <option value="Semua">Semua Status</option>
                <option value="terkirim">{STATUS_BARANG_LABEL['terkirim']}</option>
                <option value="tersalurkan">{STATUS_BARANG_LABEL['tersalurkan']}</option>
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
      {isLoading ? (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-16 text-center">
              <Loader2 size={48} className="mx-auto mb-4 text-stone-300 animate-spin" />
              <p className="font-semibold text-stone-500">Memuat data inventaris...</p>
          </div>
      ) : filtered.length === 0 ? (
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
              className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col"
            >
              {/* Image placeholder */}
              <div className="relative overflow-hidden shrink-0">
                <ClothingPlaceholder kategori={item.kategori} foto_url={item.foto_url} />
                <div className="absolute top-3 right-3">
                    <div className="bg-green-500 text-white p-1.5 rounded-lg shadow-md cursor-pointer hover:bg-green-600 transition-colors" onClick={() => setQrModal(item)}>
                      <QrCode size={16} />
                    </div>
                </div>
                {/* Status badge overlay */}
                <div className="absolute top-3 left-3">
                  {getStatusBadge(item.status)}
                </div>
              </div>

              {/* Card content */}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-display font-bold text-stone-900 leading-tight">{item.judul || item.kategori || "Barang Donasi"}</h3>
                    <p className="text-xs text-stone-400 mt-0.5 font-mono">ID: {item.id}</p>
                  </div>
                  {item.kondisi && <Badge color={kondisiBadgeColor(item.kondisi)}>{item.kondisi}</Badge>}
                </div>

                <div className="flex items-center gap-4 text-xs text-stone-500 mb-2">
                  <span className="flex items-center gap-1">
                    <Shirt size={12} /> {item.kategori || "Pakaian"}
                  </span>
                </div>

                <div className="text-xs text-stone-400 mb-2">
                  Donatur: <span className="text-stone-600 font-semibold">{item.donatur?.nama}</span>
                </div>

                <div className="text-xs text-stone-500 mb-4 line-clamp-2">
                    {item.deskripsi}
                </div>

                <div className="mt-auto pt-4 border-t border-stone-100 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 !text-xs" onClick={() => setQrModal(item)}>
                      <Eye size={14} /> Lihat QR
                    </Button>
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
                  <th className="p-5 text-xs font-bold text-stone-400 uppercase tracking-wider">QR / Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((item) => (
                  <tr key={item.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400 overflow-hidden">
                          {item.foto_url ? <img src={item.foto_url} alt="Item" className="w-full h-full object-cover" /> : <Shirt size={18} />}
                        </div>
                        <div>
                          <div className="font-bold text-stone-800 text-sm">{item.judul || item.kategori}</div>
                          <div className="text-xs text-stone-400 font-mono">ID: {item.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-sm text-stone-600">{item.kategori || "-"}</td>
                    <td className="p-5">
                      {item.kondisi ? <Badge color={kondisiBadgeColor(item.kondisi)}>{item.kondisi}</Badge> : "-"}
                    </td>
                    <td className="p-5 text-sm text-stone-600">{item.donatur?.nama}</td>
                    <td className="p-5">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="p-5">
                      <Button variant="ghost" size="sm" className="!text-xs" onClick={() => setQrModal(item)}>
                        <QrCode size={14} /> Lihat QR
                      </Button>
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
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setQrModal(null)} />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[fadeIn_0.2s_ease]">
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                  <QrCode size={20} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-stone-900">QR Code Item</h3>
                  <p className="text-xs text-stone-400">ID: {qrModal.id}</p>
                </div>
              </div>
              <button
                onClick={() => setQrModal(null)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-8 flex flex-col items-center">
              <div className="p-6 bg-white border-2 border-stone-200 rounded-2xl shadow-inner">
                <MockQRCode />
              </div>
              <p className="mt-4 text-xs text-stone-400 font-mono text-center select-all">
                {qrModal.qr_code || `QR-RWD-${qrModal.id}-GUDANG`}
              </p>
            </div>

            <div className="mx-6 mb-6 bg-stone-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">Nama Item</span>
                <span className="font-bold text-stone-800">{qrModal.judul || qrModal.kategori || "-"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">Kategori</span>
                <span className="font-semibold text-stone-600">{qrModal.kategori || "-"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">Kondisi</span>
                {qrModal.kondisi ? <Badge color={kondisiBadgeColor(qrModal.kondisi)}>{qrModal.kondisi}</Badge> : <span>-</span>}
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">Donatur</span>
                <span className="font-semibold text-stone-600">{qrModal.donatur?.nama}</span>
              </div>
            </div>

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
