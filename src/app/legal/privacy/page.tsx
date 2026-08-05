import type { Metadata } from 'next';
import { SUPPORT_EMAIL } from '../../../lib/site';

export const metadata: Metadata = {
  title: 'Privacy Policy — Chrome Sphynx Audio',
  description: 'What data Chrome Sphynx Audio collects, and what it does not.',
  alternates: { canonical: '/legal/privacy' },
};

// Revisit if analytics is ever added — the "no tracking" statement must stay true.
export default function PrivacyPage() {
  return (
    <main>
      <section className="section">
        <div className="container">
          <article className="prose">
            <h1>Privacy Policy</h1>
            <p className="prose-meta">Last updated: 4 August 2026</p>

            <h2>Who is responsible</h2>
            <p>
              <strong>Elliot Schei</strong>, trading as Chrome Sphynx Audio, of
              Suginami-ku Takaido Higashi 3-16-33, Tokyo, Japan 168-0072, is the
              data controller. Contact:{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
            </p>

            <h2>What the plugins collect</h2>
            <p>
              Nothing. Our plugins do not connect to the internet, do not phone
              home, and contain no analytics or telemetry. Licence checks happen
              entirely on your own computer. We cannot see what you make, which
              projects you open, or when you use the software.
            </p>

            <h2>What the website collects</h2>
            <ul>
              <li>
                <strong>Trial requests.</strong> When you request a trial we store
                your email address and which product you asked for, so that the
                licence can be issued and so each product&apos;s trial is issued once
                per address.
              </li>
              <li>
                <strong>Purchases.</strong> Our merchant of record processes your
                payment and shares the order details we need to issue your licence
                and provide support — typically your name, email address, and
                country. We never receive your full card details.
              </li>
              <li>
                <strong>Support email.</strong> If you write to us, we keep the
                correspondence so we can help you.
              </li>
            </ul>

            <h2>What we do not do</h2>
            <p>
              We do not sell or rent your data. We do not run advertising trackers,
              and we do not build profiles of visitors. The site sets no tracking
              cookies.
            </p>

            <h2>Who else processes your data</h2>
            <p>
              We use a merchant of record to take payments and handle sales tax, a
              transactional email provider to deliver licences, and a hosting
              provider to serve this website. Each processes data only to provide
              that service.
            </p>

            <h2>How long we keep it</h2>
            <p>
              Order and licence records are kept while your licence is valid and
              for as long as tax law requires us to retain them. Trial records are
              kept so that trials remain one-per-address.
            </p>

            <h2>Your rights</h2>
            <p>
              You can ask us for a copy of your data, ask us to correct it, or ask
              us to delete it — email{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. Note that
              deleting a trial record would let a second trial be issued to that
              address, so we may decline that specific request while a licence or
              trial is active.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
