// POST /api/account/resend — re-send every licence issued to an email address.
//
// Deliberately gives the same response whether or not the address is known, so
// the endpoint cannot be used to discover who owns a licence.

import { NextResponse } from 'next/server';
import { PRODUCTS } from '@/lib/licensing/products';
import { getStore, normalizeEmail } from '@/lib/licensing/store';
import { sendLicenseEmail } from '@/lib/licensing/email';

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
  const email = typeof body?.email === 'string' ? normalizeEmail(body.email) : '';
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }

  const licenses = await getStore().listByEmail(email);
  for (const issued of licenses) {
    const productName = PRODUCTS.find((p) => p.id === issued.product)?.name ?? issued.product;
    await sendLicenseEmail({
      to: email,
      productId: issued.product,
      productName,
      license: issued.license,
    });
  }

  // Same response either way — never reveal whether the address is known.
  return NextResponse.json({ ok: true });
}
