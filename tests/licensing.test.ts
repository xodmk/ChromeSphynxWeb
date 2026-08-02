import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  TRIAL_DAYS,
  generateLicenseKeyPair,
  isExpired,
  issueLicense,
  trialPayload,
  verifyLicense,
  type LicensePayload,
} from '../src/lib/licensing/license.ts';

const { publicKeyHex, privateKeyHex } = generateLicenseKeyPair();

const fullPayload: LicensePayload = {
  v: 1,
  type: 'full',
  product: 'block-rotator',
  licensee: 'Jane Doe',
  email: 'jane@example.com',
  issuedAt: '2026-08-02T00:00:00Z',
  orderId: 'TEST-0001',
};

test('full license round-trips sign -> verify', () => {
  const armored = issueLicense(fullPayload, privateKeyHex);
  const result = verifyLicense(armored, publicKeyHex);
  assert.ok(result.valid);
  assert.deepEqual(result.payload, fullPayload);
  assert.equal(isExpired(result.payload), false);
});

test('trial payload expires exactly TRIAL_DAYS later', () => {
  const now = new Date('2026-08-02T12:00:00Z');
  const payload = trialPayload('poltergeist', 'Jane@Example.com ', now);
  assert.equal(payload.type, 'trial');
  assert.equal(payload.expiresAt, '2026-08-22T12:00:00Z');
  assert.equal(isExpired(payload, new Date('2026-08-22T11:59:59Z')), false);
  assert.equal(isExpired(payload, new Date('2026-08-22T12:00:01Z')), true);
  assert.equal(TRIAL_DAYS, 20);
});

test('expired trial license still verifies but reports expired', () => {
  const payload = trialPayload('block-rotator', 'a@b.co', new Date('2026-01-01T00:00:00Z'));
  const armored = issueLicense(payload, privateKeyHex);
  const result = verifyLicense(armored, publicKeyHex);
  assert.ok(result.valid);
  assert.equal(isExpired(result.payload, new Date('2026-08-02T00:00:00Z')), true);
});

test('tampered payload is rejected', () => {
  const armored = issueLicense(fullPayload, privateKeyHex);
  // Decode the armor, flip the product inside the signed payload, re-encode.
  const b64 = armored.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const envelope = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  envelope.payload = envelope.payload.replace('block-rotator', 'poltergeist');
  const tampered =
    '-----BEGIN CHROME SPHYNX LICENSE-----\n' +
    Buffer.from(JSON.stringify(envelope), 'utf8').toString('base64') +
    '\n-----END CHROME SPHYNX LICENSE-----\n';
  const result = verifyLicense(tampered, publicKeyHex);
  assert.equal(result.valid, false);
});

test('license signed with a different key is rejected', () => {
  const other = generateLicenseKeyPair();
  const armored = issueLicense(fullPayload, other.privateKeyHex);
  const result = verifyLicense(armored, publicKeyHex);
  assert.equal(result.valid, false);
});

test('garbage input yields a clean error, not a throw', () => {
  const result = verifyLicense('not a license at all', publicKeyHex);
  assert.equal(result.valid, false);
});
