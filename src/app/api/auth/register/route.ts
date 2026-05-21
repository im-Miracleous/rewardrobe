// CODE-CITE:
//   Title: Register API Route - Pembuatan Akun Donatur dan Penerima
//   Type: ai
//   Value: Claude (claude.ai/code)
//   Notes: POST endpoint registrasi, validasi role, cek email duplikat, hash password, proteksi admin tidak bisa daftar via website
//   Lines Range: 1-97
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            nama,
            email,
            password,
            noTelpon,
            alamatLengkap,
            kota,
            role,
            tipe,
        } = body;

        // Validasi input
        if (!nama || !email || !password || !noTelpon || !alamatLengkap || !kota || !role) {
            return NextResponse.json(
                { message: 'Semua field harus diisi.' },
                { status: 400 }
            );
        }

        // Validasi role - admin tidak boleh register dari website
        if (role === 'admin') {
            return NextResponse.json(
                { message: 'Admin tidak dapat mendaftar melalui website. Hubungi administrator.' },
                { status: 400 }
            );
        }

        // Validasi role
        if (!['donatur', 'penerima'].includes(role)) {
            return NextResponse.json(
                { message: 'Role tidak valid.' },
                { status: 400 }
            );
        }

        // Jika role penerima, tipe harus diisi
        if (role === 'penerima' && !tipe) {
            return NextResponse.json(
                { message: 'Jenis penerima harus diisi.' },
                { status: 400 }
            );
        }

        // Cek email sudah terdaftar
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: 'Email sudah terdaftar.' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Buat user baru
        const newUser = await prisma.user.create({
            data: {
                nama,
                email,
                password: hashedPassword,
                no_telpon: noTelpon,
                alamat_lengkap: alamatLengkap,
                kota,
                role: role as 'donatur' | 'penerima',
                tipe: role === 'penerima' ? (tipe as 'panti' | 'komunitas' | 'pengrajin') : undefined,
            },
        });

        // Jangan return password
        const { password: _, ...userWithoutPassword } = newUser;

        return NextResponse.json(
            {
                message: 'Akun berhasil dibuat.',
                user: userWithoutPassword,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json(
            { message: 'Terjadi kesalahan pada server.' },
            { status: 500 }
        );
    }
}
