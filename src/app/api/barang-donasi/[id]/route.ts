import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const patchSchema = z.object({
    status: z.enum(['menunggu_verifikasi', 'disetujui', 'ditolak', 'tersalurkan']),
    verified_by: z.number().int().positive().optional(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const barangId = Number(id);

        if (!Number.isInteger(barangId) || barangId <= 0) {
            return NextResponse.json({ data: null, error: 'id tidak valid' }, { status: 400 });
        }

        const body: unknown = await request.json();
        const parsed = patchSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { data: null, error: parsed.error.issues.map((i) => i.message).join(', ') },
                { status: 400 },
            );
        }

        const { status, verified_by } = parsed.data;

        const existing = await prisma.barangDonasi.findUnique({ where: { id: barangId } });
        if (!existing) {
            return NextResponse.json({ data: null, error: 'Barang donasi tidak ditemukan' }, { status: 404 });
        }

        // When approving or rejecting, require verified_by
        const needsVerifier = status === 'disetujui' || status === 'ditolak' || status === 'tersalurkan';
        if (needsVerifier && !verified_by) {
            return NextResponse.json(
                { data: null, error: 'verified_by wajib diisi saat mengubah status menjadi disetujui, ditolak, atau tersalurkan' },
                { status: 400 },
            );
        }

        if (verified_by) {
            const verifierExists = await prisma.user.findUnique({ where: { id: verified_by } });
            if (!verifierExists) {
                return NextResponse.json({ data: null, error: 'verified_by tidak ditemukan' }, { status: 404 });
            }
        }

        const updated = await prisma.barangDonasi.update({
            where: { id: barangId },
            data: {
                status,
                ...(verified_by ? { verified_by, verified_at: new Date() } : {}),
            },
        });

        return NextResponse.json({ data: updated, error: null });
    } catch (error) {
        console.error('PATCH /api/barang-donasi/[id] error:', error);
        return NextResponse.json({ data: null, error: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}
