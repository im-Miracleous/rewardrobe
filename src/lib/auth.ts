// CODE-CITE:
//   Title: Auth Utility Functions - Hash, Verify, Cookie, Role
//   Type: ai
//   Value: Claude (claude.ai/code)
//   Notes: Fungsi utilitas autentikasi: hash/verify password bcrypt, serialisasi cookie, routing berdasarkan role
//   Lines Range: 75
import { hash, compare } from 'bcryptjs';

export type AuthRole = 'admin' | 'donatur' | 'penerima';
export const AUTH_COOKIE_NAME = 'rewardrobe_auth';

export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return compare(password, hashedPassword);
}

export function getDashboardPathForRole(role: AuthRole): string {
    if (role === 'admin') {
        return '/dashboard/admin';
    }

    if (role === 'donatur') {
        return '/dashboard/donatur';
    }

    return '/dashboard/penerima';
}

export function isWebsiteRegisterableRole(role: string): role is Exclude<AuthRole, 'admin'> {
    return role === 'donatur' || role === 'penerima';
}

export function createAuthCookieValue(userId: number, role: AuthRole): string {
    return JSON.stringify({ userId, role });
}

export function parseAuthCookieValue(value: string | undefined): { userId: number; role: AuthRole } | null {
    if (!value) {
        return null;
    }

    try {
        const parsed = JSON.parse(value) as { userId?: number; role?: AuthRole };

        if (typeof parsed.userId !== 'number') {
            return null;
        }

        if (parsed.role !== 'admin' && parsed.role !== 'donatur' && parsed.role !== 'penerima') {
            return null;
        }

        return {
            userId: parsed.userId,
            role: parsed.role,
        };
    } catch {
        return null;
    }
}

export function getRoleFromDashboardPath(pathname: string): AuthRole | null {
    if (pathname.startsWith('/dashboard/admin')) {
        return 'admin';
    }

    if (pathname.startsWith('/dashboard/donatur')) {
        return 'donatur';
    }

    if (pathname.startsWith('/dashboard/penerima')) {
        return 'penerima';
    }

    return null;
}
