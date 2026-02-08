-- Step 1: Create May's Shop tenant
INSERT INTO "Tenant" (id, slug, name, region, currency, timezone, languages, "themeColor", status, "createdAt", "updatedAt")
VALUES (
  'tenant_maysshop_001',
  'maysshop',
  'May''s Shop',
  'HK',
  'HKD',
  'Asia/Hong_Kong',
  ARRAY['zh-HK', 'en'],
  '#FF9500',
  'active',
  now(),
  now()
)
ON CONFLICT (slug) DO NOTHING;

-- Step 2: Bind all existing data to May's Shop
UPDATE "Product"         SET "tenantId" = 'tenant_maysshop_001' WHERE "tenantId" IS NULL;
UPDATE "Order"           SET "tenantId" = 'tenant_maysshop_001' WHERE "tenantId" IS NULL;
UPDATE "SiteContent"     SET "tenantId" = 'tenant_maysshop_001' WHERE "tenantId" IS NULL;
UPDATE "User"            SET "tenantId" = 'tenant_maysshop_001' WHERE "tenantId" IS NULL;
UPDATE "Badge"           SET "tenantId" = 'tenant_maysshop_001' WHERE "tenantId" IS NULL;
UPDATE "Coupon"          SET "tenantId" = 'tenant_maysshop_001' WHERE "tenantId" IS NULL;
UPDATE "AdminLog"        SET "tenantId" = 'tenant_maysshop_001' WHERE "tenantId" IS NULL;
UPDATE "HomepageSection" SET "tenantId" = 'tenant_maysshop_001' WHERE "tenantId" IS NULL;
UPDATE "HomepageBanner"  SET "tenantId" = 'tenant_maysshop_001' WHERE "tenantId" IS NULL;
UPDATE "PaymentMethod"   SET "tenantId" = 'tenant_maysshop_001' WHERE "tenantId" IS NULL;
UPDATE "Category"        SET "tenantId" = 'tenant_maysshop_001' WHERE "tenantId" IS NULL;
UPDATE "ProductVariant"  SET "tenantId" = 'tenant_maysshop_001' WHERE "tenantId" IS NULL;
UPDATE "AttributeDefinition" SET "tenantId" = 'tenant_maysshop_001' WHERE "tenantId" IS NULL;
UPDATE "StoreSettings"   SET "tenantId" = 'tenant_maysshop_001' WHERE "tenantId" IS NULL;
UPDATE "IdempotencyKey"  SET "tenantId" = 'tenant_maysshop_001' WHERE "tenantId" IS NULL;

-- Step 3: Verify no NULLs remain
-- Run these manually to confirm:
-- SELECT 'Product' AS tbl, COUNT(*) AS null_count FROM "Product" WHERE "tenantId" IS NULL
-- UNION ALL SELECT 'Order', COUNT(*) FROM "Order" WHERE "tenantId" IS NULL
-- UNION ALL SELECT 'SiteContent', COUNT(*) FROM "SiteContent" WHERE "tenantId" IS NULL
-- UNION ALL SELECT 'User', COUNT(*) FROM "User" WHERE "tenantId" IS NULL
-- UNION ALL SELECT 'Badge', COUNT(*) FROM "Badge" WHERE "tenantId" IS NULL
-- UNION ALL SELECT 'Coupon', COUNT(*) FROM "Coupon" WHERE "tenantId" IS NULL
-- UNION ALL SELECT 'AdminLog', COUNT(*) FROM "AdminLog" WHERE "tenantId" IS NULL
-- UNION ALL SELECT 'HomepageSection', COUNT(*) FROM "HomepageSection" WHERE "tenantId" IS NULL
-- UNION ALL SELECT 'HomepageBanner', COUNT(*) FROM "HomepageBanner" WHERE "tenantId" IS NULL
-- UNION ALL SELECT 'PaymentMethod', COUNT(*) FROM "PaymentMethod" WHERE "tenantId" IS NULL
-- UNION ALL SELECT 'Category', COUNT(*) FROM "Category" WHERE "tenantId" IS NULL
-- UNION ALL SELECT 'ProductVariant', COUNT(*) FROM "ProductVariant" WHERE "tenantId" IS NULL
-- UNION ALL SELECT 'AttributeDefinition', COUNT(*) FROM "AttributeDefinition" WHERE "tenantId" IS NULL
-- UNION ALL SELECT 'StoreSettings', COUNT(*) FROM "StoreSettings" WHERE "tenantId" IS NULL
-- UNION ALL SELECT 'IdempotencyKey', COUNT(*) FROM "IdempotencyKey" WHERE "tenantId" IS NULL;
-- All counts should be 0.

-- Step 4: After confirming no NULLs, apply schema change (tenantId String? -> String)
-- via: npx prisma db push
