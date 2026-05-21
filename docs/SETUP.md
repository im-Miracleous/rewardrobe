# 📋 Ringkasan Perubahan Authentication - ReWardrobe

## ✅ Yang Sudah Diselesaikan

### 1. Pisahkan Halaman Login & Register
- ✅ **[Login Page](./src/app/auth/login/page.tsx)** - `/auth/login`
- ✅ **[Register Page](./src/app/auth/register/page.tsx)** - `/auth/register`
- ✅ **[Auth Router](./src/app/auth/page.tsx)** - Redirect ke `/auth/login`

### 2. API Routes untuk Authentication
- ✅ **[Login API](./src/app/api/auth/login/route.ts)** - `POST /api/auth/login`
- ✅ **[Register API](./src/app/api/auth/register/route.ts)** - `POST /api/auth/register`

### 3. Authentication Utilities
- ✅ **[Auth Utilities](./src/lib/auth.ts)** - Password hashing & verification dengan bcryptjs

### 4. Admin Account Management
- ✅ **[Create Admin Script](./scripts/create-admin.js)** - Terminal script untuk membuat admin account

### 5. Documentation
- ✅ **[AUTH_GUIDE.md](./AUTH_GUIDE.md)** - Panduan lengkap penggunaan

---

## 🎯 Fitur yang Tersedia

### 🔐 Login
| Fitur | Status |
|-------|--------|
| Email & Password Validation | ✅ |
| Password Hashing (bcryptjs) | ✅ |
| Auto-redirect berdasarkan role | ✅ |
| Session management | ✅ |
| Error handling | ✅ |

### ✍️ Register
| Fitur | Status |
|-------|--------|
| Registrasi Donatur | ✅ |
| Registrasi Penerima (dengan tipe) | ✅ |
| Form validation lengkap | ✅ |
| Email uniqueness check | ✅ |
| Password confirmation | ✅ |
| Admin protection (tidak bisa register) | ✅ |

### 👨‍💼 Admin Account
| Fitur | Status |
|-------|--------|
| Membuat via terminal script | ✅ |
| Aman dari website registration | ✅ |
| Database entry langsung | ✅ |

---

## 🚀 Quick Start

### 1. **Membuat Admin Account**
```bash
node scripts/create-admin.js
```

### 2. **Test Login**
- Buka: http://localhost:3000/auth/login
- Gunakan email & password dari admin account yang dibuat

### 3. **Test Register**
- Buka: http://localhost:3000/auth/register
- Daftar sebagai Donatur atau Penerima
- Setelah sukses, login dengan akun yang baru dibuat

### 4. **Manage Users dengan Prisma Studio**
```bash
npx prisma studio
```
- Buka: http://localhost:51212
- Klik "users" di sidebar
- Lihat, filter, edit, atau hapus users

### 5. **Reset Database + Seed Dummy Data**
```bash
npx prisma migrate reset --force
```
Perintah ini adalah padanan paling dekat dengan `php artisan migrate:fresh --seed`.

Kalau ingin memakai shortcut project:
```bash
npm run db:fresh
```

### 6. **Jalankan Test Autentikasi**
```bash
npm test
```
Atau:
```bash
npm run test:auth
```

---

## 📊 Database Structure

### Users Table
```
Kolom                 Tipe            Constraint
─────────────────────────────────────────────
id                   Int            PRIMARY KEY, AUTO INCREMENT
nama                 String         NOT NULL
email                String         NOT NULL, UNIQUE
password             String         NOT NULL (hashed)
no_telpon            String?        OPTIONAL
alamat_lengkap       String?        OPTIONAL
kota                 String?        OPTIONAL
foto_profil          String?        OPTIONAL
role                 Enum           admin | donatur | penerima
tipe                 Enum?          panti | komunitas | pengrajin (only for penerima)
created_at           DateTime       DEFAULT: now()
updated_at           DateTime       AUTO UPDATE
```

---

## 📝 Contoh Data

### Admin Account (via terminal)
```
Email: admin@rewardrobe.com
Password: AdminPass123
Role: admin
```

### Donatur Account (via website register)
```
Nama: Budi Santoso
Email: budi@example.com
Password: Password123
Role: donatur
```

### Penerima Account (via website register)
```
Nama: Panti Harapan
Email: panti@example.com
Password: Password123
Role: penerima
Tipe: panti
```

---

## 🔗 Routes

| URL | Method | Deskripsi |
|-----|--------|-----------|
| `/auth` | GET | Redirect ke login |
| `/auth/login` | GET | Halaman login |
| `/auth/register` | GET | Halaman register |
| `/api/auth/login` | POST | API login |
| `/api/auth/register` | POST | API register |

---

## 🛠️ File Structure

```
rewardrobe/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── page.tsx
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── api/
│   │   │       └── auth/
│   │   │           ├── login/
│   │   │           │   └── route.ts
│   │   │           └── register/
│   │   │               └── route.ts
│   │   ├── dashboard/
│   │   ├── api/
│   │   └── ...
│   ├── lib/
│   │   ├── auth.ts (NEW)
│   │   ├── prisma.ts
│   │   └── ...
│   └── components/
├── scripts/
│   └── create-admin.js (NEW)
├── prisma/
│   └── schema.prisma
├── AUTH_GUIDE.md (NEW)
├── SETUP.md (NEW - this file)
└── ...
```

---

## ⚙️ Technical Details

### Password Hashing
- Algorithm: bcryptjs
- Salt Rounds: 10
- Password tidak pernah tersimpan plain text

### Session Management
- Menggunakan localStorage (client-side)
- Token format: `token_${userId}` (basic, akan di-upgrade ke JWT)
- Autentikasi di-check saat login

### Validation
- Email: valid format & unique
- Password: minimum 6 character
- Required fields: nama, email, password, no_telpon, alamat, kota

### Security
- Admin tidak bisa register dari website
- Email validation sebelum register
- Password hashing sebelum disimpan
- Error message yang aman (tidak leak info)
- Logout menghapus cookie auth dan localStorage, lalu middleware memaksa login ulang jika dashboard diakses lagi

---

## 🧪 Testing Checklist

- [ ] Test register donatur
- [ ] Test register penerima
- [ ] Test admin tidak bisa register
- [ ] Test login dengan akun yang benar
- [ ] Test login dengan password salah
- [ ] Test login dengan email tidak terdaftar
- [ ] Test redirect dashboard sesuai role
- [ ] Test email unique validation
- [ ] Test password confirmation di register
- [ ] Test form validation error messages
- [ ] Test Prisma Studio untuk view users
- [ ] Test Prisma Studio untuk filter by role
- [ ] Test create admin via terminal script
- [ ] Test `npm test` untuk auth utility
- [ ] Test logout lalu tekan Back, pastikan kembali ke login

---

## 💡 Tips

### 1. Membuat Multiple Test Accounts
```bash
# Terminal 1: Create admin
node scripts/create-admin.js

# Browser: Register donatur di /auth/register
# Browser: Register penerima di /auth/register
# Prisma Studio: View semua user di http://localhost:51212
```

### 2. Filter Users by Role di Prisma Studio
1. Buka Prisma Studio
2. Klik users table
3. Klik Filter icon
4. Select field "role"
5. Select operator "equals"
6. Type value: "donatur" / "penerima" / "admin"
7. Klik Apply

### 3. View User Details
- Di Prisma Studio, klik row user untuk melihat detail lengkap
- Termasuk created_at, updated_at, password (hashed)

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Admin cannot register" error saat daftar admin | Normal! Admin harus dibuat via terminal script |
| "Email already registered" | Email sudah digunakan, gunakan email lain |
| Login gagal dengan email benar | Pastikan password benar (case-sensitive) |
| Prisma Studio error | Stop server, jalankan `npx prisma studio` lagi |
| Halaman login kosong | Pastikan API running & database terhubung |

---

## 📚 Related Documentation

- [AUTH_GUIDE.md](./AUTH_GUIDE.md) - Panduan detail
- [prisma/schema.prisma](./prisma/schema.prisma) - Database schema
- [src/lib/auth.ts](./src/lib/auth.ts) - Auth functions

---

**Status**: ✅ Selesai  
**Last Updated**: 15 May 2026  
**Version**: 1.0.0
