# Progress Report — Week 4
**Project:** ReWardrobe  

**Branch:** https://github.com/im-Miracleous/rewardrobe/tree/Week04

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
- **Fitur (donatur)**: Improve donation forms and financial history detail UI
* **Fitur**: refine Donatur dashboard with statistical analysis and recharts visualization
* **Fitur**: implement dynamic detail view pages for clothing and monetary donation history
* **Perbaikan**: repaired impact dashboard campaign detail page linking + migrating to use table in Donation History page
* **Fitur**: implement profile management settings template and dashboard layout structure
* **Fitur**: implement user management API and role-based sidebar with profile settings interface
* **Docs**: add guide for updating code and performing database migrations to README

**Christian (2472008)**
- Melaporkan progress yang telah dikerjakan dalam file `progress_week04.md`
- Melakukan review branch `Week03-2472019` lalu merge dengan branch `Week03`, setelah itu melakukan merge branch `Week03` dengan `main`, kemudian membuat branch `Week04` dari branch `main`

**Henry (2472029)**
- Melakukan evaluasi terhadap fitur yang telah diimplementasikan berdasarkan perspektif *User Experience*
	- Kolom **Nama** seharusnya tidak ada atau opsional karena produk yang didonasikan kemungkinan besar tidak akan dinamakan oleh donatur
	- Kolom **Berat** seharusnya tidak ada atau opsional karena donatur belum tentu mengetahui berat barang yang akan didonasikannya
	- Penilaian produk donasi oleh _user_, bukan _admin_. _Admin_ hanya untuk moderasi jika terjadi komplain atau kendala teknis lainnya
		- Karena Penentu apakah produk tersebut layak untuk dipakai kembali atau tidak adalah Penerima/User, bukan Admin
		- Bisa aja Penerima/User akan ingin tetap menerima produk (misalnya) dengan merek yang oke meskipun compang-camping.
-  Memastikan bahwa *tools* dan *framework* yang digunakan telah sesuai dengan kebutuhan

**Gavin (2472042)**
- Melakukan *software testing*