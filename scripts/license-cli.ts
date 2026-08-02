// License CLI — key generation and manual issuance/verification for support
// cases. Runs directly under Node 22+ (native TypeScript type stripping):
//
//   node scripts/license-cli.ts keygen
//   node scripts/license-cli.ts issue --type full --product block-rotator \
//        --email jane@example.com --name "Jane Doe" [--order AD-1234] [--out jane.cslic]
//   node scripts/license-cli.ts issue --type trial --product poltergeist --email jane@example.com
//   node scripts/license-cli.ts verify --file jane.cslic --pubkey <hex>
//   node scripts/license-cli.ts inspect --file jane.cslic
//
// The private key is read from --key or the CS_LICENSE_PRIVATE_KEY env var.

import { readFileSync, writeFileSync } from 'node:fs';
import {
  LICENSE_FORMAT_VERSION,
  generateLicenseKeyPair,
  issueLicense,
  isExpired,
  trialPayload,
  verifyLicense,
  type LicensePayload,
} from '../src/lib/licensing/license.ts';

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

function require_(value: string | undefined, name: string): string {
  if (!value) {
    console.error(`missing --${name}`);
    process.exit(1);
  }
  return value;
}

function decodeArmored(file: string) {
  const armored = readFileSync(file, 'utf8');
  const b64 = armored
    .replace(/-----(BEGIN|END) CHROME SPHYNX LICENSE-----/g, '')
    .replace(/\s+/g, '');
  const envelope = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  return JSON.parse(envelope.payload) as LicensePayload;
}

const command = process.argv[2];

switch (command) {
  case 'keygen': {
    const { publicKeyHex, privateKeyHex } = generateLicenseKeyPair();
    console.log('public key  (embed in plugins + verify calls):', publicKeyHex);
    console.log('private key (CS_LICENSE_PRIVATE_KEY — keep secret):', privateKeyHex);
    break;
  }
  case 'issue': {
    const key = arg('key') ?? process.env.CS_LICENSE_PRIVATE_KEY;
    if (!key) {
      console.error('missing --key or CS_LICENSE_PRIVATE_KEY');
      process.exit(1);
    }
    const type = require_(arg('type'), 'type');
    const product = require_(arg('product'), 'product');
    const email = require_(arg('email'), 'email');
    let payload: LicensePayload;
    if (type === 'trial') {
      payload = trialPayload(product, email);
    } else if (type === 'full') {
      payload = {
        v: LICENSE_FORMAT_VERSION,
        type: 'full',
        product,
        licensee: arg('name') ?? email,
        email,
        issuedAt: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
        ...(arg('order') ? { orderId: arg('order') } : {}),
      };
    } else {
      console.error('--type must be trial or full');
      process.exit(1);
    }
    const license = issueLicense(payload, key);
    const out = arg('out');
    if (out) {
      writeFileSync(out, license);
      console.log(`wrote ${out}`);
    } else {
      process.stdout.write(license);
    }
    break;
  }
  case 'verify': {
    const file = require_(arg('file'), 'file');
    const pubkey = require_(arg('pubkey'), 'pubkey');
    const result = verifyLicense(readFileSync(file, 'utf8'), pubkey);
    if (!result.valid) {
      console.error(`INVALID: ${result.error}`);
      process.exit(1);
    }
    const expired = isExpired(result.payload);
    console.log(`VALID${expired ? ' (but EXPIRED)' : ''}`);
    console.log(JSON.stringify(result.payload, null, 2));
    break;
  }
  case 'inspect': {
    const file = require_(arg('file'), 'file');
    console.log(JSON.stringify(decodeArmored(file), null, 2));
    break;
  }
  default:
    console.error('usage: license-cli.ts <keygen|issue|verify|inspect> [options]');
    process.exit(1);
}
