// CODE-CITE:
//   Title: BarangDonasi PATCH Route - Update Status Verifikasi
//   Type: ai
//   Value: Claude (claude.ai/code)
//   Notes: Endpoint moderasi admin untuk approve/reject donasi, validasi Zod, cek keberadaan verifier di DB
//   Lines Range: 67
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { AUTH_COOKIE_NAME, parseAuthCookieValue } from '@/lib/auth';

const patchSchema = z.object({
    status: z.enum(['menunggu_verifikasi', 'disetujui', 'ditolak', 'tersalurkan']),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const barangId = Number(id);

        if (!Number.isInteger(barangId) || barangId <= 0) {
            return NextResponse.json({ data: null, error: 'id tidak valid' }, { status: 400 });
        }

        const barang = await prisma.barangDonasi.findUnique({
            where: { id: barangId },
            include: {
                campaign: {
                    select: { id: true, judul: true }
                },
                donatur: {
                    select: { id: true, nama: true, email: true }
                },
                verifier: {
                    select: { id: true, nama: true }
                },
                pengiriman: {
                    orderBy: { created_at: 'asc' }
                }
            }
        });

        if (!barang) {
            return NextResponse.json({ data: null, error: 'Barang donasi tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json({ data: barang, error: null });
    } catch (error) {
        console.error('GET /api/barang-donasi/[id] error:', error);
        return NextResponse.json({ data: null, error: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const barangId = Number(id);

        if (!Number.isInteger(barangId) || barangId <= 0) {
            return NextResponse.json({ data: null, error: 'id tidak valid' }, { status: 400 });
        }

        const body: unknown = await request.json();
        const parsed = patchSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { data: null, error: parsed.error.issues.map((i) => i.message).join(', ') },
                { status: 400 },
            );
        }

        const { status } = parsed.data;

        const auth = parseAuthCookieValue(request.cookies.get(AUTH_COOKIE_NAME)?.value);
        if (!auth) {
            return NextResponse.json({ data: null, error: 'Tidak terautentikasi' }, { status: 401 });
        }

        const actor = await prisma.user.findUnique({
            where: { id: auth.userId },
            select: { id: true, role: true },
        });

        if (!actor || actor.role !== 'admin') {
            return NextResponse.json({ data: null, error: 'Akses hanya untuk admin' }, { status: 403 });
        }

        const existing = await prisma.barangDonasi.findUnique({ where: { id: barangId } });
        if (!existing) {
            return NextResponse.json({ data: null, error: 'Barang donasi tidak ditemukan' }, { status: 404 });
        }

        const needsVerifier = status === 'disetujui' || status === 'ditolak' || status === 'tersalurkan';
        const updated = await prisma.barangDonasi.update({
            where: { id: barangId },
            data: {
                status,
                ...(status === 'disetujui' || status === 'ditolak' || status === 'tersalurkan'
                    ? { verified_by: actor.id, verified_at: new Date() }
                    : {}),
            },
        });

        return NextResponse.json({ data: updated, error: null });
    } catch (error) {
        console.error('PATCH /api/barang-donasi/[id] error:', error);
        return NextResponse.json({ data: null, error: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}
