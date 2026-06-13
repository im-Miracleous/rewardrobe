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

    const verifiedAt = new Date('2026-05-10T08:00:00Z');

    // --- BarangDonasi ---

    // [KASUS 1] Sudah dijemput admin (terkirim) → MUNCUL di katalog penerima
    const barang1 = await prisma.barangDonasi.create({
        data: {
            judul: 'Kemeja Batik Pria',
            deskripsi: 'Kondisi menurut donatur: baik\n\nCatatan: Ukuran L, motif kawung',
            kondisi_user: 'baik',
            kategori: 'Kemeja',
            berat_kg: 0.5,
            status: 'terkirim',
            donatur_id: donatur.id,
            verified_by: admin.id,
            verified_at: verifiedAt,
        },
    });

    // [KASUS 2] Sudah dijemput admin (terkirim) → MUNCUL di katalog penerima
    const barang2 = await prisma.barangDonasi.create({
        data: {
            judul: 'Kain Perca Campur',
            deskripsi: 'Kondisi menurut donatur: fair\n\nCatatan: Campuran berbagai kain, cocok untuk kerajinan',
            kondisi_user: 'fair',
            kategori: 'Lainnya',
            berat_kg: 1.2,
            status: 'terkirim',
            donatur_id: donatur.id,
            verified_by: admin.id,
            verified_at: verifiedAt,
        },
    });

    // [KASUS 3] Baru didonasikan, BELUM dijemput → menunggu pengiriman → TIDAK muncul di katalog
    const barang3 = await prisma.barangDonasi.create({
        data: {
            judul: 'Gaun Pesta',
            deskripsi: 'Kondisi menurut donatur: baik\n\nCatatan: Warna merah, ukuran S, bekas pakai sekali',
            kondisi_user: 'baik',
            kategori: 'Atasan Wanita',
            berat_kg: 0.6,
            status: 'menunggu_pengiriman',
            donatur_id: donatur2.id,
        },
    });

    // [KASUS 4] Baru didonasikan, BELUM dijemput → menunggu pengiriman
    const barang4 = await prisma.barangDonasi.create({
        data: {
            judul: 'Jaket Fleece',
            deskripsi: 'Kondisi menurut donatur: baik\n\nCatatan: Jaket fleece tebal, ukuran XL, sangat hangat',
            kondisi_user: 'baik',
            kategori: 'Jaket',
            berat_kg: 0.9,
            status: 'menunggu_pengiriman',
            donatur_id: donatur.id,
        },
    });

    // [KASUS 5] Donasi ditolak admin
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

    // barang3 & barang4: belum dijemput (disiapkan) → menunggu pengiriman, TIDAK muncul di katalog
    await prisma.pengiriman.create({
        data: { barang_id: barang3.id, tipe: 'donatur_ke_admin', status: 'disiapkan' },
    });
    await prisma.pengiriman.create({
        data: { barang_id: barang4.id, tipe: 'donatur_ke_admin', status: 'disiapkan' },
    });

    // --- BarangDonasi Tambahan (Pakaian dari Unsplash) ---
    const pakaianDummies = [
        { judul: 'Kemeja Flannel Pria', deskripsi: 'Kemeja kotak-kotak lengan panjang.', kategori: 'Pakaian Pria', berat_kg: 0.5, foto_url: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=600&q=80', label_ai: 'layak_donasi' },
        { judul: 'Kaos Polos Putih', deskripsi: 'Kaos cotton combed 30s warna putih.', kategori: 'Pakaian Pria', berat_kg: 0.2, foto_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80', label_ai: 'layak_donasi' },
        { judul: 'Jaket Denim Vintage', deskripsi: 'Jaket denim tebal model lama.', kategori: 'Pakaian Pria', berat_kg: 1.2, foto_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80', label_ai: 'layak_donasi' },
        { judul: 'Dress Wanita Motif Bunga', deskripsi: 'Dress katun cantik untuk acara santai.', kategori: 'Pakaian Wanita', berat_kg: 0.4, foto_url: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600&q=80', label_ai: 'layak_donasi' },
        { judul: 'Sweater Hoodie Abu-abu', deskripsi: 'Hoodie tebal dan hangat.', kategori: 'Pakaian Unisex', berat_kg: 0.8, foto_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80', label_ai: 'layak_donasi' },
        { judul: 'Celana Jeans Biru', deskripsi: 'Jeans panjang ukuran 32.', kategori: 'Pakaian Pria', berat_kg: 0.9, foto_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80', label_ai: 'layak_donasi' },
        { judul: 'Pakaian Bayi Set', deskripsi: 'Baju dan celana bayi usia 6-12 bulan.', kategori: 'Pakaian Anak', berat_kg: 0.3, foto_url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&q=80', label_ai: 'layak_donasi' },
        { judul: 'Kemeja Kerja Wanita', deskripsi: 'Kemeja polos bahan jatuh.', kategori: 'Pakaian Wanita', berat_kg: 0.3, foto_url: 'https://images.unsplash.com/photo-1599566219227-2efe0c9b7f5f?w=600&q=80', label_ai: 'layak_donasi' },
        { judul: 'Seragam Sekolah SD', deskripsi: 'Seragam merah putih ukuran anak kelas 3 SD.', kategori: 'Pakaian Anak', berat_kg: 0.4, foto_url: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=600&q=80', label_ai: 'layak_donasi' },
        { judul: 'Blazer Navy Elegan', deskripsi: 'Blazer wanita warna navy, kondisi 90%.', kategori: 'Pakaian Wanita', berat_kg: 0.6, foto_url: 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?w=600&q=80', label_ai: 'layak_donasi' }
    ] as const;

    for (const [index, p] of pakaianDummies.entries()) {
        const bd = await prisma.barangDonasi.create({
            data: {
                judul: p.judul,
                deskripsi: p.deskripsi,
                kondisi_user: 'baik',
                kategori: p.kategori,
                berat_kg: p.berat_kg,
                foto_url: p.foto_url,
                label_ai: p.label_ai as any,
                status: 'terkirim', // Supaya muncul di katalog
                donatur_id: donatur.id,
                verified_by: admin.id,
                verified_at: verifiedAt,
            }
        });

        await prisma.pengiriman.create({
            data: {
                barang_id: bd.id,
                tipe: 'donatur_ke_admin',
                kurir: 'JNE',
                status: 'terkirim',
                resi: `DUMMY${20260510003 + index}`
            }
        });
    }

    // --- Permintaan (sample) ---
    await prisma.permintaan.create({
        data: {
            barang_id: barang1.id,
            penerima_id: penerima.id,
            pesan: 'Kami membutuhkan pakaian untuk anak-anak panti usia remaja.',
            status: 'menunggu',
        },
    });

    // --- LogPoin ---
    await prisma.logPoin.createMany({
        data: [
            { user_id: donatur.id,  poin: 50, keterangan: 'Donasi Kemeja Batik Pria berhasil diterima' },
            { user_id: donatur.id,  poin: 25, keterangan: 'Bonus donasi pertama' },
            { user_id: donatur2.id, poin: 30, keterangan: 'Donasi Kain Perca berhasil diterima' },
        ],
    });

    // --- Notifikasi ---
    await prisma.notifikasi.createMany({
        data: [
            { user_id: donatur.id,  judul: 'Barang Diterima', pesan: 'Kemeja Batik Pria Anda telah diterima di gudang ReWardrobe.', dibaca: true },
            { user_id: penerima.id, judul: 'Permintaan Terkirim', pesan: 'Permintaan Kemeja Batik Pria Anda sedang diproses.', dibaca: false },
        ],
    });

    console.log('✅ Seed selesai:');
    console.log('   Users: admin, donatur, donatur2, penerima (panti), penerima2 (komunitas), pengrajin');
    console.log('   BarangDonasi: 15 item (12 di katalog/terkirim, 2 menunggu pengiriman, 1 ditolak)');
    console.log('   Katalog penerima: kemeja batik + kain perca + 10 pakaian Unsplash (sudah dijemput)');
}

main()
    .catch((error) => {
        console.error('Seed gagal:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
