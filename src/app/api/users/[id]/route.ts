import { NextResponse } from 'next/server';
import { RoleUser, TipePenerima } from '@prisma/client';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

function isRoleUser(value: unknown): value is RoleUser {
  return value === 'admin' || value === 'donatur' || value === 'penerima';
}

function isTipePenerima(value: unknown): value is TipePenerima {
  return value === 'panti' || value === 'komunitas' || value === 'pengrajin';
}

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const userId = Number(id);

  if (!Number.isInteger(userId)) {
    return NextResponse.json({ message: 'id tidak valid' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const userId = Number(id);

  if (!Number.isInteger(userId)) {
    return NextResponse.json({ message: 'id tidak valid' }, { status: 400 });
  }

  const body = (await request.json()) as {
    nama?: string;
    email?: string;
    password?: string;
    no_telpon?: string | null;
    alamat_lengkap?: string | null;
    kota?: string | null;
    foto_profil?: string | null;
    role?: RoleUser;
    tipe?: TipePenerima | null;
  };

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

  return NextResponse.json({ user: updatedUser });
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const userId = Number(id);

  if (!Number.isInteger(userId)) {
    return NextResponse.json({ message: 'id tidak valid' }, { status: 400 });
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  return NextResponse.json({ message: 'User deleted' });
}