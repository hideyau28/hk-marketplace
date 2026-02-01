import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { prisma } from "../lib/prisma";

async function main() {
  console.log("🌱 Seeding homepage data...");

  // Update products with originalPrice
  console.log("Updating products with originalPrice...");

  const productUpdates = [
    { title: "Nike Air Max 270", originalPrice: 1599 },
    { title: "Adidas Ultraboost 22", originalPrice: 1899 },
    { title: "Under Armour Tech Tee", originalPrice: 399 },
    { title: "Nike Dri-FIT Shorts", originalPrice: 499 },
    { title: "The North Face Windbreaker", originalPrice: 1199 },
  ];

  for (const update of productUpdates) {
    const product = await prisma.product.findFirst({
      where: { title: { contains: update.title, mode: "insensitive" } },
    });

    if (product) {
      await prisma.product.update({
        where: { id: product.id },
        data: { originalPrice: update.originalPrice },
      });
      console.log(`✓ Updated ${update.title} with originalPrice ${update.originalPrice}`);
    } else {
      console.log(`⚠ Product not found: ${update.title}`);
    }
  }

  // Seed SiteContent
  console.log("\nSeeding SiteContent...");

  const siteContents = [
    {
      key: "hero-1",
      type: "hero",
      titleEn: "Gear Up for Victory",
      titleZh: "裝備致勝",
      subtitleEn: "Premium sports gear for every athlete",
      subtitleZh: "為每位運動員提供專業裝備",
      buttonTextEn: "Shop Now",
      buttonTextZh: "立即選購",
      buttonLink: "/products",
      active: true,
      sortOrder: 1,
    },
    {
      key: "hero-2",
      type: "hero",
      titleEn: "New Season Arrivals",
      titleZh: "新季新品",
      subtitleEn: "Latest styles from top brands",
      subtitleZh: "頂級品牌最新款式",
      buttonTextEn: "Explore",
      buttonTextZh: "探索更多",
      buttonLink: "/products",
      active: true,
      sortOrder: 2,
    },
    {
      key: "hero-3",
      type: "hero",
      titleEn: "Run Your Best",
      titleZh: "跑出最佳表現",
      subtitleEn: "Professional running gear",
      subtitleZh: "專業跑步裝備",
      buttonTextEn: "Shop Running",
      buttonTextZh: "選購跑步裝備",
      buttonLink: "/products?category=Shoes",
      active: true,
      sortOrder: 3,
    },
    {
      key: "hero-4",
      type: "hero",
      titleEn: "Train Like a Pro",
      titleZh: "專業訓練裝備",
      subtitleEn: "Elevate your workout",
      subtitleZh: "提升你的訓練水平",
      buttonTextEn: "Shop Training",
      buttonTextZh: "選購訓練裝備",
      buttonLink: "/products?category=Tops",
      active: true,
      sortOrder: 4,
    },
    {
      key: "hero-5",
      type: "hero",
      titleEn: "Weekend Warriors",
      titleZh: "週末運動員",
      subtitleEn: "Casual sports for everyone",
      subtitleZh: "人人都係運動員",
      buttonTextEn: "Explore",
      buttonTextZh: "探索更多",
      buttonLink: "/products",
      active: true,
      sortOrder: 5,
    },
    {
      key: "promo-bar",
      type: "promo",
      titleEn: "🎉 Free Shipping on orders over HK$500!",
      titleZh: "🎉 訂單滿 HK$500 免運費！",
      active: true,
      sortOrder: 1,
    },
    {
      key: "mid-banner",
      type: "banner",
      titleEn: "Winter Sports Gear",
      titleZh: "冬季運動裝備",
      subtitleEn: "Up to 30% Off",
      subtitleZh: "低至7折",
      buttonTextEn: "Shop Now",
      buttonTextZh: "立即選購",
      buttonLink: "/products?sale=true",
      active: true,
      sortOrder: 1,
    },
  ];

  for (const content of siteContents) {
    await prisma.siteContent.upsert({
      where: { key: content.key },
      update: content,
      create: content,
    });
    console.log(`✓ Seeded SiteContent: ${content.key}`);
  }

  console.log("\n✅ Seeding completed!");
}

main()
  .catch((e) => {
    console.error("Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
