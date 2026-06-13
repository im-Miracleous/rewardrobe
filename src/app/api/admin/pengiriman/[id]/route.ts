import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { notificationSubject } from '@/lib/notifikasi';
const patchSchema = z.object({
    status: z.enum(['disiapkan', 'dalam_pengiriman', 'terkirim']),
});

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

        const { status } = parsed.data;

        // Check exists
        const existing = await prisma.pengiriman.findUnique({ where: { id }, include: { barang: true } });
        if (!existing || existing.tipe !== 'admin_ke_penerima') {
            return NextResponse.json({ data: null, error: 'Data pengiriman tidak ditemukan' }, { status: 404 });
        }

        const result = await prisma.$transaction(async (tx) => {
            const updated = await tx.pengiriman.update({
                where: { id },
                data: { status }
            });

            // If Pengiriman is finished (terkirim = sampai di tangan penerima), 
            // the status of BarangDonasi becomes 'tersalurkan'.
            if (status === 'terkirim') {
                await tx.barangDonasi.update({
                    where: { id: existing.barang_id },
                    data: { status: 'tersalurkan' }
                });

                await notificationSubject.emitStatusEvent(tx, {
                    type: 'BARANG_TERSALURKAN',
                    userId: existing.barang.donatur_id,
                    barangJudul: existing.barang.judul || 'Tanpa Judul'
                });

                await tx.logPoin.create({
                    data: {
                        user_id: existing.barang.donatur_id,
                        poin: 25,
                        keterangan: `Poin dari donasi barang tersalurkan: ${existing.barang.judul || 'Tanpa Judul'}`
                    }
                });
            }

            return updated;
        });

        return NextResponse.json({ data: result, error: null });
    } catch (error) {
        console.error('PATCH /api/admin/pengiriman/[id] error:', error);
        return NextResponse.json({ data: null, error: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}
