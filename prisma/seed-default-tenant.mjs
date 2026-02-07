import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Upsert tenant (idempotent)
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
  })
  console.log(`Tenant: ${tenant.id} (${tenant.slug})`)

  // Batch update all tables where tenantId IS NULL
  const tables = [
    'Product', 'Order', 'User', 'Badge', 'Coupon',
    'AdminLog', 'SiteContent', 'StoreSettings',
    'HomepageSection', 'HomepageBanner', 'PaymentMethod',
    'IdempotencyKey',
  ]

  const results = await prisma.$transaction(
    tables.map(table =>
      prisma[table.charAt(0).toLowerCase() + table.slice(1)].updateMany({
        where: { tenantId: null },
        data: { tenantId: tenant.id },
      })
    )
  )

  tables.forEach((t, i) => {
    console.log(`  ${t}: ${results[i].count} rows updated`)
  })

  console.log('Done!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
