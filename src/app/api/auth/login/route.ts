import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AUTH_COOKIE_NAME, createAuthCookieValue, getDashboardPathForRole, verifyPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { message: 'Email dan password harus diisi.' },
                { status: 400 }
            );
        }

        // Cari user berdasarkan email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json(
                { message: 'Email atau password salah.' },
                { status: 401 }
            );
        }

        // Verifikasi password
        const isPasswordValid = await verifyPassword(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { message: 'Email atau password salah.' },
                { status: 401 }
            );
        }

        // Jangan return password
        const { password: _, ...userWithoutPassword } = user;

        const response = NextResponse.json({
            message: 'Login berhasil.',
            user: userWithoutPassword,
            token: `token_${user.id}`,
            redirectTo: getDashboardPathForRole(user.role),
        });

        response.cookies.set(AUTH_COOKIE_NAME, createAuthCookieValue(user.id, user.role), {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { message: 'Terjadi kesalahan pada server.' },
            { status: 500 }
        );
    }
}
