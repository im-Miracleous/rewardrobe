import React from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';

export default function PenerimaDash() {
    return (
        <div className="space-y-8 animate-[fadeIn_0.3s_ease]">
            <div>
                <h1 className="text-2xl font-display font-bold text-stone-900">Katalog Donasi</h1>
                <p className="text-stone-500 mt-1">Pilih barang yang sesuai dengan kebutuhan Anda.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Cari pakaian..."
                        className="w-full md:max-w-xs rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    />
                </div>
                <select className="rounded-xl border border-stone-200 px-4 py-3 text-sm font-semibold text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 cursor-pointer">
                    <option>Semua Kategori</option>
                    <option>Pakaian Dewasa</option>
                    <option>Pakaian Anak</option>
                </select>
                <select className="rounded-xl border border-stone-200 px-4 py-3 text-sm font-semibold text-stone-700 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 cursor-pointer">
                    <option>Jarak Terdekat</option>
                    <option>Terbaru</option>
                </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[
                    { title: 'Kemeja Putih Polos', size: 'M', cond: 'Layak Donasi', loc: 'Bandung (2km)', icon: '👕' },
                    { title: 'Celana Jeans', size: '32', cond: 'Layak Donasi', loc: 'Bandung (5km)', icon: '👖' },
                    { title: 'Seragam SD', size: 'S', cond: 'Perlu Perbaikan', loc: 'Cimahi (8km)', icon: '👕' },
                    { title: 'Kain Perca Campur', size: '3kg', cond: 'Daur Ulang', loc: 'Bandung (10km)', icon: '♻️' },
                ].map((item, i) => (
                    <div key={i} className="bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col group">
                        <div className="h-44 bg-stone-50 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-500">
                            {item.icon}
                        </div>
                        <div className="p-5 flex flex-col flex-1 border-t border-stone-100">
                            <div className="mb-3">
                                <Badge color={item.cond === 'Layak Donasi' ? 'green' : item.cond === 'Perlu Perbaikan' ? 'yellow' : 'stone'}>
                                    {item.cond}
                                </Badge>
                            </div>
                            <h3 className="font-bold text-stone-900 mb-1">{item.title}</h3>
                            <div className="text-sm text-stone-500 mb-5 flex-1">Ukuran: {item.size} • {item.loc}</div>
                            <Button className="w-full">Minta Barang</Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}