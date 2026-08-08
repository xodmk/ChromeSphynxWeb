// Pre-launch gating.
//
// TO GO LIVE: set PURCHASING_ENABLED to true. That is the only change needed —
// every buy button and notice on the site reads from it. Do it once the Paddle
// account is verified, PADDLE_WEBHOOK_SECRET_KEY / PADDLE_API_KEY /
// CS_PADDLE_PRODUCT_MAP are set, and released plugin builds exist.

export const PURCHASING_ENABLED = false;

export const WIP_HEADLINE = 'Work in progress — not yet on sale';

export const WIP_BODY =
  'Chrome Sphynx Audio is still in development. Purchasing is not open yet, ' +
  'so nothing here can be ordered and no payment will be taken. Follow along ' +
  'and check back soon.';
