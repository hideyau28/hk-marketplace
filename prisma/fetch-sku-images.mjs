// fetch-sku-images.mjs - Report on SKU-format products that need multi-image support
//
// LIMITATION DISCOVERED:
// GOAT's search API requires authentication (401 Unauthorized).
// The product_templates API only accepts numeric IDs, not SKUs.
//
// For products with SKU-format image URLs (e.g., BQ7196_041.png.png),
// we cannot get additional images programmatically without:
// 1. Manual mapping of SKUs to GOAT product template IDs
// 2. Browser automation (Puppeteer/Playwright) to scrape search results
// 3. Authenticated GOAT API access
//
// This script reports on affected products.
//
// Usage: node prisma/fetch-sku-images.mjs

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true }
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

// Check if product has SKU-format image URL
function hasSkuFormatUrl(imageUrl) {
  if (!imageUrl) return false;
  return /\/[A-Z]{2,}\d+[_-]\d{3}\.png\.png$/i.test(imageUrl);
}

async function main() {
  console.log('='.repeat(70));
  console.log('SKU-FORMAT PRODUCTS REPORT');
  console.log('='.repeat(70));
  console.log('');

  // Get all products
  const allProducts = await prisma.product.findMany({
    select: {
      id: true,
      title: true,
      sku: true,
      imageUrl: true,
      images: true,
      shoeType: true,
    },
    orderBy: { createdAt: 'asc' }
  });

  // Filter to SKU-format URLs with only 1 image
  const skuProducts = allProducts.filter(p => {
    const hasSkuUrl = hasSkuFormatUrl(p.imageUrl);
    const hasOnlyOneImage = !p.images || p.images.length <= 1;
    return hasSkuUrl && hasOnlyOneImage;
  });

  // Group by shoeType
  const byShoeType = {};
  for (const p of skuProducts) {
    const type = p.shoeType || 'unknown';
    if (!byShoeType[type]) byShoeType[type] = [];
    byShoeType[type].push(p);
  }

  console.log(`Total products: ${allProducts.length}`);
  console.log(`Products with SKU-format URLs and ≤1 image: ${skuProducts.length}`);
  console.log('');

  console.log('By shoe type:');
  for (const [type, products] of Object.entries(byShoeType).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${type}: ${products.length}`);
  }
  console.log('');

  console.log('GOAT API LIMITATIONS:');
  console.log('  - Search API: Requires authentication (401)');
  console.log('  - Product template API: Only accepts numeric IDs, not SKUs');
  console.log('  - Image URL path numbers: Just directory sharding, not product IDs');
  console.log('');

  console.log('POSSIBLE SOLUTIONS:');
  console.log('  1. Manual mapping: Create SKU-to-GOAT-ID mapping table');
  console.log('  2. Browser automation: Use Puppeteer to scrape search results');
  console.log('  3. Alternative source: Use Nike/StockX images (if available)');
  console.log('  4. Accept limitation: Keep single images for these 148 products');
  console.log('');

  console.log('Sample affected products:');
  skuProducts.slice(0, 10).forEach(p => {
    console.log(`  - ${p.sku}: ${p.title.substring(0, 50)}...`);
  });
  console.log('');

  // Current image distribution
  console.log('Current image distribution:');
  const distribution = {};
  for (const p of allProducts) {
    const count = p.images?.length || 0;
    distribution[count] = (distribution[count] || 0) + 1;
  }
  const sorted = Object.entries(distribution).sort((a, b) => Number(a[0]) - Number(b[0]));
  for (const [count, num] of sorted) {
    console.log(`  ${count} images: ${num} products`);
  }

  console.log('');
  console.log('='.repeat(70));
}

main()
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
