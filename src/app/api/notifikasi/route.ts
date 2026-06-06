import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AUTH_COOKIE_NAME, parseAuthCookieValue } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        const auth = parseAuthCookieValue(request.cookies.get(AUTH_COOKIE_NAME)?.value);
        if (!auth) {
            return NextResponse.json({ data: null, error: 'Tidak terautentikasi' }, { status: 401 });
        }

        const onlyUnread = request.nextUrl.searchParams.get('dibaca') === 'false';
        const where: Record<string, unknown> = { user_id: auth.userId };
        if (onlyUnread) where.dibaca = false;

        const list = await prisma.notifikasi.findMany({
            where,
            orderBy: { created_at: 'desc' },
            take: 20,
        });

        return NextResponse.json({ data: list, error: null });
    } catch (error) {
        console.error('GET /api/notifikasi error:', error);
        return NextResponse.json({ data: null, error: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const auth = parseAuthCookieValue(request.cookies.get(AUTH_COOKIE_NAME)?.value);
        if (!auth) {
            return NextResponse.json({ data: null, error: 'Tidak terautentikasi' }, { status: 401 });
        }

        await prisma.notifikasi.updateMany({
            where: { user_id: auth.userId, dibaca: false },
            data: { dibaca: true },
        });

        return NextResponse.json({ data: { ok: true }, error: null });
    } catch (error) {
        console.error('PATCH /api/notifikasi error:', error);
        return NextResponse.json({ data: null, error: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}
