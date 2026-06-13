import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const patchSchema = z.object({
    kurir: z.string().optional(),
    status: z.enum(['disiapkan', 'dalam_pengiriman', 'terkirim']),
    catatan: z.string().optional(),
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

        const { kurir, status, catatan } = parsed.data;

        // Check exists
        const existing = await prisma.pengiriman.findUnique({ where: { id } });
        if (!existing || existing.tipe !== 'donatur_ke_admin') {
            return NextResponse.json({ data: null, error: 'Data penjemputan tidak ditemukan' }, { status: 404 });
        }

        let resiToUpdate = existing.resi;
        if (kurir && status === 'dalam_pengiriman' && !existing.resi) {
            // Mock generate resi if not exists
            resiToUpdate = `PJM-${new Date().getTime()}`;
        }

        const result = await prisma.$transaction(async (tx) => {
            const updated = await tx.pengiriman.update({
                where: { id },
                data: {
                    kurir: kurir || existing.kurir,
                    status,
                    resi: resiToUpdate
                }
            });

            // Penjemputan selesai (terkirim = sampai di gudang Admin) ->
            // barang masuk inventaris dan siap masuk katalog.
            if (status === 'terkirim') {
                await tx.barangDonasi.update({
                    where: { id: existing.barang_id },
                    data: { status: 'terkirim' },
                });
            }

            return updated;
        });

        return NextResponse.json({ data: result, error: null });
    } catch (error) {
        console.error('PATCH /api/admin/penjemputan/[id] error:', error);
        return NextResponse.json({ data: null, error: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}
