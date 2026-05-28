import React from 'react';
import Link from 'next/link';
import { Shirt, CheckCircle, ShieldCheck, MapPin, Truck, Trophy, Leaf, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Navbar from '@/components/layout/Navbar';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-50 font-body text-stone-800">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-[#052e16] via-[#166534] to-[#4a7c59]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.05)_0%,transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[60px_60px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 rounded-full text-white/90 text-sm font-semibold mb-8 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Platform Donasi Pakaian #1 di Indonesia
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-extrabold text-white leading-tight mb-6 tracking-tight">
            Pakaianmu,<br /><span className="text-green-400">Harapan</span> Mereka.
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            ReWardrobe menghubungkan donatur pakaian dengan panti asuhan, komunitas, dan pengrajin melalui alur donasi yang ringan, terverifikasi, dan mudah dipakai.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth?view=register">
              <Button variant="white" size="lg">Mulai Donasi Sekarang</Button>
            </Link>
            <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 hover:border-white/60">
              Pelajari Cara Kerjanya
            </Button>
          </div>

          {/* Floating AI Card Mockup */}
          <div className="mt-16 relative flex justify-center animate-[float_4s_ease-in-out_infinite]">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-sm text-center shadow-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-400/20 border border-green-400/40 rounded-full text-green-400 text-xs font-bold mb-4">
                <CheckCircle size={14} /> Moderasi Aktif
              </div>
              <div className="text-6xl mb-2">👕</div>
              <div className="text-sm text-white/80 mb-4">Jaket Denim — Kondisi fair</div>
              <div className="bg-green-400/10 border border-green-400/30 rounded-xl p-3">
                <div className="text-xs text-white/60 mb-1">Kondisi dari donatur</div>
                <div className="text-lg font-bold font-display text-green-400 flex items-center justify-center gap-2">
                  <CheckCircle size={18} /> Siap dimoderasi
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fitur Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-green-600 font-bold tracking-widest text-sm uppercase">Fitur Unggulan</span>
            <h2 className="text-4xl font-display font-extrabold text-stone-900 mt-2">Semua yang kamu butuhkan</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <ShieldCheck size={28} className="text-green-700" />, bg: 'bg-green-100', title: 'Self-Assessment Donatur', desc: 'Donatur mengisi kondisi barang secara langsung sebelum moderasi.' },
              { icon: <MapPin size={28} className="text-blue-700" />, bg: 'bg-blue-100', title: 'Pelacakan Real-time', desc: 'Pantau status donasimu dari awal hingga akhir.' },
              { icon: <Truck size={28} className="text-yellow-700" />, bg: 'bg-yellow-100', title: 'Integrasi Multi-kurir', desc: 'Pilih kurir favorit langsung dari aplikasi.' },
              { icon: <Trophy size={28} className="text-pink-700" />, bg: 'bg-pink-100', title: 'Gamifikasi & Poin', desc: 'Kumpulkan poin setiap donasi dan lihat peringkatmu.' },
              { icon: <Leaf size={28} className="text-emerald-700" />, bg: 'bg-emerald-100', title: 'Laporan Dampak', desc: 'Lihat jumlah limbah tekstil yang berhasil diselamatkan.' },
              { icon: <QrCode size={28} className="text-orange-700" />, bg: 'bg-orange-100', title: 'QR Code Inventory', desc: 'Stok fisik dan digital selalu tersinkronisasi.' },
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-3xl border border-stone-200 bg-white hover:-translate-y-2 hover:shadow-xl hover:border-green-200 transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl ${f.bg} flex items-center justify-center mb-6`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-display font-bold text-stone-900 mb-3">{f.title}</h3>
                <p className="text-stone-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}