'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME, parseAuthCookieValue } from '@/lib/auth';
import { notificationSubject } from '@/lib/notifikasi';

export async function getPermintaan(params?: { status?: string; penerima_id?: number }) {
  const where: Record<string, unknown> = {};
  if (params?.status) where.status = params.status;
  if (params?.penerima_id) where.penerima_id = params.penerima_id;

  const list = await prisma.permintaan.findMany({
    where,
    include: {
      barang: {
        include: {
          donatur: { select: { id: true, nama: true, kota: true } },
          pengiriman: {
            where: { tipe: 'admin_ke_penerima' },
            select: { id: true, kurir: true, resi: true, status: true, created_at: true, updated_at: true },
            orderBy: { created_at: 'desc' },
            take: 1,
          },
        },
      },
      penerima: { select: { id: true, nama: true, kota: true, tipe: true } },
    },
    orderBy: { created_at: 'desc' },
  });

  return list;
}

export async function createPermintaan(data: { barang_id: number; pesan?: string }) {
  const cookieStore = await cookies();
  const auth = parseAuthCookieValue(cookieStore.get(AUTH_COOKIE_NAME)?.value);
  if (!auth) throw new Error('Tidak terautentikasi');
  if (auth.role !== 'penerima') throw new Error('Akses hanya untuk penerima');
  
  const penerima_id = auth.userId;
  const { barang_id, pesan } = data;

  const barang = await prisma.barangDonasi.findUnique({ where: { id: barang_id } });
  if (!barang) throw new Error('Barang tidak ditemukan');
  if (barang.status !== 'terkirim') throw new Error('Barang tidak tersedia untuk diminta');

  const existing = await prisma.permintaan.findFirst({
    where: { barang_id, penerima_id, status: { in: ['menunggu', 'diterima'] } },
  });
  if (existing) throw new Error('Anda sudah memiliki permintaan aktif untuk barang ini');

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentRequestsCount = await prisma.permintaan.count({
    where: {
      penerima_id,
      created_at: { gte: sevenDaysAgo },
    },
  });

  if (recentRequestsCount >= 3) {
    throw new Error('Anda telah mencapai batas maksimal 3 permintaan dalam 7 hari terakhir.');
  }

  const permintaan = await prisma.permintaan.create({
    data: { barang_id, penerima_id, pesan: pesan || null, status: 'menunggu' },
  });

  return permintaan;
}

export async function updatePermintaan(
  id: number,
  data: { konfirmasi?: boolean; status?: 'diterima' | 'ditolak'; alasan?: string }
) {
  if (isNaN(id)) throw new Error('ID tidak valid');

  const existing = await prisma.permintaan.findUnique({ where: { id }, include: { barang: true } });
  if (!existing) throw new Error('Permintaan tidak ditemukan');

  if (data.konfirmasi) {
    const cookieStore = await cookies();
    const auth = parseAuthCookieValue(cookieStore.get(AUTH_COOKIE_NAME)?.value);
    if (!auth) throw new Error('Tidak terautentikasi');
    if (auth.role !== 'penerima') throw new Error('Akses hanya untuk penerima');
    if (existing.penerima_id !== auth.userId) throw new Error('Bukan permintaan Anda');
    if (existing.status !== 'diterima') throw new Error('Permintaan belum disetujui');
    if (existing.barang.status === 'tersalurkan') throw new Error('Penerimaan sudah dikonfirmasi');

    const pengiriman = await prisma.pengiriman.findFirst({
      where: { barang_id: existing.barang_id, tipe: 'admin_ke_penerima', status: 'terkirim' },
    });
    if (!pengiriman) throw new Error('Barang belum sampai ke penerima');

    const konfirmasiNote = `DIKONFIRMASI PENERIMA: ${new Date().toISOString()}`;
    const updated = await prisma.$transaction(async (tx) => {
      const updatedPermintaan = await tx.permintaan.update({
        where: { id },
        data: {
          pesan: existing.pesan ? `${existing.pesan}\n\n${konfirmasiNote}` : konfirmasiNote,
        },
      });

      await tx.barangDonasi.update({
        where: { id: existing.barang_id },
        data: { status: 'tersalurkan' },
      });

      await tx.logPoin.create({
        data: {
          user_id: existing.barang.donatur_id,
          poin: 25,
          keterangan: `Poin dari donasi barang tersalurkan: ${existing.barang.judul || 'Tanpa Judul'}`,
        },
      });

      await notificationSubject.emitStatusEvent(tx, {
        type: 'BARANG_TERSALURKAN',
        userId: existing.barang.donatur_id,
        barangJudul: existing.barang.judul || 'Tanpa Judul',
      });

      return updatedPermintaan;
    });
    return updated;
  }

  const { status, alasan } = data;
  if (!status) throw new Error('Status tidak diberikan');

  if (existing.status !== 'menunggu') {
    throw new Error('Permintaan sudah diproses');
  }

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.permintaan.update({
      where: { id },
      data: {
        status,
        pesan: alasan ? `${existing.pesan || ''}\n\nCATATAN ADMIN: ${alasan}`.trim() : existing.pesan,
      },
    });

    if (status === 'diterima') {
      await tx.pengiriman.create({
        data: {
          barang_id: existing.barang_id,
          tipe: 'admin_ke_penerima',
          status: 'disiapkan',
        },
      });

      await notificationSubject.emitStatusEvent(tx, {
        type: 'PERMINTAAN_DITERIMA',
        userId: existing.penerima_id,
        barangJudul: existing.barang.judul || 'Tanpa Judul'
      });
    } else if (status === 'ditolak') {
      await notificationSubject.emitStatusEvent(tx, {
        type: 'PERMINTAAN_DITOLAK',
        userId: existing.penerima_id,
        barangJudul: existing.barang.judul || 'Tanpa Judul'
      });
    }

    return updated;
  });

  return result;
}

export async function deletePermintaan(id: number) {
  if (isNaN(id)) throw new Error('ID tidak valid');

  const cookieStore = await cookies();
  const auth = parseAuthCookieValue(cookieStore.get(AUTH_COOKIE_NAME)?.value);
  if (!auth) throw new Error('Tidak terautentikasi');
  if (auth.role !== 'penerima') throw new Error('Akses hanya untuk penerima');

  const existing = await prisma.permintaan.findUnique({ where: { id } });
  if (!existing) throw new Error('Permintaan tidak ditemukan');
  if (existing.penerima_id !== auth.userId) throw new Error('Bukan permintaan Anda');
  if (existing.status !== 'menunggu') throw new Error('Permintaan sudah diproses, tidak bisa dibatalkan');

  await prisma.permintaan.delete({ where: { id } });

  return { ok: true };
}
