import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: true } });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const products = await prisma.product.findMany({ where: { active: true } });

function classify(name) {
  const n = name.toLowerCase();
  if (n.includes('jordan') || n.includes('spizike')) return 'Air Jordan';
  if (n.includes('dunk') || n.includes(' sb ') || n.endsWith(' sb') || n.includes("sb '") || n.includes('vertebrae')) return 'Dunk / SB';
  if (n.includes('air force') || n.includes('force 1') || n.includes('force 58')) return 'Air Force';
  if (n.includes('air max') || n.includes('sunder max')) return 'Air Max';
  if (n.includes('pegasus') || n.includes('vomero') || n.includes('zoom structure') || n.includes('zoomx') || n.includes('zoom fly') || n.includes('infinity run') || n.includes('reactx') || n.includes('winflo') || n.includes('quest') || n.includes('revolution') || n.includes('journey run') || n.includes('flex runner') || n.includes('shox')) return 'Running';
  if (n.includes('lebron') || n.includes('book 1') || n.includes('giannis') || n.includes('freak') || n.includes('gt hustle') || n.includes('gt jump') || n.includes('ja 2') || n.includes('kd 17') || n.includes('sabrina')) return 'Basketball';
  if (n.includes('metcon') || n.includes('free metcon')) return 'Training';
  if (n.includes('calm mule') || n.includes('aqua turf') || n.includes('air rift')) return 'Sandals';
  return 'Lifestyle';
}

let counts = {};
for (const p of products) {
  const cat = classify(p.title);
  counts[cat] = (counts[cat] || 0) + 1;
  await prisma.product.update({
    where: { id: p.id },
    data: { category: cat },
  });
}

console.log('\n✅ 分類更新完成:');
for (const [k, v] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k}: ${v}`);
}
process.exit(0);
