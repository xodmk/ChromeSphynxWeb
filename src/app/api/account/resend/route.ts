// POST /api/account/resend — re-send every licence bought by an email address.
//
// Stateless: we keep no order database. Paddle is asked what this customer
// bought, and each licence is regenerated from the order. Because generation is
// deterministic, the regenerated licence is byte-identical to the one sent at
// purchase time — the same file, not a replacement.
//
// The response is identical whether or not the address is known, so this
// endpoint cannot be used to discover who owns a licence.

import { NextResponse } from 'next/server';
import { fullLicensePayload, issueLicense, normalizeEmail } from '@/lib/licensing/license';
import { PRODUCTS, isProductId } from '@/lib/licensing/products';
import { sendLicenseEmail } from '@/lib/licensing/email';
import { resolveProductId } from '@/lib/licensing/paddle';
import { listCompletedPurchases } from '@/lib/licensing/paddle-api';

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

  const privateKey = process.env.CS_LICENSE_PRIVATE_KEY;
  if (privateKey) {
    for (const purchase of await listCompletedPurchases(email)) {
      const productId = resolveProductId(purchase.paddleIds, process.env.CS_PADDLE_PRODUCT_MAP);
      if (!productId || !isProductId(productId)) continue;

      const license = issueLicense(
        fullLicensePayload({
          product: productId,
          email,
          orderId: purchase.id,
          orderedAt: purchase.orderedAt,
        }),
        privateKey,
      );
      const productName = PRODUCTS.find((p) => p.id === productId)?.name ?? productId;
      await sendLicenseEmail({ to: email, productId, productName, license });
    }
  }

  // Same response either way — never reveal whether the address is known.
  return NextResponse.json({ ok: true });
}
