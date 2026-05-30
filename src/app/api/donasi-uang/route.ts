import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const createDonasiUangSchema = z.object({
    nominal: z.number().positive('Nominal donasi harus lebih dari 0'),
    bukti_transfer: z.string().min(1, 'Bukti transfer wajib diunggah'),
    catatan: z.string().optional(),
    donatur_id: z.number().int().positive('donatur_id harus valid'),
    campaign_id: z.number().int().positive().optional().nullable(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = createDonasiUangSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { data: null, error: parsed.error.issues.map((i) => i.message).join(', ') },
                { status: 400 }
            );
        }

        const { nominal, bukti_transfer, catatan, donatur_id, campaign_id } = parsed.data;

        // Check if donatur exists
        const donaturExists = await prisma.user.findUnique({ where: { id: donatur_id } });
        if (!donaturExists) {
            return NextResponse.json({ data: null, error: 'Donatur tidak ditemukan' }, { status: 404 });
        }

        // Check campaign if provided
        if (campaign_id) {
            const campaignExists = await prisma.campaign.findUnique({ where: { id: campaign_id } });
            if (!campaignExists) {
                return NextResponse.json({ data: null, error: 'Kampanye tidak ditemukan' }, { status: 404 });
            }
        }

        // Create DonasiUang record
        const donasi = await prisma.donasiUang.create({
            data: {
                nominal,
                bukti_transfer,
                catatan: catatan || null,
                donatur_id,
                campaign_id: campaign_id || null,
                status: 'menunggu_verifikasi',
            },
        });

        return NextResponse.json({ data: donasi, error: null }, { status: 201 });
    } catch (error) {
        console.error('POST /api/donasi-uang error:', error);
        return NextResponse.json({ data: null, error: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}
