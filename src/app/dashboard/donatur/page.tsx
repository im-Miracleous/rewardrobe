import React from 'react';
import Link from 'next/link';
import { Shirt, Leaf, Trophy, Upload, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function DonaturDash() {
    return (
        <div className="space-y-8 animate-[fadeIn_0.3s_ease]">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-display font-bold text-stone-900">Halo, Donatur!</h1>
                    <p className="text-stone-500">Terima kasih telah berkontribusi untuk bumi yang lebih baik.</p>
                </div>
                <Link href="/dashboard/donatur/donate">
                    <Button className="shadow-lg shadow-green-600/20"><Upload size={18} /> Donasi Baru</Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col justify-center min-h-[160px]">
                    <div className="relative z-10">
                        <div className="text-green-100 text-sm font-semibold mb-2">Total Poin Kamu</div>
                        <div className="text-5xl font-display font-extrabold mb-4">1.250</div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 border border-white/30 rounded-full text-xs font-bold">
                            <Trophy size={14} /> Peringkat #42
                        </div>
                    </div>
                    <Trophy className="absolute -bottom-6 -right-6 text-white/10" size={140} />
                </div>

                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-center min-h-[160px]">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                        <Leaf size={24} className="text-green-500" />
                    </div>
                    <div className="text-stone-500 text-sm font-bold mb-1">Limbah Diselamatkan</div>
                    <div className="text-3xl font-display font-extrabold text-stone-900">4,5 Kg</div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-center min-h-[160px]">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                        <Shirt size={24} className="text-blue-500" />
                    </div>
                    <div className="text-stone-500 text-sm font-bold mb-1">Pakaian Tersalurkan</div>
                    <div className="text-3xl font-display font-extrabold text-stone-900">12 Item</div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
                <h3 className="font-display font-bold text-stone-900 mb-8">Status Donasi Terakhir</h3>

                {/* Simple Progress Tracker */}
                <div className="relative flex justify-between items-center mb-10 max-w-2xl mx-auto">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-stone-100 -z-10 -translate-y-1/2 rounded-full"></div>
                    <div className="absolute top-1/2 left-0 w-[50%] h-1 bg-green-500 -z-10 -translate-y-1/2 rounded-full"></div>

                    {[
                        { label: 'Verifikasi' },
                        { label: 'Penjemputan' },
                        { label: 'Di Katalog' },
                    ].map((step, i) => (
                        <div key={i} className="flex flex-col items-center gap-3 bg-white px-4">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-green-500">
                                <CheckCircle size={28} className="bg-white rounded-full" />
                            </div>
                            <div className="text-xs font-bold text-green-600">{step.label}</div>
                        </div>
                    ))}
                </div>

                <div className="flex border border-stone-100 rounded-xl p-5 gap-5 items-center bg-stone-50/50">
                    <div className="w-16 h-16 bg-stone-200/60 rounded-xl flex items-center justify-center text-3xl">🧥</div>
                    <div>
                        <div className="font-bold text-stone-900 mb-1">Jaket Musim Dingin</div>
                        <div className="text-sm text-stone-500">Telah diverifikasi AI dan Admin. Saat ini berada di Katalog menunggu permintaan.</div>
                    </div>
                </div>
            </div>
        </div>
    );
}