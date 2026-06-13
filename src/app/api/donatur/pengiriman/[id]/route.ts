import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { AUTH_COOKIE_NAME, parseAuthCookieValue } from '@/lib/auth';

const patchSchema = z.object({
    metode: z.enum(['drop_off', 'kurir']),
    kurir: z.string().optional(),
    resi: z.string().optional(),
});

// Donatur mengonfirmasi telah mengirim barang ke ReWardrobe (disiapkan -> dalam_pengiriman).
// Penutupan (barang 'terkirim' + poin dasar + notif) tetap di langkah admin penjemputan.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr, 10);
        if (isNaN(id)) return NextResponse.json({ data: null, error: 'ID tidak valid' }, { status: 400 });

        const body = await request.json();
        const parsed = patchSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ data: null, error: parsed.error.issues.map(i => i.message).join(', ') }, { status: 400 });
        }

        const auth = parseAuthCookieValue(request.cookies.get(AUTH_COOKIE_NAME)?.value);
        if (!auth) return NextResponse.json({ data: null, error: 'Tidak terautentikasi' }, { status: 401 });
        if (auth.role !== 'donatur') return NextResponse.json({ data: null, error: 'Akses hanya untuk donatur' }, { status: 403 });

        const existing = await prisma.pengiriman.findUnique({ where: { id }, include: { barang: true } });
        if (!existing || existing.tipe !== 'donatur_ke_admin') {
            return NextResponse.json({ data: null, error: 'Data pengiriman tidak ditemukan' }, { status: 404 });
        }
        if (existing.barang.donatur_id !== auth.userId) {
            return NextResponse.json({ data: null, error: 'Bukan donasi Anda' }, { status: 403 });
        }
        if (existing.status !== 'disiapkan') {
            return NextResponse.json({ data: null, error: 'Pengiriman sudah dikonfirmasi atau diproses' }, { status: 400 });
        }

        const { metode, kurir, resi } = parsed.data;
        const updated = await prisma.pengiriman.update({
            where: { id },
            data: {
                status: 'dalam_pengiriman',
                kurir: metode === 'drop_off' ? 'Drop-off (Antar Sendiri)' : (kurir?.trim() || 'Kurir'),
                resi: resi?.trim() || null,
            },
        });

        return NextResponse.json({ data: updated, error: null });
    } catch (error) {
        console.error('PATCH /api/donatur/pengiriman/[id] error:', error);
        return NextResponse.json({ data: null, error: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}
