// POST /api/trial — issue a 20-day trial license, one per (email, product).
// Delivery: emailed via Resend when RESEND_API_KEY is set; otherwise (dev)
// the license is returned in the response body so the flow is testable.

import { NextResponse } from 'next/server';
import { TRIAL_DAYS, issueLicense, trialPayload } from '@/lib/licensing/license';
import { PRODUCTS, isProductId } from '@/lib/licensing/products';
import { hasTrial, normalizeEmail, recordTrial } from '@/lib/licensing/store';
import { SUPPORT_EMAIL, absoluteUrl } from '@/lib/site';

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

  if (hasTrial(email, product)) {
    return NextResponse.json(
      { error: 'A trial for this product has already been issued to this email.' },
      { status: 409 },
    );
  }

  const payload = trialPayload(product, email);
  const license = issueLicense(payload, privateKey);
  recordTrial({ email, product, issuedAt: payload.issuedAt });

  if (process.env.RESEND_API_KEY) {
    const sent = await sendTrialEmail(email, product, license, payload.expiresAt!);
    if (!sent) {
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

async function sendTrialEmail(
  email: string,
  product: string,
  license: string,
  expiresAt: string,
): Promise<boolean> {
  const productName = PRODUCTS.find((p) => p.id === product)?.name ?? product;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.CS_LICENSE_EMAIL_FROM ?? `Chrome Sphynx Audio <${SUPPORT_EMAIL}>`,
      to: [email],
      subject: `Your ${productName} trial license (${TRIAL_DAYS} days)`,
      text:
        `Thanks for trying ${productName}.\n\n` +
        `Your ${TRIAL_DAYS}-day trial license (expires ${expiresAt}):\n\n` +
        license +
        `\nCopy the whole block above — including the BEGIN and END lines — and ` +
        `paste it into the plugin's license panel. The same license is attached ` +
        `as a file if you prefer "Load license file".\n\n` +
        `Lost it? Retrieve it any time at ${absoluteUrl('/account')}\n` +
        `Need help? ${SUPPORT_EMAIL}\n\n` +
        `— Chrome Sphynx Audio`,
      attachments: [
        {
          filename: `ChromeSphynx-${product}-trial.cslic`,
          content: Buffer.from(license, 'utf8').toString('base64'),
        },
      ],
    }),
  });
  return res.ok;
}
