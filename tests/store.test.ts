// Exercises the file backend (the dev default). The Postgres backend shares
// the same interface; its behaviour is asserted by the same expectations here
// and by the ON CONFLICT clauses in schema.sql.

import assert from 'node:assert/strict';
import { rmSync } from 'node:fs';
import path from 'node:path';
import { afterEach, beforeEach, test } from 'node:test';
import { fileStore, normalizeEmail } from '../src/lib/licensing/store.ts';

const DATA_DIR = path.join(process.cwd(), '.data');

beforeEach(() => rmSync(DATA_DIR, { recursive: true, force: true }));
afterEach(() => rmSync(DATA_DIR, { recursive: true, force: true }));

test('a trial is issued once per email and product', async () => {
  assert.equal(await fileStore.hasTrial('a@b.co', 'block-rotator'), false);
  await fileStore.recordTrial({ email: 'a@b.co', product: 'block-rotator', issuedAt: '2026-08-04T00:00:00Z' });
  assert.equal(await fileStore.hasTrial('a@b.co', 'block-rotator'), true);
  // Same address, different product — still allowed.
  assert.equal(await fileStore.hasTrial('a@b.co', 'poltergeist'), false);
});

test('email matching is case- and whitespace-insensitive', async () => {
  await fileStore.recordTrial({ email: '  A@B.co ', product: 'poltergeist', issuedAt: 'x' });
  assert.equal(await fileStore.hasTrial('a@b.co', 'poltergeist'), true);
  assert.equal(await fileStore.hasTrial('A@B.CO', 'poltergeist'), true);
  assert.equal(normalizeEmail('  Foo@Bar.COM '), 'foo@bar.com');
});

test('an order round-trips and is findable by id', async () => {
  const order = {
    orderId: 'txn_1',
    email: 'buyer@example.com',
    product: 'block-rotator',
    license: '-----BEGIN CHROME SPHYNX LICENSE-----\nabc\n-----END CHROME SPHYNX LICENSE-----\n',
    issuedAt: '2026-08-04T00:00:00Z',
  };
  assert.equal(await fileStore.findOrder('txn_1'), null);
  await fileStore.recordOrder(order);
  const found = await fileStore.findOrder('txn_1');
  assert.equal(found?.license, order.license);
  assert.equal(found?.product, 'block-rotator');
});

test('listByEmail returns every licence bought by an address', async () => {
  await fileStore.recordOrder({
    orderId: 'txn_1', email: 'buyer@example.com', product: 'block-rotator',
    license: 'LIC-A', issuedAt: '2026-08-01T00:00:00Z',
  });
  await fileStore.recordOrder({
    orderId: 'txn_2', email: 'BUYER@example.com', product: 'poltergeist',
    license: 'LIC-B', issuedAt: '2026-08-02T00:00:00Z',
  });
  await fileStore.recordOrder({
    orderId: 'txn_3', email: 'someone@else.com', product: 'poltergeist',
    license: 'LIC-C', issuedAt: '2026-08-03T00:00:00Z',
  });

  const mine = await fileStore.listByEmail('buyer@example.com');
  assert.equal(mine.length, 2);
  assert.deepEqual(mine.map((l) => l.license).sort(), ['LIC-A', 'LIC-B']);
  assert.ok(mine.every((l) => l.type === 'full'));
  assert.equal((await fileStore.listByEmail('nobody@nowhere.com')).length, 0);
});

test('an event id is claimable exactly once (webhook idempotency)', async () => {
  assert.equal(await fileStore.markEventProcessed('evt_1'), true);
  assert.equal(await fileStore.markEventProcessed('evt_1'), false);
  assert.equal(await fileStore.markEventProcessed('evt_2'), true);
});
