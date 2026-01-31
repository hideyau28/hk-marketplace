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

const sportsProducts = [
  {
    brand: "Nike",
    title: "Nike Air Max 270",
    price: 1299,
    category: "Shoes",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=60",
    active: true,
  },
  {
    brand: "Adidas",
    title: "Adidas Ultraboost 22",
    price: 1499,
    category: "Shoes",
    imageUrl: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=60",
    active: true,
  },
  {
    brand: "Under Armour",
    title: "Under Armour Tech Tee",
    price: 299,
    category: "Tops",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=60",
    active: true,
  },
  {
    brand: "Nike",
    title: "Nike Dri-FIT Shorts",
    price: 399,
    category: "Pants",
    imageUrl: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=60",
    active: true,
  },
  {
    brand: "Adidas",
    title: "Adidas Originals Hoodie",
    price: 599,
    category: "Jackets",
    imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=60",
    active: true,
  },
  {
    brand: "Puma",
    title: "Puma Sports Socks 3-Pack",
    price: 129,
    category: "Socks",
    imageUrl: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=800&q=60",
    active: true,
  },
  {
    brand: "The North Face",
    title: "The North Face Windbreaker",
    price: 899,
    category: "Jackets",
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=60",
    active: true,
  },
  {
    brand: "New Balance",
    title: "New Balance 574",
    price: 999,
    category: "Shoes",
    imageUrl: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=60",
    active: true,
  },
  {
    brand: "Columbia",
    title: "Columbia Hiking Backpack",
    price: 699,
    category: "Accessories",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=60",
    active: true,
  },
  {
    brand: "ASICS",
    title: "ASICS Running Tights",
    price: 499,
    category: "Pants",
    imageUrl: "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=800&q=60",
    active: true,
  },
];

async function seedSportsProducts() {
  try {
    let addedCount = 0;
    let skippedCount = 0;

    for (const product of sportsProducts) {
      const existing = await prisma.product.findFirst({
        where: { title: product.title },
      });

      if (existing) {
        skippedCount++;
      } else {
        await prisma.product.create({
          data: product,
        });
        addedCount++;
      }
    }

    console.log(`Added ${addedCount} sports products.`);
    console.log(`Skipped ${skippedCount} existing products.`);
  } catch (error) {
    console.error("Error seeding sports products:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedSportsProducts();
