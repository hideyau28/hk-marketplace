-- AlterTable: add soft-delete column to Product (nullable, safe for existing rows)
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
