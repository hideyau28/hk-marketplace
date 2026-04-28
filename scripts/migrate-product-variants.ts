// Migrate legacy Product.variants JSONB + Product.variantLabel into ProductVariant rows.
// Usage:
//   tsx scripts/migrate-product-variants.ts            # dry-run (default)
//   tsx scripts/migrate-product-variants.ts --apply    # commits inserts
//
// Source shape (per Product):
//   variantLabel = "尺碼"
//   variants     = { "US 12": { qty: 1, status: "available" }, ... }
//
// Target: one ProductVariant row per JSONB entry, with options = { [variantLabel]: name }.
// Idempotent: skips products that already have ProductVariant rows.

import { config } from "dotenv";
config({ path: ".env.production" });
config({ path: ".env.local" });
config({ path: ".env" });

import { prisma } from "../lib/prisma";

type LegacyVariantEntry = { qty?: number; status?: string };
type LegacyVariants = Record<string, LegacyVariantEntry>;

const isApply = process.argv.includes("--apply");
const mode = isApply ? "APPLY" : "DRY-RUN";

async function main() {
  console.log(`🔧 Migrate Product.variants → ProductVariant (${mode})`);

  const candidates = await prisma.product.findMany({
    where: {
      // Prisma can't query the legacy column directly (schema doesn't declare it),
      // so we use $queryRaw to find matching IDs first.
    },
    select: { id: true },
    take: 0, // we'll override below
  });
  void candidates; // (placeholder; real fetch via raw query below)

  // Pull all rows that have legacy variants AND no existing ProductVariant rows.
  const rows = await prisma.$queryRawUnsafe<
    Array<{
      id: string;
      tenantId: string;
      title: string;
      variantLabel: string | null;
      variants: LegacyVariants;
    }>
  >(`
    SELECT p.id, p."tenantId", p.title, p."variantLabel", p.variants
    FROM "Product" p
    WHERE p.variants IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM "ProductVariant" pv WHERE pv."productId" = p.id)
    ORDER BY p."createdAt"
  `);

  console.log(`Found ${rows.length} products needing migration`);

  let totalEntries = 0;
  let productsWithIssues = 0;
  const sample: Array<{ productId: string; entries: number; firstName: string }> = [];

  for (const row of rows) {
    if (!row.variants || typeof row.variants !== "object") {
      console.warn(`  ⚠️  ${row.id} (${row.title}): variants is not an object, skipping`);
      productsWithIssues++;
      continue;
    }
    const entries = Object.entries(row.variants);
    if (entries.length === 0) {
      console.warn(`  ⚠️  ${row.id}: empty variants object, skipping`);
      productsWithIssues++;
      continue;
    }
    if (!row.variantLabel || row.variantLabel.trim() === "") {
      console.warn(`  ⚠️  ${row.id}: missing variantLabel, defaulting to "Variant"`);
    }
    totalEntries += entries.length;
    if (sample.length < 3) {
      sample.push({ productId: row.id, entries: entries.length, firstName: entries[0][0] });
    }

    if (isApply) {
      const dimensionLabel = row.variantLabel?.trim() || "Variant";
      const data = entries.map(([name, val], idx) => ({
        tenantId: row.tenantId,
        productId: row.id,
        name,
        stock: typeof val?.qty === "number" ? val.qty : 0,
        options: { [dimensionLabel]: name } as Record<string, string>,
        active: (val?.status ?? "available") === "available",
        sortOrder: idx,
      }));
      await prisma.productVariant.createMany({ data });
    }
  }

  console.log(`\n=== Summary (${mode}) ===`);
  console.log(`  Products to migrate: ${rows.length}`);
  console.log(`  Total variant entries: ${totalEntries}`);
  console.log(`  Products with data issues: ${productsWithIssues}`);
  console.log(`  Sample:`, sample);

  if (!isApply) {
    console.log(`\n  (DRY-RUN) Re-run with --apply to commit.`);
  } else {
    const newCount = await prisma.productVariant.count();
    console.log(`  ProductVariant rows in DB after: ${newCount}`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
