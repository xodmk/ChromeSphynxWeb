// Licence delivery. Trial and purchase mails share one template so support
// only ever has to explain a single unlock flow.

import { SUPPORT_EMAIL, absoluteUrl } from '../site';

// Only purchased licences are ever emailed. Since spec v3.0 the demo is a
// 20-minute session timer inside the plugin, so there is no trial licence to
// send and no expiry to state.
interface SendArgs {
  to: string;
  productId: string;
  productName: string;
  license: string;
}

export function licenseEmailBody({ productName, license }: Omit<SendArgs, 'to' | 'productId'>): string {
  return (
    `Thank you for buying ${productName}.\n\nYour licence:\n\n${license}\n` +
    `Copy the whole block above — including the BEGIN and END lines — and paste ` +
    `it into the plugin's licence panel. The same licence is attached as a file ` +
    `if you prefer "Load licence file".\n\n` +
    `This licence is perpetual and covers every computer you own. There is no ` +
    `subscription and nothing to renew, and the 20-minute demo limit and preset ` +
    `restriction are gone for good.\n\n` +
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

  const subject = `Your ${args.productName} licence`;

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
          filename: `ChromeSphynx-${args.productId}.cslic`,
          content: Buffer.from(args.license, 'utf8').toString('base64'),
        },
      ],
    }),
  });
  return res.ok ? 'sent' : 'failed';
}
