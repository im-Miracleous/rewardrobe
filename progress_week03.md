# Progress Report — Week 3
**Project:** ReWardrobe  

**Branch:** https://github.com/im-Miracleous/rewardrobe/tree/Week03-2472042

**Kelompok:**
- 2472019 — Miracle Steven Gerrald (Ketua)
- 2472008 — Christian Anthony Hermawan
- 2472029 — Henry Ferdynand Budiana
- 2472042 — Gavin Malik Setiawan


## Tools Used
- Claude (Haiku/Sonnet)

## Background

Industri fashion global menghasilkan jutaan ton limbah tekstil setiap tahunnya. Di Indonesia, banyak pakaian layak pakai dibuang begitu saja karena tidak adanya platform yang memudahkan proses donasi secara terstruktur. Di sisi lain, panti asuhan, komunitas, dan pengrajin membutuhkan akses terhadap pakaian bekas yang masih bisa digunakan atau didaur ulang.

**ReWardrobe** adalah aplikasi yang menghubungkan donatur pakaian dengan penerima yang membutuhkan, manajemen pengiriman, dan pelacakan dampak lingkungan. Platform ini bertujuan mengurangi limbah tekstil sekaligus memastikan setiap pakaian tersalurkan ke pihak yang paling membutuhkan.

---

## Design Patterns Used

### 1. Factory Method Pattern — Manajemen Akun & Role
Satu interface registrasi menghasilkan objek `User` yang berbeda sesuai role yang dipilih: `AdminUser`, `DonaturUser`, atau `PenerimaUser` (dengan subtipe panti / komunitas / pengrajin). Penerapan ini mengikuti **Single Responsibility Principle** sehingga logika pembuatan setiap tipe user terpusat dan penambahan role baru tidak merusak kode yang sudah berjalan.

### 2. Observer Pattern — Sistem Notifikasi Real-time
`barang_donasi` bertindak sebagai **Publisher**, sedangkan `users` (Donatur & Penerima) bertindak sebagai **Subscriber**. Setiap kali status barang berubah, sistem otomatis mengirim notifikasi ke semua pengguna yang relevan tanpa ketergantungan langsung antar komponen (*loose coupling*).


## Current Progress
**Miracle (2472019)**

- Menyesuaikan dashboard admin agar mengikuti alur penjemputan barang, bukan verifikasi manual satu per satu.
- Menghapus kolom status dan aksi setujui/tolak pada antrian admin supaya tampilan lebih fokus ke informasi donasi masuk.
- Menghilangkan placeholder nama "Donasi tanpa nama" dan merapikan label tabel menjadi lebih relevan dengan tipe pakaian serta kondisi pakaian.
- Memperbarui sidebar admin dari menu "Verifikasi Barang" menjadi "Penjemputan Barang" agar sesuai dengan proses operasional yang baru.
- Menyesuaikan ikon menu sidebar supaya lebih semantik dengan fungsi masing-masing menu.

**Christian (2472008)**

- Menyempurnakan `README.md` dengan penambahan instruksi seeding database
- Implementasi fitur tambah donasi untuk donatur (form + validasi dasar)
- Integrasi form donasi ke API `/api/barang-donasi`
- Menambahkan validasi agar field wajib tidak bisa dikosongkan
- Menambahkan fitur upload gambar untuk bukti donasi
- Menampilkan preview gambar sebelum submit

**Henry (2472029)**

- Mengidentifikasi seluruh kode yang di-generate AI di codebase Week 2 dan Week 3
- Menambahkan CodeCite citation ke 11 file source code sebagai dokumentasi referensi AI
- Mendokumentasikan file-file berikut: middleware, auth API routes, auth utilities, barang-donasi API routes, form donasi, admin dashboard, Prisma schema, dan seed script

**Gavin (2472042)**

- Menambahkan Prisma schema untuk sistem donasi (BarangDonasi, Permintaan, Pengiriman, LogPoin, Notifikasi)
- Menjalankan migrasi awal Prisma untuk PostgreSQL
- Mengimplementasikan seed script dengan data user dan contoh donasi
- Menambahkan API BarangDonasi (POST, GET, PATCH) dengan validasi Zod
- Menghubungkan API dengan database Prisma
- Menyusun struktur dasar backend agar siap digunakan oleh frontend