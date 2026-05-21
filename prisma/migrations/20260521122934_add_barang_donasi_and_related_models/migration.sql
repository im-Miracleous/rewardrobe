-- CreateEnum
CREATE TYPE "StatusBarang" AS ENUM ('menunggu_verifikasi', 'disetujui', 'ditolak', 'tersalurkan');

-- CreateEnum
CREATE TYPE "LabelAI" AS ENUM ('layak_donasi', 'perlu_perbaikan', 'daur_ulang');

-- CreateEnum
CREATE TYPE "TipePengiriman" AS ENUM ('donatur_ke_admin', 'admin_ke_penerima');

-- CreateEnum
CREATE TYPE "StatusPermintaan" AS ENUM ('menunggu', 'diterima', 'ditolak');

-- CreateEnum
CREATE TYPE "StatusPengiriman" AS ENUM ('disiapkan', 'dalam_pengiriman', 'terkirim');

-- CreateTable
CREATE TABLE "barang_donasi" (
    "id" SERIAL NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "berat_kg" DOUBLE PRECISION NOT NULL,
    "foto_url" TEXT,
    "label_ai" "LabelAI",
    "status" "StatusBarang" NOT NULL DEFAULT 'menunggu_verifikasi',
    "donatur_id" INTEGER NOT NULL,
    "verified_by" INTEGER,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "barang_donasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permintaan" (
    "id" SERIAL NOT NULL,
    "barang_id" INTEGER NOT NULL,
    "penerima_id" INTEGER NOT NULL,
    "pesan" TEXT,
    "status" "StatusPermintaan" NOT NULL DEFAULT 'menunggu',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permintaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pengiriman" (
    "id" SERIAL NOT NULL,
    "barang_id" INTEGER NOT NULL,
    "tipe" "TipePengiriman" NOT NULL,
    "kurir" TEXT,
    "status" "StatusPengiriman" NOT NULL DEFAULT 'disiapkan',
    "resi" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengiriman_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_poin" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "poin" INTEGER NOT NULL,
    "keterangan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "log_poin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifikasi" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "judul" TEXT NOT NULL,
    "pesan" TEXT NOT NULL,
    "dibaca" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifikasi_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "barang_donasi" ADD CONSTRAINT "barang_donasi_donatur_id_fkey" FOREIGN KEY ("donatur_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barang_donasi" ADD CONSTRAINT "barang_donasi_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permintaan" ADD CONSTRAINT "permintaan_barang_id_fkey" FOREIGN KEY ("barang_id") REFERENCES "barang_donasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permintaan" ADD CONSTRAINT "permintaan_penerima_id_fkey" FOREIGN KEY ("penerima_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengiriman" ADD CONSTRAINT "pengiriman_barang_id_fkey" FOREIGN KEY ("barang_id") REFERENCES "barang_donasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_poin" ADD CONSTRAINT "log_poin_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifikasi" ADD CONSTRAINT "notifikasi_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
