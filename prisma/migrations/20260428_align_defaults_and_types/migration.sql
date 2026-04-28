-- Final drift cleanup: align defaults, timestamp precision, and remaining NOT NULL.
-- All 6 columns being set NOT NULL audited as zero NULL rows.

-- Product
ALTER TABLE "Product" ALTER COLUMN "sortOrder" SET NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "hidden" SET NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "deletedAt" TYPE TIMESTAMP(3);
ALTER TABLE "Product" ALTER COLUMN "productType" DROP DEFAULT;
ALTER TABLE "Product" ALTER COLUMN "inventoryMode" SET DEFAULT 'limited';

-- Tenant
ALTER TABLE "Tenant" ALTER COLUMN "template" SET NOT NULL;
ALTER TABLE "Tenant" ALTER COLUMN "mode" SET NOT NULL;
ALTER TABLE "Tenant" ALTER COLUMN "templateId" SET NOT NULL;
ALTER TABLE "Tenant" ALTER COLUMN "hideBranding" SET NOT NULL;
ALTER TABLE "Tenant" ALTER COLUMN "coverTemplate" SET DEFAULT 'default';
ALTER TABLE "Tenant" ALTER COLUMN "planExpiresAt" TYPE TIMESTAMP(3);
ALTER TABLE "Tenant" ALTER COLUMN "trialEndsAt" TYPE TIMESTAMP(3);
ALTER TABLE "Tenant" ALTER COLUMN "deliveryOptions" SET DEFAULT '[{"id":"meetup","label":"面交","price":0,"enabled":true},{"id":"sf-collect","label":"順豐到付","price":0,"enabled":true},{"id":"sf-prepaid","label":"順豐寄付","price":30,"enabled":true}]';

-- CustomerNote — drop redundant defaults (Prisma handles via @default in schema)
ALTER TABLE "CustomerNote" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "CustomerNote" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- StoreSettings
ALTER TABLE "StoreSettings" ALTER COLUMN "id" DROP DEFAULT;

-- TenantPaymentConfig
ALTER TABLE "TenantPaymentConfig" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "TenantPaymentConfig" ALTER COLUMN "updatedAt" DROP DEFAULT;
