import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { prisma } from "../lib/prisma";

async function main() {
  console.log("🔍 Checking products in database...\n");

  const products = await prisma.product.findMany({
    select: {
      id: true,
      title: true,
      price: true,
      originalPrice: true,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  console.log(`Found ${products.length} products:\n`);

  products.forEach((p) => {
    const hasDiscount = p.originalPrice && p.originalPrice > p.price;
    console.log(`${hasDiscount ? "🔥" : "  "} ${p.title}`);
    console.log(`   Price: ${p.price}, Original: ${p.originalPrice ?? "NULL"}`);
    if (hasDiscount) {
      const discount = Math.round(((p.originalPrice! - p.price) / p.originalPrice!) * 100);
      console.log(`   Discount: ${discount}% off`);
    }
    console.log("");
  });

  const saleProducts = products.filter((p) => p.originalPrice && p.originalPrice > p.price);
  console.log(`\n📊 Summary: ${saleProducts.length} products with originalPrice > price`);
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
