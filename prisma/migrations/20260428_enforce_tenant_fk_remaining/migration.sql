-- Tighten ON DELETE action from SET NULL/NO ACTION to RESTRICT for TenantPaymentConfig + CustomerNote.
-- Both tables already have tenantId NOT NULL and zero NULL rows; only FK action needs updating.

-- TenantPaymentConfig (existing FK is NO ACTION/CASCADE; Prisma client ORM treats this as restricted, but normalize for explicitness)
ALTER TABLE "TenantPaymentConfig" DROP CONSTRAINT IF EXISTS "TenantPaymentConfig_tenantId_fkey";
ALTER TABLE "TenantPaymentConfig" ADD CONSTRAINT "TenantPaymentConfig_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CustomerNote
ALTER TABLE "CustomerNote" DROP CONSTRAINT IF EXISTS "CustomerNote_tenantId_fkey";
ALTER TABLE "CustomerNote" ADD CONSTRAINT "CustomerNote_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Missing performance index on CustomerNote.createdAt (schema declares it; prod missing it)
CREATE INDEX IF NOT EXISTS "CustomerNote_createdAt_idx" ON "CustomerNote"("createdAt");
