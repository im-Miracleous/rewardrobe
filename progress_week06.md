**Project:** ReWardrobe - Donasi Pakaian

**Branch:** https://github.com/im-Miracleous/rewardrobe/tree/Week06

**Kelompok:**
- 2472008 — Christian Anthony Hermawan
- 2472019 — Miracle Steven Gerrald
- 2472029 — Henry Ferdynand Budiana
- 2472042 — Gavin Malik Setiawan
## Tools Used

- Claude (Opus)
# Business Flow

## A. Aktor
- **Donatur** — menyumbang barang/uang.
- **Penerima** — pihak yang membutuhkan (panti, komunitas, pengrajin) dan mengambil barang dari katalog.
- **Admin** — memverifikasi, mengatur penjemputan & pengiriman, mengelola inventaris.

## B. Flow 
1. Donatur registrasi / login ke website *ReWardrobe*.
2. Donatur mengisi detail donasi (tipe pakaian, kondisi, kategori, berat) dan mengunggah foto barang.
3. Sistem otomatis menyetujui donasi (status: **menunggu_pengiriman**) karena tanpa kampanye tidak butuh screening.
4. Donatur mengirim barang ke alamat ReWardrobe (kirim sendiri / drop-off).
5. Admin menerima barang → status pengiriman: **terkirim**, barang masuk inventaris.
6. Barang muncul di katalog penerima.
7. Setelah barang diterima admin, barang **muncul di katalog penerima**.
8. Donatur mendapat **poin dasar** dan **notifikasi** bahwa donasi berhasil diterima admin.
9. Penerima memilih barang dari katalog sesuai kebutuhan dan mengajukan **permintaan**.
10. Admin menyetujui permintaan dan mengatur pengiriman barang (admin → penerima).
11. Penerima menerima barang → status barang menjadi **tersalurkan**.
12. Donatur mendapat **poin bonus** dan **notifikasi** karena donasinya berhasil tersalurkan ke penerima.

## C. Aturan Pendukung
- **Poin**: donatur memperoleh poin saat donasi disetujui (gamifikasi).
- **Notifikasi**: setiap perubahan status penting (disetujui, ditolak, permintaan diproses, barang dikirim) memicu notifikasi ke aktor terkait.
- **Katalog penerima** hanya menampilkan barang yang **sudah disetujui DAN sudah dijemput admin** (barang yang masih disiapkan/belum dijemput belum tampil).
- **Permintaan** hanya bisa diajukan untuk barang berstatus **disetujui** dan belum diminta aktif oleh penerima yang sama.

# Daftar Perbaikan ReWardrobe 

Legenda: ❌ belum ada |📝 dalam rencana | 🟡 sedang dikerjakan | ✅ sudah ada
## A. PENGHAPUSAN 

| No  | Item                                                                                                                                                    | Status | PIC   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | :----: | ----- |
| A.1 | Hapus fitur **Donasi Uang**: model `DonasiUang`, route `/api/donasi-uang/*`, halaman donatur `history/uang/*`, opsi donasi uang di form                 |   ✅    | Gavin |
| A.2 | Hapus fitur **Kampanye**: model `Campaign` & `PartisipasiCampaign`, route `/api/campaigns/*`, halaman `admin/kampanye`, pilihan kampanye di form donasi |   ✅    | Gavin |
| A.3 | Hapus kolom relasi `campaign_id` pada `BarangDonasi` + logika `verification_required`                                                                   |   ✅    | Gavin |
| A.4 | Hapus menu sidebar terkait (Kelola Kampanye) + semua referensi UI ke uang/kampanye                                                                      |   ✅    | Gavin |
| A.5 | Migrasi Prisma untuk drop tabel/kolom di atas (hati-hati, destruktif)                                                                                   |   ✅    | Gavin |

## 0. Perbaikan Status Barang 

| No  | Item                                                                                                                                                                                                                        | Status | PIC   |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----: | ----- |
| 0.1 | Sederhanakan enum `StatusBarang` → `menunggu_pengiriman`, `terkirim`, `tersalurkan` (+ `ditolak` opsional jika admin tolak barang saat diterima). Buang `menunggu_verifikasi` & `disetujui` (tak perlu tanpa kampanye/uang) |   ✅    | Gavin |
| 0.2 | Alur final: `menunggu_pengiriman → terkirim → tersalurkan`                                                                                                                                                                  |   ✅    | Gavin |
| 0.3 | POST donasi → status awal langsung `menunggu_pengiriman` (auto-approve, tanpa verifikasi)                                                                                                                                   |   ✅    | Gavin |
| 0.4 | Saat penjemputan donatur→admin = `terkirim` → set barang `terkirim` (masuk inventaris)                                                                                                                                      |   ✅    | Gavin |
| 0.5 | Permintaan penerima selesai → barang `tersalurkan`                                                                                                                                                                          |   ✅    | Gavin |
| 0.6 | Helper label status (`src/lib/statusBarang.ts`) untuk penamaan konsisten di UI                                                                                                                                              |   ✅    | Gavin |

## 1. ADMIN
| No  | Fitur                                                                                                                                                                                                                                                             | Status | PIC       |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----: | --------- |
| 1.1 | **Hapus/nonaktifkan menu "Verifikasi Donasi"** — tak ada screening tanpa kampanye                                                                                                                                                                                 |   ✅    | Gavin     |
| 1.2 | Filter inventory pakai status `terkirim` & `tersalurkan` (ganti `disetujui`)                                                                                                                                                                                      |   ✅    | Christian |
| 1.3 | Setujui permintaan penerima → atur pengiriman admin→penerima (menggantikan "Kelola Pengiriman"). _Catatan: 1.5 digabung ke sini._                                                                                                                                 |   ✅    | Gavin     |
| 1.4 | Admin update pengiriman → `terkirim` memicu status barang `tersalurkan` + poin/notif (lihat `admin/pengiriman/[id]`)                                                                                                                                              |   ✅    | Gavin     |
| 1.6 | **BUG ALUR — barang `tersalurkan` ganda**: `permintaan/[id]` set barang `tersalurkan` saat admin *approve* (poin flow 10), padahal seharusnya hanya saat barang **sampai** (poin flow 11). Hapus set status di approve, biarkan hanya `pengiriman→terkirim`       |   ❌    |           |
| 1.7 | **Putuskan aktor penutup transaksi** (flow poin 11): admin tandai pengiriman `terkirim` **atau** konfirmasi penerima. Saat ini konfirmasi penerima (`permintaan/[id]` aksi `konfirmasi`) hanya menambah catatan teks ke `pesan`, tidak mengubah status/poin/notif |   ❌    |           |

## 2. DONATUR
| No  | Fitur                                                                                                                                                         | Status | PIC |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----: | --- |
| 2.1 | **Notifikasi** saat donasi diterima admin (poin dasar). Belum ada `notifikasi.create` sama sekali                                                             |   ❌    |     |
| 2.2 | **Notifikasi** saat donasi tersalurkan ke penerima (poin bonus)                                                                                               |   ❌    |     |
| 2.3 | **Poin dasar** otomatis saat barang diterima admin (belum ada `logPoin.create`)                                                                               |   ❌    |     |
| 2.4 | **Poin bonus** otomatis saat barang tersalurkan                                                                                                               |   ❌    |     |
| 2.5 | Rename sidebar "Riwayat Donasi" → **"Donasi Saya"**                                                                                                           |   🟡   |     |
| 2.6 | Fitur **"Mengelola Pengiriman"**: donatur konfirmasi kirim barang ke ReWardrobe (drop-off/kirim sendiri)                                                      |   ❌    |     |
| 2.7 | Penamaan status untuk donatur: **"Menunggu Pengiriman"**, **"Terkirim"**, **"Tersalurkan"** (sudah pakai `STATUS_BARANG_LABEL`/`_BADGE` di `donatur/history`) |   ✅    |     |
| 2.8 | Sub-tab **"Donasi Sedang Berjalan"** di "Donasi Saya" (menunggu pengiriman / terkirim)                                                                        |   ❌    |     |
| 2.9 | Sub-tab/menu **"Riwayat Donasi"** khusus yang sudah **tersalurkan**                                                                                           |   ❌    |     |

## 3. PENERIMA
| No  | Fitur                                                                                                            | Status | PIC |
| --- | ---------------------------------------------------------------------------------------------------------------- | :----: | --- |
| 3.1 | Katalog hanya barang berstatus `terkirim` (`penerima/page.tsx` fetch `?status=terkirim`)                          |   ✅   |     |
| 3.2 | Validasi permintaan: barang harus `terkirim` & belum diminta aktif oleh penerima sama (`permintaan/route.ts` sudah cek `terkirim`) |   ✅   |     |
| 3.3 | Fitur **batasi penerimaan per satuan waktu** (rate-limit permintaan/periode)                                     |   ❌    |     |

## 4. LINTAS-AKTOR (Aturan Pendukung)
| No  | Fitur                                                                           | Status | PIC       |
| --- | ------------------------------------------------------------------------------- | :----: | --------- |
| 4.1 | Sistem **notifikasi terpusat**: tiap perubahan status penting → `Notifikasi`    |   ✅    | Christian |
| 4.2 | Sistem **poin/gamifikasi**: `LogPoin` di tiap milestone (diterima, tersalurkan) |   ✅    | Christian |
| 4.3 | Penamaan status konsisten di seluruh UI (pakai helper 0.6)                      |   ✅    | Christian |
# 5. Optimalisasi Proyek

| No  | Fitur                                                                                                          | Status | PIC     |
| --- | -------------------------------------------------------------------------------------------------------------- | :----: | ------- |
| 5.1 | Optimalisasi ukuran cache proyek                                                                               |   🟡   | Miracle |
| 5.2 | Migrasi dari Node.JS + Next.JS ke Next.JS single-monolith (menggabungkan *front-end* dan *backend* di Next.JS) |   📝   | Miracle |
| 5.3 | Update readme                                                                                                  |   🟡   | Henry   |
## Urutan Pengerjaan (saran)
1. **A.x** — hapus Donasi Uang & Kampanye dulu (bersihkan, biar tidak ganggu).
2. **0.x** — perbaiki enum & alur status.
3. **4.1 & 4.2** — helper notifikasi + poin terpusat.
4. Admin (1.x) → Donatur (2.x) → Penerima (3.x).