// The stateless design rests on one property: a licence is fully determined by
// the order. If this holds, a duplicate webhook re-sends the same file and a
// lost licence can be regenerated instead of stored. If it ever breaks,
// customers get a different licence on every re-send — so these tests guard the
// architecture, not just the function.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  fullLicensePayload,
  generateLicenseKeyPair,
  issueLicense,
  normalizeEmail,
  verifyLicense,
} from '../src/lib/licensing/license.ts';

const { publicKeyHex, privateKeyHex } = generateLicenseKeyPair();

const ORDER = {
  product: 'block-rotator',
  email: 'Buyer@Example.COM',
  orderId: 'txn_01h04vsbhqc62t8hmd4z3b578c',
  orderedAt: '2026-08-09T12:34:56.789Z',
};

test('the same order signs to byte-identical output, every time', () => {
  const a = issueLicense(fullLicensePayload(ORDER), privateKeyHex);
  const b = issueLicense(fullLicensePayload(ORDER), privateKeyHex);
  assert.equal(a, b);
});

test('regenerating months later still matches — no wall clock involved', async () => {
  const first = issueLicense(fullLicensePayload(ORDER), privateKeyHex);
  await new Promise((r) => setTimeout(r, 25));
  const later = issueLicense(fullLicensePayload(ORDER), privateKeyHex);
  assert.equal(first, later);
});

test('issuedAt comes from the order, not from now', () => {
  const payload = fullLicensePayload(ORDER);
  assert.equal(payload.issuedAt, '2026-08-09T12:34:56Z');
  assert.equal(payload.orderId, ORDER.orderId);
  assert.equal(payload.type, 'full');
  assert.equal(payload.expiresAt, undefined); // perpetual
});

test('email is normalized consistently, so case cannot fork the licence', () => {
  const upper = issueLicense(fullLicensePayload(ORDER), privateKeyHex);
  const lower = issueLicense(
    fullLicensePayload({ ...ORDER, email: 'buyer@example.com' }),
    privateKeyHex,
  );
  assert.equal(upper, lower);
  assert.equal(normalizeEmail('  Buyer@Example.COM '), 'buyer@example.com');
});

test('a different order produces a different licence', () => {
  const base = issueLicense(fullLicensePayload(ORDER), privateKeyHex);
  for (const variant of [
    { ...ORDER, orderId: 'txn_other' },
    { ...ORDER, product: 'poltergeist' },
    { ...ORDER, email: 'someone@else.com' },
    { ...ORDER, orderedAt: '2026-08-10T12:34:56.789Z' },
  ]) {
    assert.notEqual(issueLicense(fullLicensePayload(variant), privateKeyHex), base);
  }
});

test('the regenerated licence verifies and carries the order reference', () => {
  const result = verifyLicense(issueLicense(fullLicensePayload(ORDER), privateKeyHex), publicKeyHex);
  assert.ok(result.valid);
  assert.equal(result.payload.orderId, ORDER.orderId);
  assert.equal(result.payload.email, 'buyer@example.com');
  assert.equal(result.payload.product, 'block-rotator');
});
