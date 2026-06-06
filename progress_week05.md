# Progress Report — Week 5
**Project:** ReWardrobe  

**Branch:** https://github.com/im-Miracleous/rewardrobe/tree/Week05

**Kelompok:**
- 2472008 — Christian Anthony Hermawan
- 2472019 — Miracle Steven Gerrald
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
**Christian (2472008)**
- Menyempurnakan dokumen `README.md` dengan menambahkan perintah alternatif untuk melakukan migration
- Mendokumentasikan progress dalam file `progress_week05.md`

**Miracle (2472019)**
* Fitur: Ditambahkan admin APIs dan pembaharuan UI admin dashboard
* Refaktor (admin): memperbaiki dashboard UI admin + dibuat desain baru admin inventory & campaign page

**Henry (2472029)**
- Memperbaiki *User Experience*: Menukar urutan dropdown kelayakan baju menjadi berurutan Baik-Fair-Buruk, karena sebelumnya Fair-Baik-Buruk agak membingungkan

**Gavin (2472042)**
- Menganalisis alur bisnis dan logika verifikasi seluruh codebase
- Mengimplementasikan logika conditional: donasi tanpa kampanye atau kampanye bebas
  langsung auto-approve; kampanye berequirement masuk antrian verifikasi admin
- Memperbarui seeder untuk demonstrasi semua 6 kasus bisnis