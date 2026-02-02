import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: true } });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const heroes = [
  {
    key: "hero-1",
    titleEn: "Air Jordan Collection",
    titleZh: "Air Jordan 系列",
    subtitleEn: "Iconic style since 1985",
    subtitleZh: "自1985年起的經典",
    buttonTextEn: "Shop Jordan",
    buttonTextZh: "選購 Jordan",
    buttonLink: "/products?category=Air+Jordan",
    imageUrl: "https://image.goat.com/750/attachments/product_template_pictures/images/107/226/590/original/1494703_00.png.png",
    sortOrder: 1,
  },
  {
    key: "hero-2",
    titleEn: "Nike Dunk",
    titleZh: "Nike Dunk 系列",
    subtitleEn: "Street culture essentials",
    subtitleZh: "街頭文化必備",
    buttonTextEn: "Shop Dunk",
    buttonTextZh: "選購 Dunk",
    buttonLink: "/products?category=Dunk+%2F+SB",
    imageUrl: "https://image.goat.com/750/attachments/product_template_pictures/images/071/445/308/original/719082_00.png.png",
    sortOrder: 2,
  },
  {
    key: "hero-3",
    titleEn: "Air Force 1",
    titleZh: "Air Force 1 系列",
    subtitleEn: "The legend lives on",
    subtitleZh: "傳奇延續",
    buttonTextEn: "Shop AF1",
    buttonTextZh: "選購 AF1",
    buttonLink: "/products?category=Air+Force",
    imageUrl: "https://image.goat.com/750/attachments/product_template_pictures/images/061/103/144/original/811629_00.png.png",
    sortOrder: 3,
  },
  {
    key: "hero-4",
    titleEn: "Air Max Collection",
    titleZh: "Air Max 系列",
    subtitleEn: "Visible air, maximum impact",
    subtitleZh: "可見氣墊，極致體驗",
    buttonTextEn: "Shop Air Max",
    buttonTextZh: "選購 Air Max",
    buttonLink: "/products?category=Air+Max",
    imageUrl: "https://image.goat.com/750/attachments/product_template_pictures/images/102/572/037/original/DV3337_010.png.png",
    sortOrder: 4,
  },
  {
    key: "hero-5",
    titleEn: "Pegasus Running",
    titleZh: "Pegasus 跑步系列",
    subtitleEn: "Trusted by runners worldwide",
    subtitleZh: "全球跑者信賴之選",
    buttonTextEn: "Shop Running",
    buttonTextZh: "選購跑鞋",
    buttonLink: "/products?category=Running",
    imageUrl: "https://image.goat.com/750/attachments/product_template_pictures/images/106/666/791/original/FD2722_109.png.png",
    sortOrder: 5,
  },
];

for (const h of heroes) {
  await prisma.siteContent.update({
    where: { key: h.key },
    data: h,
  });
  console.log(`✅ ${h.key}: ${h.titleZh}`);
}

console.log('\n🎉 Hero slides 更新完成!');
process.exit(0);
