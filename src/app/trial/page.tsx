import Link from 'next/link';
import type { Metadata } from 'next';
import { PRODUCTS } from '../../lib/products';
import { PURCHASING_ENABLED } from '../../lib/status';
import WipNotice from '../components/WipNotice';

// This route is compiled into both plugins as kTrialUrl
// (https://chromesphynx.com/trial) — it must keep working under this path.
export const metadata: Metadata = {
  title: 'Free 20-Day Trial — Chrome Sphynx Audio',
  description:
    'Every Chrome Sphynx plugin runs free for 20 days. No sign-up, no licence request, no account.',
  alternates: { canonical: '/trial' },
};

export default function TrialPage() {
  return (
    <main>
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Free 20-Day Trial</h2>
            <p className="section-subtitle">
              No sign-up, no email required, nothing to request. Install the
              plugin and it runs in full for 20 days.
            </p>
          </div>

          <div className="prose">
            {!PURCHASING_ENABLED && <WipNotice />}

            <h2>How it works</h2>
            <p>
              Download and install. The first time you load the plugin it starts
              its own 20-day trial — there is no licence to fetch and no form to
              fill in. Everything runs on your machine; the plugin never contacts
              us, then or later.
            </p>
            <p>
              The trial is the complete plugin. Nothing is disabled, degraded, or
              watermarked while it runs, and a small badge shows how many days
              remain.
            </p>

            <h2>When the trial ends</h2>
            <p>
              The plugin passes audio through unprocessed and shows its licence
              panel. Your projects still open and still play — you simply lose
              the effect until you enter a licence. Nothing is deleted, and your
              presets stay where they are.
            </p>

            <h2>Buying</h2>
            <p>
              Purchase a licence and you receive it by email as a short text
              block. Paste it into the plugin&apos;s licence panel and it unlocks
              permanently — on every computer you own. There is no dongle, no
              online activation, and no account to create.
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
