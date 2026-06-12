import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const penjemputanList = await prisma.pengiriman.findMany({
            where: {
                tipe: 'donatur_ke_admin'
            },
            include: {
                barang: {
                    include: {
                        donatur: {
                            select: { id: true, nama: true, kota: true, alamat_lengkap: true, no_telpon: true }
                        }
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        // Format data untuk disesuaikan dengan kebutuhan UI (mendekati struktur mock)
        const formattedData = penjemputanList.map(item => ({
            id: item.id,
            barang_id: item.barang_id,
            donatur: item.barang.donatur,
            barang_info: {
                kategori: item.barang.kategori || 'Pakaian',
                jumlah: item.barang.berat_kg ? `${item.barang.berat_kg} kg` : '1 Item'
            },
            kurir: item.kurir,
            resi: item.resi,
            status: item.status, // disiapkan, dalam_pengiriman, terkirim
            waktu_request: item.created_at,
            waktu_update: item.updated_at
        }));

        return NextResponse.json({ data: formattedData, error: null });
    } catch (error) {
        console.error('GET /api/admin/penjemputan error:', error);
        return NextResponse.json({ data: null, error: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}
