"use client";
import React, { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  CheckCircle,
  MapPin,
  User,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Building2,
  Loader2,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

type StatusPengiriman = 'disiapkan' | 'dalam_pengiriman' | 'terkirim';

interface Pengiriman {
  id: number;
  barang_id: number;
  penerima: { id: number; nama: string; kota: string; tipe: string };
  alamat_tujuan: string | null;
  barang_info: {
      nama: string;
      kategori: string;
      foto_url: string | null;
  };
  kurir: string;
  resi: string;
  status: StatusPengiriman;
  waktu_request: string;
}

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

function getTipeBadgeColor(tipe: string): 'green' | 'blue' | 'stone' {
  switch (tipe) {
    case 'Panti Asuhan':
      return 'green';
    case 'Komunitas':
      return 'blue';
    case 'Pengrajin':
      return 'stone';
    default:
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
  const [data, setData] = useState<Pengiriman[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const [activeTab, setActiveTab] = useState<TabFilter>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal "Tugaskan Kurir"
  const [assignModalId, setAssignModalId] = useState<number | null>(null);
  const [formKurir, setFormKurir] = useState('');
  const [formCatatan, setFormCatatan] = useState('');

  const fetchData = async () => {
      try {
          setIsLoading(true);
          const res = await fetch('/api/admin/pengiriman');
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
        d.penerima?.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.resi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.kurir?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  async function handleStatusChange(id: number, newStatus: StatusPengiriman) {
    setIsProcessing(true);
    try {
        const res = await fetch(`/api/admin/pengiriman/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) await fetchData();
    } catch (err) {
        console.error(err);
    } finally {
        setIsProcessing(false);
    }
  }

  const openAssignModal = (id: number) => {
    setAssignModalId(id);
    setFormKurir('');
    setFormCatatan('');
  };

  async function handleAssignSubmit() {
    if (!assignModalId || !formKurir) return;
    setIsProcessing(true);
    try {
        const res = await fetch(`/api/admin/pengiriman/${assignModalId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kurir: formKurir, status: 'dalam_pengiriman', catatan: formCatatan })
        });
        if (res.ok) {
            await fetchData();
            setAssignModalId(null);
        }
    } catch (err) {
        console.error(err);
    } finally {
        setIsProcessing(false);
    }
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
      val: isLoading ? "..." : totalPengiriman,
      icon: <Package size={24} />,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      title: 'Sedang Disiapkan',
      val: isLoading ? "..." : sedangDisiapkan,
      icon: <MapPin size={24} />,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
    },
    {
      title: 'Dalam Pengiriman',
      val: isLoading ? "..." : dalamPengiriman,
      icon: <Truck size={24} />,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      title: 'Terkirim',
      val: isLoading ? "..." : terkirim,
      icon: <CheckCircle size={24} />,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
  ];

  return (
    <div className="space-y-8 animate-[fadeIn_0.3s_ease]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-stone-900">
          Kelola Pengiriman
        </h1>
        <p className="text-stone-500">
          Pantau dan kelola pengiriman barang ke penerima donasi. Baris muncul otomatis begitu admin menyetujui permintaan penerima.
        </p>
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
          <div className="flex items-center gap-2">
              <Filter size={16} className="text-stone-400" />
              <select
                  value={activeTab}
                  onChange={(e) => {
                      setActiveTab(e.target.value as TabFilter);
                      setCurrentPage(1);
                  }}
                  className="px-3 py-2 rounded-xl border border-stone-200 bg-stone-50 text-sm font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-all cursor-pointer min-w-[180px]"
              >
                  {tabs.map((tab) => (
                      <option key={tab.key} value={tab.key}>
                          {tab.label}
                      </option>
                  ))}
              </select>
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
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/60 border-b border-stone-200">
                <th className="p-4 text-xs font-bold text-stone-400 uppercase tracking-wider">No</th>
                <th className="p-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Penerima</th>
                <th className="p-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Tipe Penerima</th>
                <th className="p-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Alamat Tujuan</th>
                <th className="p-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Barang Dikirim</th>
                <th className="p-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Kurir</th>
                <th className="p-4 text-xs font-bold text-stone-400 uppercase tracking-wider">No. Resi</th>
                <th className="p-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Tanggal Kirim</th>
                <th className="p-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                  <tr>
                      <td colSpan={10} className="p-12 text-center">
                          <Loader2 size={40} className="mx-auto mb-3 text-stone-300 animate-spin" />
                          <p className="text-stone-400 font-semibold text-sm">Memuat data...</p>
                      </td>
                  </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center">
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
                          {item.penerima?.nama || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      {item.penerima && (
                        <Badge color={getTipeBadgeColor(item.penerima.tipe || 'Komunitas')}>
                          {item.penerima.tipe || 'Komunitas'}
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 max-w-[180px]">
                      <p className="text-xs text-stone-600 line-clamp-2">
                        {item.alamat_tujuan || item.penerima?.kota || '-'}
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {item.barang_info.foto_url ? (
                          <img src={item.barang_info.foto_url} alt={item.barang_info.nama} className="w-9 h-9 rounded-lg object-cover border border-stone-200 shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0">
                            <Package size={14} className="text-stone-400" />
                          </div>
                        )}
                        <span className="inline-block bg-stone-100 text-stone-600 text-xs font-medium px-2 py-0.5 rounded-md">
                          {item.barang_info.nama || item.barang_info.kategori}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-semibold text-stone-700">
                      {item.kurir}
                    </td>
                    <td className="p-4">
                      <code className="text-xs font-mono bg-stone-100 text-stone-600 px-2 py-1 rounded-md">
                        {item.resi}
                      </code>
                    </td>
                    <td className="p-4">{getStatusBadge(item.status)}</td>
                    <td className="p-4 text-sm text-stone-600 font-medium">
                      {formatTanggal(item.waktu_request)}
                    </td>
                    <td className="p-4">
                      {item.status === 'disiapkan' && (
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={isProcessing}
                          onClick={() => openAssignModal(item.id)}
                        >
                          <Truck size={14} />
                          Tugaskan Kurir
                        </Button>
                      )}
                      {item.status === 'dalam_pengiriman' && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isProcessing}
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

      {/* ── Modal: Tugaskan Kurir ──────────────────────────── */}
      {assignModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
            onClick={() => setAssignModalId(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-stone-200 animate-[fadeIn_0.25s_ease]">
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <div>
                <h3 className="font-display font-bold text-lg text-stone-900">
                  Tugaskan Kurir
                </h3>
                <p className="text-sm text-stone-500 mt-0.5">
                  Untuk ID #{assignModalId}
                </p>
              </div>
              <button
                onClick={() => setAssignModalId(null)}
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
                    placeholder="Contoh: JNE Express, SiCepat, atau kurir internal"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">
                  Catatan Tambahan
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
              <Button variant="ghost" size="sm" onClick={() => setAssignModalId(null)}>
                Batal
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAssignSubmit}
                disabled={!formKurir || isProcessing}
              >
                <Truck size={15} />
                Tugaskan Kurir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
