-- P4-B Migration: May's Shop tenant + bind existing data
-- Prefer running: DATABASE_URL="..." npx tsx scripts/migrate-maysshop.ts

-- Step 1a: If old "hk-marketplace" tenant exists, rename to "maysshop"
UPDATE "Tenant" SET slug = 'maysshop', name = 'May''s Shop', description = '香港波鞋專門店', "themeColor" = '#FF9500', template = 'default'
WHERE slug = 'hk-marketplace';

-- Step 1b: If no tenant exists at all, create fresh
INSERT INTO "Tenant" (id, slug, name, description, region, currency, timezone, languages, "themeColor", template, status, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'maysshop',
  'May''s Shop',
  '香港波鞋專門店',
  'HK',
  'HKD',
  'Asia/Hong_Kong',
  ARRAY['zh-HK', 'en'],
  '#FF9500',
  'default',
  'active',
  now(),
  now()
)
ON CONFLICT (slug) DO NOTHING;

-- Step 2: Bind all existing data to May's Shop
UPDATE "Product"              SET "tenantId" = (SELECT id FROM "Tenant" WHERE slug = 'maysshop') WHERE "tenantId" IS NULL;
UPDATE "Order"                SET "tenantId" = (SELECT id FROM "Tenant" WHERE slug = 'maysshop') WHERE "tenantId" IS NULL;
UPDATE "SiteContent"          SET "tenantId" = (SELECT id FROM "Tenant" WHERE slug = 'maysshop') WHERE "tenantId" IS NULL;
UPDATE "User"                 SET "tenantId" = (SELECT id FROM "Tenant" WHERE slug = 'maysshop') WHERE "tenantId" IS NULL;
UPDATE "Badge"                SET "tenantId" = (SELECT id FROM "Tenant" WHERE slug = 'maysshop') WHERE "tenantId" IS NULL;
UPDATE "Coupon"               SET "tenantId" = (SELECT id FROM "Tenant" WHERE slug = 'maysshop') WHERE "tenantId" IS NULL;
UPDATE "AdminLog"             SET "tenantId" = (SELECT id FROM "Tenant" WHERE slug = 'maysshop') WHERE "tenantId" IS NULL;
UPDATE "HomepageSection"      SET "tenantId" = (SELECT id FROM "Tenant" WHERE slug = 'maysshop') WHERE "tenantId" IS NULL;
UPDATE "HomepageBanner"       SET "tenantId" = (SELECT id FROM "Tenant" WHERE slug = 'maysshop') WHERE "tenantId" IS NULL;
UPDATE "PaymentMethod"        SET "tenantId" = (SELECT id FROM "Tenant" WHERE slug = 'maysshop') WHERE "tenantId" IS NULL;
UPDATE "Category"             SET "tenantId" = (SELECT id FROM "Tenant" WHERE slug = 'maysshop') WHERE "tenantId" IS NULL;
UPDATE "ProductVariant"       SET "tenantId" = (SELECT id FROM "Tenant" WHERE slug = 'maysshop') WHERE "tenantId" IS NULL;
UPDATE "AttributeDefinition"  SET "tenantId" = (SELECT id FROM "Tenant" WHERE slug = 'maysshop') WHERE "tenantId" IS NULL;
UPDATE "StoreSettings"        SET "tenantId" = (SELECT id FROM "Tenant" WHERE slug = 'maysshop') WHERE "tenantId" IS NULL;
UPDATE "IdempotencyKey"       SET "tenantId" = (SELECT id FROM "Tenant" WHERE slug = 'maysshop') WHERE "tenantId" IS NULL;

-- Step 3: Verify no NULLs remain (all counts should be 0)
SELECT 'Product' AS tbl, COUNT(*) AS null_count FROM "Product" WHERE "tenantId" IS NULL
UNION ALL SELECT 'Order', COUNT(*) FROM "Order" WHERE "tenantId" IS NULL
UNION ALL SELECT 'SiteContent', COUNT(*) FROM "SiteContent" WHERE "tenantId" IS NULL
UNION ALL SELECT 'User', COUNT(*) FROM "User" WHERE "tenantId" IS NULL
UNION ALL SELECT 'Badge', COUNT(*) FROM "Badge" WHERE "tenantId" IS NULL
UNION ALL SELECT 'Coupon', COUNT(*) FROM "Coupon" WHERE "tenantId" IS NULL
UNION ALL SELECT 'AdminLog', COUNT(*) FROM "AdminLog" WHERE "tenantId" IS NULL
UNION ALL SELECT 'HomepageSection', COUNT(*) FROM "HomepageSection" WHERE "tenantId" IS NULL
UNION ALL SELECT 'HomepageBanner', COUNT(*) FROM "HomepageBanner" WHERE "tenantId" IS NULL
UNION ALL SELECT 'PaymentMethod', COUNT(*) FROM "PaymentMethod" WHERE "tenantId" IS NULL
UNION ALL SELECT 'Category', COUNT(*) FROM "Category" WHERE "tenantId" IS NULL
UNION ALL SELECT 'ProductVariant', COUNT(*) FROM "ProductVariant" WHERE "tenantId" IS NULL
UNION ALL SELECT 'AttributeDefinition', COUNT(*) FROM "AttributeDefinition" WHERE "tenantId" IS NULL
UNION ALL SELECT 'StoreSettings', COUNT(*) FROM "StoreSettings" WHERE "tenantId" IS NULL
UNION ALL SELECT 'IdempotencyKey', COUNT(*) FROM "IdempotencyKey" WHERE "tenantId" IS NULL;

-- Step 4: After all counts = 0, make tenantId required:
--   npx prisma db push
