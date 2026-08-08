// POST /api/webhooks/paddle — purchase fulfilment.
//
// Stateless: verify the signature, derive a licence that is fully determined by
// the order, email it. Nothing is stored. A duplicate delivery regenerates a
// byte-identical licence and simply re-sends it, so no idempotency table is
// needed — Paddle is the system of record.
//
// Failure policy: 403 for a bad signature; 200 for events we ignore (a
// permanent 4xx would have Paddle retrying an unrelated event forever); 500
// only for faults a retry can fix, such as an email outage.

import { NextResponse } from 'next/server';
import { fullLicensePayload, issueLicense } from '@/lib/licensing/license';
import { PRODUCTS, isProductId } from '@/lib/licensing/products';
import { sendLicenseEmail } from '@/lib/licensing/email';
import { parseTransactionCompleted, resolveProductId, verifyPaddleSignature } from '@/lib/licensing/paddle';
import { fetchCustomerEmail } from '@/lib/licensing/paddle-api';

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
    return NextResponse.json({ ignored: payload?.event_type ?? 'unknown' });
  }

  const productId = resolveProductId(purchase.paddleIds, process.env.CS_PADDLE_PRODUCT_MAP);
  if (!productId || !isProductId(productId)) {
    console.error(
      `[paddle] no product mapping for ${purchase.paddleIds.join(', ')} on ${purchase.transactionId}. ` +
        'Set CS_PADDLE_PRODUCT_MAP.',
    );
    // Our misconfiguration — a retry cannot fix it, so acknowledge and alert
    // through logs rather than making Paddle retry forever.
    return NextResponse.json({ error: 'unmapped product' }, { status: 200 });
  }

  const email = purchase.email ?? (await fetchCustomerEmail(purchase.customerId ?? ''));
  if (!email) {
    console.error(`[paddle] no email for transaction ${purchase.transactionId}`);
    return NextResponse.json({ error: 'no customer email' }, { status: 500 });
  }

  const license = issueLicense(
    fullLicensePayload({
      product: productId,
      email,
      orderId: purchase.transactionId,
      orderedAt: purchase.orderedAt,
    }),
    privateKey,
  );

  const productName = PRODUCTS.find((p) => p.id === productId)?.name ?? productId;
  const sent = await sendLicenseEmail({ to: email, productId, productName, license });
  if (sent === 'failed') {
    // Nothing was stored, and regeneration is deterministic, so a retry
    // produces the identical licence and simply tries the email again.
    console.error(`[paddle] email failed for ${purchase.transactionId}; Paddle will retry`);
    return NextResponse.json({ error: 'email failed' }, { status: 500 });
  }

  return NextResponse.json({
    fulfilled: purchase.transactionId,
    product: productId,
    emailed: sent === 'sent',
  });
}
