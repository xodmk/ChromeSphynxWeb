// Chrome Sphynx license format v1: an Ed25519-signed JSON payload wrapped in
// a base64 armor block (.cslic). The signature covers the exact UTF-8 bytes of
// the serialized payload string, so verifiers (including the C++ plugin side)
// never need canonical-JSON logic — they verify the payload string as-is, then
// parse it. See docs/LICENSING_DESIGN.md and docs/PLUGIN_LICENSE_SPEC.md.

import { createPrivateKey, createPublicKey, generateKeyPairSync, sign, verify } from 'node:crypto';

export const LICENSE_FORMAT_VERSION = 1;
export const TRIAL_DAYS = 20;

export interface LicensePayload {
  v: number;
  type: 'trial' | 'full';
  product: string; // product id, e.g. 'block-rotator'
  licensee: string; // display name shown in the plugin UI
  email: string;
  issuedAt: string; // ISO 8601 UTC, e.g. '2026-08-02T12:00:00Z'
  expiresAt?: string; // trial only; absent means perpetual
  orderId?: string; // full only
}

export type VerifyResult =
  | { valid: true; payload: LicensePayload }
  | { valid: false; error: string };

const ARMOR_BEGIN = '-----BEGIN CHROME SPHYNX LICENSE-----';
const ARMOR_END = '-----END CHROME SPHYNX LICENSE-----';

// RFC 8410 DER prefixes: raw 32-byte Ed25519 keys <-> PKCS#8 / SPKI documents.
const PKCS8_PREFIX = Buffer.from('302e020100300506032b657004220420', 'hex');
const SPKI_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');

function privateKeyFromHex(seedHex: string) {
  const seed = Buffer.from(seedHex, 'hex');
  if (seed.length !== 32) throw new Error('private key must be 64 hex chars (32 bytes)');
  return createPrivateKey({ key: Buffer.concat([PKCS8_PREFIX, seed]), format: 'der', type: 'pkcs8' });
}

function publicKeyFromHex(pubHex: string) {
  const pub = Buffer.from(pubHex, 'hex');
  if (pub.length !== 32) throw new Error('public key must be 64 hex chars (32 bytes)');
  return createPublicKey({ key: Buffer.concat([SPKI_PREFIX, pub]), format: 'der', type: 'spki' });
}

export function generateLicenseKeyPair(): { publicKeyHex: string; privateKeyHex: string } {
  const { publicKey, privateKey } = generateKeyPairSync('ed25519');
  const spki = publicKey.export({ format: 'der', type: 'spki' });
  const pkcs8 = privateKey.export({ format: 'der', type: 'pkcs8' });
  return {
    publicKeyHex: spki.subarray(SPKI_PREFIX.length).toString('hex'),
    privateKeyHex: pkcs8.subarray(PKCS8_PREFIX.length).toString('hex'),
  };
}

export function issueLicense(payload: LicensePayload, privateKeyHex: string): string {
  const payloadJson = JSON.stringify(payload);
  const sig = sign(null, Buffer.from(payloadJson, 'utf8'), privateKeyFromHex(privateKeyHex));
  const envelope = JSON.stringify({
    v: LICENSE_FORMAT_VERSION,
    payload: payloadJson,
    sig: sig.toString('base64'),
  });
  const b64 = Buffer.from(envelope, 'utf8').toString('base64');
  const lines = b64.match(/.{1,64}/g) ?? [];
  return [ARMOR_BEGIN, ...lines, ARMOR_END].join('\n') + '\n';
}

export function verifyLicense(armored: string, publicKeyHex: string): VerifyResult {
  try {
    const beginIdx = armored.indexOf(ARMOR_BEGIN);
    const endIdx = armored.indexOf(ARMOR_END);
    if (beginIdx === -1 || endIdx === -1 || endIdx < beginIdx) {
      return { valid: false, error: 'missing license armor markers' };
    }
    const b64 = armored
      .slice(beginIdx + ARMOR_BEGIN.length, endIdx)
      .replace(/\s+/g, '');
    const envelope = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
    if (
      envelope.v !== LICENSE_FORMAT_VERSION ||
      typeof envelope.payload !== 'string' ||
      typeof envelope.sig !== 'string'
    ) {
      return { valid: false, error: 'malformed license envelope' };
    }
    const ok = verify(
      null,
      Buffer.from(envelope.payload, 'utf8'),
      publicKeyFromHex(publicKeyHex),
      Buffer.from(envelope.sig, 'base64'),
    );
    if (!ok) return { valid: false, error: 'signature verification failed' };
    return { valid: true, payload: JSON.parse(envelope.payload) };
  } catch (e) {
    return { valid: false, error: e instanceof Error ? e.message : 'unreadable license' };
  }
}

export function isExpired(payload: LicensePayload, now: Date = new Date()): boolean {
  if (!payload.expiresAt) return false;
  return now.getTime() > Date.parse(payload.expiresAt);
}

export function trialPayload(product: string, email: string, now: Date = new Date()): LicensePayload {
  const expires = new Date(now.getTime() + TRIAL_DAYS * 86_400_000);
  return {
    v: LICENSE_FORMAT_VERSION,
    type: 'trial',
    product,
    licensee: email,
    email,
    issuedAt: toIsoSeconds(now),
    expiresAt: toIsoSeconds(expires),
  };
}

function toIsoSeconds(d: Date): string {
  return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
}
