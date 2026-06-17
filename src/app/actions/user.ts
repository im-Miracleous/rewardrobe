'use server';

import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { RoleUser, TipePenerima } from '@prisma/client';

function isRoleUser(value: unknown): value is RoleUser {
  return value === 'admin' || value === 'donatur' || value === 'penerima';
}

function isTipePenerima(value: unknown): value is TipePenerima {
  return value === 'panti' || value === 'komunitas' || value === 'pengrajin';
}

export async function getUser(userId: number) {
  if (!Number.isInteger(userId)) {
    throw new Error('id tidak valid');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User tidak ditemukan');
  }

  return user;
}

export async function updateUser(
  userId: number,
  body: {
    nama?: string;
    email?: string;
    password?: string;
    no_telpon?: string | null;
    alamat_lengkap?: string | null;
    kota?: string | null;
    foto_profil?: string | null;
    role?: string;
    tipe?: string | null;
  }
) {
  if (!Number.isInteger(userId)) {
    throw new Error('id tidak valid');
  }

  let hashedPassword;
  if (body.password) {
    hashedPassword = await hashPassword(body.password);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(body.nama !== undefined ? { nama: body.nama } : {}),
      ...(body.email !== undefined ? { email: body.email } : {}),
      ...(hashedPassword !== undefined ? { password: hashedPassword } : {}),
      ...(body.no_telpon !== undefined ? { no_telpon: body.no_telpon } : {}),
      ...(body.alamat_lengkap !== undefined ? { alamat_lengkap: body.alamat_lengkap } : {}),
      ...(body.kota !== undefined ? { kota: body.kota } : {}),
      ...(body.foto_profil !== undefined ? { foto_profil: body.foto_profil } : {}),
      ...(isRoleUser(body.role) ? { role: body.role } : {}),
      ...(body.tipe !== undefined ? { tipe: isTipePenerima(body.tipe) ? body.tipe : null } : {}),
    },
  });

  return updatedUser;
}

export async function deleteUser(userId: number) {
  if (!Number.isInteger(userId)) {
    throw new Error('id tidak valid');
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  return { message: 'User deleted' };
}
