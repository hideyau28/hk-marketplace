import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: true } });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const heroes = await prisma.siteContent.findMany({ where: { type: 'hero' } });
console.log(JSON.stringify(heroes, null, 2));
process.exit(0);
