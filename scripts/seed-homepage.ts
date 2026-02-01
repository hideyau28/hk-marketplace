import { config } from "dotenv";
// Load .env for production Neon database
config({ path: ".env" });

import { prisma } from "../lib/prisma";

async function main() {
  console.log("🌱 Seeding homepage data...");

  // Update products with originalPrice
  console.log("Updating products with originalPrice...");

  const productUpdates = [
    { title: "Nike Air Max 270", price: 1299, originalPrice: 1599 },
    { title: "Adidas Ultraboost 22", price: 1499, originalPrice: 1899 },
    { title: "Under Armour Tech Tee", price: 299, originalPrice: 399 },
    { title: "Nike Dri-FIT Shorts", price: 399, originalPrice: 499 },
    { title: "The North Face Windbreaker", price: 899, originalPrice: 1199 },
  ];

  for (const update of productUpdates) {
    const product = await prisma.product.findFirst({
      where: { title: { contains: update.title, mode: "insensitive" } },
    });

    if (product) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          price: update.price,
          originalPrice: update.originalPrice
        },
      });
      console.log(`✓ Updated ${update.title} with price ${update.price} and originalPrice ${update.originalPrice}`);
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
      imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1461896836934-bd45ba8fcf9b?w=1200&q=80",
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
      imageUrl: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1200&q=80",
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
