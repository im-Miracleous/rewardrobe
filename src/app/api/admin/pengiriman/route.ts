import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const pengirimanList = await prisma.pengiriman.findMany({
            where: {
                tipe: 'admin_ke_penerima'
            },
            include: {
                barang: {
                    include: {
                        permintaan: {
                            include: {
                                penerima: {
                                    select: { id: true, nama: true, kota: true, tipe: true }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        // Format data untuk UI
        const formattedData = pengirimanList.map(item => {
            // Find the request matching this item (if multiple, take the first approved one, or just first)
            const permintaan = item.barang.permintaan.find(p => p.status === 'diterima') || item.barang.permintaan[0];
            const penerima = permintaan?.penerima;

            return {
                id: item.id,
                barang_id: item.barang_id,
                penerima: penerima,
                alamat_tujuan: permintaan?.alamat_tujuan ?? null,
                barang_info: {
                    nama: item.barang.judul || item.barang.kategori || 'Barang Donasi',
                    kategori: item.barang.kategori,
                    foto_url: item.barang.foto_url
                },
                kurir: item.kurir,
                resi: item.resi,
                status: item.status,
                waktu_request: item.created_at
            };
        });

        return NextResponse.json({ data: formattedData, error: null });
    } catch (error) {
        console.error('GET /api/admin/pengiriman error:', error);
        return NextResponse.json({ data: null, error: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}
