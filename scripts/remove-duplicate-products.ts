import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new Pool({ connectionString: url });
const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

async function removeDuplicateProducts() {
  try {
    // Find all products grouped by title
    const allProducts = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc", // newest first
      },
    });

    // Group by title
    const groupedByTitle = new Map<string, typeof allProducts>();

    for (const product of allProducts) {
      const existing = groupedByTitle.get(product.title);
      if (!existing) {
        groupedByTitle.set(product.title, [product]);
      } else {
        existing.push(product);
      }
    }

    // Find duplicates and delete older ones
    let deletedCount = 0;

    for (const [title, products] of groupedByTitle.entries()) {
      if (products.length > 1) {
        console.log(`Found ${products.length} products with title: "${title}"`);

        // Keep the first one (newest), delete the rest
        const toDelete = products.slice(1);

        for (const product of toDelete) {
          console.log(`  Deleting duplicate: ${product.id} (created: ${product.createdAt})`);
          await prisma.product.delete({
            where: { id: product.id },
          });
          deletedCount++;
        }
      }
    }

    console.log(`\nRemoved ${deletedCount} duplicate products.`);
    console.log(`Kept ${groupedByTitle.size} unique products.`);
  } catch (error) {
    console.error("Error removing duplicates:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

removeDuplicateProducts();
