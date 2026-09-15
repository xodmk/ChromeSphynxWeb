# Paddle sandbox catalog + webhook — DRAFT (not yet created)

Drafted 2026-09-15. Target: **sandbox only**, through the `paddle-sandbox-key`
MCP server. Nothing below exists in Paddle until the owner approves and the
execute block at the bottom is run. Sandbox ids never carry over to live; the
live catalog is created separately at go-live.

## What we know vs. what we're inferring

### Observed
- Sandbox is empty: 0 products, 0 prices; the destination list returns 0 items
  (though `estimatedTotal` says 1–2). Source: read-only MCP calls, 2026-09-15.
- Site copy: both plugins are `$79` / `USD`
  (`src/content/plugins/*.json`). Product images are live over HTTPS (200,
  `image/png`) and nearly square (966×938, 964×925).
- The webhook route issues **one licence per transaction**, and
  `resolveProductId` returns the **first** mapped id it finds
  (`src/lib/licensing/paddle.ts:107-121`, `src/app/api/webhooks/paddle/route.ts`).
- Paddle's `create product` requires the tax category to be **enabled on the
  account** (API reference, via MCP `search`).

### Inferred / assumed (flagged)
- **A1:** the checkout will open **one price per checkout**, as spec W4 plans.
  If a cart ever held both plugins, the current webhook would issue only one
  licence. This draft limits quantity to 1, but cannot stop a two-product cart;
  the checkout code has to.
- **A2:** `digital-goods` is the right tax category. Paddle's own skill lists
  "plugins" under it. Whether it is enabled on this account is **unknown**; if
  not, the create call fails cleanly and `standard` is the fallback.
- **A3:** the new sandbox key has `product.write`, `price.write` and
  `notification_setting.write`. Unverified; a `forbidden` error would show it.

### Deferred
| Question | Settles it |
|---|---|
| ~~Do 1–2 hidden destinations already exist?~~ | **Resolved 2026-09-15:** the dashboard says "No notification destinations yet". The API's `estimatedTotal` of 1–2 was not a count of real destinations |
| Is `$79` tax-inclusive or tax added on top? | Owner decision; the draft uses `tax_mode: account_setting` (the account default) |
| Does the `transaction.completed` payload carry the customer email without `include_sensitive_fields`? | First sandbox purchase; the route already falls back to the Paddle API lookup |

## 1. Products

| Field | Block Rotator | Poltergeist |
|---|---|---|
| `name` (shown at checkout) | Block Rotator | Poltergeist |
| `description` | A reverb that breathes, mutates, and orbits | A spectral effects processor that haunts, warps, and decays |
| `tax_category` | `digital-goods` (A2) | `digital-goods` (A2) |
| `image_url` | `https://chromesphynx.com/gfx/CSPHX_BlockRotator_ChromeFace.png` | `https://chromesphynx.com/gfx/CSPHX_Poltergeist_GorgulanFace.png` |
| `custom_data` | `{"cs_product_id":"block-rotator"}` | `{"cs_product_id":"poltergeist"}` |

`custom_data` is not read by the current code (it uses `CS_PADDLE_PRODUCT_MAP`).
It is there so the dashboard shows which licence product each item maps to.

## 2. Prices (one per product)

| Field | Value (both) |
|---|---|
| `name` (shown to customers) | Perpetual licence |
| `description` (internal) | `<Product> perpetual licence, USD, one-time` |
| `unit_price` | `{ amount: "7900", currency_code: "USD" }` = $79.00 |
| `billing_cycle` | omitted: **one-time** |
| `trial_period` | omitted (not allowed on one-time prices; the demo lives in the plugin) |
| `quantity` | `{ minimum: 1, maximum: 1 }`, because one licence covers every computer the buyer owns and the webhook issues one licence per order |
| `tax_mode` | `account_setting` (see deferred question) |
| `unit_price_overrides` | none; other currencies get Paddle's automatic conversion |

## 3. Webhook destination (notification setting)

| Field | Value |
|---|---|
| `description` | chromesphynx.com licence fulfilment (sandbox) |
| `type` | `url` |
| `destination` | `https://chromesphynx.com/api/webhooks/paddle` |
| `subscribed_events` | `["transaction.completed"]`, the only event the route handles (everything else gets 200 "ignored") |
| `traffic_source` | `all`, so Paddle's **webhook simulator** can reach it too, not only real sandbox checkouts |
| `include_sensitive_fields` | `false` |
| `api_version` | omitted (account default) |

**The secret stays out of chat.** The create call returns `endpoint_secret_key`
(`pdl_ntfset_…`). The execute block never returns it. The owner copies it from
Dashboard → Developer tools → Notifications into Vercel as
`PADDLE_WEBHOOK_SECRET_KEY`.

**Expected until Vercel is configured:** production answers
`500 not configured`, so sandbox deliveries fail and Paddle retries them. That
is harmless, and it stops once step 4 (Vercel env + redeploy) is done.

## 4. After creation — values for Vercel (step 4)

```
CS_PADDLE_PRODUCT_MAP={"pri_<block-rotator>":"block-rotator","pri_<poltergeist>":"poltergeist"}
PADDLE_API_BASE=https://sandbox-api.paddle.com
NEXT_PUBLIC_PADDLE_ENV=sandbox
PADDLE_WEBHOOK_SECRET_KEY=<from dashboard, never pasted in chat>
```

## Execute block (runs only on approval)

Refuses to create duplicates, and never returns secrets.

```js
async (client) => {
  const existing = await client.products.list({ status: ['active', 'archived'] });
  const names = (existing.products || []).map((p) => p.name);
  if (names.includes('Block Rotator') || names.includes('Poltergeist')) {
    return { aborted: 'product with that name already exists', names };
  }

  const defs = [
    { id: 'block-rotator', name: 'Block Rotator',
      description: 'A reverb that breathes, mutates, and orbits',
      image_url: 'https://chromesphynx.com/gfx/CSPHX_BlockRotator_ChromeFace.png' },
    { id: 'poltergeist', name: 'Poltergeist',
      description: 'A spectral effects processor that haunts, warps, and decays',
      image_url: 'https://chromesphynx.com/gfx/CSPHX_Poltergeist_GorgulanFace.png' },
  ];

  const out = {};
  for (const d of defs) {
    const product = await client.products.create({
      name: d.name,
      description: d.description,
      tax_category: 'digital-goods',
      image_url: d.image_url,
      custom_data: { cs_product_id: d.id },
    });
    const price = await client.prices.create({
      product_id: product.id,
      name: 'Perpetual licence',
      description: `${d.name} perpetual licence, USD, one-time`,
      unit_price: { amount: '7900', currency_code: 'USD' },
      quantity: { minimum: 1, maximum: 1 },
    });
    out[d.id] = { product_id: product.id, price_id: price.id, tax_category: product.tax_category };
  }

  const dest = await client.notificationSettings.create({
    description: 'chromesphynx.com licence fulfilment (sandbox)',
    type: 'url',
    destination: 'https://chromesphynx.com/api/webhooks/paddle',
    subscribed_events: ['transaction.completed'],
    traffic_source: 'all',
    include_sensitive_fields: false,
  });

  return {
    ...out,
    notification_setting_id: dest.id,
    destination: dest.destination,
    events: (dest.subscribed_events || []).map((e) => e.name || e),
    // endpoint_secret_key deliberately not returned
  };
}
```
