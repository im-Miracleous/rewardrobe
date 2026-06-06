-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN     "requirement" TEXT,
ADD COLUMN     "verification_required" BOOLEAN NOT NULL DEFAULT false;
