// CODE-CITE:
//   Title: BarangDonasi API Route - GET dan POST
//   Type: ai
//   Value: Claude (claude.ai/code)
//   Notes: REST API endpoint untuk barang donasi, validasi Zod, query Prisma dengan relasi donatur dan verifier
//   Lines Range: 93
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const StatusBarangEnum = z.enum(['menunggu_pengiriman', 'terkirim', 'tersalurkan', 'ditolak']);
const KondisiUserEnum = z.enum(['fair', 'baik', 'rusak']);

const createSchema = z.object({
    tipePakaian: z.string().trim().min(1, 'Tipe pakaian wajib diisi'),
    catatan: z.string().optional(),
    kategori: z.string().trim().min(1).optional(),
    kondisi: KondisiUserEnum,
    berat_kg: z.number().positive('Berat harus lebih dari 0').optional(),
    donatur_id: z.number().int().positive('donatur_id harus berupa integer positif'),
    bukti_foto: z.string().min(1, 'Bukti foto wajib diunggah'),
});

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const statusParam = searchParams.get('status');
        const tersedia = searchParams.get('tersedia') === 'true';

        const statusResult = statusParam ? StatusBarangEnum.safeParse(statusParam) : null;

        if (statusParam && !statusResult?.success) {
            return NextResponse.json(
                { data: null, error: `status tidak valid. Pilihan: ${StatusBarangEnum.options.join(', ')}` },
                { status: 400 },
            );
        }

        const where: Record<string, unknown> = statusResult?.success ? { status: statusResult.data } : {};

        // tersedia=true: hanya barang yang sudah dijemput admin (penjemputan terkirim)
        if (tersedia) {
            where.pengiriman = {
                some: { tipe: 'donatur_ke_admin', status: 'terkirim' },
            };
        }

        const barangList = await prisma.barangDonasi.findMany({
            where,
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

        const { tipePakaian, catatan, kategori, kondisi, berat_kg, donatur_id, bukti_foto } = parsed.data;

        const donaturExists = await prisma.user.findUnique({ where: { id: donatur_id } });
        if (!donaturExists) {
            return NextResponse.json({ data: null, error: 'donatur_id tidak ditemukan' }, { status: 404 });
        }

        // Tanpa kampanye/verifikasi: donasi langsung auto-approve, menunggu dijemput.
        const finalStatus = 'menunggu_pengiriman';

        const fullDeskripsi = catatan
            ? `Kondisi menurut donatur: ${kondisi}\n\nCatatan: ${catatan}`
            : `Kondisi menurut donatur: ${kondisi}`;

        const barang = await prisma.$transaction(async (tx) => {
            const created = await tx.barangDonasi.create({
                data: {
                    judul: null,
                    deskripsi: fullDeskripsi,
                    kondisi_user: kondisi,
                    kategori: tipePakaian,
                    berat_kg: berat_kg ?? null,
                    foto_url: bukti_foto || null,
                    status: finalStatus,
                    donatur_id,
                },
            });

            // Setiap donasi perlu dijemput admin -> buat jadwal penjemputan.
            await tx.pengiriman.create({
                data: {
                    barang_id: created.id,
                    tipe: 'donatur_ke_admin',
                    status: 'disiapkan',
                },
            });

            return created;
        });

        return NextResponse.json({ data: barang, error: null }, { status: 201 });
    } catch (error) {
        console.error('POST /api/barang-donasi error:', error);
        return NextResponse.json({ data: null, error: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}
