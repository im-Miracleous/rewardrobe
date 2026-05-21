// CODE-CITE:
//   Title: Logout API Route - Clear Session Cookie
//   Type: ai
//   Value: Claude (claude.ai/code)
//   Notes: POST endpoint logout, hapus cookie rewardrobe_auth dengan maxAge 0
//   Lines Range: 15
import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
    const response = NextResponse.json({ message: 'Logout berhasil.' });

    response.cookies.set(AUTH_COOKIE_NAME, '', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
    });

    return response;
}
