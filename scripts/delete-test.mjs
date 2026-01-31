import { prisma } from '../lib/prisma.js';

const count = await prisma.product.count({ where: { title: 'Test Product' } });
console.log('Found ' + count + ' Test Products');

if (count > 0) {
  const result = await prisma.product.deleteMany({ where: { title: 'Test Product' } });
  console.log('Deleted ' + result.count + ' Test Products');
}

await prisma.$disconnect();
