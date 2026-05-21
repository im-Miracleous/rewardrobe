# Panduan Authentication & User Management - ReWardrobe

## 📋 Daftar Isi
1. [Perubahan Struktur Auth](#perubahan-struktur-auth)
2. [Cara Login](#cara-login)
3. [Cara Register](#cara-register)
4. [Membuat Admin Account](#membuat-admin-account)
5. [Manage Users dengan Prisma Studio](#manage-users-dengan-prisma-studio)
6. [API Endpoints](#api-endpoints)

---

## 🔄 Perubahan Struktur Auth

Sebelumnya, login dan register ada dalam satu halaman. Sekarang sudah dipisahkan:

```
src/app/auth/
├── page.tsx              # Redirect ke /auth/login
├── login/
│   └── page.tsx         # Halaman Login
├── register/
│   └── page.tsx         # Halaman Register
└── (API Routes)
    └── api/auth/
        ├── login/
        │   └── route.ts  # API untuk login
        └── register/
            └── route.ts  # API untuk register
```

### URL Routing:
- `/auth/login` - Halaman Login
- `/auth/register` - Halaman Register
- `/auth` - Redirect ke Login

---

## 🔐 Cara Login

### Fitur Login:
✅ Email dan Password validation  
✅ Password hashing dengan bcryptjs  
✅ Auto-redirect berdasarkan role (Donatur, Penerima, Admin)  
✅ Session management dengan localStorage  

### Langkah-langkah:
1. Buka `/auth/login`
2. Masukkan email dan password
3. Klik tombol "Masuk"
4. Sistem akan memverifikasi dan redirect ke dashboard sesuai role

### Akun Test:
Untuk mencoba, Anda perlu registrasi terlebih dahulu di halaman register atau membuat admin account melalui terminal.

---

## ✍️ Cara Register

### Fitur Register:
✅ Pendaftaran untuk role Donatur dan Penerima  
✅ Admin tidak bisa register di website (hanya via terminal)  
✅ Form validation lengkap  
✅ Password confirmation  
✅ Pemilihan tipe penerima (Panti, Komunitas, Pengrajin) untuk role Penerima  

### Langkah-langkah:
1. Buka `/auth/register`
2. Pilih peran (Donatur atau Penerima)
3. Jika Penerima, pilih jenis penerima
4. Isi semua form field:
   - Nama Lengkap
   - Email
   - Password (min. 6 karakter)
   - Konfirmasi Password
   - Nomor Telepon
   - Alamat Lengkap
   - Kota
5. Klik tombol "Daftar"
6. Jika berhasil, redirect ke login

### Form Validation:
- Nama tidak boleh kosong
- Email harus valid dan unik (belum terdaftar)
- Password minimal 6 karakter
- Password dan konfirmasi harus cocok
- Nomor telepon, alamat, dan kota harus diisi

---

## 👨‍💼 Membuat Admin Account

Admin account TIDAK bisa dibuat melalui website. Hanya bisa dibuat via terminal script.

### Cara membuat Admin Account:

#### Step 1: Buka Terminal
```bash
cd "c:\Users\ASUS\Documents\MARANATHA\SEMESTER 4\IN235 Pola Desain Perangkat Lunak\TUBES\rewardrobe"
```

#### Step 2: Jalankan Script
```bash
node scripts/create-admin.js
```

#### Step 3: Isi Data Admin
```
Nama Admin: [Masukkan nama admin]
Email Admin: [Masukkan email admin]
Password Admin: [Masukkan password]
Konfirmasi Password: [Konfirmasi password]
```

#### Contoh:
```
========== Buat Admin Account ==========

Nama Admin: Abi Aziz
Email Admin: admin@rewardrobe.com
Password Admin: AdminPassword123
Konfirmasi Password: AdminPassword123

✅ Admin account berhasil dibuat!

Detail Admin:
  Email: admin@rewardrobe.com
  Nama: Abi Aziz
  Role: admin
  ID: 1
```

### Login dengan Admin Account:
- Buka `/auth/login`
- Masukkan email admin dan password
- Redirect ke `/dashboard/admin`

---

## 🔄 Reset Database + Seed

Kalau ingin meniru `php artisan migrate:fresh --seed`, pakai command bawaan Prisma ini:

```bash
npx prisma migrate reset --force
```

Perintah di atas akan menghapus data, menjalankan ulang migration, lalu menjalankan seed yang sudah dikonfigurasi di `prisma.config.ts`.

Kalau ingin menjalankan ulang seed saja:

```bash
npm run db:seed
```

Di project ini juga tersedia shortcut:

```bash
npm run db:fresh
```

Shortcut tersebut menjalankan reset lalu seed secara berurutan.

Setelah reset, akun dummy berikut akan tersedia lagi:

- `admin@example.com`
- `donatur@example.com`
- `penerima@example.com`

Semua akun dummy memakai password:

```bash
password
```

---

## 📊 Manage Users dengan Prisma Studio

### Membuka Prisma Studio

#### Via Terminal:
```bash
cd "c:\Users\ASUS\Documents\MARANATHA\SEMESTER 4\IN235 Pola Desain Perangkat Lunak\TUBES\rewardrobe"
npx prisma studio
```

Prisma Studio akan membuka di: **http://localhost:51212**

### Fitur-fitur Prisma Studio

#### 1️⃣ Melihat Semua Users
- Buka Prisma Studio
- Di sidebar kiri, klik **"users"**
- Akan menampilkan semua data users dalam tabel

#### 2️⃣ Filter Users Berdasarkan Role
- Di halaman users, klik tombol **Filter** (icon corong)
- Pilih field: **role**
- Pilih kondisi: **equals**
- Masukkan value: **donatur** / **penerima** / **admin**
- Klik "Apply"

Contoh:
```
Field: role
Operator: equals
Value: donatur
```

#### 3️⃣ Menambah User Manual
- Di halaman users, klik **"Insert row"**
- Isi semua field yang required (*)
- Klik **Save**

⚠️ **Catatan**: Jika menambah user manual, pastikan password di-hash terlebih dahulu, atau gunakan form register di website.

#### 4️⃣ Mengedit Data User
- Klik row user yang ingin diedit
- Edit field yang ingin diubah
- Klik **Save**

#### 5️⃣ Menghapus User
- Buka detail user
- Klik tombol **Delete**
- Konfirmasi penghapusan

#### 6️⃣ Melihat Detail User Lengkap
- Klik row user untuk membuka detail
- Lihat semua informasi:
  - ID
  - Nama
  - Email
  - No Telepon
  - Alamat Lengkap
  - Kota
  - Foto Profil (URL)
  - Role (admin/donatur/penerima)
  - Tipe (hanya jika penerima: panti/komunitas/pengrajin)
  - Created At
  - Updated At

### Struktur Tabel Users

```
users (Map: "users")
├── id (Int)              - Primary Key, Auto Increment
├── nama (String)         - Nama lengkap user
├── email (String)        - Email (Unique)
├── password (String)     - Password (hashed)
├── no_telpon (String?)   - Nomor telepon (optional)
├── alamat_lengkap (String?) - Alamat (optional)
├── kota (String?)        - Kota (optional)
├── foto_profil (String?) - URL foto profil (optional)
├── role (RoleUser)       - admin | donatur | penerima
├── tipe (TipePenerima?)  - panti | komunitas | pengrajin (hanya jika penerima)
├── created_at (DateTime) - Tanggal dibuat (default: now)
└── updated_at (DateTime) - Tanggal diupdate (auto update)
```

### Query SQL Manual (Tab "SQL")

Di Prisma Studio, Anda juga bisa menulis query SQL manual:

#### Lihat semua users:
```sql
SELECT * FROM "users";
```

#### Lihat users dengan role tertentu:
```sql
SELECT * FROM "users" WHERE role = 'donatur';
```

#### Hitung jumlah users per role:
```sql
SELECT role, COUNT(*) as total FROM "users" GROUP BY role;
```

#### Cari user berdasarkan email:
```sql
SELECT * FROM "users" WHERE email = 'email@example.com';
```

---

## 🧪 Testing Autentikasi

Untuk test sederhana yang sudah disiapkan, jalankan:

```bash
npm test
```

Atau khusus auth:

```bash
npm run test:auth
```

File test yang dipakai:

- `tests/auth.test.ts`

Test ini mengecek:
- hashing dan verifikasi password
- mapping role ke dashboard
- validasi role yang boleh register lewat website

---

## 🚪 Logout dan Proteksi Dashboard

Logout di dashboard sekarang sudah benar-benar memutus sesi:

- cookie auth dihapus lewat `POST /api/auth/logout`
- localStorage user dan token dibersihkan
- redirect memakai `router.replace('/auth/login')`
- dashboard diproteksi oleh `middleware.ts`

Efeknya:

- setelah logout, tombol Back tidak bisa membuka dashboard sebagai user aktif
- jika coba akses `/dashboard/...` langsung tanpa sesi, akan diarahkan ke login lagi

---

## 🔌 API Endpoints

### Login
**Endpoint**: `POST /api/auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200)**:
```json
{
  "message": "Login berhasil.",
  "user": {
    "id": 1,
    "nama": "Nama User",
    "email": "user@example.com",
    "role": "donatur",
    "created_at": "2026-05-15T04:00:00Z",
    "updated_at": "2026-05-15T04:00:00Z"
  },
  "token": "token_1"
}
```

**Error Response (401)**:
```json
{
  "message": "Email atau password salah."
}
```

### Register
**Endpoint**: `POST /api/auth/register`

**Request Body**:
```json
{
  "nama": "Nama User",
  "email": "user@example.com",
  "password": "password123",
  "noTelpon": "+62 812 3456 7890",
  "alamatLengkap": "Jalan ABC No. 123",
  "kota": "Jakarta",
  "role": "donatur",
  "tipe": null
}
```

Jika role = "penerima":
```json
{
  "tipe": "panti"  // atau "komunitas" atau "pengrajin"
}
```

**Success Response (201)**:
```json
{
  "message": "Akun berhasil dibuat.",
  "user": {
    "id": 2,
    "nama": "Nama User",
    "email": "user@example.com",
    "role": "donatur",
    "created_at": "2026-05-15T04:00:00Z",
    "updated_at": "2026-05-15T04:00:00Z"
  }
}
```

**Error Response (400/409)**:
```json
{
  "message": "Email sudah terdaftar."  // atau error message lainnya
}
```

---

## 📝 Struktur File

```
src/
├── app/
│   ├── auth/
│   │   ├── page.tsx                    # Redirect ke login
│   │   ├── login/
│   │   │   └── page.tsx               # Login page
│   │   ├── register/
│   │   │   └── page.tsx               # Register page
│   │   └── api/
│   │       └── auth/
│   │           ├── login/
│   │           │   └── route.ts       # Login API
│   │           └── register/
│   │               └── route.ts       # Register API
│   └── ...
├── lib/
│   ├── auth.ts                        # Auth utility functions
│   ├── prisma.ts                      # Prisma client
│   └── ...
└── components/
    ├── ui/
    │   ├── Button.tsx
    │   └── Input.tsx
    └── ...

scripts/
└── create-admin.js                   # Script untuk membuat admin account
```

---

## 🔐 Security Notes

1. **Password Hashing**: Semua password di-hash dengan bcryptjs (10 rounds)
2. **Email Validation**: Email harus unik di database
3. **Admin Protection**: Admin tidak bisa dibuat dari website, hanya via terminal
4. **Session**: Basic session dengan localStorage (siap untuk di-upgrade ke JWT/session yang lebih aman)

---

## 🚀 Next Steps

- [ ] Implementasi JWT untuk authentication yang lebih aman
- [ ] Implementasi refresh token
- [ ] Tambahkan email verification
- [ ] Implementasi "Lupa Password" feature
- [ ] Tambahkan 2FA (Two Factor Authentication)
- [ ] Implementasi OAuth (Google, GitHub login)

---

## ❓ FAQ

**Q: Admin tidak bisa login?**
A: Pastikan sudah membuat admin account dengan script `node scripts/create-admin.js`

**Q: Email sudah digunakan saat register?**
A: Email harus unik. Gunakan email yang berbeda atau reset database.

**Q: Password tidak cocok saat login?**
A: Pastikan password yang dimasukkan benar. Password bersifat case-sensitive.

**Q: Bagaimana reset password user?**
A: Saat ini belum ada fitur reset password. Gunakan Prisma Studio untuk mengedit password (harus di-hash terlebih dahulu).

**Q: Bisakah menghapus user dari website?**
A: Saat ini belum ada fitur delete user di website. Gunakan Prisma Studio untuk delete.

---

**Last Updated**: 15 May 2026  
**Version**: 1.0.0
