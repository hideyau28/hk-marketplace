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

function randomStock() {
  return Math.floor(Math.random() * 91) + 10; // 10-100
}

async function seedStock() {
  try {
    const products = await prisma.product.findMany({ select: { id: true } });
    let updated = 0;

    for (const product of products) {
      await prisma.product.update({
        where: { id: product.id },
        data: { stock: randomStock() },
      });
      updated += 1;
    }

    console.log(`Updated stock for ${updated} products.`);
  } catch (error) {
    console.error("Error seeding stock:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedStock();
