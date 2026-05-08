"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shirt } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 h-20 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm' : 'bg-transparent'}`}>
            <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                    <Shirt className="text-white" size={20} />
                </div>
                <span className={`font-display text-xl font-extrabold ${scrolled ? 'text-stone-900' : 'text-white'}`}>
                    Re<span className="text-green-500">Wardrobe</span>
                </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
                {['Beranda', 'Cara Kerja', 'Fitur', 'Dampak'].map(item => (
                    <a key={item} href="#" className={`text-sm font-semibold transition-colors ${scrolled ? 'text-stone-600 hover:text-green-600' : 'text-white/80 hover:text-white'}`}>
                        {item}
                    </a>
                ))}
            </div>

            <div className="flex items-center gap-3">
                <Link href="/auth?view=login">
                    <Button variant={scrolled ? 'ghost' : 'outline'} size="sm" className={!scrolled ? 'border-white/30 text-white hover:bg-white/10' : ''}>
                        Masuk
                    </Button>
                </Link>
                <Link href="/auth?view=register">
                    <Button variant={scrolled ? 'primary' : 'white'} size="sm">
                        Daftar Gratis
                    </Button>
                </Link>
            </div>
        </nav>
    );
}