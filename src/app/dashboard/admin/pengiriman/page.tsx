// CODE-CITE:
//   Title: Admin Dashboard - Kelola Pengiriman
//   Type: ai
//   Value: Claude (claude.ai/code)
//   Notes: Halaman manajemen pengiriman barang ke penerima (panti asuhan, komunitas, pengrajin) dengan tabel, filter tab, dan panel slide-out
//   Lines Range: 1-450
"use client";
import React, { useState } from 'react';
import {
  Package,
  Send,
  Truck,
  CheckCircle,
  MapPin,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

type StatusPengiriman = 'disiapkan' | 'dalam_pengiriman' | 'terkirim';
type TipePenerima = 'Panti Asuhan' | 'Komunitas' | 'Pengrajin';

interface Pengiriman {
  id: number;
  penerima: string;
  tipePenerima: TipePenerima;
  barangDikirim: string[];
  kurir: string;
  noResi: string;
  status: StatusPengiriman;
  tanggalKirim: string;
}

const initialData: Pengiriman[] = [
  {
    id: 1,
    penerima: 'Panti Asuhan Kasih Ibu',
    tipePenerima: 'Panti Asuhan',
    barangDikirim: ['Kaos Anak x5', 'Celana Jeans x3'],
    kurir: 'JNE Express',
    noResi: 'JNE20260601001',
    status: 'terkirim',
    tanggalKirim: '2026-05-28',
  },
  {
    id: 2,
    penerima: 'Komunitas Peduli Sesama',
    tipePenerima: 'Komunitas',
    barangDikirim: ['Jaket Hoodie x2', 'Kemeja Flannel x4'],
    kurir: 'SiCepat',
    noResi: 'SCP20260602001',
    status: 'dalam_pengiriman',
    tanggalKirim: '2026-06-01',
  },
  {
    id: 3,
    penerima: 'Pengrajin Batik Cirebon',
    tipePenerima: 'Pengrajin',
    barangDikirim: ['Kain Bekas x10', 'Rok Panjang x3'],
    kurir: 'J&T Express',
    noResi: 'JT20260603001',
    status: 'disiapkan',
    tanggalKirim: '2026-06-03',
  },
  {
    id: 4,
    penerima: 'Panti Asuhan Harapan Bangsa',
    tipePenerima: 'Panti Asuhan',
    barangDikirim: ['Seragam Sekolah x8', 'Kaos Kaki x12'],
    kurir: 'Anteraja',
    noResi: 'ATJ20260604001',
    status: 'terkirim',
    tanggalKirim: '2026-05-25',
  },
  {
    id: 5,
    penerima: 'Komunitas Seni Kota Lama',
    tipePenerima: 'Komunitas',
    barangDikirim: ['Dress Bekas x4', 'Blazer x2'],
    kurir: 'JNE Express',
    noResi: 'JNE20260605001',
    status: 'dalam_pengiriman',
    tanggalKirim: '2026-06-02',
  },
  {
    id: 6,
    penerima: 'Pengrajin Tas Rajut Bandung',
    tipePenerima: 'Pengrajin',
    barangDikirim: ['Kaos Polos Bekas x15'],
    kurir: 'SiCepat',
    noResi: 'SCP20260606001',
    status: 'disiapkan',
    tanggalKirim: '2026-06-04',
  },
  {
    id: 7,
    penerima: 'Panti Asuhan Budi Mulia',
    tipePenerima: 'Panti Asuhan',
    barangDikirim: ['Sweater Anak x6', 'Celana Pendek x4'],
    kurir: 'J&T Express',
    noResi: 'JT20260607001',
    status: 'disiapkan',
    tanggalKirim: '2026-06-04',
  },
  {
    id: 8,
    penerima: 'Komunitas Daur Ulang Jakarta',
    tipePenerima: 'Komunitas',
    barangDikirim: ['Jaket Denim x3', 'Kemeja Putih x5', 'Rok Mini x2'],
    kurir: 'Anteraja',
    noResi: 'ATJ20260608001',
    status: 'terkirim',
    tanggalKirim: '2026-05-30',
  },
  {
    id: 9,
    penerima: 'Pengrajin Kain Perca Yogya',
    tipePenerima: 'Pengrajin',
    barangDikirim: ['Kemeja Bekas x8', 'Celana Kain x6'],
    kurir: 'JNE Express',
    noResi: 'JNE20260609001',
    status: 'dalam_pengiriman',
    tanggalKirim: '2026-06-03',
  },
];

const daftarPenerima = [
  { nama: 'Panti Asuhan Kasih Ibu', tipe: 'Panti Asuhan' as TipePenerima },
  { nama: 'Komunitas Peduli Sesama', tipe: 'Komunitas' as TipePenerima },
  { nama: 'Pengrajin Batik Cirebon', tipe: 'Pengrajin' as TipePenerima },
  { nama: 'Panti Asuhan Harapan Bangsa', tipe: 'Panti Asuhan' as TipePenerima },
  { nama: 'Komunitas Seni Kota Lama', tipe: 'Komunitas' as TipePenerima },
  { nama: 'Pengrajin Tas Rajut Bandung', tipe: 'Pengrajin' as TipePenerima },
  { nama: 'Panti Asuhan Budi Mulia', tipe: 'Panti Asuhan' as TipePenerima },
  { nama: 'Komunitas Daur Ulang Jakarta', tipe: 'Komunitas' as TipePenerima },
  { nama: 'Pengrajin Kain Perca Yogya', tipe: 'Pengrajin' as TipePenerima },
];

const daftarBarang = [
  'Kaos Anak x5',
  'Celana Jeans x3',
  'Jaket Hoodie x2',
  'Kemeja Flannel x4',
  'Kain Bekas x10',
  'Rok Panjang x3',
  'Seragam Sekolah x8',
  'Kaos Kaki x12',
  'Dress Bekas x4',
  'Blazer x2',
  'Kaos Polos Bekas x15',
  'Sweater Anak x6',
  'Celana Pendek x4',
  'Jaket Denim x3',
  'Kemeja Putih x5',
];

type TabFilter = 'semua' | 'disiapkan' | 'dalam_pengiriman' | 'terkirim';

function getStatusBadge(status: StatusPengiriman) {
  switch (status) {
    case 'disiapkan':
      return <Badge color="yellow">Disiapkan</Badge>;
    case 'dalam_pengiriman':
      return <Badge color="blue">Dalam Pengiriman</Badge>;
    case 'terkirim':
      return <Badge color="green">Terkirim</Badge>;
  }
}

function getTipeBadgeColor(tipe: TipePenerima): 'green' | 'blue' | 'stone' {
  switch (tipe) {
    case 'Panti Asuhan':
      return 'green';
    case 'Komunitas':
      return 'blue';
    case 'Pengrajin':
      return 'stone';
  }
}

function formatTanggal(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function KelolaPengirimanPage() {
  const [data, setData] = useState<Pengiriman[]>(initialData);
  const [activeTab, setActiveTab] = useState<TabFilter>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form state
  const [formPenerima, setFormPenerima] = useState('');
  const [formBarang, setFormBarang] = useState<string[]>([]);
  const [formKurir, setFormKurir] = useState('');
  const [formNoResi, setFormNoResi] = useState('');

  // Stats
  const totalPengiriman = data.length;
  const sedangDisiapkan = data.filter((d) => d.status === 'disiapkan').length;
  const dalamPengiriman = data.filter((d) => d.status === 'dalam_pengiriman').length;
  const terkirim = data.filter((d) => d.status === 'terkirim').length;

  // Filter
  const filtered = data
    .filter((d) => activeTab === 'semua' || d.status === activeTab)
    .filter(
      (d) =>
        searchQuery === '' ||
        d.penerima.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.noResi.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.kurir.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  function handleStatusChange(id: number, newStatus: StatusPengiriman) {
    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );
  }

  function handleSubmit() {
    if (!formPenerima || formBarang.length === 0 || !formKurir || !formNoResi) return;
    const penerima = daftarPenerima.find((p) => p.nama === formPenerima);
    const newItem: Pengiriman = {
      id: Math.max(...data.map((d) => d.id)) + 1,
      penerima: formPenerima,
      tipePenerima: penerima?.tipe ?? 'Komunitas',
      barangDikirim: formBarang,
      kurir: formKurir,
      noResi: formNoResi,
      status: 'disiapkan',
      tanggalKirim: new Date().toISOString().split('T')[0],
    };
    setData((prev) => [newItem, ...prev]);
    setFormPenerima('');
    setFormBarang([]);
    setFormKurir('');
    setFormNoResi('');
    setShowPanel(false);
    setActiveTab('semua');
    setCurrentPage(1);
  }

  function toggleBarang(item: string) {
    setFormBarang((prev) =>
      prev.includes(item) ? prev.filter((b) => b !== item) : [...prev, item]
    );
  }

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'semua', label: 'Semua' },
    { key: 'disiapkan', label: 'Disiapkan' },
    { key: 'dalam_pengiriman', label: 'Dalam Pengiriman' },
    { key: 'terkirim', label: 'Terkirim' },
  ];

  const stats = [
    {
      title: 'Total Pengiriman',
      val: totalPengiriman,
      icon: <Package size={24} />,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      title: 'Sedang Disiapkan',
      val: sedangDisiapkan,
      icon: <MapPin size={24} />,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
    },
    {
      title: 'Dalam Pengiriman',
      val: dalamPengiriman,
      icon: <Truck size={24} />,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Terkirim',
      val: terkirim,
      icon: <CheckCircle size={24} />,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
  ];

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-stone-900">
            Kelola Pengiriman
          </h1>
          <p className="text-stone-500">
            Pantau dan kelola pengiriman barang ke penerima donasi.
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setShowPanel(true)}>
          <Plus size={18} />
          Buat Pengiriman Baru
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
            <div>
              <div className="text-3xl font-display font-extrabold text-stone-900">
                {s.val}
              </div>
              <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mt-1">
                {s.title}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Tabs + Search */}
        <div className="p-5 border-b border-stone-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-white text-stone-900 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari penerima, kurir, resi..."
              className="pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-all w-full md:w-72"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/60 border-b border-stone-200">
                <th className="p-4 text-xs font-bold text-stone-400 uppercase tracking-wider">
                  No
                </th>
                <th className="p-4 text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Penerima
                </th>
                <th className="p-4 text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Tipe Penerima
                </th>
                <th className="p-4 text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Barang Dikirim
                </th>
                <th className="p-4 text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Kurir
                </th>
                <th className="p-4 text-xs font-bold text-stone-400 uppercase tracking-wider">
                  No. Resi
                </th>
                <th className="p-4 text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="p-4 text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Tanggal Kirim
                </th>
                <th className="p-4 text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center">
                    <Truck size={48} className="mx-auto mb-4 text-stone-300" />
                    <p className="font-semibold text-stone-400">
                      Tidak ada data pengiriman ditemukan.
                    </p>
                  </td>
                </tr>
              ) : (
                paginated.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="border-b border-stone-100 hover:bg-stone-50 transition-colors duration-150"
                  >
                    <td className="p-4 text-sm font-semibold text-stone-500">
                      {(currentPage - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500">
                          <Building2 size={16} />
                        </div>
                        <span className="font-bold text-stone-800 text-sm">
                          {item.penerima}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge color={getTipeBadgeColor(item.tipePenerima)}>
                        {item.tipePenerima}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {item.barangDikirim.map((b, bi) => (
                          <span
                            key={bi}
                            className="inline-block bg-stone-100 text-stone-600 text-xs font-medium px-2 py-0.5 rounded-md"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-sm font-semibold text-stone-700">
                      {item.kurir}
                    </td>
                    <td className="p-4">
                      <code className="text-xs font-mono bg-stone-100 text-stone-600 px-2 py-1 rounded-md">
                        {item.noResi}
                      </code>
                    </td>
                    <td className="p-4">{getStatusBadge(item.status)}</td>
                    <td className="p-4 text-sm text-stone-600 font-medium">
                      {formatTanggal(item.tanggalKirim)}
                    </td>
                    <td className="p-4">
                      {item.status === 'disiapkan' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            handleStatusChange(item.id, 'dalam_pengiriman')
                          }
                        >
                          <Send size={14} />
                          Kirim Sekarang
                        </Button>
                      )}
                      {item.status === 'dalam_pengiriman' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleStatusChange(item.id, 'terkirim')
                          }
                        >
                          <CheckCircle size={14} />
                          Tandai Terkirim
                        </Button>
                      )}
                      {item.status === 'terkirim' && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle size={18} />
                          <span className="text-xs font-bold">Selesai</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > itemsPerPage && (
          <div className="p-4 border-t border-stone-100 flex items-center justify-between">
            <p className="text-sm text-stone-500">
              Menampilkan{' '}
              <span className="font-bold text-stone-700">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>
              –
              <span className="font-bold text-stone-700">
                {Math.min(currentPage * itemsPerPage, filtered.length)}
              </span>{' '}
              dari{' '}
              <span className="font-bold text-stone-700">{filtered.length}</span>{' '}
              pengiriman
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-stone-100 text-stone-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      currentPage === page
                        ? 'bg-green-600 text-white shadow-sm'
                        : 'text-stone-500 hover:bg-stone-100'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-stone-100 text-stone-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-out Panel Overlay */}
      {showPanel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
            onClick={() => setShowPanel(false)}
          />

          {/* Panel */}
          <div className="relative w-full max-w-lg bg-white shadow-2xl animate-[slideInRight_0.3s_ease] flex flex-col">
            {/* Panel Header */}
            <div className="p-6 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-display font-bold text-stone-900">
                  Buat Pengiriman Baru
                </h2>
                <p className="text-sm text-stone-500 mt-0.5">
                  Isi detail pengiriman ke penerima.
                </p>
              </div>
              <button
                onClick={() => setShowPanel(false)}
                className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Penerima */}
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                  Penerima
                </label>
                <select
                  value={formPenerima}
                  onChange={(e) => setFormPenerima(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-all appearance-none"
                >
                  <option value="">Pilih penerima...</option>
                  {daftarPenerima.map((p) => (
                    <option key={p.nama} value={p.nama}>
                      {p.nama} — {p.tipe}
                    </option>
                  ))}
                </select>
              </div>

              {/* Barang */}
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                  Pilih Barang dari Inventaris
                </label>
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 max-h-48 overflow-y-auto space-y-1">
                  {daftarBarang.map((b) => (
                    <label
                      key={b}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-150 ${
                        formBarang.includes(b)
                          ? 'bg-green-50 border border-green-200'
                          : 'hover:bg-stone-100 border border-transparent'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formBarang.includes(b)}
                        onChange={() => toggleBarang(b)}
                        className="w-4 h-4 rounded border-stone-300 text-green-600 focus:ring-green-500/30"
                      />
                      <span className="text-sm text-stone-700 font-medium">
                        {b}
                      </span>
                    </label>
                  ))}
                </div>
                {formBarang.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {formBarang.map((b) => (
                      <span
                        key={b}
                        className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full"
                      >
                        {b}
                        <button
                          type="button"
                          onClick={() => toggleBarang(b)}
                          className="hover:text-green-900 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Kurir */}
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                  Nama Kurir
                </label>
                <input
                  type="text"
                  value={formKurir}
                  onChange={(e) => setFormKurir(e.target.value)}
                  placeholder="cth. JNE Express, SiCepat..."
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-all"
                />
              </div>

              {/* No. Resi */}
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                  No. Resi
                </label>
                <input
                  type="text"
                  value={formNoResi}
                  onChange={(e) => setFormNoResi(e.target.value)}
                  placeholder="Masukkan nomor resi pengiriman"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-all"
                />
              </div>
            </div>

            {/* Panel Footer */}
            <div className="p-6 border-t border-stone-200 flex items-center gap-3">
              <Button
                variant="ghost"
                size="md"
                className="flex-1"
                onClick={() => setShowPanel(false)}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                onClick={handleSubmit}
                disabled={
                  !formPenerima ||
                  formBarang.length === 0 ||
                  !formKurir ||
                  !formNoResi
                }
              >
                <Send size={16} />
                Simpan Pengiriman
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Keyframe for slide-in animation */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
