// CODE-CITE:
//   Title: Donation Form Page - Donatur Submit Barang
//   Type: ai
//   Value: Claude (claude.ai/code)
//   Notes: Form donasi barang baru untuk donatur, termasuk upload foto, validasi, dan integrasi API POST /api/barang-donasi
//   Lines Range: 307
"use client";
import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

const KONDISI_OPTIONS = [
    { label: 'Fair / Cukup layak', value: 'fair' },
    { label: 'Baik / Layak pakai', value: 'baik' },
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

export default function DonatePage() {
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
    const isFormValid = resolvedTipePakaian !== '' && kondisi.trim() !== '' && buktiFoto.trim() !== '';

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setBuktiFoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (!isFormValid) {
            setErrorMsg('Harap pilih tipe pakaian, isi tipe lainnya bila diperlukan, unggah foto, dan pilih kondisi barang.');
            return;
        }

        setIsSubmitting(true);

        try {
            // Get user from localStorage (set during login)
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
                setErrorMsg(result.error || 'Gagal mengirim donasi.');
                return;
            }

            setSuccessMsg('Donasi berhasil dikirim! Menunggu verifikasi admin.');

            // Reset form
            setTipePakaian('');
            setTipePakaianLainnya('');
            setCatatan('');
            setKondisi('');
            setBuktiFoto('');

            // Redirect after a short delay
            setTimeout(() => {
                router.push('/dashboard/donatur');
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
            <div className="mb-8">
                <Link
                    href="/dashboard/donatur"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-stone-500 hover:text-stone-800 transition-colors mb-4"
                >
                    <ArrowLeft size={16} /> Kembali ke Dashboard
                </Link>
                <h1 className="text-2xl font-display font-bold text-stone-900">Donasi Barang Baru</h1>
                <p className="text-stone-500 mt-1">Pilih tipe pakaian, unggah foto, lalu isi kondisi dan catatan seperlunya.</p>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col gap-1.5 w-full">
                        <label className="text-sm font-bold text-stone-700 font-display">
                            Bukti Foto <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            required
                            disabled={isSubmitting}
                        />

                        <div
                            onClick={handleUploadClick}
                            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${buktiFoto ? 'border-stone-200 bg-stone-50 hover:bg-stone-100' : 'border-green-300 bg-green-50 hover:bg-green-100'}`}
                        >
                            {buktiFoto ? (
                                <div className="relative w-full max-w-50 rounded-lg overflow-hidden border border-stone-200">
                                    <img src={buktiFoto} alt="Preview" className="w-full h-auto object-cover" />
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
                        <span className="text-xs text-stone-500">Foto wajib diunggah untuk donasi pakaian.</span>
                    </div>

                    <div className="flex flex-col gap-1.5 w-full">
                        <label htmlFor="donate-kondisi" className="text-sm font-bold text-stone-700 font-display">
                            Kondisi barang <span className="text-red-500">*</span>
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
                                Pilih kondisi barang...
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
                                required
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
                            rows={4}
                            placeholder="Tulis info tambahan tentang barang..."
                            value={catatan}
                            onChange={(e) => setCatatan(e.target.value)}
                            disabled={isSubmitting}
                            className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-800 bg-white transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none"
                        />
                    </div>

                    {/* Error Message */}
                    {errorMsg && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                            <AlertCircle size={16} /> {errorMsg}
                        </div>
                    )}

                    {/* Success Message */}
                    {successMsg && (
                        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg border border-green-100">
                            <CheckCircle size={16} /> {successMsg}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="submit"
                            className={`flex-1 ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isSubmitting || !isFormValid}
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
