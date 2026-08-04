-- Chrome Sphynx licensing schema. Apply with: npm run db:migrate
-- Safe to re-run.

CREATE TABLE IF NOT EXISTS trials (
    email     TEXT        NOT NULL,
    product   TEXT        NOT NULL,
    issued_at TEXT        NOT NULL,
    PRIMARY KEY (email, product)
);

CREATE TABLE IF NOT EXISTS orders (
    order_id  TEXT PRIMARY KEY,
    email     TEXT NOT NULL,
    product   TEXT NOT NULL,
    license   TEXT NOT NULL,
    issued_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS orders_email_idx ON orders (email);

-- Webhook idempotency. Providers retry on any non-2xx, and a retry must never
-- mint a second licence for the same purchase.
CREATE TABLE IF NOT EXISTS webhook_events (
    event_id     TEXT PRIMARY KEY,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
