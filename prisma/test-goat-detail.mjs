// test-goat-detail.mjs - Explore GOAT's product detail API for multi-image support
//
// Tests various approaches to find additional product images from GOAT
//
// Usage: node prisma/test-goat-detail.mjs

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

// Helper to make fetch requests with proper headers
async function fetchWithHeaders(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json, text/html, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        ...options.headers
      }
    });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// Extract product template ID from image URL
function extractProductId(imageUrl) {
  // URL format: https://image.goat.com/750/attachments/product_template_pictures/images/107/226/590/original/1494703_00.png.png
  const match = imageUrl?.match(/images\/(\d+)\/(\d+)\/(\d+)\/original\/(\d+)/);
  if (match) {
    return {
      pathId: `${match[1]}/${match[2]}/${match[3]}`,
      fileId: match[4],
      fullPath: match[0]
    };
  }
  return null;
}

// Generate slug from product title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Log response details
function logResponse(label, response, body = null) {
  console.log(`\n  ${label}:`);
  console.log(`    Status: ${response.status} ${response.statusText}`);
  console.log(`    Content-Type: ${response.headers.get('content-type')}`);

  if (body) {
    if (typeof body === 'object') {
      const keys = Object.keys(body);
      console.log(`    Response keys: ${keys.slice(0, 15).join(', ')}${keys.length > 15 ? '...' : ''}`);

      // Look for image-related fields
      const imageFields = keys.filter(k =>
        k.toLowerCase().includes('image') ||
        k.toLowerCase().includes('photo') ||
        k.toLowerCase().includes('picture') ||
        k.toLowerCase().includes('gallery') ||
        k.toLowerCase().includes('media')
      );
      if (imageFields.length > 0) {
        console.log(`    Image-related fields: ${imageFields.join(', ')}`);
        for (const field of imageFields) {
          const val = body[field];
          if (Array.isArray(val)) {
            console.log(`      ${field}: Array with ${val.length} items`);
            if (val.length > 0 && typeof val[0] === 'object') {
              console.log(`        First item keys: ${Object.keys(val[0]).join(', ')}`);
            } else if (val.length > 0) {
              console.log(`        First item: ${String(val[0]).substring(0, 100)}`);
            }
          } else if (typeof val === 'object' && val !== null) {
            console.log(`      ${field}: Object with keys: ${Object.keys(val).join(', ')}`);
          } else {
            console.log(`      ${field}: ${String(val).substring(0, 100)}`);
          }
        }
      }

      // Check for nested productTemplate or similar
      if (body.productTemplate) {
        console.log(`    Has productTemplate object`);
        const ptKeys = Object.keys(body.productTemplate);
        const ptImageFields = ptKeys.filter(k =>
          k.toLowerCase().includes('image') ||
          k.toLowerCase().includes('photo') ||
          k.toLowerCase().includes('picture')
        );
        if (ptImageFields.length > 0) {
          console.log(`      Image fields in productTemplate: ${ptImageFields.join(', ')}`);
        }
      }
    } else if (typeof body === 'string') {
      // Check for image URLs in HTML
      const imgMatches = body.match(/https:\/\/image\.goat\.com[^"'\s]+/g);
      if (imgMatches) {
        const uniqueUrls = [...new Set(imgMatches)];
        console.log(`    Found ${uniqueUrls.length} unique GOAT image URLs in HTML`);
        uniqueUrls.slice(0, 5).forEach(url => {
          console.log(`      - ${url.substring(0, 100)}...`);
        });
      }
    }
  }
}

async function testProduct(product) {
  console.log('\n' + '='.repeat(80));
  console.log(`PRODUCT: ${product.title}`);
  console.log(`SKU: ${product.sku || 'N/A'}`);
  console.log(`Image URL: ${product.imageUrl || 'N/A'}`);
  console.log('='.repeat(80));

  const productId = extractProductId(product.imageUrl);
  console.log(`\nExtracted from image URL:`);
  console.log(`  Path ID: ${productId?.pathId || 'N/A'}`);
  console.log(`  File ID: ${productId?.fileId || 'N/A'}`);

  const slug = generateSlug(product.title);
  console.log(`  Generated slug: ${slug}`);

  // Test 1: GOAT API with slug
  console.log('\n--- Test 1: GOAT Product API with slug ---');
  try {
    const url = `https://www.goat.com/api/v1/product_templates/${slug}`;
    console.log(`  URL: ${url}`);
    const response = await fetchWithHeaders(url);
    let body = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('json')) {
      body = await response.json();
    }
    logResponse('Result', response, body);
  } catch (err) {
    console.log(`  Error: ${err.message}`);
  }

  // Test 2: GOAT API with SKU
  if (product.sku) {
    console.log('\n--- Test 2: GOAT Product API with SKU ---');
    try {
      const skuSlug = product.sku.toLowerCase();
      const url = `https://www.goat.com/api/v1/product_templates/${skuSlug}`;
      console.log(`  URL: ${url}`);
      const response = await fetchWithHeaders(url);
      let body = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('json')) {
        body = await response.json();
      }
      logResponse('Result', response, body);
    } catch (err) {
      console.log(`  Error: ${err.message}`);
    }
  }

  // Test 3: GOAT web page
  console.log('\n--- Test 3: GOAT Web Page ---');
  try {
    const url = `https://www.goat.com/sneakers/${slug}`;
    console.log(`  URL: ${url}`);
    const response = await fetchWithHeaders(url);
    let body = null;
    if (response.ok) {
      body = await response.text();
    }
    logResponse('Result', response, body);
  } catch (err) {
    console.log(`  Error: ${err.message}`);
  }

  // Test 4: GOAT search API
  console.log('\n--- Test 4: GOAT Search API ---');
  try {
    const searchQuery = product.sku || product.title.split(' ').slice(0, 3).join(' ');
    const url = `https://www.goat.com/api/v1/product_templates/search?query=${encodeURIComponent(searchQuery)}`;
    console.log(`  URL: ${url}`);
    const response = await fetchWithHeaders(url);
    let body = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('json')) {
      body = await response.json();
    }
    logResponse('Result', response, body);

    // If we got results, look at the first one
    if (body?.productTemplates?.length > 0) {
      const first = body.productTemplates[0];
      console.log(`\n    First result:`);
      console.log(`      ID: ${first.id}`);
      console.log(`      Slug: ${first.slug}`);
      console.log(`      Name: ${first.name}`);

      // Look for image fields
      const imageFields = Object.keys(first).filter(k =>
        k.toLowerCase().includes('image') ||
        k.toLowerCase().includes('photo') ||
        k.toLowerCase().includes('picture')
      );
      for (const field of imageFields) {
        console.log(`      ${field}: ${JSON.stringify(first[field]).substring(0, 150)}`);
      }
    }
  } catch (err) {
    console.log(`  Error: ${err.message}`);
  }

  // Test 5: GOAT product variants API (if we found an ID)
  if (productId?.fileId) {
    console.log('\n--- Test 5: GOAT Product Variants API ---');
    try {
      const url = `https://www.goat.com/api/v1/product_variants?productTemplateId=${productId.fileId}`;
      console.log(`  URL: ${url}`);
      const response = await fetchWithHeaders(url);
      let body = null;
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('json')) {
        body = await response.json();
      }
      logResponse('Result', response, body);
    } catch (err) {
      console.log(`  Error: ${err.message}`);
    }
  }

  // Test 6: Try different image URL patterns
  console.log('\n--- Test 6: Alternative Image URL Patterns ---');
  if (product.imageUrl) {
    const patterns = [
      // Try without size prefix
      product.imageUrl.replace('/750/', '/'),
      // Try with 1000 size
      product.imageUrl.replace('/750/', '/1000/'),
      // Try with transform/v1
      product.imageUrl.replace('image.goat.com/750/', 'image.goat.com/transform/v1/'),
    ];

    for (const url of patterns) {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        const size = response.headers.get('content-length');
        console.log(`  ${url.substring(0, 80)}...`);
        console.log(`    Status: ${response.status}, Size: ${size || 'unknown'}`);
      } catch (err) {
        console.log(`  ${url.substring(0, 80)}... Error: ${err.message}`);
      }
    }
  }

  // Test 7: Check GOAT's algolia/search endpoint
  console.log('\n--- Test 7: GOAT Algolia Search ---');
  try {
    const searchQuery = product.sku || product.title;
    const url = `https://2fwotdvm2o-dsn.algolia.net/1/indexes/product_variants_v2/query`;
    console.log(`  URL: ${url}`);
    console.log(`  Note: This requires API keys, likely will fail`);
    const response = await fetchWithHeaders(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: searchQuery, hitsPerPage: 1 })
    });
    logResponse('Result', response);
  } catch (err) {
    console.log(`  Error: ${err.message}`);
  }
}

async function main() {
  console.log('Fetching sample products from DB...\n');

  // Get 3 diverse sample products
  const products = await prisma.product.findMany({
    where: {
      imageUrl: { not: null },
      sku: { not: null }
    },
    select: {
      id: true,
      title: true,
      sku: true,
      imageUrl: true,
    },
    take: 3,
    orderBy: { createdAt: 'asc' }
  });

  console.log(`Found ${products.length} sample products to test\n`);

  for (const product of products) {
    await testProduct(product);
    console.log('\n');
  }

  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log('Based on the tests above, determine:');
  console.log('1. Which API/approach successfully returns product data');
  console.log('2. Which fields contain image URLs');
  console.log('3. Whether multiple images are available');
  console.log('4. The best approach for fetching additional images');
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
