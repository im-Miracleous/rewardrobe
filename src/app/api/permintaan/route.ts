import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { AUTH_COOKIE_NAME, parseAuthCookieValue } from '@/lib/auth';

const createSchema = z.object({
    barang_id: z.number().int().positive('barang_id harus integer positif'),
    pesan: z.string().optional(),
});

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const statusParam = searchParams.get('status');
        const penerimaIdStr = searchParams.get('penerima_id');

        const where: Record<string, unknown> = {};
        if (statusParam) where.status = statusParam;
        if (penerimaIdStr) where.penerima_id = parseInt(penerimaIdStr, 10);

        const list = await prisma.permintaan.findMany({
            where,
            include: {
                barang: {
                    include: {
                        donatur: { select: { id: true, nama: true, kota: true } },
                        campaign: { select: { id: true, judul: true } },
                        pengiriman: {
                            where: { tipe: 'admin_ke_penerima' },
                            select: { id: true, kurir: true, resi: true, status: true, created_at: true, updated_at: true },
                            orderBy: { created_at: 'desc' },
                            take: 1,
                        },
                    },
                },
                penerima: { select: { id: true, nama: true, kota: true, tipe: true } },
            },
            orderBy: { created_at: 'desc' },
        });

        return NextResponse.json({ data: list, error: null });
    } catch (error) {
        console.error('GET /api/permintaan error:', error);
        return NextResponse.json({ data: null, error: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const auth = parseAuthCookieValue(request.cookies.get(AUTH_COOKIE_NAME)?.value);
        if (!auth) {
            return NextResponse.json({ data: null, error: 'Tidak terautentikasi' }, { status: 401 });
        }
        if (auth.role !== 'penerima') {
            return NextResponse.json({ data: null, error: 'Akses hanya untuk penerima' }, { status: 403 });
        }
        const penerima_id = auth.userId;

        const body: unknown = await request.json();
        const parsed = createSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { data: null, error: parsed.error.issues.map((i) => i.message).join(', ') },
                { status: 400 },
            );
        }

        const { barang_id, pesan } = parsed.data;

        const barang = await prisma.barangDonasi.findUnique({ where: { id: barang_id } });
        if (!barang) {
            return NextResponse.json({ data: null, error: 'Barang tidak ditemukan' }, { status: 404 });
        }
        if (barang.status !== 'disetujui') {
            return NextResponse.json({ data: null, error: 'Barang tidak tersedia untuk diminta' }, { status: 400 });
        }

        const existing = await prisma.permintaan.findFirst({
            where: { barang_id, penerima_id, status: { in: ['menunggu', 'diterima'] } },
        });
        if (existing) {
            return NextResponse.json({ data: null, error: 'Anda sudah memiliki permintaan aktif untuk barang ini' }, { status: 409 });
        }

        const permintaan = await prisma.permintaan.create({
            data: { barang_id, penerima_id, pesan: pesan || null, status: 'menunggu' },
        });

        return NextResponse.json({ data: permintaan, error: null }, { status: 201 });
    } catch (error) {
        console.error('POST /api/permintaan error:', error);
        return NextResponse.json({ data: null, error: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}
