"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shirt, Heart, Star, Leaf, AlertCircle, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RegisterPage() {
    const router = useRouter();
    const [role, setRole] = useState<'donatur' | 'penerima'>('donatur');
    const [tipePenerima, setTipePenerima] = useState<'panti' | 'komunitas' | 'pengrajin'>('panti');
    
    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        password: '',
        passwordConfirm: '',
        noTelpon: '',
        alamatLengkap: '',
        kota: '',
    });
    
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validateForm = () => {
        if (!formData.nama.trim()) {
            setErrorMsg('Nama lengkap tidak boleh kosong.');
            return false;
        }
        if (!formData.email.trim()) {
            setErrorMsg('Email tidak boleh kosong.');
            return false;
        }
        if (!formData.password) {
            setErrorMsg('Password tidak boleh kosong.');
            return false;
        }
        if (formData.password.length < 6) {
            setErrorMsg('Password minimal 6 karakter.');
            return false;
        }
        if (formData.password !== formData.passwordConfirm) {
            setErrorMsg('Password tidak cocok.');
            return false;
        }
        if (!formData.noTelpon.trim()) {
            setErrorMsg('Nomor telepon tidak boleh kosong.');
            return false;
        }
        if (!formData.alamatLengkap.trim()) {
            setErrorMsg('Alamat lengkap tidak boleh kosong.');
            return false;
        }
        if (!formData.kota.trim()) {
            setErrorMsg('Kota tidak boleh kosong.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nama: formData.nama,
                    email: formData.email,
                    password: formData.password,
                    noTelpon: formData.noTelpon,
                    alamatLengkap: formData.alamatLengkap,
                    kota: formData.kota,
                    role: role,
                    tipe: role === 'penerima' ? tipePenerima : undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrorMsg(data.message || 'Pendaftaran gagal. Silakan coba lagi.');
                return;
            }

            setSuccessMsg('Akun berhasil dibuat! Silakan login.');
            setFormData({
                nama: '',
                email: '',
                password: '',
                passwordConfirm: '',
                noTelpon: '',
                alamatLengkap: '',
                kota: '',
            });

            // Redirect ke login setelah 2 detik
            setTimeout(() => {
                router.push('/auth/login');
            }, 2000);
        } catch (error) {
            setErrorMsg('Terjadi kesalahan. Silakan coba lagi.');
            console.error('Register error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-body bg-stone-50">
            {/* LEFT PANEL - BRANDING */}
            <div className="hidden lg:flex w-1/2 bg-linear-to-br from-green-950 via-green-800 to-[#4a7c59] p-12 flex-col justify-between relative overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/auth-bg.jpg"
                        alt="Pakaian ramah lingkungan"
                        className="w-full h-full object-cover opacity-25 mix-blend-overlay"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-green-950/90 via-transparent to-transparent"></div>
                </div>

                {/* Logo */}
                <Link href="/" className="relative z-10 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                        <Shirt className="text-green-700" size={20} />
                    </div>
                    <span className="font-display text-2xl font-extrabold text-white">ReWardrobe</span>
                </Link>

                {/* Floating Stat Card */}
                <div className="relative z-10 flex-1 flex flex-col justify-center items-start mt-8">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl max-w-sm shadow-2xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-green-400/20 rounded-full flex items-center justify-center border border-green-400/30">
                                <Leaf className="text-green-300" size={24} />
                            </div>
                            <div>
                                <div className="text-white font-bold font-display text-lg">12.480+ Item</div>
                                <div className="text-green-100 text-sm">Telah berhasil disalurkan</div>
                            </div>
                        </div>
                        <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                            <div className="w-[85%] h-full bg-green-400 rounded-full"></div>
                        </div>
                        <div className="mt-3 text-xs text-white/70">Bergabunglah dan tingkatkan dampak lingkungan!</div>
                    </div>
                </div>

                {/* Welcome Text */}
                <div className="relative z-10 mt-auto pt-8">
                    <h2 className="text-4xl font-display font-bold text-white leading-tight mb-4">
                        Mulai Langkah Kebaikanmu.
                    </h2>
                    <p className="text-green-100 text-lg max-w-md">
                        Bersama kita ciptakan ekosistem fashion yang berkelanjutan dan bantu mereka yang membutuhkan.
                    </p>
                </div>
            </div>

            {/* RIGHT PANEL - FORM */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12 relative z-10">
                <div className="w-full max-w-md">
                    <h1 className="text-3xl font-display font-bold text-stone-900 mb-2">
                        Buat Akun Baru
                    </h1>
                    <p className="text-stone-500 mb-6">
                        Pilih peran Anda dan lengkapi data diri.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* ROLE SELECTION */}
                        <div className="mb-6">
                            <label className="text-sm font-bold text-stone-700 font-display block mb-3">Pilih Peran Anda</label>
                            <div className="grid grid-cols-2 gap-3">
                                <div
                                    onClick={() => setRole('donatur')}
                                    className={`cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                                        role === 'donatur'
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-stone-200 hover:border-stone-300'
                                    }`}
                                >
                                    <Heart
                                        size={24}
                                        className={role === 'donatur' ? 'text-green-600' : 'text-stone-400'}
                                    />
                                    <span className="text-sm font-semibold">Donatur</span>
                                    <span className="text-xs text-stone-500">Pemberi pakaian</span>
                                </div>
                                <div
                                    onClick={() => setRole('penerima')}
                                    className={`cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                                        role === 'penerima'
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-stone-200 hover:border-stone-300'
                                    }`}
                                >
                                    <Star
                                        size={24}
                                        className={role === 'penerima' ? 'text-blue-600' : 'text-stone-400'}
                                    />
                                    <span className="text-sm font-semibold">Penerima</span>
                                    <span className="text-xs text-stone-500">Penerima pakaian</span>
                                </div>
                            </div>
                        </div>

                        {/* TIPE PENERIMA - HANYA JIKA ROLE PENERIMA */}
                        {role === 'penerima' && (
                            <div className="mb-6">
                                <label className="text-sm font-bold text-stone-700 font-display block mb-2">
                                    Jenis Penerima
                                </label>
                                <select
                                    value={tipePenerima}
                                    onChange={(e) => setTipePenerima(e.target.value as 'panti' | 'komunitas' | 'pengrajin')}
                                    className="w-full rounded-xl border border-stone-200 px-4 py-2.5 text-sm text-stone-800 bg-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-stone-100 disabled:cursor-not-allowed"
                                    disabled={isLoading}
                                >
                                    <option value="panti">Panti Asuhan</option>
                                    <option value="komunitas">Komunitas</option>
                                    <option value="pengrajin">Pengrajin</option>
                                </select>
                            </div>
                        )}

                        {/* FORM FIELDS */}
                        <Input
                            label="Nama Lengkap"
                            id="nama"
                            name="nama"
                            placeholder="Nama Anda"
                            value={formData.nama}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        />

                        <Input
                            label="Email"
                            id="email"
                            name="email"
                            type="email"
                            placeholder="email@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        />

                        <div className="flex flex-col gap-1.5 w-full">
                            <label htmlFor="password" className="text-sm font-bold text-stone-700 font-display">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    required
                                    className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-800 bg-white transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 pr-10 disabled:bg-stone-100 disabled:cursor-not-allowed"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isLoading}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none transition-colors disabled:cursor-not-allowed"
                                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5 w-full">
                            <label htmlFor="passwordConfirm" className="text-sm font-bold text-stone-700 font-display">
                                Konfirmasi Password
                            </label>
                            <div className="relative">
                                <input
                                    id="passwordConfirm"
                                    name="passwordConfirm"
                                    type={showPasswordConfirm ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.passwordConfirm}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    required
                                    className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-800 bg-white transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 pr-10 disabled:bg-stone-100 disabled:cursor-not-allowed"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                    disabled={isLoading}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none transition-colors disabled:cursor-not-allowed"
                                    aria-label={showPasswordConfirm ? "Sembunyikan password" : "Tampilkan password"}
                                >
                                    {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <Input
                            label="Nomor Telepon"
                            id="noTelpon"
                            name="noTelpon"
                            placeholder="+62 812 3456 7890"
                            value={formData.noTelpon}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        />

                        <div className="flex flex-col gap-1.5 w-full">
                            <label htmlFor="alamatLengkap" className="text-sm font-bold text-stone-700 font-display">
                                Alamat Lengkap
                            </label>
                            <textarea
                                id="alamatLengkap"
                                name="alamatLengkap"
                                placeholder="Jalan, nomor rumah, RT/RW, dll."
                                value={formData.alamatLengkap}
                                onChange={handleChange}
                                disabled={isLoading}
                                rows={3}
                                className="w-full rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-800 bg-white transition-all focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none disabled:bg-stone-100 disabled:cursor-not-allowed"
                                required
                            />
                        </div>

                        <Input
                            label="Kota"
                            id="kota"
                            name="kota"
                            placeholder="Kota Anda"
                            value={formData.kota}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                        />

                        {errorMsg && (
                            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                                <AlertCircle size={16} /> {errorMsg}
                            </div>
                        )}

                        {successMsg && (
                            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-100">
                                <CheckCircle size={16} /> {successMsg}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full mt-4"
                            size="lg"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Sedang memproses...' : 'Daftar'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-stone-600">
                        Sudah punya akun?{' '}
                        <Link href="/auth/login" className="font-bold text-green-600 hover:underline">
                            Masuk di sini
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
