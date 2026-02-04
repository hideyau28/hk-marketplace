import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { prisma } from "../lib/prisma";

const isDryRun = process.argv.includes("--dry-run");
const kidsShoeTypes = new Set(["grade_school", "preschool", "toddler"]);

function normalizeSizeKey(key: string): string | null {
  if (!key.endsWith("C")) return null;
  return key.slice(0, -1).trimEnd();
}

async function main() {
  console.log(`🔧 Fixing size keys (dry-run: ${isDryRun ? "yes" : "no"})`);

  const products = await prisma.product.findMany({
    select: {
      id: true,
      title: true,
      shoeType: true,
      sizes: true,
    },
  });

  let scanned = 0;
  let skippedKids = 0;
  let updatedProducts = 0;
  let renamedKeys = 0;
  let mergedKeys = 0;

  for (const product of products) {
    scanned++;

    if (product.shoeType && kidsShoeTypes.has(product.shoeType)) {
      skippedKids++;
      continue;
    }

    const sizes = product.sizes as Record<string, number> | null;
    if (!sizes || typeof sizes !== "object" || Array.isArray(sizes)) {
      continue;
    }

    let hasChanges = false;
    const updatedSizes: Record<string, number> = {};

    for (const [key, value] of Object.entries(sizes)) {
      const normalized = normalizeSizeKey(key);
      if (normalized) {
        hasChanges = true;
        renamedKeys++;
        if (updatedSizes[normalized] !== undefined) {
          updatedSizes[normalized] += Number(value) || 0;
          mergedKeys++;
        } else {
          updatedSizes[normalized] = Number(value) || 0;
        }
        continue;
      }

      if (updatedSizes[key] !== undefined) {
        updatedSizes[key] += Number(value) || 0;
        mergedKeys++;
      } else {
        updatedSizes[key] = Number(value) || 0;
      }
    }

    if (!hasChanges) continue;

    updatedProducts++;
    const preview = Object.keys(sizes).sort().join(", ");
    const nextPreview = Object.keys(updatedSizes).sort().join(", ");

    if (isDryRun) {
      console.log(`- ${product.title} (${product.id})`);
      console.log(`  before: ${preview}`);
      console.log(`  after:  ${nextPreview}`);
    } else {
      await prisma.product.update({
        where: { id: product.id },
        data: { sizes: updatedSizes },
      });
      console.log(`✓ Updated ${product.title} (${product.id})`);
    }
  }

  console.log("\nSummary:");
  console.log(`- scanned: ${scanned}`);
  console.log(`- skipped kids: ${skippedKids}`);
  console.log(`- products updated: ${updatedProducts}`);
  console.log(`- keys renamed: ${renamedKeys}`);
  console.log(`- keys merged: ${mergedKeys}`);
  console.log(`\nRun with: npx tsx scripts/fix-size-keys.ts --dry-run`);
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
