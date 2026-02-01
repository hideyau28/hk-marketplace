import { config } from "dotenv";
config({ path: ".env" });

import { prisma } from "../lib/prisma";

async function main() {
  console.log("🔍 Checking products in Neon database...\n");

  const products = await prisma.product.findMany({
    select: {
      id: true,
      title: true,
      price: true,
      originalPrice: true,
    },
    orderBy: { createdAt: "desc" },
  });

  console.log(`Found ${products.length} products:\n`);

  products.forEach((p) => {
    console.log(`Title: ${p.title}`);
    console.log(`Price: ${p.price}, Original: ${p.originalPrice ?? "NULL"}`);
    console.log("");
  });
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
