/**
 * P4-B Migration: Create May's Shop tenant + bind all existing data
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." npx tsx scripts/migrate-maysshop.ts
 *
 * After this script succeeds, run:
 *   DATABASE_URL="postgresql://..." npx prisma db push
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("ERROR: DATABASE_URL is not set");
  process.exit(1);
}

const pool = new Pool({
  connectionString: url,
  ssl: { rejectUnauthorized: true },
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const TABLES_WITH_TENANT_ID = [
  "Product",
  "Order",
  "SiteContent",
  "User",
  "Badge",
  "Coupon",
  "AdminLog",
  "HomepageSection",
  "HomepageBanner",
  "PaymentMethod",
  "Category",
  "ProductVariant",
  "AttributeDefinition",
  "StoreSettings",
  "IdempotencyKey",
] as const;

async function main() {
  console.log("=== P4-B Migration: May's Shop Tenant ===\n");

  // Step 1: Create or migrate May's Shop tenant
  // If an old "hk-marketplace" tenant exists, rename its slug to "maysshop"
  console.log("Step 1: Creating May's Shop tenant...");

  const oldTenant = await prisma.tenant.findUnique({ where: { slug: "hk-marketplace" } });
  let tenant;

  if (oldTenant) {
    console.log(`  Found existing tenant with slug "hk-marketplace" (id=${oldTenant.id}), renaming to "maysshop"...`);
    tenant = await prisma.tenant.update({
      where: { id: oldTenant.id },
      data: {
        slug: "maysshop",
        name: "May's Shop",
        description: "香港波鞋專門店",
        themeColor: "#FF9500",
        template: "default",
      },
    });
  } else {
    tenant = await prisma.tenant.upsert({
      where: { slug: "maysshop" },
      update: {},
      create: {
        slug: "maysshop",
        name: "May's Shop",
        description: "香港波鞋專門店",
        region: "HK",
        currency: "HKD",
        timezone: "Asia/Hong_Kong",
        languages: ["zh-HK", "en"],
        themeColor: "#FF9500",
        template: "default",
        status: "active",
      },
    });
  }
  console.log(`  Tenant ready: id=${tenant.id}, slug=${tenant.slug}\n`);

  // Step 2: Bind all existing data to May's Shop
  console.log("Step 2: Binding existing data to tenant...");
  for (const table of TABLES_WITH_TENANT_ID) {
    const result = await prisma.$executeRawUnsafe(
      `UPDATE "${table}" SET "tenantId" = $1 WHERE "tenantId" IS NULL`,
      tenant.id
    );
    if (result > 0) {
      console.log(`  ${table}: ${result} rows updated`);
    } else {
      console.log(`  ${table}: no NULL rows (already bound)`);
    }
  }

  // Also update TenantAdmin if any exist without correct tenantId
  const adminResult = await prisma.$executeRawUnsafe(
    `UPDATE "TenantAdmin" SET "tenantId" = $1 WHERE "tenantId" != $1 OR "tenantId" IS NULL`,
    tenant.id
  );
  console.log(`  TenantAdmin: ${adminResult} rows updated\n`);

  // Step 3: Verify no NULLs remain
  console.log("Step 3: Verifying no NULL tenantId rows...");
  let allClean = true;
  for (const table of TABLES_WITH_TENANT_ID) {
    const result = await prisma.$queryRawUnsafe<[{ count: bigint }]>(
      `SELECT COUNT(*) as count FROM "${table}" WHERE "tenantId" IS NULL`
    );
    const count = Number(result[0].count);
    if (count > 0) {
      console.error(`  ERROR: ${table} has ${count} rows with NULL tenantId`);
      allClean = false;
    }
  }

  if (allClean) {
    console.log("  All tables clean — no NULL tenantId rows.\n");
    console.log("=== Migration completed successfully! ===");
    console.log("\nNext step:");
    console.log('  DATABASE_URL="..." npx prisma db push');
    console.log("  (This will make tenantId NOT NULL in the database)\n");
  } else {
    console.error("\n=== Migration FAILED: NULL rows remain ===");
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error("Migration error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
