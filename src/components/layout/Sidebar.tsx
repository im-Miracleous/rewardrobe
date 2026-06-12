"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Shirt, Package, Truck, QrCode, Heart, Trophy, History, ClipboardList, LogOut, Settings, User, LayoutDashboard, ShieldCheck, Megaphone } from 'lucide-react';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [userName, setUserName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    useEffect(() => {
        const loadUserData = () => {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                setUserName(user.nama || '');
                if (user.foto_profil) {
                    setAvatarUrl(user.foto_profil);
                } else {
                    setAvatarUrl(`https://api.dicebear.com/7.x/notionists/svg?seed=${user.nama}`);
                }
            }
        };
        loadUserData();

        // Optional: listen for storage events to update across tabs
        window.addEventListener('storage', loadUserData);
        return () => window.removeEventListener('storage', loadUserData);
    }, []);

    // Menentukan role dari URL
    let role = 'admin';
    if (pathname.includes('/donatur')) role = 'donatur';
    if (pathname.includes('/penerima')) role = 'penerima';

    const menus: Record<string, { href: string; label: string; icon: React.ReactNode }[]> = {
        admin: [
            { href: '/dashboard/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
            { href: '/dashboard/admin/verifikasi', label: 'Verifikasi Donasi', icon: <ShieldCheck size={18} /> },
            { href: '/dashboard/admin/penjemputan', label: 'Penjemputan Barang', icon: <Truck size={18} /> },
            { href: '/dashboard/admin/pengiriman', label: 'Kelola Pengiriman', icon: <Package size={18} /> },
            { href: '/dashboard/admin/inventory', label: 'Inventory (QR)', icon: <QrCode size={18} /> },
            { href: '/dashboard/admin/kampanye', label: 'Kelola Kampanye', icon: <Megaphone size={18} /> },
        ],
        donatur: [
            { href: '/dashboard/donatur', label: 'Beranda Saya', icon: <Home size={18} /> },
            { href: '/dashboard/donatur/donate', label: 'Donasi Baru', icon: <Shirt size={18} /> },
            { href: '/dashboard/donatur/history', label: 'Riwayat Donasi', icon: <History size={18} /> },
            { href: '/dashboard/donatur/impact', label: 'Dampak & Tantangan', icon: <Trophy size={18} /> },
        ],
        penerima: [
            { href: '/dashboard/penerima', label: 'Katalog Donasi', icon: <Shirt size={18} /> },
            { href: '/dashboard/penerima/permintaan', label: 'Permintaan Saya', icon: <ClipboardList size={18} /> },
        ]
    };

    const navItems = menus[role] || [];

    const handleLogout = async () => {
        setIsLoggingOut(true);

        try {
            localStorage.removeItem('user');
            localStorage.removeItem('authToken');

            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            router.replace('/auth/login');
            router.refresh();
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <aside className="w-64 bg-white border-r border-stone-200 fixed inset-y-0 left-0 flex flex-col z-40">
            <Link href="/" className="h-16 flex items-center px-6 border-b border-stone-100">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-2">
                    <Shirt className="text-white" size={16} />
                </div>
                <span className="font-display font-extrabold text-lg text-stone-900">ReWardrobe</span>
            </Link>

            <div className="p-4 flex-1 overflow-y-auto">
                <div className="text-xs font-bold tracking-widest text-stone-400 uppercase mb-4 px-2 mt-2">Menu Utama</div>
                <div className="space-y-1">
                    {navItems.map((item, idx) => {
                        const isDashboardRoot = item.href === '/dashboard/admin' || item.href === '/dashboard/donatur' || item.href === '/dashboard/penerima';
                        const isActive = isDashboardRoot
                            ? pathname === item.href
                            : pathname.startsWith(item.href);
                        return (
                            <Link key={idx} href={item.href} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive ? 'bg-green-50 text-green-700' : 'text-stone-600 hover:bg-stone-100'}`}>
                                {item.icon} {item.label}
                            </Link>
                        );
                    })}
                </div>
            </div>

            <div className="p-4 border-t border-stone-100">
                {/* Profile Info Section (Sesuai Gambar) */}
                <Link href={`/dashboard/${role}/profile`} className="flex items-center justify-between px-2 py-3 mb-2 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden shrink-0">
                            <img src={avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=John Doe (${role.charAt(0).toUpperCase() + role.slice(1)})`} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div className="overflow-hidden">
                            <div className="text-sm font-bold text-stone-800 leading-tight truncate w-24">{userName || `User ${role}`}</div>
                            <div className="text-xs text-stone-400 capitalize leading-tight">{role}</div>
                        </div>
                    </div>
                    <Settings size={18} className="text-stone-400 hover:text-stone-600" />
                </Link>

                <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <LogOut size={18} /> {isLoggingOut ? 'Keluar...' : 'Keluar'}
                </button>
            </div>
        </aside>
    );
}