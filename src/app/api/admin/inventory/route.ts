import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // Fetch BarangDonasi that are either in warehouse (terkirim) or distributed (tersalurkan)
        const inventoryList = await prisma.barangDonasi.findMany({
            where: {
                status: {
                    in: ['terkirim', 'tersalurkan']
                }
            },
            include: {
                donatur: { select: { id: true, nama: true } },
            },
            orderBy: { updated_at: 'desc' }
        });

        return NextResponse.json({ data: inventoryList, error: null });
    } catch (error) {
        console.error('GET /api/admin/inventory error:', error);
        return NextResponse.json({ data: null, error: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}
