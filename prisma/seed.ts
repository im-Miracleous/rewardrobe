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

    // --- Users ---
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: { nama: 'Admin Utama', password: defaultPassword, no_telpon: '000000000001', alamat_lengkap: 'Jl. Admin No. 1', kota: 'Jakarta' },
        create: { nama: 'Admin Utama', email: 'admin@example.com', password: defaultPassword, role: 'admin', no_telpon: '000000000001', alamat_lengkap: 'Jl. Admin No. 1', kota: 'Jakarta' },
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

    await prisma.user.upsert({
        where: { email: 'pengrajin@example.com' },
        update: { nama: 'Kelompok Pengrajin Batik', password: defaultPassword, tipe: 'pengrajin', no_telpon: '089876543212', alamat_lengkap: 'Jl. Kerajinan No. 2', kota: 'Solo' },
        create: { nama: 'Kelompok Pengrajin Batik', email: 'pengrajin@example.com', password: defaultPassword, role: 'penerima', tipe: 'pengrajin', no_telpon: '089876543212', alamat_lengkap: 'Jl. Kerajinan No. 2', kota: 'Solo' },
    });

    // --- Campaigns ---
    // Kampanye 1: Pengrajin — bebas tipe pakaian, TIDAK perlu verifikasi
    const campaign1 = await prisma.campaign.create({
        data: {
            judul: 'Green Wardrobe Challenge',
            deskripsi: 'Tantangan mengumpulkan pakaian katun bekas untuk didaur ulang menjadi produk baru oleh pengrajin lokal.',
            target_barang: 50,
            status: 'aktif',
            verification_required: false,
            // requirement null = bebas tipe pakaian
        },
    });

    // Kampanye 2: Bantu Korban — ADA requirement, PERLU verifikasi admin
    const campaign2 = await prisma.campaign.create({
        data: {
            judul: 'Bantu Korban Banjir Ciliwung',
            deskripsi: 'Bantu warga terdampak banjir di bantaran Ciliwung dengan mendonasikan pakaian hangat yang layak pakai.',
            target_dana: 10000000,
            target_barang: 100,
            status: 'aktif',
            requirement: 'Pakaian harus bersih, tidak sobek, dan layak pakai. Diutamakan pakaian hangat (jaket, sweater, celana panjang). Pakaian dalam tidak diterima.',
            verification_required: true,
        },
    });

    // Kampanye 3: Pengrajin Lokal — bebas, TIDAK perlu verifikasi
    const campaign3 = await prisma.campaign.create({
        data: {
            judul: 'Dukung Pengrajin Lokal',
            deskripsi: 'Program pemberdayaan pengrajin lokal untuk menjahit ulang pakaian tidak layak pakai menjadi kerajinan tangan.',
            target_dana: 5000000,
            status: 'aktif',
            verification_required: false,
        },
    });

    const verifiedAt = new Date('2026-05-10T08:00:00Z');

    // --- BarangDonasi ---

    // [KASUS 1] Donasi bebas (tanpa kampanye) → auto disetujui, sudah dijemput → MUNCUL di katalog
    const barang1 = await prisma.barangDonasi.create({
        data: {
            judul: 'Kemeja Batik Pria',
            deskripsi: 'Kondisi menurut donatur: baik\n\nCatatan: Ukuran L, motif kawung',
            kondisi_user: 'baik',
            kategori: 'Kemeja',
            berat_kg: 0.5,
            status: 'disetujui',
            donatur_id: donatur.id,
            verified_by: admin.id,
            verified_at: verifiedAt,
        },
    });

    // [KASUS 2] Donasi ke kampanye pengrajin (verification_required: false) → auto disetujui, sudah dijemput → MUNCUL di katalog
    const barang2 = await prisma.barangDonasi.create({
        data: {
            judul: 'Kain Perca Campur',
            deskripsi: 'Kondisi menurut donatur: fair\n\nCatatan: Campuran berbagai kain, cocok untuk kerajinan',
            kondisi_user: 'fair',
            kategori: 'Lainnya',
            berat_kg: 1.2,
            status: 'disetujui',
            donatur_id: donatur.id,
            campaign_id: campaign1.id,
        },
    });

    // [KASUS 3] Donasi bebas, sudah disetujui tapi BELUM dijemput → TIDAK muncul di katalog (Opsi B)
    const barang3 = await prisma.barangDonasi.create({
        data: {
            judul: 'Gaun Pesta',
            deskripsi: 'Kondisi menurut donatur: baik\n\nCatatan: Warna merah, ukuran S, bekas pakai sekali',
            kondisi_user: 'baik',
            kategori: 'Atasan Wanita',
            berat_kg: 0.6,
            status: 'disetujui',
            donatur_id: donatur2.id,
        },
    });

    // [KASUS 4] Donasi ke kampanye BEREQUIREMENT → menunggu verifikasi → MUNCUL di halaman verifikasi admin
    const barang4 = await prisma.barangDonasi.create({
        data: {
            judul: 'Jaket Fleece',
            deskripsi: 'Kondisi menurut donatur: baik\n\nCatatan: Jaket fleece tebal, ukuran XL, sangat hangat',
            kondisi_user: 'baik',
            kategori: 'Jaket',
            berat_kg: 0.9,
            status: 'menunggu_verifikasi',
            donatur_id: donatur.id,
            campaign_id: campaign2.id,
        },
    });

    // [KASUS 4b] Donasi lain ke kampanye berequirement → menunggu verifikasi
    const barang5 = await prisma.barangDonasi.create({
        data: {
            judul: 'Celana Panjang Katun',
            deskripsi: 'Kondisi menurut donatur: fair\n\nCatatan: Celana panjang abu-abu, ukuran 32',
            kondisi_user: 'fair',
            kategori: 'Celana',
            berat_kg: 0.7,
            status: 'menunggu_verifikasi',
            donatur_id: donatur2.id,
            campaign_id: campaign2.id,
        },
    });

    // [KASUS 5] Donasi ditolak
    await prisma.barangDonasi.create({
        data: {
            judul: 'Celana Jeans Sobek',
            deskripsi: 'Kondisi menurut donatur: rusak\n\nALASAN PENOLAKAN: Terlalu banyak sobekan, tidak layak pakai maupun didaur ulang',
            kondisi_user: 'rusak',
            kategori: 'Celana',
            berat_kg: 0.7,
            status: 'ditolak',
            donatur_id: donatur2.id,
            verified_by: admin.id,
            verified_at: verifiedAt,
        },
    });

    // --- Pengiriman ---
    // barang1: sudah dijemput → muncul di katalog
    await prisma.pengiriman.create({
        data: { barang_id: barang1.id, tipe: 'donatur_ke_admin', kurir: 'JNE', status: 'terkirim', resi: 'JNE20260510001' },
    });

    // barang2: sudah dijemput → muncul di katalog
    await prisma.pengiriman.create({
        data: { barang_id: barang2.id, tipe: 'donatur_ke_admin', kurir: 'GoSend', status: 'terkirim', resi: 'GS20260510002' },
    });

    // barang3: belum dijemput (disiapkan) → TIDAK muncul di katalog — demonstrasi Opsi B
    await prisma.pengiriman.create({
        data: { barang_id: barang3.id, tipe: 'donatur_ke_admin', status: 'disiapkan' },
    });

    // barang4 & barang5: masih menunggu verifikasi, belum ada pengiriman

    // --- Permintaan (sample) ---
    await prisma.permintaan.create({
        data: {
            barang_id: barang1.id,
            penerima_id: penerima.id,
            pesan: 'Kami membutuhkan pakaian untuk anak-anak panti usia remaja.',
            status: 'menunggu',
        },
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

    // Donasi uang menunggu verifikasi → muncul di halaman verifikasi admin
    await prisma.donasiUang.create({
        data: {
            nominal: 75000,
            bukti_transfer: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
            catatan: 'Untuk logistik korban banjir',
            status: 'menunggu_verifikasi',
            donatur_id: donatur2.id,
            campaign_id: campaign2.id,
        },
    });

    // --- LogPoin ---
    await prisma.logPoin.createMany({
        data: [
            { user_id: donatur.id,  poin: 50, keterangan: 'Donasi Kemeja Batik Pria berhasil disetujui' },
            { user_id: donatur.id,  poin: 25, keterangan: 'Bonus donasi pertama' },
            { user_id: donatur2.id, poin: 30, keterangan: 'Donasi Kain Perca berhasil disetujui' },
        ],
    });

    // --- Notifikasi ---
    await prisma.notifikasi.createMany({
        data: [
            { user_id: donatur.id,  judul: 'Barang Disetujui', pesan: 'Kemeja Batik Pria Anda telah disetujui oleh admin.', dibaca: true },
            { user_id: penerima.id, judul: 'Permintaan Terkirim', pesan: 'Permintaan Kemeja Batik Pria Anda sedang diproses.', dibaca: false },
        ],
    });

    // --- PartisipasiCampaign ---
    await prisma.partisipasiCampaign.createMany({
        data: [
            { user_id: donatur.id, campaign_id: campaign1.id },
            { user_id: donatur.id, campaign_id: campaign2.id },
            { user_id: donatur2.id, campaign_id: campaign2.id },
        ],
    });

    console.log('✅ Seed selesai:');
    console.log('   Users: admin, donatur, donatur2, penerima (panti), penerima2 (komunitas), pengrajin');
    console.log('   Campaigns: 3 (1 perlu verifikasi, 2 bebas)');
    console.log('   BarangDonasi: 6 item (2 di katalog, 1 belum dijemput, 2 menunggu verifikasi, 1 ditolak)');
    console.log('   Verifikasi admin: jaket fleece + celana panjang (pakaian) + donasi uang Rp75rb');
    console.log('   Katalog penerima: kemeja batik + kain perca (sudah dijemput)');
}

main()
    .catch((error) => {
        console.error('Seed gagal:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
