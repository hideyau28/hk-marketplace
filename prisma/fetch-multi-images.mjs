// fetch-multi-images.mjs - Fetch multiple product images from GOAT API
//
// Uses GOAT's product_templates API to get additional product images.
// API: https://www.goat.com/api/v1/product_templates/{id}
//
// Usage: node prisma/fetch-multi-images.mjs

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true }
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Delay helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Extract product template ID from image URL
// Handles multiple URL patterns:
// 1. 7-digit ID in filename: .../1494703_00.png.png -> 1494703
// 2. 6-digit ID in filename: .../811629_00.png.png -> 811629
// 3. SKU in filename, ID in path: images/xxx/xxx/981/original/BQ7196_041.png.png
function extractProductId(imageUrl) {
  if (!imageUrl) return null;

  // Pattern 1: Numeric ID in filename (6-7 digits followed by _XX)
  // e.g., 1494703_00.png.png or 811629_00.png.png
  const numericMatch = imageUrl.match(/\/(\d{6,7})_\d{2}\.png\.png$/);
  if (numericMatch) {
    return numericMatch[1];
  }

  // Pattern 2: SKU-style filename - need to look up by searching
  // For these, we'll try the search API instead
  // e.g., BQ7196_041.png.png -> extract BQ7196-041 as SKU
  const skuMatch = imageUrl.match(/\/([A-Z]{2}\d+)[_-](\d{3})\.png\.png$/i);
  if (skuMatch) {
    return `sku:${skuMatch[1]}-${skuMatch[2]}`;
  }

  // Pattern 3: 6-digit with 3-digit suffix (e.g., 553560_152.png.png)
  const altMatch = imageUrl.match(/\/(\d{6})_(\d{3})\.png\.png$/);
  if (altMatch) {
    // Try to get product ID from the path
    const pathMatch = imageUrl.match(/images\/(\d+)\/(\d+)\/(\d+)\/original/);
    if (pathMatch) {
      // Construct potential product ID from path
      return `path:${pathMatch[1]}${pathMatch[2]}${pathMatch[3]}`;
    }
    return `sku:${altMatch[1]}-${altMatch[2]}`;
  }

  return null;
}

// Fetch product template from GOAT API with retry
async function fetchProductTemplate(productId, retryCount = 1) {
  // If it's a SKU, try search first
  if (productId.startsWith('sku:')) {
    const sku = productId.replace('sku:', '');
    return await searchProductBySku(sku, retryCount);
  }

  // If it's a path-based ID, it's not directly usable
  if (productId.startsWith('path:')) {
    return null;
  }

  const url = `https://www.goat.com/api/v1/product_templates/${productId}`;

  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (err) {
      if (attempt < retryCount) {
        await delay(500);
        continue;
      }
      return null;
    }
  }
  return null;
}

// Search for product by SKU
async function searchProductBySku(sku, retryCount = 1) {
  // GOAT search requires auth, so try direct template lookup with slug format
  // Convert SKU like "BQ7196-041" to potential slug formats
  const slugVariants = [
    sku.toLowerCase(),
    sku.toLowerCase().replace('-', '_'),
  ];

  for (const slug of slugVariants) {
    const url = `https://www.goat.com/api/v1/product_templates/${slug}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      // Continue to next variant
    }
  }

  return null;
}

// Extract image URLs from GOAT API response
function extractImages(data, originalImageUrl, maxImages = 5) {
  const images = [];

  // Always keep original as first
  if (originalImageUrl) {
    images.push(originalImageUrl);
  }

  // Get additional images from productTemplateExternalPictures
  const additionalPics = data?.productTemplateExternalPictures || [];

  // Sort by order and take first few
  const sortedPics = [...additionalPics].sort((a, b) => (a.order || 0) - (b.order || 0));

  for (const pic of sortedPics) {
    if (images.length >= maxImages) break;

    // Prefer mainPictureUrl (medium size, good quality)
    const url = pic.mainPictureUrl || pic.gridPictureUrl;
    if (url && images.indexOf(url) === -1) {
      images.push(url);
    }
  }

  return images;
}

async function main() {
  console.log('Fetching all products from DB...\n');

  const products = await prisma.product.findMany({
    select: {
      id: true,
      title: true,
      imageUrl: true,
      images: true,
    },
    orderBy: { createdAt: 'asc' }
  });

  console.log(`Found ${products.length} products\n`);

  let totalImages = 0;
  let updatedCount = 0;
  let apiSuccessCount = 0;
  let apiFailCount = 0;
  let skippedCount = 0;
  let skuLookupCount = 0;
  const startTime = Date.now();

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const productId = extractProductId(product.imageUrl);

    // Skip if no valid product ID and no imageUrl
    if (!productId) {
      if (product.imageUrl) {
        // Still update with just the original image
        await prisma.product.update({
          where: { id: product.id },
          data: { images: [product.imageUrl] }
        });
        totalImages += 1;
      }
      skippedCount++;
      continue;
    }

    try {
      // Track SKU lookups
      if (productId.startsWith('sku:')) {
        skuLookupCount++;
      }

      // Fetch from GOAT API
      const data = await fetchProductTemplate(productId);

      if (data && data.productTemplateExternalPictures) {
        apiSuccessCount++;

        // Extract images (original + up to 4 additional = 5 total)
        const images = extractImages(data, product.imageUrl, 5);

        // Update DB if we have images
        if (images.length > 0) {
          await prisma.product.update({
            where: { id: product.id },
            data: { images }
          });

          if (images.length > (product.images?.length || 1)) {
            updatedCount++;
          }
        }

        totalImages += images.length;
      } else {
        apiFailCount++;
        // Keep original image if API fails
        if (product.imageUrl) {
          await prisma.product.update({
            where: { id: product.id },
            data: { images: [product.imageUrl] }
          });
          totalImages += 1;
        }
      }

      // Log progress every 10 products
      if ((i + 1) % 10 === 0 || i === products.length - 1) {
        const processed = i + 1 - skippedCount;
        const avgImages = processed > 0 ? (totalImages / (i + 1)).toFixed(1) : '0';
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
        console.log(`${i + 1}/${products.length} done, avg ${avgImages} images/product, API: ${apiSuccessCount} ok / ${apiFailCount} fail (${elapsed}s)`);
      }

      // Rate limiting: 200ms between API calls
      await delay(200);

    } catch (err) {
      console.error(`Error processing ${product.title}: ${err.message}`);
      apiFailCount++;
    }
  }

  // Final summary
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total products: ${products.length}`);
  console.log(`Skipped (no pattern match): ${skippedCount}`);
  console.log(`SKU lookups attempted: ${skuLookupCount}`);
  console.log(`API successful: ${apiSuccessCount}`);
  console.log(`API failed: ${apiFailCount}`);
  console.log(`Products updated with multi-images: ${updatedCount}`);
  console.log(`Total images stored: ${totalImages}`);
  console.log(`Average images/product: ${(totalImages / products.length).toFixed(2)}`);
  console.log(`Total time: ${totalTime}s`);
  console.log('='.repeat(50));
}

main()
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
