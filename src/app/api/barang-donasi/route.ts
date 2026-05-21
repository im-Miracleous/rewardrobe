import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const StatusBarangEnum = z.enum(['menunggu_verifikasi', 'disetujui', 'ditolak', 'tersalurkan']);

const createSchema = z.object({
    namaBarang: z.string().min(1, 'namaBarang wajib diisi'),
    deskripsi: z.string().optional(),
    kategori: z.string().min(1, 'Kategori wajib diisi'),
    kondisi: z.string().min(1, 'Kondisi wajib diisi'),
    berat_kg: z.number().positive('Berat harus lebih dari 0'),
    donatur_id: z.number().int().positive('donatur_id harus berupa integer positif'),
    bukti_foto: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.kategori.toLowerCase() === 'pakaian' && (!data.bukti_foto || data.bukti_foto.trim() === '')) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "bukti_foto wajib diisi untuk kategori pakaian",
            path: ["bukti_foto"]
        });
    }
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

        const fullDeskripsi = deskripsi ? `Kondisi: ${kondisi}\n\n${deskripsi}` : `Kondisi: ${kondisi}`;

        const barang = await prisma.barangDonasi.create({
            data: {
                judul: namaBarang,
                deskripsi: fullDeskripsi,
                kategori,
                berat_kg,
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
