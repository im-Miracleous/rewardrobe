// CODE-CITE:
//   Title: BarangDonasi API Route - GET dan POST
//   Type: ai
//   Value: Claude (claude.ai/code)
//   Notes: REST API endpoint untuk barang donasi, validasi Zod, query Prisma dengan relasi donatur dan verifier
//   Lines Range: 93
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const StatusBarangEnum = z.enum(['menunggu_verifikasi', 'disetujui', 'ditolak', 'tersalurkan']);
const KondisiUserEnum = z.enum(['fair', 'baik', 'rusak']);

const createSchema = z.object({
    namaBarang: z.string().trim().min(1).optional(),
    deskripsi: z.string().optional(),
    kategori: z.string().trim().min(1).optional(),
    kondisi: KondisiUserEnum,
    berat_kg: z.number().positive('Berat harus lebih dari 0').optional(),
    donatur_id: z.number().int().positive('donatur_id harus berupa integer positif'),
    bukti_foto: z.string().optional(),
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

        const { namaBarang, deskripsi, kategori, kondisi, berat_kg, donatur_id, bukti_foto } = parsed.data;

        const donaturExists = await prisma.user.findUnique({ where: { id: donatur_id } });
        if (!donaturExists) {
            return NextResponse.json({ data: null, error: 'donatur_id tidak ditemukan' }, { status: 404 });
        }

        const fullDeskripsi = deskripsi
            ? `Kondisi menurut donatur: ${kondisi}\n\n${deskripsi}`
            : `Kondisi menurut donatur: ${kondisi}`;

        const barang = await prisma.barangDonasi.create({
            data: {
                judul: namaBarang?.trim() || null,
                deskripsi: fullDeskripsi,
                kondisi_user: kondisi,
                kategori: kategori?.trim() || null,
                berat_kg: berat_kg ?? null,
                foto_url: bukti_foto || null,
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
