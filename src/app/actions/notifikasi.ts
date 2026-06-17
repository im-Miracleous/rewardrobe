'use server';

import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME, parseAuthCookieValue } from '@/lib/auth';

export async function getNotifikasi(onlyUnread?: boolean) {
  const cookieStore = await cookies();
  const auth = parseAuthCookieValue(cookieStore.get(AUTH_COOKIE_NAME)?.value);
  if (!auth) {
    throw new Error('Tidak terautentikasi');
  }

  const where: Record<string, unknown> = { user_id: auth.userId };
  if (onlyUnread) where.dibaca = false;

  const list = await prisma.notifikasi.findMany({
    where,
    orderBy: { created_at: 'desc' },
    take: 20,
  });

  return list;
}

export async function markNotifikasiRead() {
  const cookieStore = await cookies();
  const auth = parseAuthCookieValue(cookieStore.get(AUTH_COOKIE_NAME)?.value);
  if (!auth) {
    throw new Error('Tidak terautentikasi');
  }

  await prisma.notifikasi.updateMany({
    where: { user_id: auth.userId, dibaca: false },
    data: { dibaca: true },
  });

  return { ok: true };
}
