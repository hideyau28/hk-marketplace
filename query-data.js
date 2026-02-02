require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const [types, cats, colors, sizes] = await Promise.all([
    p.product.findMany({ where: { active: true }, select: { shoeType: true }, distinct: ['shoeType'] }),
    p.product.findMany({ where: { active: true }, select: { category: true }, distinct: ['category'] }),
    p.product.findMany({ where: { active: true }, select: { color: true }, distinct: ['color'] }),
    p.product.findMany({ where: { active: true }, take: 3, select: { sizes: true, price: true } })
  ]);
  console.log(JSON.stringify({
    shoeTypes: types.map(x => x.shoeType),
    categories: cats.map(x => x.category),
    colors: colors.map(x => x.color),
    sizesSample: sizes
  }, null, 2));
  await p.$disconnect();
}

main().catch(e => { console.error(e); p.$disconnect(); });
