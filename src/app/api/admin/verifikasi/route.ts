import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // Fetch both BarangDonasi and DonasiUang
        const pakaianList = await prisma.barangDonasi.findMany({
            include: {
                donatur: { select: { id: true, nama: true, kota: true, email: true } },
                campaign: { select: { judul: true } }
            },
            orderBy: { created_at: 'desc' }
        });

        const uangList = await prisma.donasiUang.findMany({
            include: {
                donatur: { select: { id: true, nama: true, kota: true, email: true } },
                campaign: { select: { judul: true } }
            },
            orderBy: { created_at: 'desc' }
        });

        // Normalize data to a common format
        const normalizedPakaian = pakaianList.map(p => ({
            id: p.id,
            tipe: 'pakaian',
            donatur: p.donatur,
            kategori: p.kategori,
            kondisi: p.kondisi_user,
            deskripsi: p.deskripsi,
            foto_url: p.foto_url,
            status: p.status,
            created_at: p.created_at,
            campaign: p.campaign?.judul || null
        }));

        const normalizedUang = uangList.map(u => ({
            id: u.id,
            tipe: 'uang',
            donatur: u.donatur,
            kategori: 'Donasi Dana',
            kondisi: u.nominal, // nominal instead of condition
            deskripsi: u.catatan || 'Tidak ada catatan',
            foto_url: u.bukti_transfer,
            status: u.status,
            created_at: u.created_at,
            campaign: u.campaign?.judul || null
        }));

        // Combine and sort by created_at desc
        const allDonations = [...normalizedPakaian, ...normalizedUang].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        return NextResponse.json({ data: allDonations, error: null });
    } catch (error) {
        console.error('GET /api/admin/verifikasi error:', error);
        return NextResponse.json({ data: null, error: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}

const patchSchema = z.object({
    id: z.number().int().positive(),
    tipe: z.enum(['pakaian', 'uang']),
    status: z.enum(['disetujui', 'ditolak']),
    alasan_penolakan: z.string().optional(),
    admin_id: z.number().int().positive().optional().default(1) // Default admin ID for now
});

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = patchSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ data: null, error: parsed.error.issues.map(i => i.message).join(', ') }, { status: 400 });
        }

        const { id, tipe, status, alasan_penolakan, admin_id } = parsed.data;

        let result;

        if (tipe === 'pakaian') {
            // Check if exists
            const existing = await prisma.barangDonasi.findUnique({ where: { id } });
            if (!existing) return NextResponse.json({ data: null, error: 'Donasi pakaian tidak ditemukan' }, { status: 404 });

            let updatedDeskripsi = existing.deskripsi;
            if (status === 'ditolak' && alasan_penolakan) {
                updatedDeskripsi += `\n\nALASAN PENOLAKAN: ${alasan_penolakan}`;
            }

            result = await prisma.$transaction(async (tx) => {
                const updated = await tx.barangDonasi.update({
                    where: { id },
                    data: {
                        status,
                        deskripsi: updatedDeskripsi,
                        verified_by: admin_id,
                        verified_at: new Date()
                    }
                });

                // Otomatisasi: Buat jadwal penjemputan (Pengiriman tipe donatur_ke_admin) jika disetujui
                if (status === 'disetujui') {
                    await tx.pengiriman.create({
                        data: {
                            barang_id: id,
                            tipe: 'donatur_ke_admin',
                            status: 'disiapkan'
                        }
                    });
                }
                
                return updated;
            });
        } else {
            // Tipe uang
            const existing = await prisma.donasiUang.findUnique({ where: { id } });
            if (!existing) return NextResponse.json({ data: null, error: 'Donasi uang tidak ditemukan' }, { status: 404 });

            let updatedCatatan = existing.catatan || '';
            if (status === 'ditolak' && alasan_penolakan) {
                updatedCatatan += `\n\nALASAN PENOLAKAN: ${alasan_penolakan}`;
            }

            result = await prisma.donasiUang.update({
                where: { id },
                data: {
                    status,
                    catatan: updatedCatatan,
                    verified_by: admin_id,
                    verified_at: new Date()
                }
            });
        }

        return NextResponse.json({ data: result, error: null });
    } catch (error) {
        console.error('PATCH /api/admin/verifikasi error:', error);
        return NextResponse.json({ data: null, error: 'Terjadi kesalahan saat memproses verifikasi' }, { status: 500 });
    }
}
