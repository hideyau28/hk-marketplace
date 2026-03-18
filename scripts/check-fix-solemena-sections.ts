/**
 * Diagnostic + fix script for solemena-test HomepageSections
 * Checks all sections and fixes "Hot Right Now" cardSize if needed.
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." npx tsx scripts/check-fix-solemena-sections.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const pool = new Pool({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  // Find tenant
  const tenant = await prisma.tenant.findUnique({
    where: { slug: "solemena-test" },
    select: { id: true, slug: true, name: true },
  });

  if (!tenant) {
    console.error("Tenant 'solemena-test' not found");
    process.exit(1);
  }
  console.log(`Tenant: ${tenant.name} (${tenant.slug}) [${tenant.id}]\n`);

  // Query all HomepageSections
  const sections = await prisma.homepageSection.findMany({
    where: { tenantId: tenant.id },
    orderBy: { sortOrder: "asc" },
  });

  if (sections.length === 0) {
    console.log("No HomepageSections found for this tenant.");
    return;
  }

  console.log("── All HomepageSections ──");
  console.table(
    sections.map((s) => ({
      title: s.title,
      cardSize: s.cardSize,
      filterType: s.filterType,
      sortOrder: s.sortOrder,
      active: s.active,
    })),
  );

  // Fix "Hot Right Now" if cardSize is "large"
  const hotSection = sections.find((s) => s.title === "Hot Right Now");
  if (!hotSection) {
    console.log('\n⚠️  "Hot Right Now" section not found');
    return;
  }

  if (hotSection.cardSize === "large") {
    console.log(
      `\n🔧 Fixing: "Hot Right Now" cardSize "${hotSection.cardSize}" → "small"`,
    );
    await prisma.homepageSection.update({
      where: { id: hotSection.id },
      data: { cardSize: "small" },
    });
    console.log('✅ Updated "Hot Right Now" cardSize to "small"');
  } else {
    console.log(
      `\nℹ️  "Hot Right Now" cardSize is already "${hotSection.cardSize}" — no fix needed`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
