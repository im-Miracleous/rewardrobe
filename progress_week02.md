# Progress Report — Week 2
**Project:** ReWardrobe  
**Kelompok:**
- 2472019 — Miracle Steven Gerrald (Ketua)
- 2472008 — Christian Anthony Hermawan
- 2472029 — Henry Ferdynand Budiana
- 2472042 — Gavin Malik Setiawan

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

## Features Implemented — Week 2

Implementasi Authentication System
Membangun sistem autentikasi lengkap mencakup API routes untuk login, register, dan logout (`/api/auth/login`, `/api/auth/register`, `/api/auth/logout`), password hashing menggunakan bcryptjs, serta session management via cookies.
Menambahkan middleware (`middleware.ts`) untuk proteksi route `/dashboard/*` berdasarkan role, beserta role-based redirection setelah login.
Menyiapkan Prisma ORM dengan PostgreSQL (schema `User`, enum role, migration SQL), seed file untuk default users, dan script CLI `scripts/create-admin.js` untuk pembuatan admin tanpa melalui website.
Melanjutkan pengembangan frontend mockup (static HTML) dari minggu sebelumnya.

Notes:
Dokumentasi lengkap tersedia di `README.md` dan `SETUP.md`, mencakup database setup, auth flow, API usage, dan troubleshooting.

PS:
Untuk login, gunakan kredensial berikut (semua akun menggunakan password: `password`):
- **Admin** → Email: `admin@example.com`
- **Donatur** → Email: `donatur@example.com`
- **Penerima** → Email: `penerima@example.com`

---

## Current Progress

| NRP     | Nama                       | Task                                                                         | Status      |
| ------- | -------------------------- | ---------------------------------------------------------------------------- | ----------- |
| 2472019 | Miracle Steven Gerrald     | Authentication system, database setup, middleware, dokumentasi               | Done        |
| 2472008 | Christian Anthony Hermawan | Software testing, perbaikan branch dengan mengembalikan `progress_week01.md`, sedikit memperjelas `README.md` | In Progress |
| 2472029 | Henry Ferdynand Budiana    | Modifikasi `progress_week02.md`                                              | Done        |
| 2472042 | Gavin Malik Setiawan       | Frontend mockup (HTML static page)                                           | In Progress |

**Status legend:** `Not Started` · `In Progress` · `Done` · `Blocked`

---

