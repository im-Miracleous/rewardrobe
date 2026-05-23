-- AlterTable
ALTER TABLE "barang_donasi" ADD COLUMN     "kondisi_user" TEXT NOT NULL DEFAULT 'fair',
ALTER COLUMN "judul" DROP NOT NULL,
ALTER COLUMN "kategori" DROP NOT NULL,
ALTER COLUMN "berat_kg" DROP NOT NULL;
