// CODE-CITE:
//   Title: Next.js Edge Middleware - Route Protection
//   Type: ai
//   Value: Claude (claude.ai/code)
//   Notes: Middleware edge-safe untuk proteksi route /dashboard/*, validasi cookie auth, redirect berdasarkan role
//   Lines Range: 57
import { NextRequest, NextResponse } from 'next/server';

/**
 * Edge-safe middleware.
 * Avoid importing runtime-heavy files (prisma, bcrypt, etc.) so Next can statically
 * analyze and detect the `middleware` export.
 */
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Read auth cookie value directly; cookie format is JSON: { userId: number, role: 'admin'|'donatur'|'penerima' }
    const cookieValue = request.cookies.get('rewardrobe_auth')?.value;

    let auth: { userId: number; role: 'admin' | 'donatur' | 'penerima' } | null = null;
    if (cookieValue) {
        try {
            const parsed = JSON.parse(cookieValue);
            if (
                parsed &&
                typeof parsed.userId === 'number' &&
                (parsed.role === 'admin' || parsed.role === 'donatur' || parsed.role === 'penerima')
            ) {
                auth = { userId: parsed.userId, role: parsed.role };
            }
        } catch {
            auth = null;
        }
    }

    if (!auth) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/auth/login';
        loginUrl.searchParams.set('next', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Determine required role for the requested dashboard path
    const dashboardRole: 'admin' | 'donatur' | 'penerima' | null = pathname.startsWith('/dashboard/admin')
        ? 'admin'
        : pathname.startsWith('/dashboard/donatur')
        ? 'donatur'
        : pathname.startsWith('/dashboard/penerima')
        ? 'penerima'
        : null;

    if (dashboardRole && dashboardRole !== auth.role) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = auth.role === 'admin' ? '/dashboard/admin' : auth.role === 'donatur' ? '/dashboard/donatur' : '/dashboard/penerima';
        return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*'],
};