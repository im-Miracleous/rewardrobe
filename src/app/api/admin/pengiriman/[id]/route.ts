import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
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

        // status 'terkirim' di sini hanya berarti barang sampai di tangan penerima.
        // Penutupan transaksi (status barang 'tersalurkan' + poin donatur + notif)
        // terjadi saat penerima mengkonfirmasi penerimaan di /api/permintaan/[id].
        const updated = await prisma.pengiriman.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json({ data: updated, error: null });
    } catch (error) {
        console.error('PATCH /api/admin/pengiriman/[id] error:', error);
        return NextResponse.json({ data: null, error: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}
