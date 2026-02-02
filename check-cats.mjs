import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const res = await pool.query('SELECT category, COUNT(*)::int as cnt FROM "Product" GROUP BY category ORDER BY cnt DESC');
console.table(res.rows);
const total = await pool.query('SELECT COUNT(*)::int as total FROM "Product"');
console.log('Total products:', total.rows[0].total);
await pool.end();
