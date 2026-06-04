-- AlterTable
ALTER TABLE "barang_donasi" ADD COLUMN     "campaign_id" INTEGER;

-- CreateTable
CREATE TABLE "campaigns" (
    "id" SERIAL NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "target_dana" DOUBLE PRECISION,
    "terkumpul_dana" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "target_barang" INTEGER,
    "terkumpul_barang" INTEGER NOT NULL DEFAULT 0,
    "foto_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'aktif',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partisipasi_campaign" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "campaign_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partisipasi_campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donasi_uang" (
    "id" SERIAL NOT NULL,
    "nominal" DOUBLE PRECISION NOT NULL,
    "bukti_transfer" TEXT NOT NULL,
    "catatan" TEXT,
    "status" "StatusBarang" NOT NULL DEFAULT 'menunggu_verifikasi',
    "donatur_id" INTEGER NOT NULL,
    "campaign_id" INTEGER,
    "verified_by" INTEGER,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "donasi_uang_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "partisipasi_campaign_user_id_campaign_id_key" ON "partisipasi_campaign"("user_id", "campaign_id");

-- AddForeignKey
ALTER TABLE "barang_donasi" ADD CONSTRAINT "barang_donasi_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partisipasi_campaign" ADD CONSTRAINT "partisipasi_campaign_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partisipasi_campaign" ADD CONSTRAINT "partisipasi_campaign_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donasi_uang" ADD CONSTRAINT "donasi_uang_donatur_id_fkey" FOREIGN KEY ("donatur_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donasi_uang" ADD CONSTRAINT "donasi_uang_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donasi_uang" ADD CONSTRAINT "donasi_uang_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;
