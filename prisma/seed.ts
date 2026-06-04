import 'dotenv/config';
import prisma from '../src/lib/prisma';
import { hashPassword } from '../src/lib/auth';

async function main() {
    const defaultPassword = await hashPassword('password');

    // Delete in FK-dependency order before re-inserting
    await prisma.notifikasi.deleteMany();
    await prisma.logPoin.deleteMany();
    await prisma.pengiriman.deleteMany();
    await prisma.permintaan.deleteMany();
    await prisma.barangDonasi.deleteMany();
    await prisma.partisipasiCampaign.deleteMany();
    await prisma.donasiUang.deleteMany();
    await prisma.campaign.deleteMany();

    // --- Users (upsert) ---
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: { nama: 'Admin Utama', password: defaultPassword, no_telpon: '000000000001', alamat_lengkap: 'Jl. Admin No. 1', kota: 'Jakarta' },
        create: { nama: 'Admin Utama', email: 'admin@example.com', password: defaultPassword, role: 'admin', no_telpon: '000000000001', alamat_lengkap: 'Jl. Admin No. 1', kota: 'Jakarta' },
    });

    await prisma.user.upsert({
        where: { email: 'admin2@example.com' },
        update: { nama: 'Admin Kedua', password: defaultPassword, no_telpon: '000000000002', alamat_lengkap: 'Jl. Admin No. 2', kota: 'Jakarta' },
        create: { nama: 'Admin Kedua', email: 'admin2@example.com', password: defaultPassword, role: 'admin', no_telpon: '000000000002', alamat_lengkap: 'Jl. Admin No. 2', kota: 'Jakarta' },
    });

    const donatur = await prisma.user.upsert({
        where: { email: 'donatur@example.com' },
        update: { nama: 'Budi Santoso', password: defaultPassword, no_telpon: '081234567890', alamat_lengkap: 'Jl. Mawar No. 5', kota: 'Bandung' },
        create: { nama: 'Budi Santoso', email: 'donatur@example.com', password: defaultPassword, role: 'donatur', no_telpon: '081234567890', alamat_lengkap: 'Jl. Mawar No. 5', kota: 'Bandung' },
    });

    const donatur2 = await prisma.user.upsert({
        where: { email: 'donatur2@example.com' },
        update: { nama: 'Siti Rahayu', password: defaultPassword, no_telpon: '081234567891', alamat_lengkap: 'Jl. Melati No. 3', kota: 'Surabaya' },
        create: { nama: 'Siti Rahayu', email: 'donatur2@example.com', password: defaultPassword, role: 'donatur', no_telpon: '081234567891', alamat_lengkap: 'Jl. Melati No. 3', kota: 'Surabaya' },
    });

    const penerima = await prisma.user.upsert({
        where: { email: 'penerima@example.com' },
        update: { nama: 'Panti Asuhan Harapan', password: defaultPassword, tipe: 'panti', no_telpon: '089876543210', alamat_lengkap: 'Jl. Harapan No. 10', kota: 'Yogyakarta' },
        create: { nama: 'Panti Asuhan Harapan', email: 'penerima@example.com', password: defaultPassword, role: 'penerima', tipe: 'panti', no_telpon: '089876543210', alamat_lengkap: 'Jl. Harapan No. 10', kota: 'Yogyakarta' },
    });

    const penerima2 = await prisma.user.upsert({
        where: { email: 'penerima2@example.com' },
        update: { nama: 'Komunitas Peduli Sesama', password: defaultPassword, tipe: 'komunitas', no_telpon: '089876543211', alamat_lengkap: 'Jl. Sosial No. 7', kota: 'Semarang' },
        create: { nama: 'Komunitas Peduli Sesama', email: 'penerima2@example.com', password: defaultPassword, role: 'penerima', tipe: 'komunitas', no_telpon: '089876543211', alamat_lengkap: 'Jl. Sosial No. 7', kota: 'Semarang' },
    });

    // --- Campaigns ---
    const campaign1 = await prisma.campaign.create({
        data: {
            judul: 'Green Wardrobe Challenge',
            deskripsi: 'Tantangan mengumpulkan pakaian katun bekas layak pakai untuk didaur ulang menjadi produk baru bernilai tinggi.',
            target_barang: 50,
            foto_url: 'https://images.unsplash.com/photo-1532453268499-10d8709d098b?auto=format&fit=crop&w=600&q=80',
            status: 'aktif',
        },
    });

    const campaign2 = await prisma.campaign.create({
        data: {
            judul: 'Bantu Korban Banjir Ciliwung',
            deskripsi: 'Mari bantu meringankan beban warga terdampak banjir di bantaran Ciliwung dengan mendonasikan pakaian hangat atau dana logistik.',
            target_dana: 10000000,
            target_barang: 100,
            foto_url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=600&q=80',
            status: 'aktif',
        },
    });

    const campaign3 = await prisma.campaign.create({
        data: {
            judul: 'Dukung Pengrajin Lokal',
            deskripsi: 'Program pemberdayaan pengrajin lokal untuk menjahit ulang pakaian tidak layak pakai menjadi kerajinan tangan. Donasi dana digunakan untuk mesin jahit dan pelatihan.',
            target_dana: 5000000,
            foto_url: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&w=600&q=80',
            status: 'aktif',
        },
    });

    // --- BarangDonasi ---
    const verifiedAt = new Date('2026-05-10T08:00:00Z');

    const barang1 = await prisma.barangDonasi.create({
        data: {
            judul: 'Kemeja Batik Pria',
            deskripsi: 'Kemeja batik motif kawung, ukuran L, kondisi baik',
            kategori: 'atasan_pria',
            berat_kg: 0.5,
            label_ai: 'layak_donasi',
            status: 'disetujui',
            donatur_id: donatur.id,
            verified_by: admin.id,
            verified_at: verifiedAt,
        },
    });

    const barang2 = await prisma.barangDonasi.create({
        data: {
            judul: 'Jaket Denim',
            deskripsi: 'Jaket denim biru, ukuran M, sedikit pudar',
            kategori: 'atasan_pria',
            berat_kg: 0.8,
            label_ai: 'perlu_perbaikan',
            status: 'menunggu_verifikasi',
            donatur_id: donatur.id,
            campaign_id: campaign1.id,
        },
    });

    const barang3 = await prisma.barangDonasi.create({
        data: {
            judul: 'Gaun Pesta',
            deskripsi: 'Gaun pesta warna merah, ukuran S, bekas pakai sekali',
            kategori: 'atasan_wanita',
            berat_kg: 0.6,
            label_ai: 'layak_donasi',
            status: 'tersalurkan',
            donatur_id: donatur2.id,
            verified_by: admin.id,
            verified_at: verifiedAt,
        },
    });

    await prisma.barangDonasi.create({
        data: {
            judul: 'Celana Jeans Sobek',
            deskripsi: 'Celana jeans dengan banyak sobekan besar, tidak layak pakai',
            kategori: 'bawahan',
            berat_kg: 0.7,
            label_ai: 'daur_ulang',
            status: 'ditolak',
            donatur_id: donatur2.id,
            verified_by: admin.id,
            verified_at: verifiedAt,
        },
    });

    // --- Permintaan ---
    await prisma.permintaan.create({
        data: {
            barang_id: barang1.id,
            penerima_id: penerima.id,
            pesan: 'Kami membutuhkan pakaian untuk anak-anak panti usia remaja.',
            status: 'diterima',
        },
    });

    await prisma.permintaan.create({
        data: {
            barang_id: barang3.id,
            penerima_id: penerima.id,
            pesan: 'Untuk acara wisuda anggota komunitas kami.',
            status: 'diterima',
        },
    });

    await prisma.permintaan.create({
        data: {
            barang_id: barang1.id,
            penerima_id: penerima2.id,
            pesan: 'Dibutuhkan untuk kegiatan sosial komunitas.',
            status: 'menunggu',
        },
    });

    // --- Pengiriman ---
    await prisma.pengiriman.create({
        data: {
            barang_id: barang1.id,
            tipe: 'donatur_ke_admin',
            kurir: 'JNE',
            status: 'terkirim',
            resi: 'JNE20260510001',
        },
    });

    await prisma.pengiriman.create({
        data: {
            barang_id: barang3.id,
            tipe: 'donatur_ke_admin',
            kurir: 'GoSend',
            status: 'terkirim',
            resi: 'GS20260510002',
        },
    });

    await prisma.pengiriman.create({
        data: {
            barang_id: barang3.id,
            tipe: 'admin_ke_penerima',
            kurir: 'GrabExpress',
            status: 'terkirim',
            resi: 'GE20260512001',
        },
    });

    // --- LogPoin ---
    await prisma.logPoin.createMany({
        data: [
            { user_id: donatur.id,  poin: 50, keterangan: 'Donasi Kemeja Batik Pria berhasil disetujui' },
            { user_id: donatur2.id, poin: 50, keterangan: 'Donasi Gaun Pesta berhasil tersalurkan' },
            { user_id: donatur.id,  poin: 25, keterangan: 'Bonus donasi pertama' },
        ],
    });

    // --- Notifikasi ---
    await prisma.notifikasi.createMany({
        data: [
            { user_id: donatur.id,  judul: 'Barang Diverifikasi', pesan: 'Kemeja Batik Pria Anda telah disetujui oleh admin.', dibaca: true },
            { user_id: penerima.id, judul: 'Permintaan Diterima', pesan: 'Permintaan Kemeja Batik Pria Anda telah dikonfirmasi.', dibaca: false },
            { user_id: donatur2.id, judul: 'Barang Tersalurkan', pesan: 'Gaun Pesta Anda telah berhasil tersalurkan kepada penerima.', dibaca: false },
        ],
    });

    // --- DonasiUang ---
    await prisma.donasiUang.create({
        data: {
            nominal: 150000,
            bukti_transfer: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
            catatan: 'Semoga membantu untuk pembelian mesin jahit.',
            status: 'disetujui',
            donatur_id: donatur.id,
            campaign_id: campaign3.id,
            verified_by: admin.id,
            verified_at: verifiedAt,
        },
    });

    await prisma.donasiUang.create({
        data: {
            nominal: 50000,
            bukti_transfer: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
            catatan: 'Donasi umum finansial',
            status: 'menunggu_verifikasi',
            donatur_id: donatur2.id,
        },
    });

    // --- PartisipasiCampaign ---
    await prisma.partisipasiCampaign.create({
        data: {
            user_id: donatur.id,
            campaign_id: campaign1.id,
        },
    });

    await prisma.partisipasiCampaign.create({
        data: {
            user_id: donatur.id,
            campaign_id: campaign3.id,
        },
    });

    console.log('Seed selesai: 6 users, 4 barang_donasi, 3 permintaan, 3 pengiriman, 3 log_poin, 3 notifikasi, 3 campaigns, 2 donasi_uang');
}

main()
    .catch((error) => {
        console.error('Seed gagal:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
