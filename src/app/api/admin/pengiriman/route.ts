import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
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
                barang_info: {
                    nama: item.barang.judul || item.barang.kategori || 'Barang Donasi',
                    kategori: item.barang.kategori
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

const postSchema = z.object({
    penerima_id: z.number().int().positive(),
    barang_ids: z.array(z.number().int().positive()).min(1),
    kurir: z.string().min(1),
    resi: z.string().min(1)
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = postSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ data: null, error: parsed.error.issues.map(i => i.message).join(', ') }, { status: 400 });
        }

        const { penerima_id, barang_ids, kurir, resi } = parsed.data;

        // Check penerima exists
        const penerima = await prisma.user.findUnique({ where: { id: penerima_id } });
        if (!penerima) return NextResponse.json({ data: null, error: 'Penerima tidak ditemukan' }, { status: 404 });

        const result = await prisma.$transaction(async (tx) => {
            const createdPengiriman = [];

            for (const barang_id of barang_ids) {
                // Ensure barang is available (status terkirim = di gudang, not already requested/sent)
                const barang = await tx.barangDonasi.findUnique({ where: { id: barang_id } });
                if (!barang || barang.status !== 'terkirim') {
                    throw new Error(`Barang ID ${barang_id} tidak valid atau tidak tersedia di gudang`);
                }

                // 1. Create Permintaan if not exists for this penerima & barang
                let permintaan = await tx.permintaan.findFirst({
                    where: { barang_id, penerima_id }
                });

                if (!permintaan) {
                    permintaan = await tx.permintaan.create({
                        data: {
                            barang_id,
                            penerima_id,
                            status: 'diterima', // Automatically approved since admin is creating it
                            pesan: 'Dikirim oleh Admin'
                        }
                    });
                } else if (permintaan.status !== 'diterima') {
                    // Update status if it was pending
                    permintaan = await tx.permintaan.update({
                        where: { id: permintaan.id },
                        data: { status: 'diterima' }
                    });
                }

                // 2. Create Pengiriman
                const pengiriman = await tx.pengiriman.create({
                    data: {
                        barang_id,
                        tipe: 'admin_ke_penerima',
                        kurir,
                        resi,
                        status: 'disiapkan'
                    }
                });

                createdPengiriman.push(pengiriman);
            }

            return createdPengiriman;
        });

        return NextResponse.json({ data: result, error: null }, { status: 201 });
    } catch (error: any) {
        console.error('POST /api/admin/pengiriman error:', error);
        return NextResponse.json({ data: null, error: error.message || 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}
