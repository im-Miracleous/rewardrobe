import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // 1. Verifikasi: Menunggu (Barang + Uang)
        const barangMenunggu = await prisma.barangDonasi.count({
            where: { status: 'menunggu_verifikasi' }
        });
        const uangMenunggu = await prisma.donasiUang.count({
            where: { status: 'menunggu_verifikasi' }
        });
        const totalMenungguVerifikasi = barangMenunggu + uangMenunggu;

        // 2. Penjemputan: Menunggu & Sedang Dijemput
        const penjemputanAktif = await prisma.pengiriman.count({
            where: {
                tipe: 'donatur_ke_admin',
                status: { in: ['disiapkan', 'dalam_pengiriman'] }
            }
        });

        // 3. Inventory: Di Gudang (disetujui)
        const inventoryGudang = await prisma.barangDonasi.count({
            where: { status: 'disetujui' }
        });
        
        // Inventory: Tersalurkan (tersalurkan)
        const totalTersalurkan = await prisma.barangDonasi.count({
            where: { status: 'tersalurkan' }
        });

        // 4. Pengiriman ke Penerima: Aktif
        const pengirimanAktif = await prisma.pengiriman.count({
            where: {
                tipe: 'admin_ke_penerima',
                status: { in: ['disiapkan', 'dalam_pengiriman'] }
            }
        });

        // 5. Kampanye Aktif
        const kampanyeAktif = await prisma.campaign.count({
            where: { status: 'aktif' }
        });

        // 6. Recent Donations (Barang Donasi)
        const recentDonations = await prisma.barangDonasi.findMany({
            take: 5,
            orderBy: { created_at: 'desc' },
            include: { donatur: { select: { nama: true, kota: true } } }
        });

        return NextResponse.json({
            data: {
                stats: {
                    menungguVerifikasi: totalMenungguVerifikasi,
                    penjemputanAktif: penjemputanAktif,
                    inventoryGudang: inventoryGudang,
                    pengirimanAktif: pengirimanAktif,
                    kampanyeAktif: kampanyeAktif,
                    totalTersalurkan: totalTersalurkan
                },
                recentDonations: recentDonations
            },
            error: null
        });
    } catch (error) {
        console.error('GET /api/admin/dashboard error:', error);
        return NextResponse.json({ data: null, error: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}
