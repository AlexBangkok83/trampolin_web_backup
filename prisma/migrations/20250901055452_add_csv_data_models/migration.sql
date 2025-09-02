/*
  Warnings:

  - The `status` column on the `CsvUpload` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[stripeCustomerId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fileSize` to the `CsvUpload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalName` to the `CsvUpload` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."CsvUploadStatus" AS ENUM ('pending', 'processing', 'completed', 'failed');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."SubscriptionStatus" ADD VALUE 'incomplete';
ALTER TYPE "public"."SubscriptionStatus" ADD VALUE 'incomplete_expired';
ALTER TYPE "public"."SubscriptionStatus" ADD VALUE 'paused';

-- AlterTable
ALTER TABLE "public"."CsvUpload" ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "fileSize" INTEGER NOT NULL,
ADD COLUMN     "headers" TEXT[],
ADD COLUMN     "originalName" TEXT NOT NULL,
ADD COLUMN     "totalRows" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "validRows" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "status",
ADD COLUMN     "status" "public"."CsvUploadStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "stripeCustomerId" TEXT;

-- CreateTable
CREATE TABLE "public"."CsvRow" (
    "id" TEXT NOT NULL,
    "uploadId" TEXT NOT NULL,
    "rowIndex" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CsvRow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CsvRow_uploadId_rowIndex_idx" ON "public"."CsvRow"("uploadId", "rowIndex");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "public"."User"("stripeCustomerId");

-- AddForeignKey
ALTER TABLE "public"."CsvRow" ADD CONSTRAINT "CsvRow_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "public"."CsvUpload"("id") ON DELETE CASCADE ON UPDATE CASCADE;
