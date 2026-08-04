// POST /api/webhooks/paddle — purchase fulfilment.
//
// transaction.completed → issue a perpetual licence → email it → record the
// order so /account can re-send it later.
//
// Failure policy: return 5xx only for faults Paddle should retry (our bugs,
// email outages). Return 200 for anything a retry cannot fix — bad signature
// is 403, and events we deliberately ignore are 200, because a permanent 4xx
// would otherwise have Paddle retrying an unrelated event forever.

import { NextResponse } from 'next/server';
import { LICENSE_FORMAT_VERSION, issueLicense } from '@/lib/licensing/license';
import { PRODUCTS, isProductId } from '@/lib/licensing/products';
import { getStore, normalizeEmail } from '@/lib/licensing/store';
import { sendLicenseEmail } from '@/lib/licensing/email';
import { parseTransactionCompleted, resolveProductId, verifyPaddleSignature } from '@/lib/licensing/paddle';

export async function POST(req: Request) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET_KEY;
  const privateKey = process.env.CS_LICENSE_PRIVATE_KEY;
  if (!secret || !privateKey) {
    console.error('[paddle] missing PADDLE_WEBHOOK_SECRET_KEY or CS_LICENSE_PRIVATE_KEY');
    return NextResponse.json({ error: 'not configured' }, { status: 500 });
  }

  // Must be the raw body — parsing and re-serializing changes the bytes and
  // the signature will not match.
  const rawBody = await req.text();
  const verdict = verifyPaddleSignature(rawBody, req.headers.get('paddle-signature'), secret);
  if (!verdict.valid) {
    console.warn(`[paddle] rejected webhook: ${verdict.reason}`);
    return NextResponse.json({ error: 'invalid signature' }, { status: 403 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const purchase = parseTransactionCompleted(payload);
  if (!purchase) {
    // Some other event type — acknowledge so Paddle stops sending it.
    return NextResponse.json({ ignored: payload?.event_type ?? 'unknown' });
  }

  const store = getStore();

  // Idempotency first: Paddle retries on any non-2xx, and duplicate delivery
  // is normal. Losing the race here means someone else already fulfilled it.
  if (!(await store.markEventProcessed(purchase.eventId))) {
    return NextResponse.json({ duplicate: true });
  }

  const productId = resolveProductId(purchase.paddleIds, process.env.CS_PADDLE_PRODUCT_MAP);
  if (!productId || !isProductId(productId)) {
    console.error(
      `[paddle] no product mapping for ${purchase.paddleIds.join(', ')} on ${purchase.transactionId}. ` +
        'Set CS_PADDLE_PRODUCT_MAP.',
    );
    // Our misconfiguration, not Paddle's — retrying will not help, but this
    // must be visible. Acknowledge and alert through logs.
    return NextResponse.json({ error: 'unmapped product' }, { status: 200 });
  }

  const email = purchase.email ?? (await fetchCustomerEmail(purchase.customerId));
  if (!email) {
    console.error(`[paddle] no email for transaction ${purchase.transactionId}`);
    return NextResponse.json({ error: 'no customer email' }, { status: 500 });
  }

  const existing = await store.findOrder(purchase.transactionId);
  const productName = PRODUCTS.find((p) => p.id === productId)?.name ?? productId;
  const issuedAt = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');

  const license =
    existing?.license ??
    issueLicense(
      {
        v: LICENSE_FORMAT_VERSION,
        type: 'full',
        product: productId,
        licensee: email,
        email: normalizeEmail(email),
        issuedAt,
        orderId: purchase.transactionId,
      },
      privateKey,
    );

  if (!existing) {
    await store.recordOrder({
      orderId: purchase.transactionId,
      email: normalizeEmail(email),
      product: productId,
      license,
      issuedAt,
    });
  }

  const sent = await sendLicenseEmail({ to: email, productId, productName, license });
  if (sent === 'failed') {
    // The licence is safely recorded, so a retry re-sends without re-issuing.
    console.error(`[paddle] licence recorded but email failed for ${purchase.transactionId}`);
    return NextResponse.json({ error: 'email failed' }, { status: 500 });
  }

  return NextResponse.json({
    fulfilled: purchase.transactionId,
    product: productId,
    emailed: sent === 'sent',
  });
}

async function fetchCustomerEmail(customerId?: string): Promise<string | undefined> {
  const apiKey = process.env.PADDLE_API_KEY;
  if (!customerId || !apiKey) return undefined;
  const base = process.env.PADDLE_API_BASE ?? 'https://api.paddle.com';
  try {
    const res = await fetch(`${base}/customers/${customerId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) return undefined;
    const body = await res.json();
    return body?.data?.email;
  } catch {
    return undefined;
  }
}
