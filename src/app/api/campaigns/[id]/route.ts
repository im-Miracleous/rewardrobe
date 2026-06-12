import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const patchSchema = z.object({
    status: z.enum(['aktif', 'selesai']).optional(),
    requirement: z.string().nullable().optional(),
    verification_required: z.boolean().optional(),
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

        const updateData: Record<string, unknown> = {};
        if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
        if (parsed.data.requirement !== undefined) updateData.requirement = parsed.data.requirement;
        if (parsed.data.verification_required !== undefined) updateData.verification_required = parsed.data.verification_required;

        const campaign = await prisma.campaign.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json({ data: campaign, error: null });
    } catch (error) {
        console.error('PATCH /api/campaigns/[id] error:', error);
        return NextResponse.json({ data: null, error: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}
