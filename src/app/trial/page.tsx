import Link from 'next/link';
import type { Metadata } from 'next';
import { PRODUCTS } from '../../lib/products';
import { PURCHASING_ENABLED } from '../../lib/status';
import WipNotice from '../components/WipNotice';

// This route is compiled into both plugins as kTrialUrl
// (https://chromesphynx.com/trial) — it must keep working under this path.
export const metadata: Metadata = {
  title: 'Free Demo — Chrome Sphynx Audio',
  description:
    'Every Chrome Sphynx plugin runs as a fully functional demo: 20 minutes per session, preset saving disabled. No sign-up, no account.',
  alternates: { canonical: '/trial' },
};

export default function TrialPage() {
  return (
    <main>
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Free Demo</h2>
            <p className="section-subtitle">
              The complete plugin, free to run for 20 minutes at a time. No
              sign-up, no email, no account — just install it and go.
            </p>
          </div>

          <div className="prose">
            {!PURCHASING_ENABLED && <WipNotice />}

            <h2>How it works</h2>
            <p>
              Install the plugin and load it in your DAW. It runs completely
              unrestricted for 20 minutes of processing — every algorithm, every
              parameter, full quality. Nothing is greyed out, watermarked, or
              degraded, and no noise is injected into your audio.
            </p>
            <p>
              A small badge counts the time down. When it reaches zero the plugin
              fades out smoothly and passes audio through unprocessed; reload it
              and you get another 20 minutes. The timer counts audio actually
              processed, so a paused session doesn&apos;t consume it.
            </p>

            <h2>The one limit</h2>
            <p>
              <strong>Saving presets is disabled in the demo.</strong> That is the
              real boundary — you can explore the plugin as long as you like, but
              you can&apos;t build a preset library or rely on it in finished work
              until you buy. Your DAW sessions still save and reload normally.
            </p>

            <h2>Nothing to install, expire, or reset</h2>
            <p>
              There is no trial licence to request, no key to enter, and no clock
              running down in the background. The demo doesn&apos;t write anything
              to your machine and never contacts us — the plugin has no network
              code in it at all.
            </p>

            <h2>Buying</h2>
            <p>
              A licence arrives by email as a short text block. Paste it into the
              plugin&apos;s licence panel and it unlocks permanently, on every
              computer you own — no dongle, no online activation, no account. The
              timer and the preset restriction disappear for good.
            </p>

            <h2>Downloads</h2>
            <p>
              {PURCHASING_ENABLED
                ? 'Grab the installer for your platform from the product pages:'
                : 'Installers are not published yet. Once they are, you will find them on the product pages:'}
            </p>
            <ul>
              {PRODUCTS.map((p) => (
                <li key={p.slug}>
                  <Link href={`/plugins/${p.slug}`}>{p.name}</Link> — {p.tagline}
                </li>
              ))}
            </ul>

            <p>
              Already bought and lost your licence? Retrieve it from{' '}
              <Link href="/account">My Licenses</Link>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
