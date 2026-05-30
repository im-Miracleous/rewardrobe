import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const joinSchema = z.object({
    user_id: z.number().int().positive(),
    campaign_id: z.number().int().positive(),
    action: z.enum(['join', 'leave']),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = joinSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { data: null, error: parsed.error.issues.map((i) => i.message).join(', ') },
                { status: 400 }
            );
        }

        const { user_id, campaign_id, action } = parsed.data;

        // Check if user and campaign exist
        const userExists = await prisma.user.findUnique({ where: { id: user_id } });
        if (!userExists) {
            return NextResponse.json({ data: null, error: 'User tidak ditemukan' }, { status: 404 });
        }

        const campaignExists = await prisma.campaign.findUnique({ where: { id: campaign_id } });
        if (!campaignExists) {
            return NextResponse.json({ data: null, error: 'Kampanye tidak ditemukan' }, { status: 404 });
        }

        if (action === 'join') {
            const upsertResult = await prisma.partisipasiCampaign.upsert({
                where: {
                    user_id_campaign_id: {
                        user_id,
                        campaign_id,
                    },
                },
                update: {},
                create: {
                    user_id,
                    campaign_id,
                },
            });
            return NextResponse.json({ data: upsertResult, error: null });
        } else {
            await prisma.partisipasiCampaign.delete({
                where: {
                    user_id_campaign_id: {
                        user_id,
                        campaign_id,
                    },
                },
            });
            return NextResponse.json({ data: { message: 'Berhasil keluar dari tantangan' }, error: null });
        }
    } catch (error) {
        console.error('POST /api/campaigns/join error:', error);
        return NextResponse.json({ data: null, error: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}
