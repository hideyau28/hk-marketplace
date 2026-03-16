-- Migration: add customer notes table for CRM notes feature
-- Additive only; safe to deploy before code reads/writes the new table.

CREATE TABLE IF NOT EXISTS "CustomerNote" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "note" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CustomerNote_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CustomerNote_tenantId_fkey"
    FOREIGN KEY ("tenantId")
    REFERENCES "Tenant"("id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "CustomerNote_tenantId_phone_idx"
  ON "CustomerNote"("tenantId", "phone");

CREATE INDEX IF NOT EXISTS "CustomerNote_createdAt_idx"
  ON "CustomerNote"("createdAt");
