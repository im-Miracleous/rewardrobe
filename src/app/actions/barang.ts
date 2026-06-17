'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME, parseAuthCookieValue } from '@/lib/auth';
import { z } from 'zod';

const KondisiUserEnum = z.enum(['fair', 'baik', 'rusak']);

type KondisiUserType = z.infer<typeof KondisiUserEnum>;

export async function getBarangDonasi(params?: { status?: string; tersedia?: boolean }) {
  const where: Record<string, unknown> = {};

  if (params?.status) {
    where.status = params.status;
  }

  if (params?.tersedia) {
    where.pengiriman = {
      some: { tipe: 'donatur_ke_admin', status: 'terkirim' },
    };
  }

  const barangList = await prisma.barangDonasi.findMany({
    where,
    include: {
      donatur: { select: { id: true, nama: true, kota: true } },
      verifier: { select: { id: true, nama: true } },
    },
    orderBy: { created_at: 'desc' },
  });

  return barangList;
}

export async function getBarangDonasiById(barangId: number) {
  if (!Number.isInteger(barangId) || barangId <= 0) {
    throw new Error('id tidak valid');
  }

  const barang = await prisma.barangDonasi.findUnique({
    where: { id: barangId },
    include: {
      donatur: {
        select: { id: true, nama: true, email: true }
      },
      verifier: {
        select: { id: true, nama: true }
      },
      pengiriman: {
        orderBy: { created_at: 'asc' }
      }
    }
  });

  if (!barang) {
    throw new Error('Barang donasi tidak ditemukan');
  }

  return barang;
}

export async function createBarangDonasi(data: {
  tipePakaian: string;
  catatan?: string;
  kategori?: string;
  kondisi: string;
  berat_kg?: number;
  donatur_id: number;
  bukti_foto: string;
}) {
  const donaturExists = await prisma.user.findUnique({ where: { id: data.donatur_id } });
  if (!donaturExists) {
    throw new Error('donatur_id tidak ditemukan');
  }

  const finalStatus = 'menunggu_pengiriman';

  const fullDeskripsi = data.catatan
    ? `Kondisi menurut donatur: ${data.kondisi}\n\nCatatan: ${data.catatan}`
    : `Kondisi menurut donatur: ${data.kondisi}`;

  const kondisiEnum = KondisiUserEnum.parse(data.kondisi);

  const barang = await prisma.$transaction(async (tx) => {
    const created = await tx.barangDonasi.create({
      data: {
        judul: null,
        deskripsi: fullDeskripsi,
        kondisi_user: kondisiEnum,
        kategori: data.tipePakaian,
        berat_kg: data.berat_kg ?? null,
        foto_url: data.bukti_foto || null,
        status: finalStatus,
        donatur_id: data.donatur_id,
      },
    });

    await tx.pengiriman.create({
      data: {
        barang_id: created.id,
        tipe: 'donatur_ke_admin',
        status: 'disiapkan',
      },
    });

    return created;
  });

  return barang;
}

export async function updateStatusBarangDonasi(barangId: number, status: string) {
  if (!Number.isInteger(barangId) || barangId <= 0) {
    throw new Error('id tidak valid');
  }

  const cookieStore = await cookies();
  const auth = parseAuthCookieValue(cookieStore.get(AUTH_COOKIE_NAME)?.value);
  if (!auth) {
    throw new Error('Tidak terautentikasi');
  }

  const actor = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, role: true },
  });

  if (!actor || actor.role !== 'admin') {
    throw new Error('Akses hanya untuk admin');
  }

  const existing = await prisma.barangDonasi.findUnique({ where: { id: barangId } });
  if (!existing) {
    throw new Error('Barang donasi tidak ditemukan');
  }

  const needsVerifier = status === 'terkirim' || status === 'ditolak' || status === 'tersalurkan';
  const updated = await prisma.barangDonasi.update({
    where: { id: barangId },
    data: {
      status: status as import('@prisma/client').StatusBarang,
      ...(needsVerifier
        ? { verified_by: actor.id, verified_at: new Date() }
        : {}),
    },
  });

  return updated;
}
