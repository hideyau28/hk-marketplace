import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: true } });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const result = await prisma.product.deleteMany({ where: { sku: null } });
console.log('Deleted:', result.count, 'old seed products');
const remaining = await prisma.product.count();
console.log('Remaining:', remaining, 'Nike products');
process.exit(0);
