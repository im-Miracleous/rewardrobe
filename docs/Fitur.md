# Fitur — ReWardrobe
> Hanya mencakup fitur yang sudah berjalan per versi saat ini.

---

## 1. Autentikasi & Akses Berbasis Role

Sistem login dan registrasi dengan tiga peran: **Admin**, **Donatur**, dan **Penerima** (panti / komunitas / pengrajin). Setiap role mendapat dashboard dan hak akses yang berbeda.

- Tanpa identitas terverifikasi, platform tidak bisa membedakan siapa yang memberi dan siapa yang menerima — fraud dan penyalahgunaan mustahil dikontrol.
- Role menentukan alur kerja: Donatur mengunggah barang, Admin memverifikasi, Penerima mengajukan permintaan — ketiganya tidak bisa saling tumpang-tindih tanpa merusak integritas proses.
- Data akun yang tersimpan memungkinkan atribusi donasi ke individu, yang menjadi fondasi fitur poin, riwayat, dan laporan dampak.
- Perusahaan memerlukan audit trail yang jelas — setiap tindakan (donasi masuk, verifikasi, penyaluran) harus terikat ke akun yang bertanggung jawab.

---

## 2. Dashboard Donatur (Beranda)

Halaman ringkasan personal yang menampilkan total poin, estimasi limbah tekstil yang diselamatkan, jumlah item yang didonasikan, grafik kontribusi 6 bulan terakhir, dan status tiga donasi terakhir.

- Donatur yang tidak melihat dampak nyata dari aksi mereka kehilangan motivasi untuk berdonasi kembali — retensi pengguna bergantung pada visibilitas kontribusi.
- Grafik 6 bulan memberikan konteks temporal: donatur melihat pola kebiasaan sendiri dan terdorong untuk mengisi bulan yang kosong (behavioral nudge).
- Status donasi terakhir langsung di beranda memotong kebutuhan navigasi ke riwayat — mengurangi friction dan meningkatkan kepuasan pengguna.
- Dari sisi bisnis, metrik di dashboard (total item, total poin platform) menjadi bahan laporan dampak sosial dan lingkungan yang bisa dikomunikasikan ke investor atau mitra.

---

## 3. Donasi Pakaian Fisik

Form pengiriman donasi pakaian dengan upload foto sebagai bukti, pilihan kondisi (Fair / Baik / Rusak), tipe pakaian, catatan tambahan, dan opsi menautkan ke kampanye tertentu.

- Foto wajib mencegah donasi asal-asalan — penerima tidak boleh menerima pakaian yang tidak layak, dan foto adalah satu-satunya bukti awal sebelum barang fisik tiba.
- Pilihan kondisi yang terstruktur (bukan teks bebas) memungkinkan Admin memfilter dan memprioritaskan verifikasi berdasarkan risiko — pakaian "Rusak" butuh perhatian lebih.
- Integrasi kampanye di formulir donasi memastikan barang yang masuk bisa langsung diarahkan ke program yang sedang aktif, memaksimalkan relevansi penyaluran.
- Data tipe dan kondisi pakaian yang terkumpul dari waktu ke waktu membentuk basis statistik yang dapat digunakan untuk laporan dampak lingkungan dan analisis jenis pakaian yang paling banyak didonasikan.

---

## 4. Donasi Finansial (Uang)

Form donasi uang dengan nominal kustom, tombol cepat (Rp 50rb / 100rb / 250rb / 500rb), wajib unggah bukti transfer, dan opsi menautkan ke kampanye.

- Tidak semua donatur memiliki pakaian layak untuk didonasikan — donasi uang membuka partisipasi bagi segmen yang ingin berkontribusi secara finansial untuk logistik atau operasional kampanye.
- Bukti transfer wajib mencegah klaim donasi palsu yang dapat merusak kepercayaan platform dan laporan keuangan perusahaan.
- Nominal yang tervalidasi dan tercatat di database memungkinkan perusahaan melacak total dana masuk per kampanye secara real-time dan membuktikan transparansi ke donatur.
- Quick-amount buttons menurunkan cognitive load — pengguna tidak perlu mengetik, sehingga konversi dari "niat berdonasi" ke "donasi terkirim" menjadi lebih tinggi.

---

## 5. Riwayat Donasi

Tabel lengkap semua donasi dengan tab filter per tipe (Semua / Pakaian / Uang), pencarian teks, filter rentang waktu, pagination, dan badge status warna-warni per item.

- Donatur membutuhkan catatan permanen sebagai bukti kontribusi mereka — tanpa riwayat yang jelas, kepercayaan terhadap platform menurun drastis.
- Pemisahan tab Pakaian dan Uang membantu donatur yang aktif di keduanya tetap fokus tanpa noise — UX yang bersih mendorong eksplorasi lebih lanjut.
- Filter waktu dan pencarian teks memungkinkan donatur menemukan donasi spesifik dengan cepat — penting saat ada klaim atau pertanyaan lanjutan tentang status.
- Data riwayat yang terstruktur di backend memungkinkan tim Admin mengaudit seluruh aktivitas platform secara granular, termasuk identifikasi donatur paling aktif untuk program apresiasi.

---

## 6. Pelacakan Status Donasi

Setiap donasi memiliki lifecycle status yang jelas: **Menunggu Verifikasi → Disetujui / Ditolak → Tersalurkan**, ditampilkan dengan badge warna berbeda di riwayat dan beranda.

- Ketidakjelasan status adalah penyebab utama donatur mengulang tanya ke Admin — status otomatis mengurangi beban komunikasi manual secara signifikan.
- Status yang terstandardisasi di database memungkinkan sistem otomasi seperti poin (poin hanya diberikan saat status "Disetujui") dan notifikasi berbasis event.
- Dari perspektif penerima, status "Tersalurkan" adalah konfirmasi bahwa barang benar-benar sudah berpindah tangan — ini menciptakan akuntabilitas yang terukur.
- Audit trail status (lengkap dengan timestamp verified_at dan verifier) memberikan bukti hukum jika terjadi sengketa antara donatur, Admin, atau penerima.

---

## 7. Sistem Poin & Gamifikasi

Setiap donasi pakaian yang disetujui menghasilkan poin otomatis untuk donatur. Donasi finansial dikonversi ke poin kemitraan (10 poin per Rp 10.000). Poin ditampilkan di dashboard dan berkontribusi ke peringkat global.

- Poin mengubah aksi satu kali menjadi perilaku berulang — donatur yang melihat poin mereka bertambah termotivasi untuk terus berdonasi tanpa perlu insentif eksternal berbasis uang.
- Sistem poin menciptakan ukuran partisipasi yang lebih kaya dari sekadar hitungan item — donatur yang rajin mendapat pengakuan yang proporsional terhadap kontribusi nyata mereka.
- Peringkat global menciptakan kompetisi positif yang bisa dimanfaatkan sebagai materi marketing ("Jadilah Top Donatur ReWardrobe") tanpa biaya akuisisi tambahan.
- Data poin yang terakumulasi membuka jalan untuk fitur reward (penukaran poin dengan voucher mitra) yang dapat menjadi sumber revenue baru bagi perusahaan.

---

## 8. Papan Peringkat (Leaderboard)

Leaderboard Top 10 donatur berdasarkan total poin, ditampilkan di halaman Dampak & Tantangan dengan nama dan poin masing-masing donatur.

- Transparansi peringkat menciptakan social proof — calon donatur baru melihat bahwa komunitas aktif dan terdorong untuk bergabung agar tidak tertinggal.
- Visibility publik nama donatur teratas berfungsi sebagai penghargaan non-materi yang efektif — banyak donatur lebih termotivasi oleh pengakuan sosial daripada hadiah fisik.
- Leaderboard menjadi indikator kesehatan platform bagi manajemen: jika Top 10 dikuasai user lama dan tidak ada pendatang baru, ini sinyal bahwa akuisisi donatur baru perlu diperkuat.
- Data peringkat dapat digunakan untuk program "Donatur Terpilih" atau ambassador program tanpa infrastruktur tambahan — cukup ambil dari database yang sudah ada.

---

## 9. Dampak Lingkungan & Sosial

Halaman dedikasi yang menampilkan metrik dampak nyata: total tekstil diselamatkan (kg), total donasi finansial terverifikasi (Rp), poin dikumpulkan, dan peringkat global donatur.

- Donatur gen-Z dan milenial tidak cukup termotivasi oleh "niat baik" saja — mereka membutuhkan angka konkret yang bisa mereka bagikan ke media sosial sebagai bukti aksi nyata.
- Estimasi kilogram tekstil yang diselamatkan mengkonversi jumlah item menjadi dampak lingkungan yang terasa — ini adalah bahasa yang dimengerti oleh mitra korporat dan lembaga sertifikasi keberlanjutan.
- Halaman ini berfungsi ganda sebagai laporan pertanggungjawaban platform kepada publik tanpa membutuhkan dokumen terpisah — transparansi terbuka adalah modal kepercayaan.
- Metrik lingkungan yang terukur dan teratribusi membuka peluang kerja sama dengan program CSR perusahaan yang membutuhkan bukti dampak untuk laporan keberlanjutan mereka.

---

## 10. Kampanye Donasi

Sistem kampanye bertarget yang bisa menghimpun donasi pakaian maupun uang dengan target tertentu (target dana, target jumlah barang). Donatur dapat menautkan donasi ke kampanye aktif langsung dari form donasi.

- Kampanye memberikan konteks dan urgensi yang membuat donasi terasa lebih bermakna — "Donasi untuk Bencana Sulawesi" lebih menggerakkan dari "Donasi Umum".
- Target terukur (terkumpul vs target) memungkinkan platform membuktikan progres secara real-time kepada donatur dan mitra, meningkatkan akuntabilitas penggunaan donasi.
- Sistem kampanye membuka model pendanaan berbasis misi yang bisa dikerjakan sama dengan NGO, yayasan, atau brand fashion sebagai penyelenggara kampanye bersama.
- Barang yang masuk melalui kampanye sudah memiliki tujuan penyaluran yang jelas sejak awal, mengurangi waktu matching antara donasi dan penerima yang membutuhkan.

---

## 11. Moderasi & Verifikasi Admin

Admin dapat melihat seluruh donasi masuk, memverifikasi atau menolak dengan alasan, dan mengubah status donasi dari "Menunggu Verifikasi" ke "Disetujui", "Ditolak", atau "Tersalurkan". Setiap keputusan dicatat dengan timestamp dan ID Admin.

- Tanpa layer verifikasi manusia, platform menjadi saluran terbuka untuk pakaian tidak layak yang dapat merusak reputasi dan kepercayaan penerima.
- Pencatatan siapa yang memverifikasi dan kapan menciptakan akuntabilitas internal — jika ada kesalahan penyaluran, dapat ditelusuri ke Admin yang bertanggung jawab.
- Admin yang memverifikasi foto dapat mendeteksi potensi fraud (foto palsu, duplikat) sebelum barang masuk ke katalog publik — melindungi integritas ekosistem.
- Data keputusan moderasi (berapa % disetujui vs ditolak) adalah KPI operasional yang membantu manajemen menilai kualitas donasi yang masuk dan efektivitas edukasi donatur.

---

## 12. Profil & Pengaturan Akun

Donatur dapat mengelola data profil (nama, kontak, foto, kota) dari halaman pengaturan yang dapat diakses melalui ikon di sidebar.

- Data profil lengkap (kota, kontak) memungkinkan Admin memfasilitasi koordinasi pengiriman tanpa harus menghubungi donatur secara manual di luar platform.
- Foto profil dan nama yang dapat dikustomisasi meningkatkan sense of identity di leaderboard — donatur yang merasa "terlihat" lebih cenderung aktif kembali.
- Informasi kontak yang tersimpan di akun menjadi dasar untuk sistem notifikasi aktif (email/SMS) di masa mendatang tanpa perlu onboarding ulang pengguna.
- Manajemen akun terpusat mengurangi risiko data yang tidak konsisten antara sesi — perubahan nama atau kontak langsung ter-refleksi di seluruh sistem tanpa celah duplikasi.
