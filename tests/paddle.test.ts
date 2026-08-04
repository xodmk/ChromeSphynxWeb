import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { test } from 'node:test';
import {
  parseTransactionCompleted,
  resolveProductId,
  verifyPaddleSignature,
} from '../src/lib/licensing/paddle.ts';

const SECRET = 'pdl_ntfset_test_secret';
const NOW = 1_770_000_000;

function sign(rawBody: string, ts: number = NOW, secret: string = SECRET): string {
  const h1 = createHmac('sha256', secret).update(`${ts}:${rawBody}`, 'utf8').digest('hex');
  return `ts=${ts};h1=${h1}`;
}

const BODY = JSON.stringify({
  event_id: 'evt_01gks14ge726w50ch2tmaw2a1x',
  event_type: 'transaction.completed',
  data: {
    id: 'txn_01h04vsbhqc62t8hmd4z3b578c',
    status: 'completed',
    customer_id: 'ctm_01h04vsbhqc62t8hmd4z3b578c',
    items: [{ price: { id: 'pri_blockrotator', product_id: 'pro_blockrotator' } }],
  },
});

test('accepts a correctly signed payload', () => {
  assert.equal(verifyPaddleSignature(BODY, sign(BODY), SECRET, NOW).valid, true);
});

test('rejects a tampered body', () => {
  const header = sign(BODY);
  const tampered = BODY.replace('block-rotator', 'poltergeist').replace('txn_', 'txn_x');
  assert.equal(verifyPaddleSignature(tampered, header, SECRET, NOW).valid, false);
});

test('rejects a signature made with the wrong secret', () => {
  const header = sign(BODY, NOW, 'pdl_ntfset_wrong');
  const result = verifyPaddleSignature(BODY, header, SECRET, NOW);
  assert.equal(result.valid, false);
  assert.match((result as { reason: string }).reason, /signature mismatch/);
});

test('rejects a stale timestamp (replay)', () => {
  const header = sign(BODY, NOW - 10_000);
  const result = verifyPaddleSignature(BODY, header, SECRET, NOW);
  assert.equal(result.valid, false);
  assert.match((result as { reason: string }).reason, /tolerance/);
});

test('rejects a future timestamp beyond tolerance', () => {
  const result = verifyPaddleSignature(BODY, sign(BODY, NOW + 10_000), SECRET, NOW);
  assert.equal(result.valid, false);
});

test('rejects missing and malformed headers without throwing', () => {
  assert.equal(verifyPaddleSignature(BODY, null, SECRET, NOW).valid, false);
  assert.equal(verifyPaddleSignature(BODY, 'garbage', SECRET, NOW).valid, false);
  assert.equal(verifyPaddleSignature(BODY, 'ts=abc;h1=def', SECRET, NOW).valid, false);
  // Truncated hex must not throw inside timingSafeEqual.
  assert.equal(verifyPaddleSignature(BODY, `ts=${NOW};h1=ab`, SECRET, NOW).valid, false);
});

test('signature depends on the exact raw bytes, not parsed JSON', () => {
  const header = sign(BODY);
  const reserialized = JSON.stringify(JSON.parse(BODY).data ? JSON.parse(BODY) : {});
  const spaced = reserialized.replace(/","/g, '", "');
  assert.equal(verifyPaddleSignature(spaced, header, SECRET, NOW).valid, false);
});

test('parses a transaction.completed payload', () => {
  const parsed = parseTransactionCompleted(JSON.parse(BODY));
  assert.ok(parsed);
  assert.equal(parsed.eventId, 'evt_01gks14ge726w50ch2tmaw2a1x');
  assert.equal(parsed.transactionId, 'txn_01h04vsbhqc62t8hmd4z3b578c');
  assert.equal(parsed.customerId, 'ctm_01h04vsbhqc62t8hmd4z3b578c');
  assert.deepEqual(parsed.paddleIds, ['pri_blockrotator', 'pro_blockrotator']);
});

test('ignores other event types', () => {
  assert.equal(parseTransactionCompleted({ event_type: 'subscription.created', data: { id: 'x' } }), null);
  assert.equal(parseTransactionCompleted(null), null);
});

test('prefers an inline customer email, then custom_data', () => {
  const withCustomer = parseTransactionCompleted({
    event_type: 'transaction.completed',
    event_id: 'evt_1',
    data: { id: 'txn_1', customer: { email: 'a@b.co' } },
  });
  assert.equal(withCustomer?.email, 'a@b.co');

  const withCustomData = parseTransactionCompleted({
    event_type: 'transaction.completed',
    event_id: 'evt_2',
    data: { id: 'txn_2', custom_data: { email: 'c@d.co' } },
  });
  assert.equal(withCustomData?.email, 'c@d.co');
});

test('resolves our product id from the configured map', () => {
  const map = JSON.stringify({ pri_blockrotator: 'block-rotator', pro_ghost: 'poltergeist' });
  assert.equal(resolveProductId(['pri_blockrotator', 'pro_blockrotator'], map), 'block-rotator');
  assert.equal(resolveProductId(['pro_ghost'], map), 'poltergeist');
  assert.equal(resolveProductId(['pri_unknown'], map), null);
  assert.equal(resolveProductId(['pri_blockrotator'], undefined), null);
  assert.equal(resolveProductId(['pri_blockrotator'], 'not json'), null);
});
