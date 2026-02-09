-- Add mode field to Tenant (biolink = 簡化 sidebar, fullstore = 全部功能)
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "mode" TEXT DEFAULT 'biolink';

-- May's Shop 設為 fullstore
UPDATE "Tenant" SET "mode" = 'fullstore' WHERE "slug" = 'maysshop';
