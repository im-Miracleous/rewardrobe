# ReWardrobe

Platform ekonomi sirkular berbasis komunitas untuk donasi, daur ulang, dan manajemen limbah tekstil.

**Deskripsi:** Platform Ekonomi Sirkular untuk Donasi, Daur Ulang, dan Manajemen Limbah Tekstil Berbasis Komunitas

**Tim Pengembang:**
* 2472008 - Christian Anthony Hermawan
* 2472019 - Miracle Steven Gerrald
* 2472029 - Henry Ferdynand Budiana
* 2472042 - Gavin Malik Setiawan

Untuk menjalankan aplikasi, eksekusi command berikut:
```bash
npm run dev
```

Buka browser di alamat [http://localhost:3000](http://localhost:3000) untuk melihat hasilnya.

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
* **Smart Posting & Otomatisasi Siklus:** Menggunakan *AI Assessment* untuk memberikan label otomatis ("Layak Donasi", "Perlu Perbaikan", "Daur Ulang") pada foto unggahan donatur. Sistem juga secara cerdas akan menentukan alur penanganan tekstil otomatis berdasarkan jenis dan kondisi barang.
* **Fokus pada Lokalisasi:** Menyediakan katalog donasi dengan filter lokasi terdekat untuk menekan biaya logistik (mendukung pengiriman instan/COD yang lebih murah) dan mengurangi jejak karbon.
* **Integrasi Logistik Terpadu (Satu Pintu):** Menyediakan *gateway* fasad logistik yang menghubungkan aplikasi dengan pihak ketiga (seperti GoSend, GrabExpress) untuk memudahkan penjemputan barang tanpa merumitkan kode integrasi API.
* **Gamifikasi & Insentif Dampak:** Menggunakan modul analitik untuk menampilkan perhitungan reduksi jejak karbon dan limbah yang diselamatkan. Pengguna juga akan mendapatkan *reward* poin dan *badge* yang bisa ditukarkan dengan voucer diskon dari mitra *brand fashion* berkelanjutan.
* **Pemberdayaan UMKM (Upcycle Hub):** Menyalurkan pakaian tidak layak pakai ke komunitas daur ulang atau pengrajin lokal untuk diolah menjadi produk bernilai tinggi, mendukung prinsip *zero-waste*.

---

## 🛫 Plan

* **Manajemen Akun & Kebijakan Global:** Membangun *SystemConfigManager* terpusat menggunakan *Singleton Pattern* untuk mengatur kebijakan ekonomi sirkular (seperti standar kelayakan donasi). Pembuatan akun Donatur, Penerima, dan Admin akan dikelola dengan *Factory Method*.
* **Pengembangan Fitur Cerdas & Interaktif:** * Membangun *Smart Posting* dengan *Strategy Pattern* agar algoritma AI penilai kelayakan dapat ditukar secara fleksibel.
    * Menerapkan *Observer Pattern* untuk katalog lokasi dan sistem notifikasi instan agar pengguna relevan langsung mendapat pemberitahuan donasi baru.
* **Pelacakan & Inventori (Transparansi):** * Membangun sistem *Inventory Tracking* dengan *QR Code* bagi *warehouse* untuk memvalidasi pemotongan stok secara *real-time*.
    * Membangun *Donation Tracker* terperinci menggunakan *State Pattern* untuk melacak status pakaian dari penjemputan hingga penyaluran.
* **Modul Keberlanjutan & Penghargaan:** Mengembangkan *Sustainability Analytics* serta sistem gamifikasi (*Gamifikasi & Reward System*) menggunakan *Strategy Pattern* untuk menghitung metrik karbon dan poin donasi.
* **Manajemen Penyaluran (Upcycle Hub):** Mengimplementasikan *Factory Method* untuk membuat instruksi penanganan spesifik bagi pengrajin berdasarkan jenis bahan limbah tekstil yang diterima.
