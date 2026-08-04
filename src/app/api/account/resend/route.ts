// POST /api/account/resend — re-send every licence issued to an email address.
//
// Deliberately gives the same response whether or not the address is known, so
// the endpoint cannot be used to discover who owns a licence.

import { NextResponse } from 'next/server';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const WINDOW_MS = 3_600_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }

  // TODO(launch): look the address up in the durable order/trial store and
  // re-send each licence found. Blocked on the same store that replaces the
  // dev file store in src/lib/licensing/store.ts — see docs/LICENSING_DESIGN.md
  // "Before launch". Until then the endpoint accepts the request and tells the
  // customer to email support, rather than silently doing nothing.
  return NextResponse.json({ ok: true, pending: true });
}
