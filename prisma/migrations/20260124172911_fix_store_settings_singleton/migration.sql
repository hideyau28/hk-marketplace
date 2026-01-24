/*
  Warnings:

  - The primary key for the `StoreSettings` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "StoreSettings" DROP CONSTRAINT "StoreSettings_pkey",
ALTER COLUMN "id" SET DEFAULT 'default',
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "storeName" DROP NOT NULL,
ALTER COLUMN "tagline" DROP NOT NULL,
ADD CONSTRAINT "StoreSettings_pkey" PRIMARY KEY ("id");
