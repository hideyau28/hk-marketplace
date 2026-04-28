-- Enforce tenantId NOT NULL + ON DELETE RESTRICT for tables with zero NULL tenantId rows.
-- Tables with NULL rows (IdempotencyKey, PaymentMethod, StoreSettings) are handled separately.

-- AdminLog
ALTER TABLE "AdminLog" DROP CONSTRAINT IF EXISTS "AdminLog_tenantId_fkey";
ALTER TABLE "AdminLog" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "AdminLog" ADD CONSTRAINT "AdminLog_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AttributeDefinition
ALTER TABLE "AttributeDefinition" DROP CONSTRAINT IF EXISTS "AttributeDefinition_tenantId_fkey";
ALTER TABLE "AttributeDefinition" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "AttributeDefinition" ADD CONSTRAINT "AttributeDefinition_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Badge
ALTER TABLE "Badge" DROP CONSTRAINT IF EXISTS "Badge_tenantId_fkey";
ALTER TABLE "Badge" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Badge" ADD CONSTRAINT "Badge_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Category
ALTER TABLE "Category" DROP CONSTRAINT IF EXISTS "Category_tenantId_fkey";
ALTER TABLE "Category" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Category" ADD CONSTRAINT "Category_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Coupon
ALTER TABLE "Coupon" DROP CONSTRAINT IF EXISTS "Coupon_tenantId_fkey";
ALTER TABLE "Coupon" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- HomepageBanner
ALTER TABLE "HomepageBanner" DROP CONSTRAINT IF EXISTS "HomepageBanner_tenantId_fkey";
ALTER TABLE "HomepageBanner" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "HomepageBanner" ADD CONSTRAINT "HomepageBanner_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- HomepageSection
ALTER TABLE "HomepageSection" DROP CONSTRAINT IF EXISTS "HomepageSection_tenantId_fkey";
ALTER TABLE "HomepageSection" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "HomepageSection" ADD CONSTRAINT "HomepageSection_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Order
ALTER TABLE "Order" DROP CONSTRAINT IF EXISTS "Order_tenantId_fkey";
ALTER TABLE "Order" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Order" ADD CONSTRAINT "Order_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Product
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_tenantId_fkey";
ALTER TABLE "Product" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "Product" ADD CONSTRAINT "Product_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ProductVariant
ALTER TABLE "ProductVariant" DROP CONSTRAINT IF EXISTS "ProductVariant_tenantId_fkey";
ALTER TABLE "ProductVariant" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SiteContent
ALTER TABLE "SiteContent" DROP CONSTRAINT IF EXISTS "SiteContent_tenantId_fkey";
ALTER TABLE "SiteContent" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "SiteContent" ADD CONSTRAINT "SiteContent_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- User
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_tenantId_fkey";
ALTER TABLE "User" ALTER COLUMN "tenantId" SET NOT NULL;
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
