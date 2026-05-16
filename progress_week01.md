# Progress Report — Week 1
**Project:** ReWardrobe  
**Periode:** Week 1  
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

## Features Implemented — Week 1

### Inisiasi Project
- Inisiasi project web app dengan teknologi Next.js (frontend) dan Node.js (backend).
- Membuat template awal website secara static (mockup design) untuk Landing page, halaman Autentikasi (Login + Register), dan Dashboard berdasarkan role.

#### Notes:
Untuk mengakses desain awal dari halaman Dashboard, silahkan login dengan kredensial berikut:
1. Admin -> Email: admin@example.com
2. Donatur -> Email: donatur@example.com
3. Penerima -> Email: penerima@example.com

**PS:**
- Semua akun dummy menggunakan password: `password`.
- Karena website masih bersifat static, proses authentication disini masih *hard-coded*. Implementasi yang benar akan dilakukan di tahap selanjutnya, seiring perkembangan website.

---

## Current Progress

> _Bagian ini diisi oleh masing-masing anggota sesuai progress real-time._

| NRP | Nama | Task | Status |
|---|---|---|---|
| 2472019 | Miracle Steven Gerrald | Inisiasi project dengan teknologi `Next.js` (frontend) & `Node.js` (backend) | Done |
| 2472008 | Christian Anthony Hermawan | Merancang struktur pola desain & membuat daftar fitur pada `Fitur.md`| Done |
| 2472029 | Henry Ferdynand Budiana | Membuat `progress_week01.md` | Done |
| 2472042 | Gavin Malik Setiawan | Membuat `README.md` | Done |

**Status legend:** `Not Started` · `In Progress` · `Done` · `Blocked`

---

