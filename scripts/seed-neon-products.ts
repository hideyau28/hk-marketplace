import { config } from "dotenv";
config({ path: ".env" });

import { prisma } from "../lib/prisma";

async function main() {
  console.log("🌱 Seeding Neon database with products...\n");

  const products = [
    // Sale Products
    {
      title: "Nike Air Max 270",
      brand: "Nike",
      price: 1299,
      originalPrice: 1599,
      category: "Shoes",
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
      stock: 15,
      active: true,
    },
    {
      title: "Adidas Ultraboost 22",
      brand: "Adidas",
      price: 1499,
      originalPrice: 1899,
      category: "Shoes",
      imageUrl: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80",
      stock: 12,
      active: true,
    },
    {
      title: "Under Armour Tech Tee",
      brand: "Under Armour",
      price: 299,
      originalPrice: 399,
      category: "Tops",
      imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
      stock: 25,
      active: true,
    },
    {
      title: "Nike Dri-FIT Shorts",
      brand: "Nike",
      price: 399,
      originalPrice: 499,
      category: "Pants",
      imageUrl: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80",
      stock: 20,
      active: true,
    },
    {
      title: "The North Face Windbreaker",
      brand: "The North Face",
      price: 899,
      originalPrice: 1199,
      category: "Jackets",
      imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80",
      stock: 8,
      active: true,
    },
    // Regular Products
    {
      title: "Puma Sports Socks 3-Pack",
      brand: "Puma",
      price: 129,
      category: "Accessories",
      imageUrl: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=800&q=80",
      stock: 50,
      active: true,
    },
    {
      title: "Adidas Originals Hoodie",
      brand: "Adidas",
      price: 599,
      category: "Tops",
      imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80",
      stock: 18,
      active: true,
    },
    {
      title: "New Balance 574",
      brand: "New Balance",
      price: 999,
      category: "Shoes",
      imageUrl: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&q=80",
      stock: 10,
      active: true,
    },
    {
      title: "Columbia Hiking Backpack",
      brand: "Columbia",
      price: 699,
      category: "Accessories",
      imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
      stock: 12,
      active: true,
    },
    {
      title: "ASICS Running Tights",
      brand: "ASICS",
      price: 499,
      category: "Pants",
      imageUrl: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800&q=80",
      stock: 15,
      active: true,
    },
  ];

  for (const product of products) {
    const created = await prisma.product.create({
      data: product,
    });
    console.log(`✓ Created: ${created.title} - HK$${created.price}${created.originalPrice ? ` (was HK$${created.originalPrice})` : ""}`);
  }

  console.log(`\n✅ Seeded ${products.length} products!`);
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
