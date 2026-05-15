import 'dotenv/config';
import prisma from '../src/lib/prisma';
import { hashPassword } from '../src/lib/auth';

async function main() {
    const defaultPassword = await hashPassword('password');

    const users = [
        {
            nama: 'Admin',
            email: 'admin@example.com',
            role: 'admin' as const,
            tipe: null,
            no_telpon: '000000000000',
            alamat_lengkap: 'Alamat admin dummy',
            kota: 'Jakarta',
        },
        {
            nama: 'Donatur Dummy',
            email: 'donatur@example.com',
            role: 'donatur' as const,
            tipe: null,
            no_telpon: '081234567890',
            alamat_lengkap: 'Alamat donatur dummy',
            kota: 'Bandung',
        },
        {
            nama: 'Penerima Dummy',
            email: 'penerima@example.com',
            role: 'penerima' as const,
            tipe: 'panti' as const,
            no_telpon: '089876543210',
            alamat_lengkap: 'Alamat penerima dummy',
            kota: 'Surabaya',
        },
    ];

    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {
                nama: user.nama,
                password: defaultPassword,
                role: user.role,
                tipe: user.tipe,
                no_telpon: user.no_telpon,
                alamat_lengkap: user.alamat_lengkap,
                kota: user.kota,
            },
            create: {
                nama: user.nama,
                email: user.email,
                password: defaultPassword,
                role: user.role,
                tipe: user.tipe,
                no_telpon: user.no_telpon,
                alamat_lengkap: user.alamat_lengkap,
                kota: user.kota,
            },
        });
    }

    console.log('Seed selesai: admin@example.com, donatur@example.com, penerima@example.com');
}

main()
    .catch((error) => {
        console.error('Seed gagal:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
