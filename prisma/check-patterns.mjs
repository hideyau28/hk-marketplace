// Check imageUrl patterns
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true }
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const products = await prisma.product.findMany({
    select: { imageUrl: true },
  });

  const patterns = {};
  for (const p of products) {
    if (p.imageUrl === null || p.imageUrl === undefined) {
      patterns["null"] = (patterns["null"] || 0) + 1;
      continue;
    }

    // Get last part of URL
    const parts = p.imageUrl.split("/");
    const lastPart = parts[parts.length - 1] || "";

    // Check pattern type
    if (/^\d{7}_\d{2}\.png\.png$/.test(lastPart)) {
      patterns["7digit_XX (e.g. 1494703_00)"] = (patterns["7digit_XX (e.g. 1494703_00)"] || 0) + 1;
    } else if (/^\d{6}_\d{3}\.png\.png$/.test(lastPart)) {
      patterns["6digit_XXX (e.g. 553560_152)"] = (patterns["6digit_XXX (e.g. 553560_152)"] || 0) + 1;
    } else if (/^[A-Z]+\d+[_-]\d+\.png\.png$/i.test(lastPart)) {
      patterns["SKU_style (e.g. BQ7196_041)"] = (patterns["SKU_style (e.g. BQ7196_041)"] || 0) + 1;
    } else {
      patterns["other: " + lastPart.substring(0, 25)] = (patterns["other: " + lastPart.substring(0, 25)] || 0) + 1;
    }
  }

  console.log("URL Pattern Distribution:");
  const sorted = Object.entries(patterns).sort((a, b) => b[1] - a[1]);
  for (const [pattern, count] of sorted) {
    console.log(`  ${count.toString().padStart(3)} : ${pattern}`);
  }

  // Show example of each pattern
  console.log("\nExamples:");
  for (const p of products.slice(0, 5)) {
    if (p.imageUrl) {
      const parts = p.imageUrl.split("/");
      console.log(`  ${parts[parts.length - 1]}`);
    }
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
