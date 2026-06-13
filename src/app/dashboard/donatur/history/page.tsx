"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { History, Shirt, Calendar, AlertCircle, ExternalLink, RefreshCw, Search, Filter, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { STATUS_BARANG_BADGE, STATUS_BARANG_LABEL, type StatusBarang } from '@/lib/statusBarang';

export default function DonationHistoryPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Data State
    const [clothesList, setClothesList] = useState<any[]>([]);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

    // Filtering State
    const [filter, setFilter] = useState<'semua' | 'pakaian'>('semua');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState<'semua' | 'hari_ini' | 'minggu_ini' | 'bulan_ini'>('semua');
    const [kondisiFilter, setKondisiFilter] = useState<'semua' | 'baik' | 'fair' | 'rusak'>('semua');
    const [kategoriFilter, setKategoriFilter] = useState<string>('semua');

    // Sorting State
    const [sortColumn, setSortColumn] = useState<'tanggal' | 'tipe' | 'judul' | 'status'>('tanggal');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);

    const fetchHistory = async () => {
        setIsLoading(true);
        setError('');
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                router.replace('/auth/login');
                return;
            }
            const user = JSON.parse(userStr);
            const donaturId = user.id;

            if (!donaturId) {
                setError('ID Pengguna tidak ditemukan.');
                setIsLoading(false);
                return;
            }

            const response = await fetch(`/api/donatur/history?donatur_id=${donaturId}`);
            const result = await response.json();

            if (!response.ok) {
                setError(result.error || 'Gagal memuat riwayat donasi.');
                return;
            }

            if (result.data) {
                setClothesList(result.data.barang || []);
            }
        } catch (err) {
            console.error('Fetch history error:', err);
            setError('Terjadi kesalahan koneksi internet.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [router]);

    // Reset pagination when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filter, searchQuery, dateFilter, kondisiFilter, kategoriFilter, itemsPerPage, sortColumn, sortDirection]);

    const getStatusBadge = (status: StatusBarang) => {
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${STATUS_BARANG_BADGE[status] ?? ''}`}>
                {STATUS_BARANG_LABEL[status] ?? status}
            </span>
        );
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // 1. Map raw data
    const combinedHistory = clothesList.map(item => ({ ...item, type: 'pakaian' as const }));

    // 2. Apply Filters (Tab, Search, Custom Filters)
    const filteredAndSearched = combinedHistory.filter(item => {
        // Tab Filter
        if (filter !== 'semua' && item.type !== filter) return false;

        // Date Filter
        if (dateFilter !== 'semua') {
            const itemDate = new Date(item.created_at);
            const now = new Date();
            if (dateFilter === 'hari_ini') {
                if (itemDate.toDateString() !== now.toDateString()) return false;
            } else if (dateFilter === 'minggu_ini') {
                const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                if (itemDate < oneWeekAgo) return false;
            } else if (dateFilter === 'bulan_ini') {
                if (itemDate.getMonth() !== now.getMonth() || itemDate.getFullYear() !== now.getFullYear()) return false;
            }
        }

        // Specific Tab Filters
        if (filter === 'pakaian' && item.type === 'pakaian') {
            if (kondisiFilter !== 'semua' && item.kondisi_user !== kondisiFilter) return false;
            if (kategoriFilter !== 'semua' && item.kategori?.toLowerCase() !== kategoriFilter.toLowerCase()) return false;
        }

        // Search Filter
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            const titleMatch = (item.judul || item.kategori || '').toLowerCase().includes(query);
            const descMatch = (item.deskripsi || '').toLowerCase().includes(query);

            if (!titleMatch && !descMatch) return false;
        }

        return true;
    });

    // 3. Sorting
    const sortedHistory = [...filteredAndSearched].sort((a, b) => {
        let valA, valB;
        switch (sortColumn) {
            case 'tanggal':
                valA = new Date(a.created_at).getTime();
                valB = new Date(b.created_at).getTime();
                break;
            case 'tipe':
                valA = a.type;
                valB = b.type;
                break;
            case 'judul':
                valA = (a.judul || a.kategori || '');
                valB = (b.judul || b.kategori || '');
                break;
            case 'status':
                valA = a.status;
                valB = b.status;
                break;
            default:
                valA = new Date(a.created_at).getTime();
                valB = new Date(b.created_at).getTime();
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });

    // 4. Pagination
    const totalPages = Math.ceil(sortedHistory.length / itemsPerPage) || 1;
    const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));
    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    const paginatedHistory = sortedHistory.slice(startIndex, startIndex + itemsPerPage);

    const toggleSort = (column: 'tanggal' | 'tipe' | 'judul' | 'status') => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc'); 
        }
    };
    
    // Sort Icon Helper
    const SortIcon = ({ column }: { column: 'tanggal' | 'tipe' | 'judul' | 'status' }) => {
        return (
            <div className="flex flex-col ml-1">
                <ChevronUp size={10} className={sortColumn === column && sortDirection === 'asc' ? 'text-green-600' : 'text-stone-300'} />
                <ChevronDown size={10} className={`-mt-1 ${sortColumn === column && sortDirection === 'desc' ? 'text-green-600' : 'text-stone-300'}`} />
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-[fadeIn_0.3s_ease]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-display font-bold text-stone-900 flex items-center gap-2">
                        <History className="text-green-600" size={24} /> Donasi Saya
                    </h1>
                    <p className="text-stone-500 text-sm mt-1">Kelola dan pantau seluruh histori kontribusi sosial Anda.</p>
                </div>
                <div className="flex gap-2 shrink-0">
                    <button 
                        onClick={fetchHistory}
                        disabled={isLoading}
                        className="p-2.5 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors text-stone-600 disabled:opacity-50"
                        title="Segarkan data"
                    >
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <Link href="/dashboard/donatur/donate">
                        <Button className="shadow-lg shadow-green-600/20">Donasi Baru</Button>
                    </Link>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-stone-200 pb-px">
                {(['semua', 'pakaian'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => {
                            setFilter(tab);
                            // Reset tab-specific filters when switching tabs
                            if (tab !== 'pakaian') {
                                setKondisiFilter('semua');
                                setKategoriFilter('semua');
                            }
                        }}
                        className={`pb-3 px-4 text-sm font-bold font-display border-b-2 transition-all capitalize -mb-px ${filter === tab ? 'border-green-600 text-green-700' : 'border-transparent text-stone-500 hover:text-stone-800'}`}
                    >
                        {tab === 'semua' ? 'Semua Donasi' : 'Donasi Pakaian'}
                    </button>
                ))}
            </div>

            {/* Top Toolbar (Search & Filters) */}
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
                <div className="relative w-full xl:w-72 shrink-0">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={16} className="text-stone-400" />
                    </div>
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari donasi..."
                        className="w-full pl-9 pr-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-stone-50 hover:bg-white"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    <div className="flex items-center gap-2">
                        <Filter size={14} className="text-stone-400" />
                        <span className="text-xs font-semibold text-stone-500 uppercase">Filter:</span>
                    </div>
                    
                    <select 
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value as any)}
                        className="text-xs bg-white border border-stone-200 text-stone-600 rounded-lg px-2.5 py-2 focus:outline-hidden focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    >
                        <option value="semua">Semua Waktu</option>
                        <option value="hari_ini">Hari Ini</option>
                        <option value="minggu_ini">7 Hari Terakhir</option>
                        <option value="bulan_ini">Bulan Ini</option>
                    </select>

                    {filter === 'pakaian' && (
                        <>
                            <select 
                                value={kategoriFilter}
                                onChange={(e) => setKategoriFilter(e.target.value)}
                                className="text-xs bg-white border border-stone-200 text-stone-600 rounded-lg px-2.5 py-2 focus:outline-hidden focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                            >
                                <option value="semua">Semua Kategori</option>
                                <option value="baju">Baju</option>
                                <option value="celana">Celana</option>
                                <option value="jaket">Jaket / Luaran</option>
                                <option value="sepatu">Sepatu</option>
                                <option value="aksesoris">Aksesoris</option>
                            </select>
                            
                            <select 
                                value={kondisiFilter}
                                onChange={(e) => setKondisiFilter(e.target.value as any)}
                                className="text-xs bg-white border border-stone-200 text-stone-600 rounded-lg px-2.5 py-2 focus:outline-hidden focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                            >
                                <option value="semua">Semua Kondisi</option>
                                <option value="baik">Baik / Layak</option>
                                <option value="fair">Cukup / Sedang</option>
                                <option value="rusak">Rusak / Daur Ulang</option>
                            </select>
                        </>
                    )}
                </div>
            </div>

            {/* Content States */}
            {isLoading ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col items-center justify-center">
                    <RefreshCw size={40} className="text-green-600 animate-spin mb-4" />
                    <p className="text-stone-500 font-medium">Memuat riwayat donasi...</p>
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center text-red-800 flex flex-col items-center justify-center">
                    <AlertCircle size={40} className="mb-3 text-red-500" />
                    <h3 className="font-bold text-lg mb-1">Gagal Memuat Riwayat</h3>
                    <p className="text-sm text-red-600 mb-4">{error}</p>
                    <Button variant="outline" size="sm" onClick={fetchHistory}>Coba Lagi</Button>
                </div>
            ) : paginatedHistory.length === 0 ? (
                <div className="bg-white border border-stone-200 shadow-sm rounded-2xl p-16 text-center max-w-xl mx-auto flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-6">
                        <History size={28} className="text-stone-400" />
                    </div>
                    <h3 className="font-display font-bold text-lg text-stone-900 mb-2">Data Tidak Ditemukan</h3>
                    <p className="text-stone-500 text-sm mb-8">
                        Belum ada riwayat donasi yang sesuai dengan saringan (filter) atau pencarian Anda.
                    </p>
                    {(searchQuery || filter !== 'semua' || dateFilter !== 'semua') ? (
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setFilter('semua');
                                setSearchQuery('');
                                setDateFilter('semua');
                                setKondisiFilter('semua');
                                setKategoriFilter('semua');
                            }}
                        >
                            Reset Filter
                        </Button>
                    ) : (
                        <Link href="/dashboard/donatur/donate">
                            <Button>Mulai Donasi Pertamamu</Button>
                        </Link>
                    )}
                </div>
            ) : (
                /* Data Table */
                <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-stone-50 border-b border-stone-200 text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                                    <th className="px-4 py-3 w-16 text-center">Gambar</th>
                                    <th className="px-4 py-3 cursor-pointer hover:bg-stone-100 transition-colors select-none" onClick={() => toggleSort('tipe')}>
                                        <div className="flex items-center">Tipe <SortIcon column="tipe" /></div>
                                    </th>
                                    <th className="px-4 py-3 cursor-pointer hover:bg-stone-100 transition-colors select-none" onClick={() => toggleSort('judul')}>
                                        <div className="flex items-center">Rincian Donasi <SortIcon column="judul" /></div>
                                    </th>
                                    <th className="px-4 py-3 cursor-pointer hover:bg-stone-100 transition-colors select-none" onClick={() => toggleSort('tanggal')}>
                                        <div className="flex items-center">Tanggal <SortIcon column="tanggal" /></div>
                                    </th>
                                    <th className="px-4 py-3 cursor-pointer hover:bg-stone-100 transition-colors select-none" onClick={() => toggleSort('status')}>
                                        <div className="flex items-center">Status <SortIcon column="status" /></div>
                                    </th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {paginatedHistory.map((item) => (
                                    <tr key={`${item.type}-${item.id}`} className="hover:bg-stone-50/80 transition-colors group">
                                        <td className="px-4 py-3 text-center align-middle">
                                            <div className="w-12 h-12 rounded-lg bg-stone-100 overflow-hidden relative border border-stone-200 shadow-sm inline-block shrink-0">
                                                {item.foto_url ? (
                                                    <img
                                                        src={item.foto_url}
                                                        alt={item.kategori || 'Pakaian'}
                                                        className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform"
                                                        onClick={() => setSelectedPhoto(item.foto_url)}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-stone-400"><Shirt size={20} /></div>
                                                )}
                                                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-lg pointer-events-none"></div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 align-middle">
                                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                                <Shirt size={10} /> Pakaian
                                            </span>
                                            <div className="text-xs text-stone-400 mt-1 font-mono font-semibold">#{item.id}</div>
                                        </td>

                                        <td className="px-4 py-4 align-middle max-w-xs">
                                            <div className="font-bold text-stone-900 text-sm line-clamp-1">
                                                {item.judul || `Pakaian - ${item.kategori || 'Lainnya'}`}
                                            </div>
                                            <div className="mt-1 text-xs text-stone-500 line-clamp-1">
                                                {item.deskripsi || '-'}
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 align-middle">
                                            <div className="flex items-center gap-1.5 text-stone-600 text-xs font-bold">
                                                <Calendar size={14} className="text-stone-400" />
                                                {formatDate(item.created_at)}
                                            </div>
                                        </td>

                                        <td className="px-4 py-4 align-middle">
                                            {getStatusBadge(item.status)}
                                        </td>

                                        <td className="px-4 py-4 align-middle text-right">
                                            <Link href={`/dashboard/donatur/history/${item.type}/${item.id}`}>
                                                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-500 hover:text-white hover:bg-green-600 rounded-lg transition-colors border border-stone-200 hover:border-green-600" title="Lihat Rincian">
                                                    Detail <ExternalLink size={14} />
                                                </button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Toolbar */}
                    <div className="bg-stone-50 border-t border-stone-200 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-stone-500 font-medium">
                                Tampilkan:
                            </span>
                            <select 
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1); // Reset to page 1
                                }}
                                className="text-xs bg-white border border-stone-200 text-stone-700 rounded-md px-2 py-1 focus:outline-hidden font-bold"
                            >
                                <option value={5}>5 Baris</option>
                                <option value={10}>10 Baris</option>
                                <option value={20}>20 Baris</option>
                            </select>
                            <span className="text-xs text-stone-500">
                                dari {sortedHistory.length} entri
                            </span>
                        </div>

                        <div className="flex items-center gap-1">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={validCurrentPage === 1}
                                className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            
                            <div className="px-3 text-xs font-bold text-stone-700">
                                Hal {validCurrentPage} / {totalPages}
                            </div>

                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={validCurrentPage === totalPages}
                                className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Photo Modal Preview */}
            {selectedPhoto && (
                <div 
                    className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease]"
                    onClick={() => setSelectedPhoto(null)}
                >
                    <div className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-xl border border-white/10 shadow-2xl bg-stone-900 flex items-center justify-center">
                        <button 
                            className="absolute top-4 right-4 bg-stone-900/60 hover:bg-stone-900/80 backdrop-blur-md px-4 py-2 rounded-full text-white font-bold transition-colors text-xs z-[70]"
                            onClick={(e) => { e.stopPropagation(); setSelectedPhoto(null); }}
                        >
                            Tutup
                        </button>
                        <img 
                            src={selectedPhoto} 
                            alt="Pratinjau penuh" 
                            className="w-auto h-auto max-w-full max-h-[85vh] object-contain" 
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
