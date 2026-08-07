// POST /api/trial — issue a 20-day trial licence, one per (email, product).
// Delivery: emailed via Resend when RESEND_API_KEY is set; otherwise (dev)
// the licence is returned in the response body so the flow is testable.

import { NextResponse } from 'next/server';
import { TRIAL_DAYS, issueLicense, trialPayload } from '@/lib/licensing/license';
import { PRODUCTS, isProductId } from '@/lib/licensing/products';
import { getStore, normalizeEmail, storeIsDurable } from '@/lib/licensing/store';
import { sendLicenseEmail } from '@/lib/licensing/email';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Per-instance rate limit: good enough to stop naive scripting in dev and on
// a single warm serverless instance; not a substitute for edge rate limiting.
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
  const privateKey = process.env.CS_LICENSE_PRIVATE_KEY;
  if (!privateKey) {
    return NextResponse.json({ error: 'Licensing is not configured.' }, { status: 503 });
  }

  // Refuse rather than issue a licence we cannot record: without a durable
  // store the one-trial-per-email rule is unenforceable, and on Vercel the
  // write throws anyway (read-only filesystem outside /tmp).
  //
  // Gated on VERCEL, not NODE_ENV: `next start` sets NODE_ENV=production even
  // on a developer machine, where the file store works fine and is the whole
  // point of having a file store.
  if (!storeIsDurable() && process.env.VERCEL) {
    console.error('[trial] refused: no durable store (DATABASE_URL unset)');
    return NextResponse.json(
      { error: 'Trials are temporarily unavailable. Please try again later.' },
      { status: 503 },
    );
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const email = typeof body?.email === 'string' ? normalizeEmail(body.email) : '';
  const product = typeof body?.product === 'string' ? body.product : '';
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }
  if (!isProductId(product)) {
    return NextResponse.json({ error: 'Unknown product.' }, { status: 400 });
  }

  const store = getStore();
  if (await store.hasTrial(email, product)) {
    return NextResponse.json(
      { error: 'A trial for this product has already been issued to this email.' },
      { status: 409 },
    );
  }

  const payload = trialPayload(product, email);
  const license = issueLicense(payload, privateKey);
  await store.recordTrial({ email, product, issuedAt: payload.issuedAt });

  if (process.env.RESEND_API_KEY) {
    const productName = PRODUCTS.find((p) => p.id === product)?.name ?? product;
    const sent = await sendLicenseEmail({
      to: email,
      productId: product,
      productName,
      license,
      expiresAt: payload.expiresAt,
    });
    if (sent === 'failed') {
      return NextResponse.json({ error: 'Could not send the license email.' }, { status: 502 });
    }
    return NextResponse.json({ sent: true, trialDays: TRIAL_DAYS });
  }

  return NextResponse.json({
    sent: false,
    trialDays: TRIAL_DAYS,
    expiresAt: payload.expiresAt,
    license,
  });
}
