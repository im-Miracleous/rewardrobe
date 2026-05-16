-- CreateEnum
CREATE TYPE "RoleUser" AS ENUM ('admin', 'donatur', 'penerima');

-- CreateEnum
CREATE TYPE "TipePenerima" AS ENUM ('panti', 'komunitas', 'pengrajin');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "no_telpon" TEXT,
    "alamat_lengkap" TEXT,
    "kota" TEXT,
    "foto_profil" TEXT,
    "role" "RoleUser" NOT NULL,
    "tipe" "TipePenerima",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
