# Progress Report — Week 1
**Project:** ReWardrobe  
**Periode:** Week 1  
**Kelompok:**
- 2472008 — Christian Anthony Hermawan
- 2472042 — Gavin Malik Setiawan
- 2472019 — Miracle Steven Gerrald
- 2472029 — Henry Ferdynand Budiana

---

## Background

Industri fashion global menghasilkan jutaan ton limbah tekstil setiap tahunnya. Di Indonesia, banyak pakaian layak pakai dibuang begitu saja karena tidak adanya platform yang memudahkan proses donasi secara terstruktur. Di sisi lain, panti asuhan, komunitas, dan pengrajin membutuhkan akses terhadap pakaian bekas yang masih bisa digunakan atau didaur ulang.

**ReWardrobe** hadir sebagai platform digital yang menghubungkan donatur pakaian dengan penerima yang membutuhkan, dilengkapi sistem penilaian kondisi berbasis AI, manajemen pengiriman, dan pelacakan dampak lingkungan. Platform ini bertujuan mengurangi limbah tekstil sekaligus memastikan setiap pakaian tersalurkan ke pihak yang paling membutuhkan.

---

## Design Patterns Used

### 1. Factory Method Pattern — Manajemen Akun & Role
Satu interface registrasi menghasilkan objek `User` yang berbeda sesuai role yang dipilih: `AdminUser`, `DonaturUser`, atau `PenerimaUser` (dengan subtipe panti / komunitas / pengrajin). Penerapan ini mengikuti **Single Responsibility Principle** sehingga logika pembuatan setiap tipe user terpusat dan penambahan role baru tidak merusak kode yang sudah berjalan.

### 2. Observer Pattern — Sistem Notifikasi Real-time
`barang_donasi` bertindak sebagai **Publisher**, sedangkan `users` (Donatur & Penerima) bertindak sebagai **Subscriber**. Setiap kali status barang berubah, sistem otomatis mengirim notifikasi ke semua pengguna yang relevan tanpa ketergantungan langsung antar komponen (*loose coupling*).

---

## Features Implemented — Week 1

### Login & Autentikasi
- Form login dengan validasi email dan password
- Autentikasi berbasis role (Admin / Donatur / Penerima)
- Session management setelah login berhasil
- Redirect otomatis ke dashboard sesuai role masing-masing pengguna

---

## Current Progress

> _Bagian ini diisi oleh masing-masing anggota sesuai progress aktual._

| NIM | Nama | Task | Status | Catatan |
|---|---|---|---|---|
| 2472008 | Christian Anthony Hermawan | — | — | — |
| 2472042 | Gavin Malik Setiawan | — | — | — |
| 2472019 | Miracle Steven Gerrald | — | — | — |
| 2472029 | Henry Ferdynand Budiana | — | — | — |

**Status legend:** `Not Started` · `In Progress` · `Done` · `Blocked`

---

## Notes & Blockers

> _Tulis kendala, pertanyaan, atau hal yang perlu didiskusikan di sini._

-

