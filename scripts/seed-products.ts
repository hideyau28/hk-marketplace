import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

function normalizeDbUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const isLocal = parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";
    if (isLocal || parsed.searchParams.has("sslmode")) {
      return url;
    }
    parsed.searchParams.set("sslmode", "require");
    return parsed.toString();
  } catch {
    return url;
  }
}

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not set");
}

const normalizedUrl = normalizeDbUrl(url);
const parsed = new URL(normalizedUrl);
const needsSsl = parsed.hostname !== "localhost" && parsed.hostname !== "127.0.0.1";

const poolConfig: any = { connectionString: normalizedUrl };
if (needsSsl) {
  poolConfig.ssl = { rejectUnauthorized: true };
}

const pool = new Pool(poolConfig);
const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

const demoProducts = [
  {
    title: "Wireless Headphones",
    price: 299,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=60",
    active: true,
  },
  {
    title: "Smart Watch",
    price: 399,
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=60",
    active: true,
  },
  {
    title: "Laptop Stand",
    price: 149,
    imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=60",
    active: true,
  },
  {
    title: "Mechanical Keyboard",
    price: 459,
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=60",
    active: true,
  },
  {
    title: "USB-C Hub",
    price: 89,
    imageUrl: "https://images.unsplash.com/photo-1625948515291-69613efd103f?auto=format&fit=crop&w=800&q=60",
    active: true,
  },
  {
    title: "Wireless Mouse",
    price: 129,
    imageUrl: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&q=60",
    active: true,
  },
  {
    title: "Phone Case",
    price: 49,
    imageUrl: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=60",
    active: true,
  },
  {
    title: "Portable Charger",
    price: 79,
    imageUrl: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=60",
    active: true,
  },
  {
    title: "Bluetooth Speaker",
    price: 199,
    imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=60",
    active: true,
  },
  {
    title: "Webcam HD",
    price: 179,
    imageUrl: "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?auto=format&fit=crop&w=800&q=60",
    active: true,
  },
  {
    title: "Monitor Arm",
    price: 249,
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=60",
    active: true,
  },
  {
    title: "Desk Lamp",
    price: 99,
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=60",
    active: true,
  },
];

async function main() {
  console.log("🌱 Seeding products...");

  for (const product of demoProducts) {
    await prisma.product.create({
      data: product,
    });
  }

  console.log(`✅ Created ${demoProducts.length} demo products`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding products:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
