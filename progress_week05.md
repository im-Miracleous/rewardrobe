# Progress Report — Week 4
**Project:** ReWardrobe  

**Branch:** https://github.com/im-Miracleous/rewardrobe/tree/Week05

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

**Christian (2472008)**

**Henry (2472029)**

**Gavin (2472042)**
