# ReWardrobe

Platform ekonomi sirkular berbasis komunitas untuk donasi, daur ulang, dan manajemen limbah tekstil.

**Deskripsi:** Platform Ekonomi Sirkular untuk Donasi, Daur Ulang, dan Manajemen Limbah Tekstil Berbasis Komunitas

**Tim Pengembang:**
* 2472008 - Christian Anthony Hermawan
* 2472019 - Miracle Steven Gerrald
* 2472029 - Henry Ferdynand Budiana
* 2472042 - Gavin Malik Setiawan

Jika sebelumnya telah melakukan setup, Untuk menjalankan aplikasi, eksekusi command berikut:
```bash
npm run dev
```

Buka browser di alamat [http://localhost:3000](http://localhost:3000) untuk melihat hasilnya.

## Database Setup

ReWardrobe menggunakan Prisma ORM untuk terhubung ke PostgreSQL. Pastikan PostgreSQL sudah aktif sebelum menjalankan app.

Catatan: proyek ini memakai Prisma 7, jadi Prisma Client perlu PostgreSQL driver adapter (`@prisma/adapter-pg`) saat runtime.

### 1. Siapkan file `.env`

Buat file `.env` di root project, lalu isi dengan connection string PostgreSQL yang valid.

Contoh untuk PostgreSQL lokal:

```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/rewardrobe_db?schema=public"
```

Catatan:

* Ganti `password` sesuai password PostgreSQL kamu.
* Pastikan database `rewardrobe_db` sudah dibuat.
* Jika pakai Docker atau server remote, ganti `localhost` dan port sesuai host database yang benar.

### 2. Install dependency

```bash
npm install
```

Jika perlu, generate ulang Prisma Client dengan:

```bash
npx prisma generate
```

### 3. Jalankan migration & seed

```bash
npm run db:fresh
```

> Perintah ini mereset database, menjalankan semua migration, dan mengisi sample data sekaligus.

### 4. Jalankan aplikasi

```bash
npm run dev
```

Lalu buka:

* [http://localhost:3000](http://localhost:3000) untuk halaman utama.
* [http://localhost:3000/db-check](http://localhost:3000/db-check) untuk test koneksi database.

### Endpoint API untuk test database

Endpoint berikut mengecek status DB secara otomatis dan bisa dipakai dari frontend dengan polling:

```bash
GET /api/db-status
```

Contoh response berhasil:

```json
{
    "connected": true,
    "latencyMs": 12,
    "userCount": 0,
    "message": "Prisma bisa terhubung ke PostgreSQL dan membaca tabel User.",
    "checkedAt": "2026-05-15T03:21:00.000Z"
}
```

### Route CRUD User

Untuk menguji operasi baca/tulis ke tabel `users`, gunakan route berikut:

```bash
GET /api/users
POST /api/users
GET /api/users/:id
PATCH /api/users/:id
DELETE /api/users/:id
```

Contoh `POST` untuk membuat user test:

```bash
curl -X POST http://localhost:3000/api/users \
    -H "Content-Type: application/json" \
    -d '{"nama":"Test User","email":"test@example.com","password":"password","role":"donatur"}'
```

Contoh `GET` untuk melihat semua user:

```bash
curl http://localhost:3000/api/users | npx json
```

Contoh `PATCH` untuk update user:

```bash
curl -X PATCH http://localhost:3000/api/users/1 \
    -H "Content-Type: application/json" \
    -d '{"kota":"Bandung"}'
```

Contoh `DELETE` untuk hapus user:

```bash
curl -X DELETE http://localhost:3000/api/users/1
```

### 5. Verifikasi tambahan

Jika ingin cek isi database secara visual:

```bash
npx prisma studio
```

Jika halaman `db-check` menampilkan status `Connected`, berarti Next.js app sudah berhasil terhubung ke PostgreSQL lewat Prisma.

## Update Kode & Migrasi Database

Jika ada pembaruan kode dari repositori (terdapat fitur baru atau pembaruan struktur database), ikuti langkah-langkah berikut agar aplikasi dapat berjalan dengan lancar:

### 1. Pull Pembaruan Kode
Pastikan Anda berada di branch utama (misal: `main`) dan ambil perubahan terbaru dengan Git:
```bash
git pull origin main
```

### 2. Install/Update Dependency
Jika terdapat penambahan atau perubahan pada file `package.json`, Anda harus menginstal dependensi terbaru:
```bash
npm install
```

### 3. Migrasi Database (Jika ada perubahan skema)
Jika update tersebut berisi perubahan pada `prisma/schema.prisma`, maka struktur database lokal Anda harus diselaraskan. Jalankan:
```bash
npx prisma migrate dev
```
*Catatan:* Command ini akan menyinkronkan database dengan skema terbaru dan secara otomatis menjalankan `npx prisma generate` untuk memperbarui Prisma Client.

### 4. Jalankan Aplikasi
Setelah kode dan database tersinkronisasi, jalankan aplikasi seperti biasa:
```bash
npm run dev
```

---

## 👀 Problem

* **Kebingungan Kelayakan Pakaian:** Seringkali donatur bingung menentukan apakah baju mereka masih layak pakai atau tidak, yang berisiko membuat sampah tekstil rusak masuk ke jalur donasi pakaian layak.
* **Kurangnya Edukasi Manajemen Limbah:** Masyarakat masih minim edukasi bahwa pakaian yang sudah rusak sebaiknya didaur ulang, bukan dibuang ke tempat sampah biasa.
* **Kendala Biaya Logistik & Jejak Karbon:** Proses donasi pakaian sering terhambat oleh ongkos kirim yang mahal, serta pengiriman jarak jauh yang meningkatkan jejak karbon transportasi.
* **Kurangnya Transparansi & Kepercayaan:** Dalam ekosistem donasi sosial, kepercayaan adalah kunci. Saat ini, seringkali tidak ada pelacakan jelas yang membuktikan bahwa pakaian donasi tidak berakhir begitu saja di tempat pembuangan akhir (TPA).
* **Manajemen Operasional yang Rumit:** Pengelolaan siklus hidup tekstil secara manual, pelacakan inventori fisik tanpa standar, serta kerumitan integrasi dengan berbagai vendor logistik membebani sistem operasional.

---

## ☁️ Proposal

* **Solusi Utama:** ReWardrobe diusulkan sebagai platform terpadu yang memisahkan akses pengguna menjadi Donatur, Penerima (Komunitas/Panti), dan Admin untuk menciptakan ekosistem donasi yang aman, terverifikasi, dan termoderasi.
* **Smart Posting & Moderasi:** Donatur mengisi kondisi barang secara mandiri sebelum barang masuk ke antrian moderasi admin. Sistem fokus pada proses yang ringan dan realistis, bukan menuntut input yang sulit dipastikan seperti berat atau nama produk.
* **Fokus pada Lokalisasi:** Menyediakan katalog donasi dengan filter lokasi terdekat untuk menekan biaya logistik (mendukung pengiriman instan/COD yang lebih murah) dan mengurangi jejak karbon.
* **Integrasi Logistik Terpadu (Satu Pintu):** Menyediakan *gateway* fasad logistik yang menghubungkan aplikasi dengan pihak ketiga (seperti GoSend, GrabExpress) untuk memudahkan penjemputan barang tanpa merumitkan kode integrasi API.
* **Gamifikasi & Insentif Dampak:** Menggunakan modul analitik untuk menampilkan perhitungan reduksi jejak karbon dan limbah yang diselamatkan. Pengguna juga akan mendapatkan *reward* poin dan *badge* yang bisa ditukarkan dengan voucer diskon dari mitra *brand fashion* berkelanjutan.
* **Pemberdayaan UMKM (Upcycle Hub):** Menyalurkan pakaian tidak layak pakai ke komunitas daur ulang atau pengrajin lokal untuk diolah menjadi produk bernilai tinggi, mendukung prinsip *zero-waste*.

---

## 🛫 Plan

* **Manajemen Akun & Kebijakan Global:** Membangun *SystemConfigManager* terpusat menggunakan *Singleton Pattern* untuk mengatur kebijakan ekonomi sirkular (seperti standar kelayakan donasi). Pembuatan akun Donatur, Penerima, dan Admin akan dikelola dengan *Factory Method*.
* **Pengembangan Fitur Cerdas & Interaktif:** * Membangun *Smart Posting* dengan *Strategy Pattern* agar alur penilaian dari donatur dan moderasi admin dapat ditukar secara fleksibel.
    * Menerapkan *Observer Pattern* untuk katalog lokasi dan sistem notifikasi instan agar pengguna relevan langsung mendapat pemberitahuan donasi baru.
* **Pelacakan & Inventori (Transparansi):** * Membangun sistem *Inventory Tracking* dengan *QR Code* bagi *warehouse* untuk memvalidasi pemotongan stok secara *real-time*.
    * Membangun *Donation Tracker* terperinci menggunakan *State Pattern* untuk melacak status pakaian dari penjemputan hingga penyaluran.
* **Modul Keberlanjutan & Penghargaan:** Mengembangkan *Sustainability Analytics* serta sistem gamifikasi (*Gamifikasi & Reward System*) menggunakan *Strategy Pattern* untuk menghitung metrik karbon dan poin donasi.
* **Manajemen Penyaluran (Upcycle Hub):** Mengimplementasikan *Factory Method* untuk membuat instruksi penanganan spesifik bagi pengrajin berdasarkan jenis bahan limbah tekstil yang diterima.
