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

        // Add a mock QR code string (could be an actual DB field later)
        const formattedData = inventoryList.map(item => ({
            ...item,
            qr_code: `QR-RWD-${item.id}-${new Date(item.created_at).getTime().toString().substring(0, 5)}`
        }));

        return NextResponse.json({ data: formattedData, error: null });
    } catch (error) {
        console.error('GET /api/admin/inventory error:', error);
        return NextResponse.json({ data: null, error: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}
