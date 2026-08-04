// Licence delivery. Trial and purchase mails share one template so support
// only ever has to explain a single unlock flow.

import { SUPPORT_EMAIL, absoluteUrl } from '../site';

interface SendArgs {
  to: string;
  productId: string;
  productName: string;
  license: string;
  /** Trials state their expiry; full licences are perpetual. */
  expiresAt?: string;
}

export function licenseEmailBody({ productName, license, expiresAt }: Omit<SendArgs, 'to' | 'productId'>): string {
  const opening = expiresAt
    ? `Thanks for trying ${productName}.\n\nYour trial licence (valid until ${expiresAt}):`
    : `Thank you for buying ${productName}.\n\nYour licence:`;

  const closing = expiresAt
    ? `When the trial ends, ${productName} passes audio through unprocessed until you enter a purchased licence — your projects keep opening either way.`
    : `This licence is perpetual and covers every computer you own. There is no ` +
      `subscription and nothing to renew.`;

  return (
    `${opening}\n\n${license}\n` +
    `Copy the whole block above — including the BEGIN and END lines — and paste ` +
    `it into the plugin's licence panel. The same licence is attached as a file ` +
    `if you prefer "Load licence file".\n\n` +
    `${closing}\n\n` +
    `Lost it? Retrieve it any time at ${absoluteUrl('/account')}\n` +
    `Need help? ${SUPPORT_EMAIL}\n\n` +
    `— Chrome Sphynx Audio`
  );
}

// 'skipped' means no provider is configured — expected in development, and
// distinct from 'failed', which is an outage the caller should surface.
export type SendResult = 'sent' | 'skipped' | 'failed';

export async function sendLicenseEmail(args: SendArgs): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`[licensing] RESEND_API_KEY unset — licence for ${args.to} not emailed`);
    return 'skipped';
  }

  const subject = args.expiresAt
    ? `Your ${args.productName} trial licence`
    : `Your ${args.productName} licence`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.CS_LICENSE_EMAIL_FROM ?? `Chrome Sphynx Audio <${SUPPORT_EMAIL}>`,
      to: [args.to],
      subject,
      text: licenseEmailBody(args),
      attachments: [
        {
          filename: `ChromeSphynx-${args.productId}${args.expiresAt ? '-trial' : ''}.cslic`,
          content: Buffer.from(args.license, 'utf8').toString('base64'),
        },
      ],
    }),
  });
  return res.ok ? 'sent' : 'failed';
}
