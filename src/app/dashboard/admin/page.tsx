import React from 'react';
import { ShieldCheck, Truck, CheckCircle, User, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function AdminDash() {
    return (
        <div className="space-y-8 animate-[fadeIn_0.3s_ease]">
            <div>
                <h1 className="text-2xl font-display font-bold text-stone-900">Ringkasan Sistem</h1>
                <p className="text-stone-500">Pantau aktivitas platform ReWardrobe hari ini.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { title: 'Menunggu Verifikasi', val: '24', icon: <ShieldCheck size={24} />, color: 'text-orange-600', bg: 'bg-orange-100' },
                    { title: 'Siap Kirim', val: '18', icon: <Truck size={24} />, color: 'text-blue-600', bg: 'bg-blue-100' },
                    { title: 'Total Tersalurkan', val: '1.240', icon: <CheckCircle size={24} />, color: 'text-green-600', bg: 'bg-green-100' },
                    { title: 'Pengguna Baru', val: '12', icon: <User size={24} />, color: 'text-purple-600', bg: 'bg-purple-100' },
                ].map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-5">
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

            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                    <h3 className="font-display font-bold text-stone-900">Antrian Moderasi</h3>
                    <Button variant="outline" size="sm">Lihat Semua</Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-stone-200">
                                <th className="p-5 text-xs font-bold text-stone-400 uppercase tracking-wider">Donatur</th>
                                <th className="p-5 text-xs font-bold text-stone-400 uppercase tracking-wider">Barang</th>
                                <th className="p-5 text-xs font-bold text-stone-400 uppercase tracking-wider">Label / Status</th>
                                <th className="p-5 text-xs font-bold text-stone-400 uppercase tracking-wider">Bukti Foto</th>
                                <th className="p-5 text-xs font-bold text-stone-400 uppercase tracking-wider">Waktu Masuk</th>
                                <th className="p-5 text-xs font-bold text-stone-400 uppercase tracking-wider text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                                <td className="p-5 font-bold text-stone-800">Siti Rahayu</td>
                                <td className="p-5 text-stone-600">Kemeja Flannel</td>
                                <td className="p-5"><Badge color="green">Layak Donasi</Badge></td>
                                <td className="p-5">
                                    <div className="w-14 h-14 bg-stone-100 rounded-lg border border-stone-200 flex items-center justify-center text-stone-400">
                                        <ImageIcon size={20} />
                                    </div>
                                </td>
                                <td className="p-5 text-sm font-semibold text-stone-500">10 Menit lalu</td>
                                <td className="p-5 text-right">
                                    <div className="flex gap-2 justify-end items-center">
                                        <Button size="sm">Setujui</Button>
                                        <button className="text-sm font-semibold text-stone-500 hover:text-stone-800 px-3">Revisi</button>
                                    </div>
                                </td>
                            </tr>
                            <tr className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                                <td className="p-5 font-bold text-stone-800">Budi Santoso</td>
                                <td className="p-5 text-stone-600">Celana Jeans Sobek</td>
                                <td className="p-5"><Badge color="yellow">Perlu Perbaikan</Badge></td>
                                <td className="p-5">
                                    <div className="w-14 h-14 bg-stone-100 rounded-lg border border-stone-200 flex items-center justify-center text-stone-400">
                                        <ImageIcon size={20} />
                                    </div>
                                </td>
                                <td className="p-5 text-sm font-semibold text-stone-500">1 Jam lalu</td>
                                <td className="p-5 text-right">
                                    <div className="flex gap-2 justify-end items-center">
                                        <Button size="sm">Setujui</Button>
                                        <button className="text-sm font-semibold text-stone-500 hover:text-stone-800 px-3">Revisi</button>
                                    </div>
                                </td>
                            </tr>
                            <tr className="hover:bg-stone-50 transition-colors">
                                <td className="p-5 font-bold text-stone-800">Ahmad</td>
                                <td className="p-5 text-stone-600">Kaos Lama</td>
                                <td className="p-5"><Badge color="stone">Daur Ulang</Badge></td>
                                <td className="p-5">
                                    <div className="w-14 h-14 bg-stone-100 rounded-lg border border-stone-200 flex items-center justify-center text-stone-400">
                                        <ImageIcon size={20} />
                                    </div>
                                </td>
                                <td className="p-5 text-sm font-semibold text-stone-500">2 Jam lalu</td>
                                <td className="p-5 text-right">
                                    <div className="flex gap-2 justify-end items-center">
                                        <Button size="sm">Setujui</Button>
                                        <button className="text-sm font-semibold text-stone-500 hover:text-stone-800 px-3">Revisi</button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}