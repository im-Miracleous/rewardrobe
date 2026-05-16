import { NextResponse } from 'next/server';
import { RoleUser } from '@prisma/client';
import prisma from '@/lib/prisma';

function isRoleUser(value: unknown): value is RoleUser {
  return value === 'admin' || value === 'donatur' || value === 'penerima';
}

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { id: 'desc' },
  });

  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    nama?: string;
    email?: string;
    password?: string;
    no_telpon?: string;
    alamat_lengkap?: string;
    kota?: string;
    foto_profil?: string;
    role?: RoleUser;
    tipe?: 'panti' | 'komunitas' | 'pengrajin' | null;
  };

  if (!body.nama || !body.email || !body.password) {
    return NextResponse.json(
      { message: 'nama, email, dan password wajib diisi.' },
      { status: 400 },
    );
  }

  const role = isRoleUser(body.role) ? body.role : 'donatur';

  const user = await prisma.user.create({
    data: {
      nama: body.nama,
      email: body.email,
      password: body.password,
      no_telpon: body.no_telpon,
      alamat_lengkap: body.alamat_lengkap,
      kota: body.kota,
      foto_profil: body.foto_profil,
      role,
      tipe: body.tipe ?? null,
    },
  });

  return NextResponse.json({ user }, { status: 201 });
}