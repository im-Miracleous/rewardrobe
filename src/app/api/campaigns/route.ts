import { NextRequest, NextResponse } from 'next/server';
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
