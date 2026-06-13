import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { AUTH_COOKIE_NAME, parseAuthCookieValue } from '@/lib/auth';
import { notificationSubject } from '@/lib/notifikasi';
const patchSchema = z.union([
    z.object({
        status: z.enum(['diterima', 'ditolak']),
        alasan: z.string().optional(),
    }),
    z.object({
        konfirmasi: z.literal(true),
    }),
]);

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

        const existing = await prisma.permintaan.findUnique({ where: { id }, include: { barang: true } });
        if (!existing) {
            return NextResponse.json({ data: null, error: 'Permintaan tidak ditemukan' }, { status: 404 });
        }

        // Konfirmasi penerima — penerima mengakui barang sudah diterima
        if ('konfirmasi' in parsed.data) {
            const auth = parseAuthCookieValue(request.cookies.get(AUTH_COOKIE_NAME)?.value);
            if (!auth) return NextResponse.json({ data: null, error: 'Tidak terautentikasi' }, { status: 401 });
            if (auth.role !== 'penerima') return NextResponse.json({ data: null, error: 'Akses hanya untuk penerima' }, { status: 403 });
            if (existing.penerima_id !== auth.userId) return NextResponse.json({ data: null, error: 'Bukan permintaan Anda' }, { status: 403 });
            if (existing.status !== 'diterima') return NextResponse.json({ data: null, error: 'Permintaan belum disetujui' }, { status: 400 });
            if (existing.barang.status === 'tersalurkan') return NextResponse.json({ data: null, error: 'Penerimaan sudah dikonfirmasi' }, { status: 400 });

            // Barang harus sudah sampai (pengiriman terkirim) sebelum penerima bisa konfirmasi
            const pengiriman = await prisma.pengiriman.findFirst({
                where: { barang_id: existing.barang_id, tipe: 'admin_ke_penerima', status: 'terkirim' },
            });
            if (!pengiriman) return NextResponse.json({ data: null, error: 'Barang belum sampai ke penerima' }, { status: 400 });

            const konfirmasiNote = `DIKONFIRMASI PENERIMA: ${new Date().toISOString()}`;
            const updated = await prisma.$transaction(async (tx) => {
                const updatedPermintaan = await tx.permintaan.update({
                    where: { id },
                    data: {
                        pesan: existing.pesan
                            ? `${existing.pesan}\n\n${konfirmasiNote}`
                            : konfirmasiNote,
                    },
                });

                await tx.barangDonasi.update({
                    where: { id: existing.barang_id },
                    data: { status: 'tersalurkan' },
                });

                await tx.logPoin.create({
                    data: {
                        user_id: existing.barang.donatur_id,
                        poin: 25,
                        keterangan: `Poin dari donasi barang tersalurkan: ${existing.barang.judul || 'Tanpa Judul'}`,
                    },
                });

                await notificationSubject.emitStatusEvent(tx, {
                    type: 'BARANG_TERSALURKAN',
                    userId: existing.barang.donatur_id,
                    barangJudul: existing.barang.judul || 'Tanpa Judul',
                });

                return updatedPermintaan;
            });
            return NextResponse.json({ data: updated, error: null });
        }

        // Admin approve / reject
        const { status, alasan } = parsed.data;

        if (existing.status !== 'menunggu') {
            return NextResponse.json({ data: null, error: 'Permintaan sudah diproses' }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            const updated = await tx.permintaan.update({
                where: { id },
                data: {
                    status,
                    pesan: alasan
                        ? `${existing.pesan || ''}\n\nCATATAN ADMIN: ${alasan}`.trim()
                        : existing.pesan,
                },
            });

            if (status === 'diterima') {
                await tx.pengiriman.create({
                    data: {
                        barang_id: existing.barang_id,
                        tipe: 'admin_ke_penerima',
                        status: 'disiapkan',
                    },
                });

                await notificationSubject.emitStatusEvent(tx, {
                    type: 'PERMINTAAN_DITERIMA',
                    userId: existing.penerima_id,
                    barangJudul: existing.barang.judul || 'Tanpa Judul'
                });
            } else if (status === 'ditolak') {
                await notificationSubject.emitStatusEvent(tx, {
                    type: 'PERMINTAAN_DITOLAK',
                    userId: existing.penerima_id,
                    barangJudul: existing.barang.judul || 'Tanpa Judul'
                });
            }

            return updated;
        });

        return NextResponse.json({ data: result, error: null });
    } catch (error) {
        console.error('PATCH /api/permintaan/[id] error:', error);
        return NextResponse.json({ data: null, error: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}

// Penerima membatalkan permintaan yang masih menunggu
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const auth = parseAuthCookieValue(request.cookies.get(AUTH_COOKIE_NAME)?.value);
        if (!auth) return NextResponse.json({ data: null, error: 'Tidak terautentikasi' }, { status: 401 });
        if (auth.role !== 'penerima') return NextResponse.json({ data: null, error: 'Akses hanya untuk penerima' }, { status: 403 });

        const { id: idStr } = await params;
        const id = parseInt(idStr, 10);
        if (isNaN(id)) return NextResponse.json({ data: null, error: 'ID tidak valid' }, { status: 400 });

        const existing = await prisma.permintaan.findUnique({ where: { id } });
        if (!existing) return NextResponse.json({ data: null, error: 'Permintaan tidak ditemukan' }, { status: 404 });
        if (existing.penerima_id !== auth.userId) return NextResponse.json({ data: null, error: 'Bukan permintaan Anda' }, { status: 403 });
        if (existing.status !== 'menunggu') return NextResponse.json({ data: null, error: 'Permintaan sudah diproses, tidak bisa dibatalkan' }, { status: 400 });

        await prisma.permintaan.delete({ where: { id } });

        return NextResponse.json({ data: { ok: true }, error: null });
    } catch (error) {
        console.error('DELETE /api/permintaan/[id] error:', error);
        return NextResponse.json({ data: null, error: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}
