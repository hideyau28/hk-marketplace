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

const oldElectronicsProducts = [
  "Monitor Arm",
  "Desk Lamp",
  "Webcam HD",
  "Bluetooth Speaker",
  "Portable Charger",
  "Phone Case",
  "Wireless Mouse",
  "USB-C Hub",
  "Mechanical Keyboard",
  "Laptop Stand",
  "Smart Watch",
  "Wireless Headphones",
];

async function removeOldElectronics() {
  try {
    let deletedCount = 0;

    for (const title of oldElectronicsProducts) {
      const result = await prisma.product.deleteMany({
        where: { title },
      });

      if (result.count > 0) {
        console.log(`Deleted: ${title} (${result.count} record(s))`);
        deletedCount += result.count;
      }
    }

    console.log(`\nTotal deleted: ${deletedCount} old electronics products.`);
  } catch (error) {
    console.error("Error removing old electronics:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

removeOldElectronics();
