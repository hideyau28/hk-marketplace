import { config } from 'dotenv';
config({ path: '.env.local' });

const { PrismaClient } = await import('@prisma/client');
const p = new PrismaClient();

const results = await p.$queryRaw`SELECT DISTINCT category, "shoeType" FROM "Product" WHERE active = true ORDER BY category`;
console.log(results);
await p.$disconnect();
