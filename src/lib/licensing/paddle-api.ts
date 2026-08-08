// Read-only Paddle API access. Paddle is the system of record for purchases —
// we store nothing ourselves, so licence re-sends are answered by asking Paddle
// what this customer bought and regenerating the (deterministic) licence.

import { transactionPaddleIds } from './paddle';

const BASE = process.env.PADDLE_API_BASE ?? 'https://api.paddle.com';

export interface PurchasedTransaction {
  id: string;
  orderedAt: string; // RFC 3339
  paddleIds: string[]; // price/product ids seen on the transaction
}

async function get(path: string): Promise<any | null> {
  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: 'no-store',
    });
    if (!res.ok) {
      console.error(`[paddle-api] GET ${path} -> ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (e) {
    console.error(`[paddle-api] GET ${path} failed: ${e instanceof Error ? e.message : e}`);
    return null;
  }
}

export async function fetchCustomerEmail(customerId: string): Promise<string | undefined> {
  const body = await get(`/customers/${customerId}`);
  return body?.data?.email;
}

// `email` is an exact-match filter — Paddle recommends it over `search` for
// addresses. Returns every completed purchase, newest first.
export async function listCompletedPurchases(email: string): Promise<PurchasedTransaction[]> {
  const customers = await get(`/customers?email=${encodeURIComponent(email)}`);
  const ids: string[] = (customers?.data ?? []).map((c: any) => c.id).filter(Boolean);
  if (!ids.length) return [];

  const out: PurchasedTransaction[] = [];
  for (const customerId of ids) {
    const txs = await get(
      `/transactions?customer_id=${encodeURIComponent(customerId)}&status=completed&per_page=200`,
    );
    for (const tx of txs?.data ?? []) {
      if (!tx?.id) continue;
      out.push({
        id: tx.id,
        orderedAt: tx.created_at ?? tx.billed_at,
        paddleIds: transactionPaddleIds(tx),
      });
    }
  }
  return out;
}
