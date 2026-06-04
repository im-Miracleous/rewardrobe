import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const campaignId = Number(id);

        if (!Number.isInteger(campaignId) || campaignId <= 0) {
            return NextResponse.json({ data: null, error: 'id tidak valid' }, { status: 400 });
        }

        const { searchParams } = request.nextUrl;
        const userIdStr = searchParams.get('userId');
        const userId = userIdStr ? parseInt(userIdStr, 10) : null;

        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            include: {
                barang_donasi: {
                    where: {
                        status: { in: ['disetujui', 'tersalurkan'] }
                    },
                    include: {
                        donatur: { select: { nama: true } }
                    },
                    orderBy: { created_at: 'desc' }
                },
                donasi_uang: {
                    where: {
                        status: { in: ['disetujui', 'tersalurkan'] }
                    },
                    include: {
                        donatur: { select: { nama: true } }
                    },
                    orderBy: { created_at: 'desc' }
                },
                partisipan: userId ? {
                    where: { user_id: userId }
                } : false
            }
        });

        if (!campaign) {
            return NextResponse.json({ data: null, error: 'Kampanye tidak ditemukan' }, { status: 404 });
        }

        const terkumpulDana = campaign.donasi_uang.reduce((sum, d) => sum + d.nominal, 0);
        const terkumpulBarang = campaign.barang_donasi.length;
        const joined = userId ? (campaign.partisipan as any[]).length > 0 : false;

        // Count all partisipan
        const totalPartisipan = await prisma.partisipasiCampaign.count({
            where: { campaign_id: campaignId }
        });

        // Combine recent contributions (pakaian + uang)
        const recentBarang = campaign.barang_donasi.slice(0, 5).map(b => ({
            id: b.id,
            type: 'pakaian',
            donatur: b.donatur.nama,
            detail: b.kategori,
            created_at: b.created_at
        }));

        const recentUang = campaign.donasi_uang.slice(0, 5).map(u => ({
            id: u.id,
            type: 'uang',
            donatur: u.donatur.nama,
            detail: `Rp ${u.nominal.toLocaleString('id-ID')}`,
            created_at: u.created_at
        }));

        const recentContributions = [...recentBarang, ...recentUang]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5);

        return NextResponse.json({
            data: {
                id: campaign.id,
                judul: campaign.judul,
                deskripsi: campaign.deskripsi,
                target_dana: campaign.target_dana,
                terkumpul_dana: terkumpulDana,
                target_barang: campaign.target_barang,
                terkumpul_barang: terkumpulBarang,
                foto_url: campaign.foto_url,
                status: campaign.status,
                joined,
                total_partisipan: totalPartisipan,
                recent_contributions: recentContributions,
                created_at: campaign.created_at,
                updated_at: campaign.updated_at
            },
            error: null
        });
    } catch (error) {
        console.error('GET /api/campaigns/[id] error:', error);
        return NextResponse.json({ data: null, error: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}
