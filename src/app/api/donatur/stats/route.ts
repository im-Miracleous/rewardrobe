import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = request.nextUrl;
        const donaturIdStr = searchParams.get('donatur_id');

        if (!donaturIdStr) {
            return NextResponse.json(
                { data: null, error: 'donatur_id wajib diisi' },
                { status: 400 }
            );
        }

        const donaturId = parseInt(donaturIdStr, 10);
        if (isNaN(donaturId)) {
            return NextResponse.json(
                { data: null, error: 'donatur_id harus berupa angka' },
                { status: 400 }
            );
        }

        // 1. Total Poin
        const pointsLog = await prisma.logPoin.findMany({
            where: { user_id: donaturId },
            select: { poin: true }
        });
        const totalPoin = pointsLog.reduce((sum, item) => sum + item.poin, 0);

        // 2. Limbah Diselamatkan (Approved clothes weight)
        const approvedClothes = await prisma.barangDonasi.findMany({
            where: {
                donatur_id: donaturId,
                status: { in: ['terkirim', 'tersalurkan'] }
            },
            select: { berat_kg: true }
        });
        const totalLimbahKg = approvedClothes.reduce((sum, item) => sum + (item.berat_kg || 0), 0);

        // 3. Pakaian Tersalurkan (Count of approved clothes)
        const totalPakaianItem = approvedClothes.length;

        // 5. Leaderboard (Calculate sum of points for all donaturs)
        const donaturUsers = await prisma.user.findMany({
            where: { role: 'donatur' },
            select: {
                id: true,
                nama: true,
                foto_profil: true,
                log_poin: {
                    select: { poin: true }
                }
            }
        });

        const leaderboard = donaturUsers.map(user => {
            const points = user.log_poin.reduce((sum, item) => sum + item.poin, 0);
            return {
                id: user.id,
                nama: user.nama,
                foto_profil: user.foto_profil,
                total_poin: points
            };
        }).sort((a, b) => b.total_poin - a.total_poin);

        // 6. User Rank
        const userRank = leaderboard.findIndex(u => u.id === donaturId) + 1;

        // 7. Monthly donations (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        sixMonthsAgo.setHours(0, 0, 0, 0);

        const allBarang = await prisma.barangDonasi.findMany({
            where: { donatur_id: donaturId, created_at: { gte: sixMonthsAgo } },
            select: { created_at: true }
        });

        // Group by month
        const monthlyStatsMap = new Map();
        for (let i = 0; i < 6; i++) {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const key = d.toLocaleString('id-ID', { month: 'short', year: 'numeric' });
            monthlyStatsMap.set(key, { name: key, pakaian: 0 });
        }

        allBarang.forEach(b => {
            const key = new Date(b.created_at).toLocaleString('id-ID', { month: 'short', year: 'numeric' });
            if (monthlyStatsMap.has(key)) {
                monthlyStatsMap.get(key).pakaian += 1;
            }
        });

        const monthlyStats = Array.from(monthlyStatsMap.values()).reverse(); // chronological order

        return NextResponse.json({
            data: {
                total_poin: totalPoin,
                total_limbah_kg: totalLimbahKg,
                total_pakaian_item: totalPakaianItem,
                peringkat: userRank > 0 ? userRank : '-',
                leaderboard: leaderboard.slice(0, 10), // top 10
                monthly_stats: monthlyStats
            },
            error: null
        });
    } catch (error) {
        console.error('GET /api/donatur/stats error:', error);
        return NextResponse.json({ data: null, error: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}
