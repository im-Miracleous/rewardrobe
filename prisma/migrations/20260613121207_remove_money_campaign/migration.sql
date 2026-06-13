/*
  Warnings:

  - The values [menunggu_verifikasi,disetujui] on the enum `StatusBarang` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `campaign_id` on the `barang_donasi` table. All the data in the column will be lost.
  - You are about to drop the `campaigns` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `donasi_uang` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `partisipasi_campaign` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "barang_donasi" DROP CONSTRAINT "barang_donasi_campaign_id_fkey";

-- DropForeignKey
ALTER TABLE "donasi_uang" DROP CONSTRAINT "donasi_uang_campaign_id_fkey";

-- DropForeignKey
ALTER TABLE "donasi_uang" DROP CONSTRAINT "donasi_uang_donatur_id_fkey";

-- DropForeignKey
ALTER TABLE "donasi_uang" DROP CONSTRAINT "donasi_uang_verified_by_fkey";

-- DropForeignKey
ALTER TABLE "partisipasi_campaign" DROP CONSTRAINT "partisipasi_campaign_campaign_id_fkey";

-- DropForeignKey
ALTER TABLE "partisipasi_campaign" DROP CONSTRAINT "partisipasi_campaign_user_id_fkey";

-- DropTable (drop dulu agar tidak ada lagi kolom yang bergantung pada enum lama)
DROP TABLE "donasi_uang";

-- DropTable
DROP TABLE "partisipasi_campaign";

-- DropTable
DROP TABLE "campaigns";

-- AlterEnum
BEGIN;
CREATE TYPE "StatusBarang_new" AS ENUM ('menunggu_pengiriman', 'terkirim', 'tersalurkan', 'ditolak');
ALTER TABLE "public"."barang_donasi" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "barang_donasi" ALTER COLUMN "status" TYPE "StatusBarang_new" USING ("status"::text::"StatusBarang_new");
ALTER TYPE "StatusBarang" RENAME TO "StatusBarang_old";
ALTER TYPE "StatusBarang_new" RENAME TO "StatusBarang";
DROP TYPE "public"."StatusBarang_old";
ALTER TABLE "barang_donasi" ALTER COLUMN "status" SET DEFAULT 'menunggu_pengiriman';
COMMIT;

-- AlterTable
ALTER TABLE "barang_donasi" DROP COLUMN "campaign_id",
ALTER COLUMN "status" SET DEFAULT 'menunggu_pengiriman';
