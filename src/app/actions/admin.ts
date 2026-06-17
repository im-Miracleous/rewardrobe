'use server';

import prisma from '@/lib/prisma';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME, parseAuthCookieValue } from '@/lib/auth';

function checkAdminAuth(auth: any) {
  if (!auth || auth.role !== 'admin') {
    throw new Error('Akses ditolak: Hanya admin');
  }
}

export async function getAdminDashboardStats() {
  const cookieStore = await cookies();
  const auth = parseAuthCookieValue(cookieStore.get(AUTH_COOKIE_NAME)?.value);
  checkAdminAuth(auth);

  const totalMenungguPengiriman = await prisma.barangDonasi.count({
    where: { status: 'menunggu_pengiriman' }
  });

  const penjemputanAktif = await prisma.pengiriman.count({
    where: {
      tipe: 'donatur_ke_admin',
      status: { in: ['disiapkan', 'dalam_pengiriman'] }
    }
  });

  const inventoryGudang = await prisma.barangDonasi.count({
    where: { status: 'terkirim' }
  });
  
  const totalTersalurkan = await prisma.barangDonasi.count({
    where: { status: 'tersalurkan' }
  });

  const pengirimanAktif = await prisma.pengiriman.count({
    where: {
      tipe: 'admin_ke_penerima',
      status: { in: ['disiapkan', 'dalam_pengiriman'] }
    }
  });

  const recentDonations = await prisma.barangDonasi.findMany({
    take: 5,
    orderBy: { created_at: 'desc' },
    include: { donatur: { select: { nama: true, kota: true } } }
  });

  return {
    stats: {
      menungguPengiriman: totalMenungguPengiriman,
      penjemputanAktif,
      inventoryGudang,
      pengirimanAktif,
      totalTersalurkan
    },
    recentDonations
  };
}

export async function getAdminInventory() {
  const cookieStore = await cookies();
  const auth = parseAuthCookieValue(cookieStore.get(AUTH_COOKIE_NAME)?.value);
  checkAdminAuth(auth);

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

  const formattedData = inventoryList.map(item => ({
    ...item,
    qr_code: `QR-RWD-${item.id}-${new Date(item.created_at).getTime().toString().substring(0, 5)}`
  }));

  return formattedData;
}

export async function getAdminPengiriman() {
  const cookieStore = await cookies();
  const auth = parseAuthCookieValue(cookieStore.get(AUTH_COOKIE_NAME)?.value);
  checkAdminAuth(auth);

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

  const formattedData = pengirimanList.map(item => {
    const permintaan = item.barang.permintaan.find((p: any) => p.status === 'diterima') || item.barang.permintaan[0];
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

  return formattedData;
}

const postSchema = z.object({
  penerima_id: z.number().int().positive(),
  barang_ids: z.array(z.number().int().positive()).min(1),
  kurir: z.string().min(1),
  resi: z.string().min(1)
});

export async function createAdminPengiriman(data: { penerima_id: number, barang_ids: number[], kurir: string, resi: string }) {
  const cookieStore = await cookies();
  const auth = parseAuthCookieValue(cookieStore.get(AUTH_COOKIE_NAME)?.value);
  checkAdminAuth(auth);

  const parsed = postSchema.parse(data);
  const { penerima_id, barang_ids, kurir, resi } = parsed;

  const penerima = await prisma.user.findUnique({ where: { id: penerima_id } });
  if (!penerima) throw new Error('Penerima tidak ditemukan');

  const result = await prisma.$transaction(async (tx) => {
    const createdPengiriman = [];

    for (const barang_id of barang_ids) {
      const barang = await tx.barangDonasi.findUnique({ where: { id: barang_id } });
      if (!barang || barang.status !== 'terkirim') {
        throw new Error(`Barang ID ${barang_id} tidak valid atau tidak tersedia di gudang`);
      }

      let permintaan = await tx.permintaan.findFirst({
        where: { barang_id, penerima_id }
      });

      if (!permintaan) {
        permintaan = await tx.permintaan.create({
          data: {
            barang_id,
            penerima_id,
            status: 'diterima',
            pesan: 'Dikirim oleh Admin'
          }
        });
      } else if (permintaan.status !== 'diterima') {
        permintaan = await tx.permintaan.update({
          where: { id: permintaan.id },
          data: { status: 'diterima' }
        });
      }

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

  return result;
}

export async function getAdminPenjemputan() {
  const cookieStore = await cookies();
  const auth = parseAuthCookieValue(cookieStore.get(AUTH_COOKIE_NAME)?.value);
  checkAdminAuth(auth);

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
    status: item.status,
    waktu_request: item.created_at,
    waktu_update: item.updated_at
  }));

  return formattedData;
}

export async function updateAdminPengirimanStatus(id: number, status: 'disiapkan' | 'dalam_pengiriman' | 'terkirim') {
  const cookieStore = await cookies();
  const auth = parseAuthCookieValue(cookieStore.get(AUTH_COOKIE_NAME)?.value);
  checkAdminAuth(auth);

  if (!Number.isInteger(id) || id <= 0) throw new Error('ID tidak valid');

  const existing = await prisma.pengiriman.findUnique({ where: { id }, include: { barang: true } });
  if (!existing || existing.tipe !== 'admin_ke_penerima') {
    throw new Error('Data pengiriman tidak ditemukan');
  }

  const updated = await prisma.pengiriman.update({
    where: { id },
    data: { status }
  });

  return updated;
}

const patchPenjemputanSchema = z.object({
  kurir: z.string().optional(),
  status: z.enum(['disiapkan', 'dalam_pengiriman', 'terkirim']),
  catatan: z.string().optional(),
});

import { notificationSubject } from '@/lib/notifikasi';

export async function updateAdminPenjemputanStatus(id: number, data: { kurir?: string, status: 'disiapkan' | 'dalam_pengiriman' | 'terkirim', catatan?: string }) {
  const cookieStore = await cookies();
  const auth = parseAuthCookieValue(cookieStore.get(AUTH_COOKIE_NAME)?.value);
  checkAdminAuth(auth);

  if (!Number.isInteger(id) || id <= 0) throw new Error('ID tidak valid');
  const parsed = patchPenjemputanSchema.parse(data);
  const { kurir, status, catatan } = parsed;

  const existing = await prisma.pengiriman.findUnique({ where: { id }, include: { barang: true } });
  if (!existing || existing.tipe !== 'donatur_ke_admin') {
    throw new Error('Data penjemputan tidak ditemukan');
  }

  let resiToUpdate = existing.resi;
  if (kurir && status === 'dalam_pengiriman' && !existing.resi) {
    resiToUpdate = `PJM-${new Date().getTime()}`;
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.pengiriman.update({
      where: { id },
      data: {
        kurir: kurir || existing.kurir,
        status,
        resi: resiToUpdate
      }
    });

    if (status === 'terkirim') {
      await tx.barangDonasi.update({
        where: { id: existing.barang_id },
        data: { status: 'terkirim' },
      });

      await notificationSubject.emitStatusEvent(tx, {
        type: 'BARANG_TERKIRIM',
        userId: existing.barang.donatur_id,
        barangJudul: existing.barang.judul || 'Tanpa Judul'
      });

      await tx.logPoin.create({
        data: {
          user_id: existing.barang.donatur_id,
          poin: 50,
          keterangan: `Poin dari donasi barang terkirim: ${existing.barang.judul || 'Tanpa Judul'}`
        }
      });
    }

    return updated;
  });

  return result;
}
