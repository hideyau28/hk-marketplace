import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const res = await pool.query('SELECT "shoeType", COUNT(*)::int as cnt FROM "Product" GROUP BY "shoeType" ORDER BY cnt DESC');
console.table(res.rows);
await pool.end();
