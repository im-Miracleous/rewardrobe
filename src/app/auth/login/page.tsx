"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shirt, Leaf, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrorMsg(data.message || 'Login gagal. Cek email dan password Anda.');
                return;
            }

            // Simpan user info ke localStorage (basic session)
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('authToken', data.token);

            router.replace(data.redirectTo || '/dashboard');
        } catch (error) {
            setErrorMsg('Terjadi kesalahan. Silakan coba lagi.');
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex font-body bg-white">
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
                        Selamat Datang Kembali!
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
                        Masuk ke Akun
                    </h1>
                    <p className="text-stone-500 mb-8">
                        Masukkan email dan password Anda untuk melanjutkan.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Email"
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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

                        {errorMsg && (
                            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                                <AlertCircle size={16} /> {errorMsg}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full mt-2"
                            size="lg"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Sedang memproses...' : 'Masuk'}
                        </Button>
                    </form>

                    <div className="mt-8 text-center text-sm text-stone-600">
                        Belum punya akun?{' '}
                        <Link href="/auth/register" className="font-bold text-green-600 hover:underline">
                            Daftar sekarang
                        </Link>
                    </div>

                    <div className="mt-4 text-center">
                        <Link
                            href="/db-check"
                            className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-600 shadow-sm transition hover:border-green-200 hover:text-green-700"
                        >
                            Database check
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
