import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const StatusBarangEnum = z.enum(['menunggu_verifikasi', 'disetujui', 'ditolak', 'tersalurkan']);

const createSchema = z.object({
    judul: z.string().min(1, 'Judul wajib diisi'),
    deskripsi: z.string().min(1, 'Deskripsi wajib diisi'),
    kategori: z.string().min(1, 'Kategori wajib diisi'),
    berat_kg: z.number().positive('Berat harus lebih dari 0'),
    donatur_id: z.number().int().positive('donatur_id harus berupa integer positif'),
    foto_url: z.string().url('foto_url harus berupa URL valid').optional(),
});

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const statusParam = searchParams.get('status');

        const statusResult = statusParam ? StatusBarangEnum.safeParse(statusParam) : null;

        if (statusParam && !statusResult?.success) {
            return NextResponse.json(
                { data: null, error: `status tidak valid. Pilihan: ${StatusBarangEnum.options.join(', ')}` },
                { status: 400 },
            );
        }

        const barangList = await prisma.barangDonasi.findMany({
            where: statusResult?.success ? { status: statusResult.data } : undefined,
            include: {
                donatur: { select: { id: true, nama: true, kota: true } },
                verifier: { select: { id: true, nama: true } },
            },
            orderBy: { created_at: 'desc' },
        });

        return NextResponse.json({ data: barangList, error: null });
    } catch (error) {
        console.error('GET /api/barang-donasi error:', error);
        return NextResponse.json({ data: null, error: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body: unknown = await request.json();
        const parsed = createSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { data: null, error: parsed.error.issues.map((i) => i.message).join(', ') },
                { status: 400 },
            );
        }

        const { judul, deskripsi, kategori, berat_kg, donatur_id, foto_url } = parsed.data;

        const donaturExists = await prisma.user.findUnique({ where: { id: donatur_id } });
        if (!donaturExists) {
            return NextResponse.json({ data: null, error: 'donatur_id tidak ditemukan' }, { status: 404 });
        }

        const barang = await prisma.barangDonasi.create({
            data: {
                judul,
                deskripsi,
                kategori,
                berat_kg,
                foto_url,
                status: 'menunggu_verifikasi',
                donatur_id,
            },
        });

        return NextResponse.json({ data: barang, error: null }, { status: 201 });
    } catch (error) {
        console.error('POST /api/barang-donasi error:', error);
        return NextResponse.json({ data: null, error: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}
