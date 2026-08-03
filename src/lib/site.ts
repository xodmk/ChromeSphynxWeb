// Canonical site origin. Everything that needs an absolute URL — metadata,
// license emails, MoR webhook callbacks — resolves it here so the hostname is
// never hardcoded again.
//
// Production is chromesphynx.com (registered 2026-08-04). Set
// NEXT_PUBLIC_SITE_URL to override for preview/staging deployments; on Vercel
// previews, VERCEL_URL is used automatically.

const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
const fromVercel = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;

export const SITE_URL = (fromEnv ?? fromVercel ?? 'https://chromesphynx.com').replace(/\/$/, '');

export const SUPPORT_EMAIL = process.env.CS_SUPPORT_EMAIL ?? 'support@chromesphynx.com';

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
