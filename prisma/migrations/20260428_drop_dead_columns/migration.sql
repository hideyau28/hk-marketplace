-- Drop legacy columns that are no longer referenced anywhere in code.
-- Code grep confirmed zero references in app/, lib/, components/ (excluding .bak.* and .claude/worktrees).
-- Backups for non-null data saved locally:
--   backups/tenant_legacy_fields_20260428.json (paymentMethods + showLowStock)
--
-- Skipped from this migration (need real data migration first):
--   Product.variants / Product.variantLabel — 248 products still have legacy JSONB
--   variant data without corresponding ProductVariant table rows. Dropping now would
--   permanently lose that data. Tracked separately.

-- Order
ALTER TABLE "Order" DROP COLUMN IF EXISTS "paymentMethodType";  -- 0 non-null rows; replaced by PaymentMethod relation
ALTER TABLE "Order" DROP COLUMN IF EXISTS "paymentProofUrl";    -- 0 non-null rows; replaced by Order.paymentProof

-- Product
ALTER TABLE "Product" DROP COLUMN IF EXISTS "inventoryCount";   -- 0 non-null rows; replaced by inventoryMode + variant stock
ALTER TABLE "Product" DROP COLUMN IF EXISTS "preorderDate";     -- feature removed
ALTER TABLE "Product" DROP COLUMN IF EXISTS "preorderNote";     -- feature removed
ALTER TABLE "Product" DROP COLUMN IF EXISTS "promoEndDate";     -- feature removed
ALTER TABLE "Product" DROP COLUMN IF EXISTS "visible";          -- replaced by Product.hidden (inverted)

-- Tenant
ALTER TABLE "Tenant" DROP COLUMN IF EXISTS "fpsId";             -- 0 non-null rows; replaced by Tenant.fpsAccountId
ALTER TABLE "Tenant" DROP COLUMN IF EXISTS "fpsQrCode";         -- 0 non-null rows; replaced by Tenant.fpsQrCodeUrl
ALTER TABLE "Tenant" DROP COLUMN IF EXISTS "logo";              -- 0 non-null rows; replaced by Tenant.logoUrl
ALTER TABLE "Tenant" DROP COLUMN IF EXISTS "paymentMethods";    -- 12 rows backed up; replaced by PaymentMethod table
ALTER TABLE "Tenant" DROP COLUMN IF EXISTS "showLowStock";      -- 12 rows backed up; feature removed

-- StoreSettings
ALTER TABLE "StoreSettings" DROP COLUMN IF EXISTS "socialLinks"; -- 0 non-null rows; replaced by Tenant.socialLinks
