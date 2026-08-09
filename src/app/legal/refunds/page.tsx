import Link from 'next/link';
import type { Metadata } from 'next';
import { SUPPORT_EMAIL } from '../../../lib/site';

export const metadata: Metadata = {
  title: 'Refund Policy — Chrome Sphynx Audio',
  description: 'Our refund policy for downloadable audio plugins.',
  alternates: { canonical: '/legal/refunds' },
};

// TODO(owner): confirm the 14-day window before submitting for domain review.
export default function RefundsPage() {
  return (
    <main>
      <section className="section">
        <div className="container">
          <article className="prose">
            <h1>Refund Policy</h1>
            <p className="prose-meta">Last updated: 4 August 2026</p>

            <h2>The short version</h2>
            <p>
              If a plugin isn&apos;t working out for you, email{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> within 14 days
              of purchase and we&apos;ll refund you. You do not need to justify the
              request.
            </p>

            <h2>Try before you buy</h2>
            <p>
              Every plugin has a <Link href="/trial">free demo</Link> — the same
              binary as the paid version, unrestricted for 20 minutes per
              session, with only preset saving disabled. We would much rather you
              tested it in your own projects, on your own machine, than bought it
              hoping for the best.
            </p>

            <h2>How to request a refund</h2>
            <p>
              Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> from the
              address you bought with, or include your order reference. We&apos;ll
              confirm by email and pass the refund to our merchant of record, who
              processes it back to your original payment method. Banks typically
              take 5–10 business days to show it.
            </p>

            <h2>After a refund</h2>
            <p>
              Your licence for that product is withdrawn and you should uninstall
              the plugin. Projects you have already made remain yours, but the
              plugin will pass audio through unprocessed once the licence is gone.
            </p>

            <h2>Faults</h2>
            <p>
              If a plugin is faulty or does not do what this website says it does,
              your statutory rights are unaffected by the 14-day window. Tell us
              what went wrong and we will either fix it or refund you, whichever
              you prefer.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
