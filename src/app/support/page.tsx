import Link from 'next/link';
import type { Metadata } from 'next';
import { SUPPORT_EMAIL } from '../../lib/site';
import { PRODUCTS } from '../../lib/products';
import { PURCHASING_ENABLED } from '../../lib/status';
import WipNotice from '../components/WipNotice';

export const metadata: Metadata = {
  title: 'Support — Chrome Sphynx Audio',
  description: 'Installation, licensing help, and how to contact Chrome Sphynx Audio.',
  alternates: { canonical: '/support' },
};

export default function SupportPage() {
  return (
    <main>
      <section className="section">
        <div className="container">
          <article className="prose">
            <h1>Support</h1>
            <p className="prose-meta">
              Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> — we aim
              to reply within two business days.
            </p>

            <h2 id="buying">Buying</h2>
            {!PURCHASING_ENABLED && <WipNotice />}
            <p>
              {PRODUCTS.map((p) => p.name).join(' and ')} are sold individually.
              Checkout is handled by our merchant of record, who will appear as the
              seller on your statement and issues your invoice. Your licence
              arrives by email immediately after payment.
            </p>
            <p>
              Not ready to buy? Try the <Link href="/trial">free demo</Link>{' '}
              first — it&apos;s the full plugin, not a reduced version.
            </p>

            <h2>Installing</h2>
            <p>
              Download the installer for your platform and run it. On macOS this is
              a signed and notarised <code>.pkg</code>; on Linux you get a
              <code> .deb</code>, <code>.rpm</code>, or AppImage. The installer
              places the VST3 (and the Audio Unit on macOS) where your DAW expects
              it, then you rescan plugins in your DAW.
            </p>
            <p>
              Your presets and licence are created by the plugin itself the first
              time you use it — the installer does not ask for a serial number.
            </p>

            <h2>Entering your licence</h2>
            <p>
              Open the plugin and click the key icon. Paste the licence block from
              your email — the whole thing, including the BEGIN and END lines — and
              it unlocks immediately. If you saved the <code>.cslic</code> file
              instead, use &quot;Load licence file&quot; or drag the file onto the
              plugin window.
            </p>
            <p>
              There is no online activation, no dongle, and no account to log into.
              The plugin verifies the licence on your own machine, which means it
              keeps working whether or not we are around.
            </p>

            <h2>Lost your licence?</h2>
            <p>
              Get it re-sent from <Link href="/account">My Licenses</Link> using the
              email address you bought with.
            </p>

            <h2>Frequently asked</h2>

            <h3>How many computers can I install on?</h3>
            <p>
              All of the ones you own. We don&apos;t count machines or bind licences
              to hardware.
            </p>

            <h3>What happens when a demo session ends?</h3>
            <p>
              The plugin fades out smoothly and passes audio through unchanged,
              and the licence panel appears. Your projects still open and still
              play — you just lose the effect. Reload the plugin and you get
              another 20 minutes.
            </p>

            <h3>What is limited in the demo?</h3>
            <p>
              Only two things: sessions run for 20 minutes of processing, and
              saving presets is disabled. Every algorithm and parameter works at
              full quality, and nothing is watermarked or noised.
            </p>

            <h3>Do I need an internet connection?</h3>
            <p>
              Only to download the installer and receive your licence email. The
              plugin itself never connects to the internet.
            </p>

            <h3>Which formats do you support?</h3>
            <p>
              VST3 on macOS, Windows, and Linux, plus Audio Unit on macOS. There is
              no AAX build at present.
            </p>

            <h3>Can I transfer or resell a licence?</h3>
            <p>Licences are personal and cannot be transferred or resold.</p>

            <h2>Contact</h2>
            <p>
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. Please include
              your operating system, DAW, and plugin version — it saves a round
              trip.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
