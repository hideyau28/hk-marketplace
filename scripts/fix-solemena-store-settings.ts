/**
 * Fix script: Update solemena-test StoreSettings + HomepageBanner
 * Run on production: npx tsx scripts/fix-solemena-store-settings.ts
 *
 * Changes:
 * - storeName: "Bull Kicks"
 * - storeNameEn: "Bull Kicks - Authenticated Sneakers"
 * - tagline: "Authenticated Sneakers from Asia"
 * - welcomePopup fields updated for Bull Kicks
 * - WhatsApp template updated
 * - Hero banner updated (title + subtitle, no image → CSS gradient fallback)
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const url = process.env.DATABASE_URL!;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const pool = new Pool({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  // ── 1. Find solemena-test tenant ──
  const tenant = await prisma.tenant.findUnique({
    where: { slug: "solemena-test" },
    select: { id: true, slug: true, name: true },
  });

  if (!tenant) {
    console.error("Tenant 'solemena-test' not found");
    process.exit(1);
  }
  console.log(`Found tenant: ${tenant.name} (${tenant.slug}) [${tenant.id}]`);

  // ── 2. Update StoreSettings ──
  const settings = await prisma.storeSettings.findFirst({
    where: { tenantId: tenant.id },
    select: { id: true, storeName: true },
  });

  if (!settings) {
    console.error("StoreSettings not found for solemena-test");
    process.exit(1);
  }

  console.log(`Current storeName: "${settings.storeName}"`);

  const updated = await prisma.storeSettings.update({
    where: { id: settings.id },
    data: {
      storeName: "Bull Kicks",
      storeNameEn: "Bull Kicks - Authenticated Sneakers",
      tagline: "Authenticated Sneakers from Asia",
      welcomePopupTitle: "Welcome to Bull Kicks",
      welcomePopupSubtitle: "Every pair verified authentic before shipping.",
      welcomePopupPromoText: "✅ Ships from Hong Kong to UAE & GCC",
      welcomePopupButtonText: "Start Shopping",
    },
  });
  console.log(`✅ StoreSettings updated → storeName: "${updated.storeName}"`);

  // ── 3. Update Tenant orderConfirmMessage (WhatsApp template) ──
  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      name: "Bull Kicks",
      orderConfirmMessage: JSON.stringify({
        thanks:
          "Thank you for your order! Your authenticated sneakers are on the way.",
        whatsappTemplate:
          "Hi! I just placed order #{orderNumber} on Bull Kicks.",
      }),
    },
  });
  console.log(`✅ Tenant name + WhatsApp template updated`);

  // ── 4. Update hero banner (or create if missing) ──
  const existingBanner = await prisma.homepageBanner.findFirst({
    where: { tenantId: tenant.id, position: "hero" },
  });

  if (existingBanner) {
    await prisma.homepageBanner.update({
      where: { id: existingBanner.id },
      data: {
        title: "Bull Kicks",
        subtitle: "Authenticated Sneakers from Asia to the Middle East",
        imageUrl: null,
        images: [],
        linkUrl: null,
      },
    });
    console.log(`✅ Hero banner updated (id: ${existingBanner.id})`);
  } else {
    await prisma.homepageBanner.create({
      data: {
        tenantId: tenant.id,
        title: "Bull Kicks",
        subtitle: "Authenticated Sneakers from Asia to the Middle East",
        position: "hero",
        sortOrder: 0,
        active: true,
        imageUrl: null,
        images: [],
      },
    });
    console.log(`✅ Hero banner created`);
  }

  // ── 5. Fix "Hot Right Now" section cardSize → "small" for consistent cards ──
  const hotSection = await prisma.homepageSection.findFirst({
    where: { tenantId: tenant.id, title: "Hot Right Now" },
  });
  if (hotSection && hotSection.cardSize === "large") {
    await prisma.homepageSection.update({
      where: { id: hotSection.id },
      data: { cardSize: "small" },
    });
    console.log(`✅ "Hot Right Now" cardSize changed from "large" → "small"`);
  } else if (hotSection) {
    console.log(
      `ℹ️  "Hot Right Now" cardSize already "${hotSection.cardSize}" — no change`,
    );
  } else {
    console.log(`⚠️  "Hot Right Now" section not found`);
  }

  console.log("\nDone! All solemena-test settings updated to Bull Kicks.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
