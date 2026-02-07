import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: true } });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'hk-marketplace' },
    update: {},
    create: {
      name: 'HK Marketplace',
      slug: 'hk-marketplace',
      region: 'HK',
      currency: 'HKD',
      timezone: 'Asia/Hong_Kong',
      languages: ['zh-HK', 'en'],
      themeColor: '#6B7B3A',
      status: 'active',
    },
  });
  console.log(`Tenant: ${tenant.id} (${tenant.slug})`);

  const tables = [
    'product', 'order', 'user', 'badge', 'coupon',
    'adminLog', 'siteContent', 'storeSettings',
    'homepageSection', 'homepageBanner', 'paymentMethod',
    'idempotencyKey',
  ];

  const results = await prisma.$transaction(
    tables.map(t =>
      prisma[t].updateMany({
        where: { tenantId: null },
        data: { tenantId: tenant.id },
      })
    )
  );

  tables.forEach((t, i) => {
    console.log(`  ${t}: ${results[i].count} rows updated`);
  });

  console.log('Done!');
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
