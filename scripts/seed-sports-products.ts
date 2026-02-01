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

// Size defaults for admin sizing system
// Shoes use UK sizes with "UK" prefix
const UK_SHOE_SIZES = [
  "UK 3", "UK 3.5", "UK 4", "UK 4.5", "UK 5", "UK 5.5",
  "UK 6", "UK 6.5", "UK 7", "UK 7.5", "UK 8", "UK 8.5",
  "UK 9", "UK 9.5", "UK 10", "UK 10.5", "UK 11", "UK 11.5", "UK 12"
];
// Tops, Pants, Jackets use letter sizes
const CLOTHING_SIZES = ["S", "M", "L", "XL", "XXL"];
// Socks and Accessories use simpler options
const SOCK_SIZES = ["One Size", "S", "M", "L"];
const ACCESSORY_SIZES = ["One Size"];

// Sample images for carousel (3 per product category)
const SHOE_IMAGES = [
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=60",
  "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=60",
  "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=60",
];
const TOP_IMAGES = [
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=60",
  "https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=800&q=60",
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=60",
];
const PANTS_IMAGES = [
  "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=60",
  "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=60",
  "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=60",
];
const JACKET_IMAGES = [
  "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=60",
  "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=60",
  "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?auto=format&fit=crop&w=800&q=60",
];
const ACCESSORY_IMAGES = [
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=60",
  "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=60",
  "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=800&q=60",
];

const sportsProducts = [
  {
    brand: "Nike",
    title: "Nike Air Max 270",
    price: 1299,
    category: "Shoes",
    imageUrl: SHOE_IMAGES[0],
    images: SHOE_IMAGES,
    active: true,
    sizeSystem: "UK",
    sizes: UK_SHOE_SIZES,
  },
  {
    brand: "Adidas",
    title: "Adidas Ultraboost 22",
    price: 1499,
    category: "Shoes",
    imageUrl: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=60",
    images: [
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=60",
    ],
    active: true,
    sizeSystem: "UK",
    sizes: UK_SHOE_SIZES,
  },
  {
    brand: "Under Armour",
    title: "Under Armour Tech Tee",
    price: 299,
    category: "Tops",
    imageUrl: TOP_IMAGES[0],
    images: TOP_IMAGES,
    active: true,
    sizeSystem: "clothing",
    sizes: CLOTHING_SIZES,
  },
  {
    brand: "Nike",
    title: "Nike Dri-FIT Shorts",
    price: 399,
    category: "Pants",
    imageUrl: PANTS_IMAGES[0],
    images: PANTS_IMAGES,
    active: true,
    sizeSystem: "clothing",
    sizes: CLOTHING_SIZES,
  },
  {
    brand: "Adidas",
    title: "Adidas Originals Hoodie",
    price: 599,
    category: "Jackets",
    imageUrl: JACKET_IMAGES[0],
    images: JACKET_IMAGES,
    active: true,
    sizeSystem: "clothing",
    sizes: CLOTHING_SIZES,
  },
  {
    brand: "Puma",
    title: "Puma Sports Socks 3-Pack",
    price: 129,
    category: "Socks",
    imageUrl: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=800&q=60",
    images: [
      "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1556306535-0f09a537f0a3?auto=format&fit=crop&w=800&q=60",
    ],
    active: true,
    sizeSystem: "socks",
    sizes: SOCK_SIZES,
  },
  {
    brand: "The North Face",
    title: "The North Face Windbreaker",
    price: 899,
    category: "Jackets",
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=60",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=60",
    ],
    active: true,
    sizeSystem: "clothing",
    sizes: CLOTHING_SIZES,
  },
  {
    brand: "New Balance",
    title: "New Balance 574",
    price: 999,
    category: "Shoes",
    imageUrl: "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=60",
    images: [
      "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1584735175315-9d5df23860e6?auto=format&fit=crop&w=800&q=60",
    ],
    active: true,
    sizeSystem: "UK",
    sizes: UK_SHOE_SIZES,
  },
  {
    brand: "Columbia",
    title: "Columbia Hiking Backpack",
    price: 699,
    category: "Accessories",
    imageUrl: ACCESSORY_IMAGES[0],
    images: ACCESSORY_IMAGES,
    active: true,
    sizeSystem: "accessories",
    sizes: ACCESSORY_SIZES,
  },
  {
    brand: "ASICS",
    title: "ASICS Running Tights",
    price: 499,
    category: "Pants",
    imageUrl: "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=800&q=60",
    images: [
      "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=60",
      "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=60",
    ],
    active: true,
    sizeSystem: "clothing",
    sizes: CLOTHING_SIZES,
  },
];

async function seedSportsProducts() {
  try {
    let addedCount = 0;
    let updatedCount = 0;

    for (const product of sportsProducts) {
      const existing = await prisma.product.findFirst({
        where: { title: product.title },
      });

      if (existing) {
        // Update existing product with size data and images
        await prisma.product.update({
          where: { id: existing.id },
          data: {
            sizeSystem: product.sizeSystem,
            sizes: product.sizes,
            images: product.images,
          },
        });
        updatedCount++;
      } else {
        await prisma.product.create({
          data: product,
        });
        addedCount++;
      }
    }

    console.log(`Added ${addedCount} new sports products.`);
    console.log(`Updated ${updatedCount} existing products with size data.`);
  } catch (error) {
    console.error("Error seeding sports products:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedSportsProducts();
