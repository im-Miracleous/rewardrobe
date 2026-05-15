import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const startedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    const userCount = await prisma.user.count();

    return NextResponse.json({
      connected: true,
      latencyMs: Date.now() - startedAt,
      userCount,
      message: 'Prisma bisa terhubung ke PostgreSQL dan membaca tabel User.',
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        connected: false,
        latencyMs: Date.now() - startedAt,
        userCount: null,
        message: error instanceof Error ? error.message : 'Unknown database error',
        checkedAt: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}