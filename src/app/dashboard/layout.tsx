"use client";
import React, { useEffect, useState, useRef, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { Bell, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface Notifikasi {
    id: number;
    judul: string;
    pesan: string;
    dibaca: boolean;
    created_at: string;
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [notifications, setNotifications] = useState<Notifikasi[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    let role = 'admin';
    if (pathname.includes('/admin')) { role = 'admin'; }
    if (pathname.includes('/donatur')) { role = 'donatur'; }
    if (pathname.includes('/penerima')) { role = 'penerima'; }

    const titleMap: Record<string, string> = {
        '/dashboard/admin': 'Admin Dashboard',
        '/dashboard/admin/penjemputan': 'Penjemputan Barang',
        '/dashboard/admin/pengiriman': 'Kelola Pengiriman',
        '/dashboard/admin/inventory': 'Inventory & Katalog (QR)',
        '/dashboard/admin/permintaan': 'Permintaan Penerima',
        '/dashboard/donatur': 'Donatur Dashboard',
        '/dashboard/penerima': 'Katalog Donasi',
        '/dashboard/penerima/permintaan': 'Permintaan Saya',
    };
    const title = titleMap[pathname] || (role === 'admin' ? 'Admin Dashboard' : role === 'donatur' ? 'Donatur Dashboard' : 'Penerima Dashboard');

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch('/api/notifikasi');
            const json = await res.json();
            if (json.data) {
                setNotifications(json.data);
                setUnreadCount(json.data.filter((n: Notifikasi) => !n.dibaca).length);
            }
        } catch {
            // silently ignore
        }
    }, []);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            router.replace('/auth/login');
            return;
        }
        setIsCheckingAuth(false);
        fetchNotifications();
    }, [router, fetchNotifications]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleBellClick = async () => {
        if (!isNotifOpen && unreadCount > 0) {
            // Mark all as read when opening
            try {
                await fetch('/api/notifikasi', { method: 'PATCH' });
                setNotifications(prev => prev.map(n => ({ ...n, dibaca: true })));
                setUnreadCount(0);
            } catch {
                // silently ignore
            }
        }
        setIsNotifOpen(prev => !prev);
    };

    if (isCheckingAuth) {
        return <div className="min-h-screen bg-stone-50" />;
    }

    return (
        <div className="flex min-h-screen bg-stone-50">
            <Sidebar />
            <main className="flex-1 ml-64 flex flex-col min-h-screen">
                <header className="h-16 bg-white border-b border-stone-200 px-8 flex items-center justify-between sticky top-0 z-30">
                    <h2 className="font-display font-bold text-lg text-stone-800">{title}</h2>
                    <div className="flex items-center gap-4">
                        {/* Bell + Notification Dropdown */}
                        <div ref={notifRef} className="relative">
                            <button
                                onClick={handleBellClick}
                                className="relative p-2 rounded-full hover:bg-stone-100 transition-colors"
                            >
                                <Bell size={20} className="text-stone-600" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 rounded-full border border-white text-white text-[10px] font-bold flex items-center justify-center px-0.5">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {isNotifOpen && (
                                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-stone-200 z-50 overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
                                        <span className="text-sm font-bold text-stone-800">Notifikasi</span>
                                        <button onClick={() => setIsNotifOpen(false)} className="text-stone-400 hover:text-stone-600">
                                            <X size={16} />
                                        </button>
                                    </div>
                                    {notifications.length === 0 ? (
                                        <div className="px-4 py-8 text-center text-stone-400 text-sm">
                                            Belum ada notifikasi.
                                        </div>
                                    ) : (
                                        <div className="max-h-80 overflow-y-auto divide-y divide-stone-50">
                                            {notifications.slice(0, 10).map(n => (
                                                <div key={n.id} className={`px-4 py-3 ${!n.dibaca ? 'bg-green-50' : ''}`}>
                                                    <p className="text-xs font-bold text-stone-800 mb-0.5">{n.judul}</p>
                                                    <p className="text-xs text-stone-500 leading-relaxed">{n.pesan}</p>
                                                    <p className="text-[10px] text-stone-400 mt-1">
                                                        {new Date(n.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <Button size="sm" onClick={() => router.push(`/dashboard/${role}/profile`)}>Profil</Button>
                    </div>
                </header>
                <div className="p-8 flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}
