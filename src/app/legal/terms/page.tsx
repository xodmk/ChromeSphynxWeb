import Link from 'next/link';
import type { Metadata } from 'next';
import { SUPPORT_EMAIL } from '../../../lib/site';

export const metadata: Metadata = {
  title: 'Terms & Conditions — Chrome Sphynx Audio',
  description: 'Terms and conditions of sale for Chrome Sphynx Audio plugins.',
  alternates: { canonical: '/legal/terms' },
};

// Trading identity supplied by the owner 2026-08-05. Have these terms reviewed
// by a professional before launch.
export default function TermsPage() {
  return (
    <main>
      <section className="section">
        <div className="container">
          <article className="prose">
            <h1>Terms &amp; Conditions</h1>
            <p className="prose-meta">Last updated: 4 August 2026</p>

            <h2>1. Who we are</h2>
            <p>
              Chrome Sphynx Audio is a trading name of <strong>Elliot Schei</strong>,
              a sole proprietor registered in Japan, at Suginami-ku Takaido Higashi
              3-16-33, Tokyo, Japan 168-0072 (&quot;we&quot;, &quot;us&quot;). You
              can reach us at <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
            </p>

            <h2>2. What we sell</h2>
            <p>
              We sell downloadable audio plugin software for use in digital audio
              workstations. Each product page states the formats, supported
              operating systems, system requirements, and price. Purchases are
              delivered electronically: you receive a licence key by email, along
              with download links. Nothing is shipped physically.
            </p>

            <h2>3. Orders and payment</h2>
            <p>
              Our order process is operated by our merchant of record, who handles
              payment, invoicing, and applicable sales tax or VAT on our behalf.
              They appear as the seller of record on your payment statement and
              their terms apply to the payment transaction itself.
            </p>
            <p>
              Prices are shown in the currency stated on the product page.
              Applicable taxes are calculated at checkout based on your location.
            </p>

            <h2>4. Your licence</h2>
            <p>
              A purchase grants you a perpetual, non-exclusive, non-transferable
              licence to use the software, as set out in the{' '}
              <Link href="/legal/eula">End User Licence Agreement</Link>. You may
              install it on any computer you own or control. Licences may not be
              resold or transferred to another person.
            </p>

            <h2>5. Trials</h2>
            <p>
              We offer a free 20-day trial of each plugin. Trials are fully
              functional. When a trial expires, the plugin stops processing audio
              and passes it through unaltered until a licence is entered. One
              trial is issued per product per email address.
            </p>

            <h2>6. Refunds</h2>
            <p>
              See our <Link href="/legal/refunds">Refund Policy</Link>, which forms
              part of these terms.
            </p>

            <h2>7. Updates and support</h2>
            <p>
              Updates within the current major version are free. We provide support
              by email at <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> and
              aim to respond within two business days.
            </p>

            <h2>8. Availability and changes</h2>
            <p>
              We may update, change, or discontinue products. We may revise these
              terms; the version in force at the time of your purchase governs that
              purchase.
            </p>

            <h2>9. Liability</h2>
            <p>
              To the extent permitted by law, our total liability arising from a
              purchase is limited to the amount you paid for it. Nothing in these
              terms excludes liability that cannot lawfully be excluded.
            </p>

            <h2>10. Governing law</h2>
            <p>
              These terms are governed by the laws of Japan. Consumers retain the
              protections of mandatory law in their country of residence.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
