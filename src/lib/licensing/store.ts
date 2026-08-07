// Licence persistence: trials issued, orders fulfilled, webhook events seen.
//
// Two backends. Postgres is used whenever DATABASE_URL is set — required in
// production, because Vercel's serverless filesystem is ephemeral and the file
// backend would silently forget every trial. Without DATABASE_URL the file
// backend runs, which is fine for local development and keeps `npm run dev`
// working with no database.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export interface TrialRecord {
  email: string; // normalized: trimmed, lowercased
  product: string;
  issuedAt: string;
}

export interface OrderRecord {
  orderId: string; // merchant-of-record transaction id
  email: string;
  product: string;
  license: string; // the armored .cslic block
  issuedAt: string;
}

export interface IssuedLicense {
  product: string;
  license: string;
  type: 'trial' | 'full';
  issuedAt: string;
}

export interface LicenseStore {
  hasTrial(email: string, product: string): Promise<boolean>;
  recordTrial(record: TrialRecord): Promise<void>;
  findOrder(orderId: string): Promise<OrderRecord | null>;
  recordOrder(record: OrderRecord): Promise<void>;
  /** Everything ever issued to an address — powers /account resend. */
  listByEmail(email: string): Promise<IssuedLicense[]>;
  /** Webhook idempotency: providers retry, we must not issue twice. */
  markEventProcessed(eventId: string): Promise<boolean>;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// --- file backend (development only) -------------------------------------

interface FileShape {
  trials: TrialRecord[];
  orders: OrderRecord[];
  events: string[];
}

const DATA_FILE = path.join(process.cwd(), '.data', 'licensing.json');

function loadFile(): FileShape {
  try {
    const parsed = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    return { trials: parsed.trials ?? [], orders: parsed.orders ?? [], events: parsed.events ?? [] };
  } catch {
    return { trials: [], orders: [], events: [] };
  }
}

function saveFile(data: FileShape): void {
  mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2) + '\n');
}

export const fileStore: LicenseStore = {
  async hasTrial(email, product) {
    const norm = normalizeEmail(email);
    return loadFile().trials.some((t) => t.email === norm && t.product === product);
  },
  async recordTrial(record) {
    const data = loadFile();
    data.trials.push({ ...record, email: normalizeEmail(record.email) });
    saveFile(data);
  },
  async findOrder(orderId) {
    return loadFile().orders.find((o) => o.orderId === orderId) ?? null;
  },
  async recordOrder(record) {
    const data = loadFile();
    data.orders.push({ ...record, email: normalizeEmail(record.email) });
    saveFile(data);
  },
  async listByEmail(email) {
    const norm = normalizeEmail(email);
    const data = loadFile();
    return [
      ...data.orders
        .filter((o) => o.email === norm)
        .map((o) => ({ product: o.product, license: o.license, type: 'full' as const, issuedAt: o.issuedAt })),
    ];
  },
  async markEventProcessed(eventId) {
    const data = loadFile();
    if (data.events.includes(eventId)) return false;
    data.events.push(eventId);
    saveFile(data);
    return true;
  },
};

// --- backend selection ----------------------------------------------------

let cached: LicenseStore | undefined;

// True when writes will actually persist. The file backend is not durable
// anywhere, and on serverless hosts it cannot even be written: Vercel's
// filesystem is read-only outside /tmp, so mkdirSync/writeFileSync throw.
// Callers that must record something (trial issuance) check this first and
// refuse the request, rather than issuing a licence they cannot log — which
// would make "one trial per email" silently unenforceable.
export function storeIsDurable(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getStore(): LicenseStore {
  if (cached) return cached;
  if (process.env.DATABASE_URL) {
    // Required lazily so local development never loads the pg driver.
    cached = require('./store-postgres').postgresStore as LicenseStore;
  } else {
    if (process.env.NODE_ENV === 'production') {
      console.error(
        '[licensing] DATABASE_URL is not set. The file store cannot be written ' +
          'on a read-only serverless filesystem, so every write will fail. ' +
          'Provision Postgres, run `npm run db:migrate`, and set DATABASE_URL.',
      );
    }
    cached = fileStore;
  }
  return cached;
}
