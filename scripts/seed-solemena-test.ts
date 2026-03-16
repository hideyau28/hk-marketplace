import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const HKD_TO_USD = 7.8;

const url = process.env.DATABASE_URL!;
const pool = new Pool({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

/** Round to 2 decimal places */
function toUsd(hkd: number): number {
  return Math.round((hkd / HKD_TO_USD) * 100) / 100;
}

async function main() {
  // ── 1. List existing tenants ──
  const allTenants = await prisma.tenant.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      currency: true,
      region: true,
      status: true,
    },
    orderBy: { createdAt: "asc" },
  });
  console.log("=== Existing Tenants ===");
  for (const t of allTenants) {
    console.log(
      `  ${t.slug} | ${t.name} | ${t.currency} | ${t.region} | ${t.status}`,
    );
  }
  console.log(`  Total: ${allTenants.length}\n`);

  // ── 2. Find May's Store tenant ──
  const sourceTenant = allTenants.find(
    (t) => t.name.toLowerCase().includes("may") || t.slug.includes("may"),
  );
  if (!sourceTenant) {
    console.error(
      "Cannot find May's Store tenant. Available slugs:",
      allTenants.map((t) => t.slug).join(", "),
    );
    process.exit(1);
  }
  console.log(`Source tenant: ${sourceTenant.name} (${sourceTenant.slug})\n`);

  // ── 3. Create solemena-test tenant ──
  const tenant = await prisma.tenant.upsert({
    where: { slug: "solemena-test" },
    update: {},
    create: {
      name: "SoleMENA",
      slug: "solemena-test",
      description: "Hong Kong → Middle East Sneaker Resale",
      region: "ME",
      currency: "USD",
      timezone: "Asia/Dubai",
      languages: ["en"],
      taxRate: 0,
      themeColor: "#1A1A2E",
      brandColor: "#E94560",
      template: "default",
      templateId: "mochi",
      mode: "store",
      status: "active",
      plan: "pro",
      tagline: "Authenticated Sneakers from Asia to the Middle East",
      whatsapp: "+85291234567",
      instagram: "https://instagram.com/solemena",
      location: "Hong Kong → Dubai",
      coverTemplate: "default",
      fpsEnabled: false,
      paymeEnabled: false,
      deliveryOptions: JSON.stringify([
        {
          id: "aramex-standard",
          label: "Aramex Standard (3-7 days)",
          price: 28,
          enabled: true,
        },
        {
          id: "dhl-express",
          label: "DHL Express (1-2 days)",
          price: 55,
          enabled: true,
        },
      ]),
      freeShippingThreshold: null,
      orderConfirmMessage: JSON.stringify({
        thanks:
          "Thank you for your order! Your authenticated sneakers are on the way.",
        whatsappTemplate: "Hi! I just placed order #{orderNumber}",
      }),
    },
  });
  console.log(`Tenant created: ${tenant.name} (${tenant.slug})`);

  // ── 4. Store Settings: shipping fee $28 USD (Aramex), free shipping above $500 ──
  await prisma.storeSettings.upsert({
    where: { tenantId: tenant.id },
    update: {
      welcomePopupTitle: "Welcome to SoleMENA",
      welcomePopupSubtitle:
        "Authenticated sneakers shipped from Hong Kong to the Middle East.",
      welcomePopupPromoText: "✅ Every pair verified authentic before shipping",
      welcomePopupButtonText: "Start Shopping",
      returnsPolicy:
        "All items are final sale. Returns accepted only if the wrong item or size was shipped. Contact us within 48 hours of delivery.",
      shippingPolicy:
        "All orders ship from Hong Kong via Aramex Standard (3-7 business days, US$28) or DHL Express (1-2 business days, US$55). Import duties and customs fees are the buyer's responsibility.",
    },
    create: {
      tenantId: tenant.id,
      storeName: "SoleMENA",
      storeNameEn: "SoleMENA - Authenticated Sneakers",
      tagline: "From Asia to the Middle East. Every pair verified.",
      whatsappNumber: "+85291234567",
      instagramUrl: "https://instagram.com/solemena",
      shippingFee: 28,
      freeShippingThreshold: null,
      homeDeliveryFee: 28,
      homeDeliveryFreeAbove: 99999,
      sfLockerFee: 0,
      sfLockerFreeAbove: 99999,
      returnsPolicy:
        "All items are final sale. Returns accepted only if the wrong item or size was shipped. Contact us within 48 hours of delivery.",
      shippingPolicy:
        "All orders ship from Hong Kong via Aramex Standard (3-7 business days, US$28) or DHL Express (1-2 business days, US$55). Import duties and customs fees are the buyer's responsibility.",
      welcomePopupTitle: "Welcome to SoleMENA",
      welcomePopupSubtitle:
        "Authenticated sneakers shipped from Hong Kong to the Middle East.",
      welcomePopupPromoText: "✅ Every pair verified authentic before shipping",
      welcomePopupButtonText: "Start Shopping",
    },
  });
  console.log("Store settings configured");

  // ── 5. Badges ──
  const badgeDefs = [
    {
      nameZh: "Authenticated",
      nameEn: "Authenticated",
      color: "#16a34a",
      sortOrder: 1,
    },
    {
      nameZh: "Asia Exclusive",
      nameEn: "Asia Exclusive",
      color: "#7c3aed",
      sortOrder: 2,
    },
    {
      nameZh: "Large Size",
      nameEn: "Large Size Available",
      color: "#2563eb",
      sortOrder: 3,
    },
    { nameZh: "Hot", nameEn: "Hot", color: "#dc2626", sortOrder: 4 },
    {
      nameZh: "New Arrival",
      nameEn: "New Arrival",
      color: "#ea580c",
      sortOrder: 5,
    },
  ];

  // Delete existing badges for idempotency
  await prisma.badge.deleteMany({ where: { tenantId: tenant.id } });
  for (const badge of badgeDefs) {
    await prisma.badge.create({ data: { tenantId: tenant.id, ...badge } });
  }
  console.log(`${badgeDefs.length} badges created`);

  // ── 6. Clone products from May's Store ──
  const sourceProducts = await prisma.product.findMany({
    where: { tenantId: sourceTenant.id, active: true, deletedAt: null },
    include: { variants: true, categoryRel: true },
    orderBy: { createdAt: "asc" },
  });
  console.log(
    `\nFound ${sourceProducts.length} active products in ${sourceTenant.name}`,
  );

  // Delete existing products for idempotency (cascade deletes variants)
  await prisma.productVariant.deleteMany({ where: { tenantId: tenant.id } });
  await prisma.product.deleteMany({ where: { tenantId: tenant.id } });

  // Build category map — clone categories from source based on unique brands
  const brandSet = new Set(sourceProducts.map((p) => p.brand).filter(Boolean));
  const categoryMap: Record<string, string> = {};

  for (const brand of brandSet) {
    if (!brand) continue;
    const slug = brand.toLowerCase().replace(/\s+/g, "-");
    const cat = await prisma.category.upsert({
      where: { tenantId_slug: { tenantId: tenant.id, slug } },
      update: {},
      create: {
        tenantId: tenant.id,
        name: brand,
        slug,
        active: true,
        sortOrder: [...brandSet].indexOf(brand) + 1,
      },
    });
    categoryMap[brand] = cat.id;
  }
  console.log(`${brandSet.size} categories created from brands`);

  let productCount = 0;
  let variantCount = 0;

  for (const src of sourceProducts) {
    const newSku = src.sku ? `SM-${src.sku}` : `SM-${productCount + 1}`;
    const usdPrice = toUsd(src.price);
    const usdOriginal = src.originalPrice
      ? toUsd(src.originalPrice)
      : undefined;

    const product = await prisma.product.create({
      data: {
        tenantId: tenant.id,
        title: src.title,
        sku: newSku,
        brand: src.brand,
        category: src.category,
        categoryId: src.brand ? (categoryMap[src.brand] ?? null) : null,
        price: usdPrice,
        originalPrice: usdOriginal,
        description: src.description,
        shoeType: src.shoeType,
        color: src.color,
        featured: src.featured,
        active: true,
        stock: src.stock,
        sizeSystem: src.sizeSystem,
        sizes: src.sizes as any,
        badges: src.badges as any,
        productType: src.productType,
        inventoryMode: src.inventoryMode,
        images: src.images,
        imageUrl: src.imageUrl,
        videoUrl: src.videoUrl,
        sortOrder: src.sortOrder,
        attributes: src.attributes as any,
      },
    });

    // Clone variants with USD pricing
    for (const v of src.variants) {
      const variantSku = v.sku ? `SM-${v.sku}` : undefined;
      await prisma.productVariant.create({
        data: {
          tenantId: tenant.id,
          productId: product.id,
          name: v.name,
          sku: variantSku,
          price: v.price ? toUsd(v.price) : null,
          compareAtPrice: v.compareAtPrice ? toUsd(v.compareAtPrice) : null,
          stock: v.stock,
          options: v.options as any,
          imageUrl: v.imageUrl,
          active: v.active,
          sortOrder: v.sortOrder,
        },
      });
      variantCount++;
    }
    productCount++;
  }
  console.log(
    `${productCount} products + ${variantCount} variants cloned (HKD / ${HKD_TO_USD} = USD)`,
  );

  // ── 7. Payment methods ──
  // Bank transfer (manual) + Stripe (online) for ME market
  await prisma.tenantPaymentConfig.deleteMany({
    where: { tenantId: tenant.id },
  });

  const paymentConfigs = [
    {
      providerId: "bank_transfer",
      enabled: true,
      displayName: "Bank Transfer",
      config: {
        bankName: "Emirates NBD",
        accountName: "SoleMENA Trading LLC",
        accountNumber: "1234567890",
      },
      sortOrder: 1,
    },
    {
      providerId: "stripe",
      enabled: true,
      displayName: "Credit / Debit Card",
      config: {},
      sortOrder: 2,
    },
  ];

  for (const pc of paymentConfigs) {
    await prisma.tenantPaymentConfig.create({
      data: { tenantId: tenant.id, ...pc },
    });
  }
  console.log(`${paymentConfigs.length} payment methods configured`);

  // ── 8. Homepage sections by brand ──
  await prisma.homepageSection.deleteMany({ where: { tenantId: tenant.id } });

  const sectionDefs = [
    {
      title: "Hot Right Now",
      type: "product_grid",
      cardSize: "large",
      sortOrder: 1,
      filterType: "featured",
      filterValue: "true",
    },
    ...[...brandSet].map((brand, i) => ({
      title: brand,
      type: "product_grid" as const,
      cardSize: "small" as const,
      sortOrder: i + 2,
      filterType: "brand",
      filterValue: brand,
    })),
  ];

  for (const section of sectionDefs) {
    await prisma.homepageSection.create({
      data: { tenantId: tenant.id, ...section, active: true, productIds: [] },
    });
  }
  console.log(`${sectionDefs.length} homepage sections created`);

  // ── Summary ──
  console.log("\n" + "=".repeat(50));
  console.log("SoleMENA test tenant ready!");
  console.log("=".repeat(50));
  console.log(`\nStore URL: http://localhost:3012/solemena-test`);
  console.log(`Admin:     http://localhost:3012/en/admin`);
  console.log(`\nProducts: ${productCount} (cloned from ${sourceTenant.name})`);
  console.log(`Variants: ${variantCount}`);
  console.log(`Categories: ${brandSet.size}`);
  console.log(`Badges: ${badgeDefs.length}`);
  console.log(`Sections: ${sectionDefs.length}`);
  console.log(`Payments: ${paymentConfigs.length} (Bank Transfer, Stripe)`);
  console.log(`Currency: USD | Region: ME | Timezone: Asia/Dubai`);
  console.log(`Shipping: Aramex $28 / DHL Express $55`);
  console.log(`Price conversion: HKD / ${HKD_TO_USD}`);
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
