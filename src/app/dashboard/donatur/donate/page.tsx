"use client";
import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Send, AlertCircle, CheckCircle, Image as ImageIcon, Wallet, Shield } from 'lucide-react';
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

const QUICK_AMOUNTS = [50000, 100000, 250000, 500000];

function DonateFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const moneyFileInputRef = useRef<HTMLInputElement>(null);

    const [donationType, setDonationType] = useState<'pakaian' | 'uang'>('pakaian');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [campaigns, setCampaigns] = useState<any[]>([]);

    // State for Clothes Donation
    const [tipePakaian, setTipePakaian] = useState('');
    const [tipePakaianLainnya, setTipePakaianLainnya] = useState('');
    const [catatan, setCatatan] = useState('');
    const [kondisi, setKondisi] = useState('');
    const [buktiFoto, setBuktiFoto] = useState('');
    const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
    const [isCampaignDonation, setIsCampaignDonation] = useState(false);

    // State for Money Donation
    const [nominal, setNominal] = useState<number>(0);
    const [buktiTransfer, setBuktiTransfer] = useState('');
    const [catatanUang, setCatatanUang] = useState('');

    useEffect(() => {
        // Fetch campaigns
        const fetchCampaigns = async () => {
            try {
                const res = await fetch('/api/campaigns');
                const result = await res.json();
                if (result.data) {
                    setCampaigns(result.data);
                }
            } catch (err) {
                console.error('Gagal memuat kampanye:', err);
            }
        };
        fetchCampaigns();
    }, []);

    useEffect(() => {
        // Preselect campaign from URL query parameter if present
        const urlCampaignId = searchParams.get('campaignId');
        if (urlCampaignId) {
            const parsed = parseInt(urlCampaignId, 10);
            if (!isNaN(parsed)) {
                setSelectedCampaignId(parsed);
                setIsCampaignDonation(true);
                // If this campaign has target_dana but not target_barang, maybe user wants to donate money
                const camp = campaigns.find(c => c.id === parsed);
                if (camp && camp.target_dana && !camp.target_barang) {
                    setDonationType('uang');
                }
            }
        }
    }, [searchParams, campaigns]);

    const isTipeLainnya = tipePakaian === 'Lainnya';
    const resolvedTipePakaian = isTipeLainnya ? tipePakaianLainnya.trim() : tipePakaian.trim();

    // Validation
    const isClothesFormValid = resolvedTipePakaian !== '' && kondisi.trim() !== '' && buktiFoto.trim() !== '';
    const isMoneyFormValid = nominal >= 10000 && buktiTransfer.trim() !== '';

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

    const handleMoneyFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setBuktiTransfer(reader.result as string);
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

        setIsSubmitting(true);

        try {
            if (donationType === 'pakaian') {
                if (!isClothesFormValid || (isCampaignDonation && !selectedCampaignId)) {
                    setErrorMsg('Harap lengkapi semua field pakaian wajib (*) dan pilih kampanye jika terhubung.');
                    setIsSubmitting(false);
                    return;
                }

                const payload = {
                    tipePakaian: resolvedTipePakaian,
                    catatan,
                    kondisi,
                    donatur_id: donaturId,
                    bukti_foto: buktiFoto.trim(),
                    campaign_id: selectedCampaignId,
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

                setSuccessMsg('Donasi pakaian berhasil dikirim! Menunggu verifikasi admin.');

                // Reset clothes form
                setTipePakaian('');
                setTipePakaianLainnya('');
                setCatatan('');
                setKondisi('');
                setBuktiFoto('');
                setSelectedCampaignId(null);
            } else {
                if (!isMoneyFormValid || (isCampaignDonation && !selectedCampaignId)) {
                    setErrorMsg('Harap masukkan nominal donasi (minimal Rp 10.000), unggah bukti transfer, dan pilih kampanye jika terhubung.');
                    setIsSubmitting(false);
                    return;
                }

                const payload = {
                    nominal,
                    bukti_transfer: buktiTransfer.trim(),
                    catatan: catatanUang,
                    donatur_id: donaturId,
                    campaign_id: selectedCampaignId,
                };

                const response = await fetch('/api/donasi-uang', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                const result = await response.json();
                if (!response.ok) {
                    setErrorMsg(result.error || 'Gagal mengirim donasi uang.');
                    return;
                }

                setSuccessMsg('Donasi uang berhasil dikirim! Menunggu verifikasi admin.');

                // Reset money form
                setNominal(0);
                setBuktiTransfer('');
                setCatatanUang('');
                setSelectedCampaignId(null);
            }

            // Redirect after a short delay
            setTimeout(() => {
                router.push('/dashboard/donatur/history');
            }, 2000);
        } catch (error) {
            console.error('Submit donation error:', error);
            setErrorMsg('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const campaignSelectorField = (
        <div className="flex flex-col gap-3 w-full my-8">
            <label className="flex items-center gap-2.5 cursor-pointer">
                <input 
                    type="checkbox"
                    checked={isCampaignDonation}
                    onChange={(e) => {
                        setIsCampaignDonation(e.target.checked);
                        if (!e.target.checked) setSelectedCampaignId(null);
                    }}
                    disabled={isSubmitting}
                    className="w-4 h-4 rounded border-stone-300 text-green-600 focus:ring-green-500 cursor-pointer"
                />
                <span className="text-sm font-bold text-stone-700 font-display">Apakah Anda ingin mendonasikan ke program kampanye tertentu?</span>
            </label>
            
            {isCampaignDonation && (
                <div className="flex flex-col gap-1.5 mt-1 animate-[fadeIn_0.2s_ease]">
                    <label htmlFor="donate-campaign" className="text-xs font-bold text-stone-600 font-display">
                        Pilih Kampanye <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="donate-campaign"
                        value={selectedCampaignId || ''}
                        onChange={(e) => setSelectedCampaignId(parseInt(e.target.value, 10) || null)}
                        disabled={isSubmitting}
                        required={isCampaignDonation}
                        className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-800 bg-white transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 appearance-none cursor-pointer"
                    >
                        <option value="" disabled>-- Pilih Kampanye Tujuan --</option>
                        {campaigns.map((camp) => (
                            <option key={camp.id} value={camp.id}>
                                {camp.judul}
                            </option>
                        ))}
                    </select>
                    <span className="text-xs text-stone-500">Pilih program kampanye yang ingin Anda dukung.</span>
                </div>
            )}
        </div>
    );

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
                    Pilih jenis donasi Anda, isi formulir, dan kontribusikan dampak positif bagi masyarakat & lingkungan.
                </p>
            </div>

            {/* Donation Type Tabs */}
            <div className="flex gap-2 p-1 bg-stone-100 rounded-2xl mb-6">
                <button
                    type="button"
                    onClick={() => { setDonationType('pakaian'); setErrorMsg(''); }}
                    className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold font-display transition-all flex items-center justify-center gap-2 ${donationType === 'pakaian' ? 'bg-white text-green-700 shadow-sm border border-stone-200/50' : 'text-stone-500 hover:text-stone-800'}`}
                >
                    🧥 Pakaian Fisik
                </button>
                <button
                    type="button"
                    onClick={() => { setDonationType('uang'); setErrorMsg(''); }}
                    className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold font-display transition-all flex items-center justify-center gap-2 ${donationType === 'uang' ? 'bg-white text-green-700 shadow-sm border border-stone-200/50' : 'text-stone-500 hover:text-stone-800'}`}
                >
                    💵 Finansial (Uang)
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {donationType === 'pakaian' ? (
                        /* CLOTHES FORM FIELDS */
                        <>
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
                                    required={donationType === 'pakaian'}
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
                                    required={donationType === 'pakaian'}
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
                                    required={donationType === 'pakaian'}
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
                                        required={donationType === 'pakaian' && isTipeLainnya}
                                        disabled={isSubmitting}
                                    />
                                </div>
                            )}

                            {campaignSelectorField}

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
                        </>
                    ) : (
                        /* MONETARY FORM FIELDS */
                        <>
                            {/* Transfer Account Instruction Box */}
                            <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-3">
                                <div className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
                                    <Wallet size={14} className="text-green-600" /> Informasi Rekening ReWardrobe
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white p-3 rounded-xl border border-stone-200/50">
                                        <div className="text-[10px] font-bold text-stone-400 uppercase">Bank Mandiri</div>
                                        <div className="text-sm font-bold text-stone-800 font-display">123-456-789-0</div>
                                        <div className="text-xs text-stone-500">a.n. Yayasan ReWardrobe</div>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-stone-200/50">
                                        <div className="text-[10px] font-bold text-stone-400 uppercase">E-Wallet (GoPay/OVO)</div>
                                        <div className="text-sm font-bold text-stone-800 font-display">0812-3456-7890</div>
                                        <div className="text-xs text-stone-500">a.n. ReWardrobe Peduli</div>
                                    </div>
                                </div>
                                <div className="text-[11px] text-stone-400 flex items-center gap-1">
                                    <Shield size={12} className="text-green-500" /> Semua donasi dana akan diaudit secara berkala untuk transparansi ekosistem.
                                </div>
                            </div>

                            {/* Quick Select Amounts */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-bold text-stone-700 font-display">Pilih Nominal Cepat</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {QUICK_AMOUNTS.map((amt) => (
                                        <button
                                            key={amt}
                                            type="button"
                                            onClick={() => setNominal(amt)}
                                            className={`py-3 px-4 rounded-xl border text-sm font-bold font-display transition-all text-center ${nominal === amt ? 'bg-green-50 border-green-500 text-green-700 shadow-xs' : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300'}`}
                                        >
                                            Rp {amt.toLocaleString('id-ID')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Amount */}
                            <div className="flex flex-col gap-1.5 w-full">
                                <label htmlFor="nominal-input" className="text-sm font-bold text-stone-700 font-display">
                                    Nominal Donasi (Rupiah) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-sm">Rp</span>
                                    <input
                                        id="nominal-input"
                                        type="number"
                                        min="10000"
                                        placeholder="Minimal Rp 10.000"
                                        value={nominal || ''}
                                        onChange={(e) => setNominal(parseInt(e.target.value, 10) || 0)}
                                        required={donationType === 'uang'}
                                        disabled={isSubmitting}
                                        className="w-full rounded-xl border border-stone-200 pl-10 pr-4 py-3 text-sm text-stone-800 bg-white transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                    />
                                </div>
                                <span className="text-xs text-stone-500">Jumlah donasi kustom. Minimal Rp 10.000.</span>
                            </div>

                            {/* Receipt Upload */}
                            <div className="flex flex-col gap-1.5 w-full">
                                <label className="text-sm font-bold text-stone-700 font-display">
                                    Bukti Transfer <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={moneyFileInputRef}
                                    onChange={handleMoneyFileChange}
                                    required={donationType === 'uang'}
                                    disabled={isSubmitting}
                                />

                                <div
                                    onClick={() => moneyFileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${buktiTransfer ? 'border-stone-200 bg-stone-50 hover:bg-stone-100' : 'border-green-300 bg-green-50 hover:bg-green-100'}`}
                                >
                                    {buktiTransfer ? (
                                        <div className="relative w-full max-w-50 rounded-lg overflow-hidden border border-stone-200">
                                            <img src={buktiTransfer} alt="Bukti Transfer" className="w-full h-auto object-cover" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <span className="text-white text-xs font-semibold">Ganti Bukti</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <ImageIcon size={32} className="text-green-500 mb-2" />
                                            <span className="text-sm font-semibold text-stone-600">Klik untuk unggah struk transfer/pembayaran</span>
                                        </>
                                    )}
                                </div>
                                <span className="text-xs text-stone-500">Wajib mengunggah bukti transaksi yang jelas untuk divalidasi.</span>
                            </div>

                            {campaignSelectorField}

                            {/* Money Note */}
                            <div className="flex flex-col gap-1.5 w-full">
                                <label htmlFor="donate-catatan-uang" className="text-sm font-bold text-stone-700 font-display">
                                    Pesan / Catatan (Opsional)
                                </label>
                                <textarea
                                    id="donate-catatan-uang"
                                    rows={3}
                                    placeholder="Tulis pesan penyemangat atau info tambahan..."
                                    value={catatanUang}
                                    onChange={(e) => setCatatanUang(e.target.value)}
                                    disabled={isSubmitting}
                                    className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-800 bg-white transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none"
                                />
                            </div>
                        </>
                    )}

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

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="submit"
                            className={`flex-1 ${((donationType === 'pakaian' && !isClothesFormValid) || (donationType === 'uang' && !isMoneyFormValid)) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isSubmitting || (donationType === 'pakaian' && !isClothesFormValid) || (donationType === 'uang' && !isMoneyFormValid)}
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
