#!/usr/bin/env node

/**
 * Script untuk membuat admin account melalui terminal
 * Usage: node scripts/create-admin.js --email admin@example.com --password password123 --nama "Admin Name"
 */

require('dotenv/config');
const readline = require('readline');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function prompt(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

async function main() {
    try {
        console.log('\n========== Buat Admin Account ==========\n');

        const nama = await prompt('Nama Admin: ');
        const email = await prompt('Email Admin: ');
        const password = await prompt('Password Admin: ');
        const passwordConfirm = await prompt('Konfirmasi Password: ');

        if (password !== passwordConfirm) {
            console.error('\n❌ Password tidak cocok!');
            process.exit(1);
        }

        // Cek email sudah ada
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            console.error('\n❌ Email sudah terdaftar!');
            process.exit(1);
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Buat admin user
        const adminUser = await prisma.user.create({
            data: {
                nama,
                email,
                password: hashedPassword,
                role: 'admin',
                no_telpon: '-',
                alamat_lengkap: '-',
                kota: '-',
            },
        });

        console.log('\n✅ Admin account berhasil dibuat!');
        console.log('\nDetail Admin:');
        console.log(`  Email: ${adminUser.email}`);
        console.log(`  Nama: ${adminUser.nama}`);
        console.log(`  Role: ${adminUser.role}`);
        console.log(`  ID: ${adminUser.id}`);
        console.log('\n');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        rl.close();
    }
}

main();