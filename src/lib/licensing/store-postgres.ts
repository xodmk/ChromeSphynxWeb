// Postgres backend. Works with any Postgres — Neon, Supabase, RDS, local.
//
// On serverless, use your provider's POOLED connection string (pgbouncer):
// each invocation may open its own connection, and a direct connection string
// will exhaust the server's limit under load. The pool below is capped at one
// connection per instance for the same reason.

import { Pool } from 'pg';
import type { IssuedLicense, LicenseStore, OrderRecord, TrialRecord } from './store';
import { normalizeEmail } from './store';

let pool: Pool | undefined;

function db(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 1,
      idleTimeoutMillis: 10_000,
      ssl: process.env.DATABASE_SSL === 'disable' ? undefined : { rejectUnauthorized: false },
    });
  }
  return pool;
}

export const postgresStore: LicenseStore = {
  async hasTrial(email: string, product: string) {
    const { rowCount } = await db().query(
      'SELECT 1 FROM trials WHERE email = $1 AND product = $2 LIMIT 1',
      [normalizeEmail(email), product],
    );
    return (rowCount ?? 0) > 0;
  },

  async recordTrial(record: TrialRecord) {
    await db().query(
      `INSERT INTO trials (email, product, issued_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (email, product) DO NOTHING`,
      [normalizeEmail(record.email), record.product, record.issuedAt],
    );
  },

  async findOrder(orderId: string) {
    const { rows } = await db().query(
      'SELECT order_id, email, product, license, issued_at FROM orders WHERE order_id = $1',
      [orderId],
    );
    if (!rows.length) return null;
    const r = rows[0];
    return {
      orderId: r.order_id,
      email: r.email,
      product: r.product,
      license: r.license,
      issuedAt: r.issued_at,
    } satisfies OrderRecord;
  },

  async recordOrder(record: OrderRecord) {
    await db().query(
      `INSERT INTO orders (order_id, email, product, license, issued_at)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (order_id) DO NOTHING`,
      [record.orderId, normalizeEmail(record.email), record.product, record.license, record.issuedAt],
    );
  },

  async listByEmail(email: string) {
    const { rows } = await db().query(
      `SELECT product, license, issued_at FROM orders
       WHERE email = $1 ORDER BY issued_at DESC`,
      [normalizeEmail(email)],
    );
    return rows.map(
      (r): IssuedLicense => ({
        product: r.product,
        license: r.license,
        type: 'full',
        issuedAt: r.issued_at,
      }),
    );
  },

  // Returns true only for the first caller with a given event id, so a
  // provider retry cannot issue a second licence for the same purchase.
  async markEventProcessed(eventId: string) {
    const { rowCount } = await db().query(
      'INSERT INTO webhook_events (event_id) VALUES ($1) ON CONFLICT DO NOTHING',
      [eventId],
    );
    return (rowCount ?? 0) > 0;
  },
};
