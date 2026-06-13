"use client";
import React, { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

type StatusPengiriman = 'disiapkan' | 'dalam_pengiriman' | 'terkirim';

interface Pengiriman {
  id: number;
  barang_id: number;
  penerima: { id: number; nama: string; kota: string; tipe: string };
  barang_info: {
      nama: string;
      kategori: string;
  };
  kurir: string;
  resi: string;
  status: StatusPengiriman;
  waktu_request: string;
}

const mockDaftarPenerima = [
  { id: 101, nama: 'Panti Asuhan Kasih Ibu', tipe: 'Panti Asuhan' },
  { id: 102, nama: 'Komunitas Peduli Sesama', tipe: 'Komunitas' },
  { id: 103, nama: 'Pengrajin Batik Cirebon', tipe: 'Pengrajin' },
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
  const [inventoryList, setInventoryList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [activeTab, setActiveTab] = useState<TabFilter>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPanel, setShowPanel] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form state
  const [formPenerimaId, setFormPenerimaId] = useState<number | ''>('');
  const [formBarangIds, setFormBarangIds] = useState<number[]>([]);
  const [formKurir, setFormKurir] = useState('');
  const [formNoResi, setFormNoResi] = useState('');

  const fetchData = async () => {
      try {
          setIsLoading(true);
          const [resPengiriman, resInventory] = await Promise.all([
              fetch('/api/admin/pengiriman'),
              fetch('/api/admin/inventory')
          ]);
          
          const jsonPengiriman = await resPengiriman.json();
          const jsonInventory = await resInventory.json();

          if (jsonPengiriman.data) setData(jsonPengiriman.data);
          
          // Only show items that are 'terkirim' (in warehouse), not 'tersalurkan'
          if (jsonInventory.data) {
              setInventoryList(jsonInventory.data.filter((i: any) => i.status === 'terkirim'));
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

  async function handleSubmit() {
    if (!formPenerimaId || formBarangIds.length === 0 || !formKurir || !formNoResi) return;
    
    setIsProcessing(true);
    try {
        const res = await fetch('/api/admin/pengiriman', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                penerima_id: formPenerimaId,
                barang_ids: formBarangIds,
                kurir: formKurir,
                resi: formNoResi
            })
        });

        if (res.ok) {
            setFormPenerimaId('');
            setFormBarangIds([]);
            setFormKurir('');
            setFormNoResi('');
            setShowPanel(false);
            setActiveTab('semua');
            setCurrentPage(1);
            await fetchData();
        } else {
            const err = await res.json();
            alert(`Gagal membuat pengiriman: ${err.error}`);
        }
    } catch (err) {
        console.error(err);
    } finally {
        setIsProcessing(false);
    }
  }

  function toggleBarang(id: number) {
    setFormBarangIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
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
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/60 border-b border-stone-200">
                <th className="p-4 text-xs font-bold text-stone-400 uppercase tracking-wider">No</th>
                <th className="p-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Penerima</th>
                <th className="p-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Tipe Penerima</th>
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
                      <td colSpan={9} className="p-12 text-center">
                          <Loader2 size={40} className="mx-auto mb-3 text-stone-300 animate-spin" />
                          <p className="text-stone-400 font-semibold text-sm">Memuat data...</p>
                      </td>
                  </tr>
              ) : paginated.length === 0 ? (
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
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                          <span
                            className="inline-block bg-stone-100 text-stone-600 text-xs font-medium px-2 py-0.5 rounded-md"
                          >
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

      {/* Slide-out Panel Overlay */}
      {showPanel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
            onClick={() => setShowPanel(false)}
          />

          <div className="relative w-full max-w-lg bg-white shadow-2xl animate-[slideInRight_0.3s_ease] flex flex-col">
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

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Penerima */}
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                  Penerima (Mock User)
                </label>
                <select
                  value={formPenerimaId}
                  onChange={(e) => setFormPenerimaId(parseInt(e.target.value))}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-400 transition-all appearance-none"
                >
                  <option value="">Pilih penerima...</option>
                  {/* Just use some simple user ID placeholders, assuming they exist or create one if not, 
                      Actually our DB has user 1,2 as donatur. Let's use any ID, or we can use ID 1,2 for demo */}
                  <option value={1}>Panti Asuhan Kasih Ibu (Mock User ID 1)</option>
                  <option value={2}>Komunitas Peduli Sesama (Mock User ID 2)</option>
                </select>
                <p className="text-[10px] text-stone-400 mt-1">
                  Catatan: Menggunakan ID Donatur yang ada (1 & 2) sebagai simulasi akun Penerima untuk demo ini.
                </p>
              </div>

              {/* Barang */}
              <div>
                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">
                  Pilih Barang dari Inventaris Gudang
                </label>
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 max-h-48 overflow-y-auto space-y-1">
                  {inventoryList.length === 0 ? (
                      <p className="text-sm text-stone-500 p-2 text-center">Gudang kosong (tidak ada barang disetujui).</p>
                  ) : (
                      inventoryList.map((b) => (
                        <label
                          key={b.id}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors duration-150 ${
                            formBarangIds.includes(b.id)
                              ? 'bg-green-50 border border-green-200'
                              : 'hover:bg-stone-100 border border-transparent'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formBarangIds.includes(b.id)}
                            onChange={() => toggleBarang(b.id)}
                            className="w-4 h-4 rounded border-stone-300 text-green-600 focus:ring-green-500/30"
                          />
                          <span className="text-sm text-stone-700 font-medium truncate flex-1">
                            {b.judul || b.kategori} (ID: {b.id})
                          </span>
                        </label>
                      ))
                  )}
                </div>
                {formBarangIds.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {formBarangIds.map((id) => {
                        const item = inventoryList.find(i => i.id === id);
                        if (!item) return null;
                        return (
                          <span
                            key={id}
                            className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full"
                          >
                            {item.judul || item.kategori}
                            <button
                              type="button"
                              onClick={() => toggleBarang(id)}
                              className="hover:text-green-900 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        )
                    })}
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
                  !formPenerimaId ||
                  formBarangIds.length === 0 ||
                  !formKurir ||
                  !formNoResi ||
                  isProcessing
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
