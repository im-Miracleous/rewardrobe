import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { AUTH_COOKIE_NAME, parseAuthCookieValue } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        // Fetch BarangDonasi yang menunggu verifikasi (hanya kampanye dengan verification_required=true)
        const pakaianList = await prisma.barangDonasi.findMany({
            where: { status: 'menunggu_verifikasi' },
            include: {
                donatur: { select: { id: true, nama: true, kota: true, email: true } },
                campaign: { select: { judul: true, requirement: true, verification_required: true } }
            },
            orderBy: { created_at: 'desc' }
        });

        // DonasiUang tetap diverifikasi semua yang menunggu
        const uangList = await prisma.donasiUang.findMany({
            where: { status: 'menunggu_verifikasi' },
            include: {
                donatur: { select: { id: true, nama: true, kota: true, email: true } },
                campaign: { select: { judul: true, requirement: true, verification_required: true } }
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
            bukti_foto: p.foto_url,
            status: p.status,
            created_at: p.created_at,
            campaign: p.campaign?.judul || null,
            requirement: p.campaign?.requirement || null,
            verification_required: p.campaign?.verification_required ?? false,
        }));

        const normalizedUang = uangList.map(u => ({
            id: u.id,
            tipe: 'uang',
            donatur: u.donatur,
            kategori: 'Donasi Dana',
            kondisi: u.nominal,
            deskripsi: u.catatan || 'Tidak ada catatan',
            bukti_foto: u.bukti_transfer,
            status: u.status,
            created_at: u.created_at,
            campaign: u.campaign?.judul || null,
            requirement: u.campaign?.requirement || null,
            verification_required: u.campaign?.verification_required ?? false,
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
});

export async function PATCH(request: NextRequest) {
    try {
        const auth = parseAuthCookieValue(request.cookies.get(AUTH_COOKIE_NAME)?.value);
        if (!auth) {
            return NextResponse.json({ data: null, error: 'Tidak terautentikasi' }, { status: 401 });
        }
        if (auth.role !== 'admin') {
            return NextResponse.json({ data: null, error: 'Akses hanya untuk admin' }, { status: 403 });
        }
        const admin_id = auth.userId;

        const body = await request.json();
        const parsed = patchSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ data: null, error: parsed.error.issues.map(i => i.message).join(', ') }, { status: 400 });
        }

        const { id, tipe, status, alasan_penolakan } = parsed.data;

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
