-- Cleanup orphan rows with NULL tenantId, then enforce NOT NULL + RESTRICT FK on
-- IdempotencyKey, PaymentMethod, StoreSettings. Backups for PaymentMethod and
-- StoreSettings rows saved locally before delete (see backups/*_null_orphans_20260428.json).
--
-- Audit confirmed:
--   IdempotencyKey: 31 NULL rows, all from 2026-02-09 to 2026-03-01 (well past idempotency TTL)
--   PaymentMethod:  12 NULL rows, owner Tenant deleted long ago (orphaned by old ON DELETE SET NULL FK)
--   StoreSettings:   8 NULL rows, owner Tenant deleted long ago
-- All read paths filter tenantId, so these rows are unreachable from code.

-- 1. Delete orphans
DELETE FROM "IdempotencyKey" WHERE "tenantId" IS NULL;
DELETE FROM "PaymentMethod" WHERE "tenantId" IS NULL;
DELETE FROM "StoreSettings" WHERE "tenantId" IS NULL;

-- 2. Enforce NOT NULL
ALTER TABLE "IdempotencyKey" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "PaymentMethod" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "StoreSettings" ALTER COLUMN "tenantId" SET NOT NULL;

-- 3. Replace FK with ON DELETE RESTRICT to prevent future orphans
ALTER TABLE "IdempotencyKey" DROP CONSTRAINT IF EXISTS "IdempotencyKey_tenantId_fkey";
ALTER TABLE "IdempotencyKey" ADD CONSTRAINT "IdempotencyKey_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PaymentMethod" DROP CONSTRAINT IF EXISTS "PaymentMethod_tenantId_fkey";
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "StoreSettings" DROP CONSTRAINT IF EXISTS "StoreSettings_tenantId_fkey";
ALTER TABLE "StoreSettings" ADD CONSTRAINT "StoreSettings_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
