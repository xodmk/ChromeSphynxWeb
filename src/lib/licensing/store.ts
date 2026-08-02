// Trial issuance ledger: one trial per (email, product).
//
// File-backed store for development only. Vercel's serverless filesystem is
// ephemeral, so this MUST be replaced with a durable store (Turso / Vercel
// Postgres) before launch — the interface below is the seam.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export interface TrialRecord {
  email: string; // normalized: trimmed, lowercased
  product: string;
  issuedAt: string;
}

const DATA_FILE = path.join(process.cwd(), '.data', 'trial-issued.json');

function load(): TrialRecord[] {
  try {
    return JSON.parse(readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function hasTrial(email: string, product: string): boolean {
  const norm = normalizeEmail(email);
  return load().some((r) => r.email === norm && r.product === product);
}

export function recordTrial(record: TrialRecord): void {
  const records = load();
  records.push(record);
  mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(records, null, 2) + '\n');
}
