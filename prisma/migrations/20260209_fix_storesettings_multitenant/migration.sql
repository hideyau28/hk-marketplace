-- Fix StoreSettings: remove singleton "default" id, use cuid PK + unique tenantId
-- This allows each tenant to have exactly one StoreSettings row.

-- Step 1: Drop old PK constraint
ALTER TABLE "StoreSettings" DROP CONSTRAINT IF EXISTS "StoreSettings_pkey";

-- Step 2: Change id default from 'default' to gen_random_uuid()
ALTER TABLE "StoreSettings" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- Step 3: Update existing rows — give them a real unique id (May's Shop)
UPDATE "StoreSettings" SET "id" = gen_random_uuid() WHERE "id" = 'default';

-- Step 4: Re-add PK
ALTER TABLE "StoreSettings" ADD CONSTRAINT "StoreSettings_pkey" PRIMARY KEY ("id");

-- Step 5: Drop old tenantId index (replaced by unique constraint)
DROP INDEX IF EXISTS "StoreSettings_tenantId_idx";

-- Step 6: Add unique constraint on tenantId (one settings per tenant)
CREATE UNIQUE INDEX IF NOT EXISTS "StoreSettings_tenantId_key" ON "StoreSettings"("tenantId");
