import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const donasiId = Number(id);

        if (!Number.isInteger(donasiId) || donasiId <= 0) {
            return NextResponse.json({ data: null, error: 'id tidak valid' }, { status: 400 });
        }

        const donasi = await prisma.donasiUang.findUnique({
            where: { id: donasiId },
            include: {
                campaign: {
                    select: { id: true, judul: true }
                },
                donatur: {
                    select: { id: true, nama: true, email: true }
                },
                verifier: {
                    select: { id: true, nama: true }
                }
            }
        });

        if (!donasi) {
            return NextResponse.json({ data: null, error: 'Donasi uang tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json({ data: donasi, error: null });
    } catch (error) {
        console.error('GET /api/donasi-uang/[id] error:', error);
        return NextResponse.json({ data: null, error: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}
