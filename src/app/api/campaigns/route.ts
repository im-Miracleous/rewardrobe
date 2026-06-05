import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const userIdStr = searchParams.get('userId');
        const userId = userIdStr ? parseInt(userIdStr, 10) : null;

        const campaigns = await prisma.campaign.findMany({
            include: {
                barang_donasi: {
                    where: {
                        status: { in: ['disetujui', 'tersalurkan'] }
                    },
                    select: { id: true }
                },
                donasi_uang: {
                    where: {
                        status: { in: ['disetujui', 'tersalurkan'] }
                    },
                    select: { nominal: true }
                },
                partisipan: userId ? {
                    where: { user_id: userId }
                } : false
            },
            orderBy: { created_at: 'desc' }
        });

        const formattedCampaigns = campaigns.map((c) => {
            const terkumpulDana = c.donasi_uang.reduce((sum, d) => sum + d.nominal, 0);
            const terkumpulBarang = c.barang_donasi.length;
            const joined = userId ? (c.partisipan as any[]).length > 0 : false;

            // Total participants calculation (mocked for now, or based on partisipan count if we include it)
            // But we didn't include full partisipan array. Let's just mock it or query it.
            // For now, let's keep it simple.

            return {
                id: c.id,
                judul: c.judul,
                deskripsi: c.deskripsi,
                target_dana: c.target_dana,
                terkumpul_dana: terkumpulDana,
                target_barang: c.target_barang,
                terkumpul_barang: terkumpulBarang,
                foto_url: c.foto_url,
                status: c.status,
                joined,
                created_at: c.created_at,
                updated_at: c.updated_at
            };
        });

        return NextResponse.json({ data: formattedCampaigns, error: null });
    } catch (error) {
        console.error('GET /api/campaigns error:', error);
        return NextResponse.json({ data: null, error: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}

const postSchema = z.object({
    judul: z.string().min(1),
    deskripsi: z.string().min(1),
    target_dana: z.number().optional().nullable(),
    target_barang: z.number().optional().nullable(),
    foto_url: z.string().optional().nullable()
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = postSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ data: null, error: parsed.error.issues.map(i => i.message).join(', ') }, { status: 400 });
        }

        const data = parsed.data;

        const newCampaign = await prisma.campaign.create({
            data: {
                judul: data.judul,
                deskripsi: data.deskripsi,
                target_dana: data.target_dana || null,
                target_barang: data.target_barang || null,
                foto_url: data.foto_url || null,
                status: 'aktif'
            }
        });

        return NextResponse.json({ data: newCampaign, error: null }, { status: 201 });
    } catch (error) {
        console.error('POST /api/campaigns error:', error);
        return NextResponse.json({ data: null, error: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}
