// Paddle Billing webhook support: signature verification and payload mapping.
// Kept free of Next.js and network calls so it can be unit-tested directly.
//
// Signature scheme (developer.paddle.com/webhooks/signature-verification):
//   header  Paddle-Signature: ts=<unix>;h1=<hex>
//   payload `${ts}:${rawBody}`  — the RAW body, never re-serialized JSON
//   digest  HMAC-SHA256 keyed with the endpoint secret used as-is

import { createHmac, timingSafeEqual } from 'node:crypto';

// Paddle's own SDKs allow 5 seconds. That is tight for a cold-starting
// serverless function, and replay protection here rests primarily on event-id
// idempotency in the store, so we allow more clock/latency slack.
export const DEFAULT_MAX_AGE_SECONDS = 300;

export type VerifyOutcome =
  | { valid: true }
  | { valid: false; reason: string };

export function verifyPaddleSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
  maxAgeSeconds: number = DEFAULT_MAX_AGE_SECONDS,
): VerifyOutcome {
  if (!signatureHeader) return { valid: false, reason: 'missing Paddle-Signature header' };

  const parts = new Map<string, string>();
  for (const part of signatureHeader.split(';')) {
    const idx = part.indexOf('=');
    if (idx > 0) parts.set(part.slice(0, idx).trim(), part.slice(idx + 1).trim());
  }

  const ts = parts.get('ts');
  const h1 = parts.get('h1');
  if (!ts || !h1) return { valid: false, reason: 'malformed Paddle-Signature header' };

  const eventTime = Number(ts);
  if (!Number.isFinite(eventTime)) return { valid: false, reason: 'malformed timestamp' };
  if (Math.abs(nowSeconds - eventTime) > maxAgeSeconds) {
    return { valid: false, reason: 'timestamp outside tolerance' };
  }

  const expected = createHmac('sha256', secret).update(`${ts}:${rawBody}`, 'utf8').digest('hex');

  // timingSafeEqual throws on length mismatch, so guard first.
  if (expected.length !== h1.length) return { valid: false, reason: 'signature mismatch' };
  if (!timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(h1, 'utf8'))) {
    return { valid: false, reason: 'signature mismatch' };
  }
  return { valid: true };
}

// --- payload mapping ------------------------------------------------------

export interface PaddlePurchase {
  eventId: string;
  transactionId: string;
  email?: string;
  customerId?: string;
  /** Paddle price/product ids seen on the transaction, most specific first. */
  paddleIds: string[];
}

export function parseTransactionCompleted(payload: any): PaddlePurchase | null {
  if (!payload || payload.event_type !== 'transaction.completed') return null;
  const data = payload.data;
  if (!data?.id) return null;

  const paddleIds: string[] = [];
  for (const item of data.items ?? []) {
    if (item?.price?.id) paddleIds.push(item.price.id);
    if (item?.price?.product_id) paddleIds.push(item.price.product_id);
  }
  for (const line of data.details?.line_items ?? []) {
    if (line?.price_id) paddleIds.push(line.price_id);
    if (line?.product?.id) paddleIds.push(line.product.id);
  }

  return {
    eventId: payload.event_id,
    transactionId: data.id,
    // Paddle sends customer_id; the email is only inline when the customer is
    // expanded, so the route falls back to the API. custom_data lets a
    // checkout pass the address through directly.
    email: data.customer?.email ?? data.custom_data?.email,
    customerId: data.customer_id ?? data.customer?.id,
    paddleIds: [...new Set(paddleIds)],
  };
}

// Maps Paddle price/product ids to our product ids. The Paddle ids only exist
// once the catalog is created in their dashboard, so this is configuration:
//   CS_PADDLE_PRODUCT_MAP={"pri_abc":"block-rotator","pro_xyz":"poltergeist"}
export function resolveProductId(paddleIds: string[], rawMap: string | undefined): string | null {
  if (!rawMap) return null;
  let map: Record<string, string>;
  try {
    map = JSON.parse(rawMap);
  } catch {
    return null;
  }
  for (const id of paddleIds) {
    if (map[id]) return map[id];
  }
  return null;
}
