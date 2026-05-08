"use client";
import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    let title = 'Dashboard';
    if (pathname.includes('/admin')) title = 'Admin Dashboard';
    if (pathname.includes('/donatur')) title = 'Donatur Dashboard';
    if (pathname.includes('/penerima')) title = 'Penerima Dashboard';

    return (
        <div className="flex min-h-screen bg-stone-50">
            <Sidebar />
            <main className="flex-1 ml-64 flex flex-col min-h-screen">
                <header className="h-16 bg-white border-b border-stone-200 px-8 flex items-center justify-between sticky top-0 z-30">
                    <h2 className="font-display font-bold text-lg text-stone-800">{title}</h2>
                    <div className="flex items-center gap-4">
                        <button className="relative p-2 rounded-full hover:bg-stone-100 transition-colors">
                            <Bell size={20} className="text-stone-600" />
                            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                        <Button size="sm">Profil</Button>
                    </div>
                </header>
                <div className="p-8 flex-1">
                    {children}
                </div>
            </main>
        </div>
    );
}