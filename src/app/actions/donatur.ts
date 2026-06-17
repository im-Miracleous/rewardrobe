'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME, parseAuthCookieValue } from '@/lib/auth';
import { z } from 'zod';

export async function getDonaturStats(donaturId: number) {
  if (!Number.isInteger(donaturId) || donaturId <= 0) {
    throw new Error('donatur_id tidak valid');
  }

  const pointsLog = await prisma.logPoin.findMany({
    where: { user_id: donaturId },
    select: { poin: true }
  });
  const totalPoin = pointsLog.reduce((sum, item) => sum + item.poin, 0);

  const approvedClothes = await prisma.barangDonasi.findMany({
    where: {
      donatur_id: donaturId,
      status: { in: ['terkirim', 'tersalurkan'] }
    },
    select: { berat_kg: true }
  });
  const totalLimbahKg = approvedClothes.reduce((sum, item) => sum + (item.berat_kg || 0), 0);
  const totalPakaianItem = approvedClothes.length;

  const donaturUsers = await prisma.user.findMany({
    where: { role: 'donatur' },
    select: {
      id: true,
      nama: true,
      foto_profil: true,
      log_poin: {
        select: { poin: true }
      }
    }
  });

  const leaderboard = donaturUsers.map(user => {
    const points = user.log_poin.reduce((sum, item) => sum + item.poin, 0);
    return {
      id: user.id,
      nama: user.nama,
      foto_profil: user.foto_profil,
      total_poin: points
    };
  }).sort((a, b) => b.total_poin - a.total_poin);

  const userRank = leaderboard.findIndex(u => u.id === donaturId) + 1;

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const allBarang = await prisma.barangDonasi.findMany({
    where: { donatur_id: donaturId, created_at: { gte: sixMonthsAgo } },
    select: { created_at: true }
  });

  const monthlyStatsMap = new Map();
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toLocaleString('id-ID', { month: 'short', year: 'numeric' });
    monthlyStatsMap.set(key, { name: key, pakaian: 0 });
  }

  allBarang.forEach(b => {
    const key = new Date(b.created_at).toLocaleString('id-ID', { month: 'short', year: 'numeric' });
    if (monthlyStatsMap.has(key)) {
      monthlyStatsMap.get(key).pakaian += 1;
    }
  });

  const monthlyStats = Array.from(monthlyStatsMap.values()).reverse();

  return {
    total_poin: totalPoin,
    total_limbah_kg: totalLimbahKg,
    total_pakaian_item: totalPakaianItem,
    peringkat: userRank > 0 ? userRank : '-',
    leaderboard: leaderboard.slice(0, 10),
    monthly_stats: monthlyStats
  };
}

export async function getDonaturHistory(donaturId: number) {
  if (!Number.isInteger(donaturId) || donaturId <= 0) {
    throw new Error('donatur_id tidak valid');
  }

  const barangDonasi = await prisma.barangDonasi.findMany({
    where: { donatur_id: donaturId },
    orderBy: { created_at: 'desc' },
    include: {
      pengiriman: {
        where: { tipe: 'donatur_ke_admin' },
        orderBy: { created_at: 'asc' },
      },
    },
  });

  return { barang: barangDonasi };
}

const patchSchema = z.object({
  metode: z.enum(['drop_off', 'kurir']),
  kurir: z.string().optional(),
  resi: z.string().optional(),
});

export async function confirmPengirimanDonatur(id: number, data: { metode: 'drop_off' | 'kurir', kurir?: string, resi?: string }) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('ID tidak valid');
  }

  const parsed = patchSchema.parse(data);

  const cookieStore = await cookies();
  const auth = parseAuthCookieValue(cookieStore.get(AUTH_COOKIE_NAME)?.value);
  if (!auth) throw new Error('Tidak terautentikasi');
  if (auth.role !== 'donatur') throw new Error('Akses hanya untuk donatur');

  const existing = await prisma.pengiriman.findUnique({ where: { id }, include: { barang: true } });
  if (!existing || existing.tipe !== 'donatur_ke_admin') {
    throw new Error('Data pengiriman tidak ditemukan');
  }
  if (existing.barang.donatur_id !== auth.userId) {
    throw new Error('Bukan donasi Anda');
  }
  if (existing.status !== 'disiapkan') {
    throw new Error('Pengiriman sudah dikonfirmasi atau diproses');
  }

  const { metode, kurir, resi } = parsed;
  const updated = await prisma.pengiriman.update({
    where: { id },
    data: {
      status: 'dalam_pengiriman',
      kurir: metode === 'drop_off' ? 'Drop-off (Antar Sendiri)' : (kurir?.trim() || 'Kurir'),
      resi: resi?.trim() || null,
    },
  });

  return updated;
}
