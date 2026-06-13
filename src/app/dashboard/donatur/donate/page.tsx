"use client";
import React, { useState, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

const KONDISI_OPTIONS = [
    { label: 'Baik / Layak pakai', value: 'baik' },
    { label: 'Fair / Cukup layak', value: 'fair' },
    { label: 'Rusak / Perlu penanganan', value: 'rusak' },
];

const TIPE_PAKAIAN_OPTIONS = [
    { label: 'Kaos/Kemeja', value: 'Kaos/Kemeja' },
    { label: 'Jaket', value: 'Jaket' },
    { label: 'Celana panjang', value: 'Celana panjang' },
    { label: 'Celana pendek', value: 'Celana pendek' },
    { label: 'Rok', value: 'Rok' },
    { label: 'Pakaian Dalam', value: 'Pakaian Dalam' },
    { label: 'Sepatu', value: 'Sepatu' },
    { label: 'Sandal', value: 'Sandal' },
    { label: 'Lainnya', value: 'Lainnya' },
];

function DonateFormContent() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [tipePakaian, setTipePakaian] = useState('');
    const [tipePakaianLainnya, setTipePakaianLainnya] = useState('');
    const [catatan, setCatatan] = useState('');
    const [kondisi, setKondisi] = useState('');
    const [buktiFoto, setBuktiFoto] = useState('');

    const isTipeLainnya = tipePakaian === 'Lainnya';
    const resolvedTipePakaian = isTipeLainnya ? tipePakaianLainnya.trim() : tipePakaian.trim();

    const isClothesFormValid = resolvedTipePakaian !== '' && kondisi.trim() !== '' && buktiFoto.trim() !== '';

    const handleClothesFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setBuktiFoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        const userStr = localStorage.getItem('user');
        if (!userStr) {
            setErrorMsg('Sesi habis. Silakan login ulang.');
            router.replace('/auth/login');
            return;
        }

        const user = JSON.parse(userStr);
        const donaturId = user.id;

        if (!donaturId) {
            setErrorMsg('User ID tidak ditemukan. Silakan login ulang.');
            return;
        }

        if (!isClothesFormValid) {
            setErrorMsg('Harap lengkapi semua field pakaian wajib (*).');
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                tipePakaian: resolvedTipePakaian,
                catatan,
                kondisi,
                donatur_id: donaturId,
                bukti_foto: buktiFoto.trim(),
            };

            const response = await fetch('/api/barang-donasi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (!response.ok) {
                setErrorMsg(result.error || 'Gagal mengirim donasi pakaian.');
                return;
            }

            setSuccessMsg('Donasi pakaian berhasil dikirim! Menunggu penjemputan oleh admin.');

            setTipePakaian('');
            setTipePakaianLainnya('');
            setCatatan('');
            setKondisi('');
            setBuktiFoto('');

            setTimeout(() => {
                router.push('/dashboard/donatur/donasi-saya');
            }, 2000);
        } catch (error) {
            console.error('Submit donation error:', error);
            setErrorMsg('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto animate-[fadeIn_0.3s_ease]">
            <div className="mb-6">
                <Link
                    href="/dashboard/donatur"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-stone-500 hover:text-stone-800 transition-colors mb-4"
                >
                    <ArrowLeft size={16} /> Kembali ke Dashboard
                </Link>
                <h1 className="text-2xl font-display font-bold text-stone-900">Donasi Baru</h1>
                <p className="text-stone-500 mt-1">
                    Isi formulir donasi pakaian Anda, dan kontribusikan dampak positif bagi masyarakat & lingkungan.
                </p>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col gap-1.5 w-full">
                        <label className="text-sm font-bold text-stone-700 font-display">
                            Foto Pakaian <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleClothesFileChange}
                            disabled={isSubmitting}
                        />

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${buktiFoto ? 'border-stone-200 bg-stone-50 hover:bg-stone-100' : 'border-green-300 bg-green-50 hover:bg-green-100'}`}
                        >
                            {buktiFoto ? (
                                <div className="relative w-full max-w-50 rounded-lg overflow-hidden border border-stone-200">
                                    <img src={buktiFoto} alt="Preview Pakaian" className="w-full h-auto object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <span className="text-white text-xs font-semibold">Ganti Foto</span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <ImageIcon size={32} className="text-green-500 mb-2" />
                                    <span className="text-sm font-semibold text-stone-600">Klik untuk unggah foto pakaian</span>
                                </>
                            )}
                        </div>
                        <span className="text-xs text-stone-500">Foto wajib diunggah untuk diverifikasi kelayakannya oleh admin & AI.</span>
                    </div>

                    <div className="flex flex-col gap-1.5 w-full">
                        <label htmlFor="donate-kondisi" className="text-sm font-bold text-stone-700 font-display">
                            Kondisi Pakaian <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="donate-kondisi"
                            value={kondisi}
                            onChange={(e) => setKondisi(e.target.value)}
                            required
                            disabled={isSubmitting}
                            className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-800 bg-white transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 appearance-none cursor-pointer"
                        >
                            <option value="" disabled>
                                Pilih kondisi pakaian...
                            </option>
                            {KONDISI_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5 w-full">
                        <label htmlFor="donate-tipePakaian" className="text-sm font-bold text-stone-700 font-display">
                            Tipe Pakaian <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="donate-tipePakaian"
                            value={tipePakaian}
                            onChange={(e) => setTipePakaian(e.target.value)}
                            required
                            disabled={isSubmitting}
                            className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-800 bg-white transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 appearance-none cursor-pointer"
                        >
                            <option value="" disabled>
                                Pilih tipe pakaian...
                            </option>
                            {TIPE_PAKAIAN_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {isTipeLainnya && (
                        <div className="flex flex-col gap-1.5 w-full">
                            <label htmlFor="donate-tipePakaianLainnya" className="text-sm font-bold text-stone-700 font-display">
                                Spesifikasi Tipe Pakaian <span className="text-red-500">*</span>
                            </label>
                            <Input
                                id="donate-tipePakaianLainnya"
                                placeholder="Contoh: Jaket hoodie, gamis, blazer"
                                value={tipePakaianLainnya}
                                onChange={(e) => setTipePakaianLainnya(e.target.value)}
                                required={isTipeLainnya}
                                disabled={isSubmitting}
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5 w-full">
                        <label htmlFor="donate-catatan" className="text-sm font-bold text-stone-700 font-display">
                            Catatan (Opsional)
                        </label>
                        <textarea
                            id="donate-catatan"
                            rows={3}
                            placeholder="Tulis info tambahan tentang pakaian (ukuran spesifik, minus, dll)..."
                            value={catatan}
                            onChange={(e) => setCatatan(e.target.value)}
                            disabled={isSubmitting}
                            className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-800 bg-white transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none"
                        />
                    </div>

                    {errorMsg && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                            <AlertCircle size={16} /> {errorMsg}
                        </div>
                    )}

                    {successMsg && (
                        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-100">
                            <CheckCircle size={16} /> {successMsg}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="submit"
                            className={`flex-1 ${!isClothesFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isSubmitting || !isClothesFormValid}
                        >
                            <Send size={16} />
                            {isSubmitting ? 'Mengirim...' : 'Kirim Donasi'}
                        </Button>
                        <Link href="/dashboard/donatur">
                            <Button type="button" variant="outline" disabled={isSubmitting}>
                                Batal
                            </Button>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function DonatePage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-stone-500 font-display">Memuat formulir donasi...</div>}>
            <DonateFormContent />
        </Suspense>
    );
}
