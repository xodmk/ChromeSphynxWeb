// Apply src/lib/licensing/schema.sql to DATABASE_URL. Idempotent.
//
//   DATABASE_URL=postgres://... node scripts/db-migrate.ts

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { Pool } from 'pg';

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const sql = readFileSync(path.join(process.cwd(), 'src/lib/licensing/schema.sql'), 'utf8');
const pool = new Pool({
  connectionString: url,
  ssl: process.env.DATABASE_SSL === 'disable' ? undefined : { rejectUnauthorized: false },
});

try {
  await pool.query(sql);
  const { rows } = await pool.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name IN ('trials','orders','webhook_events')
     ORDER BY table_name`,
  );
  console.log(`schema applied — tables present: ${rows.map((r) => r.table_name).join(', ')}`);
} catch (e) {
  console.error(`migration failed: ${e instanceof Error ? e.message : e}`);
  process.exit(1);
} finally {
  await pool.end();
}
