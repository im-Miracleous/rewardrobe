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

        // Fetch clothes donations
        const barangDonasi = await prisma.barangDonasi.findMany({
            where: { donatur_id: donaturId },
            orderBy: { created_at: 'desc' },
        });

        return NextResponse.json({
            data: {
                barang: barangDonasi
            },
            error: null
        });
    } catch (error) {
        console.error('GET /api/donatur/history error:', error);
        return NextResponse.json({ data: null, error: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}
