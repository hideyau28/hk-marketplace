import { prisma } from "../lib/prisma";

async function main() {
  console.log("Seeding homepage sections and banners...");

  // Delete existing records
  await prisma.homepageSection.deleteMany({});
  await prisma.homepageBanner.deleteMany({});

  // Seed default sections matching current homepage layout
  const sections = [
    {
      title: "為你推薦",
      type: "product_grid",
      cardSize: "small",
      sortOrder: 1,
      active: true,
      filterType: "featured",
      filterValue: "true",
    },
    {
      title: "Air Jordan 系列",
      type: "product_grid",
      cardSize: "large",
      sortOrder: 2,
      active: true,
      filterType: "category",
      filterValue: "Air Jordan",
    },
    {
      title: "Dunk / SB 系列",
      type: "product_grid",
      cardSize: "small",
      sortOrder: 3,
      active: true,
      filterType: "category",
      filterValue: "Dunk / SB",
    },
    {
      title: "Air Force 系列",
      type: "product_grid",
      cardSize: "large",
      sortOrder: 4,
      active: true,
      filterType: "category",
      filterValue: "Air Force",
    },
    {
      title: "Air Max 系列",
      type: "product_grid",
      cardSize: "small",
      sortOrder: 5,
      active: true,
      filterType: "category",
      filterValue: "Air Max",
    },
    {
      title: "Running 系列",
      type: "product_grid",
      cardSize: "large",
      sortOrder: 6,
      active: true,
      filterType: "category",
      filterValue: "Running",
    },
    {
      title: "Basketball 系列",
      type: "product_grid",
      cardSize: "small",
      sortOrder: 7,
      active: true,
      filterType: "category",
      filterValue: "Basketball",
    },
    {
      title: "童裝專區",
      type: "product_grid",
      cardSize: "large",
      sortOrder: 8,
      active: true,
      filterType: "shoeType",
      filterValue: "kids",
    },
  ];

  for (const section of sections) {
    await prisma.homepageSection.create({ data: section });
  }

  console.log(`Created ${sections.length} homepage sections`);

  // Seed hero banner placeholder
  const heroBanner = await prisma.homepageBanner.create({
    data: {
      title: "最新波鞋",
      subtitle: "正品保證 · 免運費滿$600",
      imageUrl: "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1200&q=80",
      position: "hero",
      sortOrder: 1,
      active: true,
    },
  });

  console.log(`Created hero banner: ${heroBanner.id}`);

  // Seed mid-page banner placeholder
  const midBanner = await prisma.homepageBanner.create({
    data: {
      title: "運動鞋專區",
      subtitle: "精選運動鞋款",
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
      position: "mid",
      sortOrder: 1,
      active: true,
    },
  });

  console.log(`Created mid banner: ${midBanner.id}`);

  console.log("Homepage seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
