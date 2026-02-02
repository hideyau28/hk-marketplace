// Check if there's a mapping between SKU and numeric image ID
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true }
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const products = await prisma.product.findMany({
    select: { title: true, sku: true, imageUrl: true, images: true }
  });

  // Products with numeric ID URLs (that worked)
  const numericIdProducts = products.filter(p => {
    if (!p.imageUrl) return false;
    return /\/\d{6,7}_\d{2}\.png\.png$/.test(p.imageUrl);
  });

  console.log(`Products with numeric ID URLs: ${numericIdProducts.length}`);
  console.log(`Products with numeric ID + SKU: ${numericIdProducts.filter(p => p.sku).length}`);

  console.log('\nSample mappings (SKU -> Image ID):');
  numericIdProducts.filter(p => p.sku).slice(0, 10).forEach(p => {
    const match = p.imageUrl.match(/\/(\d{6,7})_\d{2}\.png\.png$/);
    const imageId = match ? match[1] : 'N/A';
    console.log(`  ${p.sku.padEnd(15)} -> ${imageId}`);
  });

  // Products with SKU-format URLs (that didn't work)
  const skuUrlProducts = products.filter(p => {
    if (!p.imageUrl) return false;
    return /\/[A-Z]{2,}\d+[_-]\d{3}\.png\.png$/i.test(p.imageUrl);
  });

  console.log(`\nProducts with SKU-format URLs: ${skuUrlProducts.length}`);
  console.log('Sample SKU-format URLs:');
  skuUrlProducts.slice(0, 5).forEach(p => {
    const parts = p.imageUrl.split('/');
    console.log(`  ${p.sku}: ${parts[parts.length - 1]}`);
  });
}

main()
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
