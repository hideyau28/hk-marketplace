-- Drop legacy Product.variants JSONB and Product.variantLabel after data migration.
-- 1,469 variant entries from 248 products migrated to ProductVariant table via
-- scripts/migrate-product-variants.ts; verified zero unmigrated products remain.

ALTER TABLE "Product" DROP COLUMN IF EXISTS "variants";
ALTER TABLE "Product" DROP COLUMN IF EXISTS "variantLabel";
