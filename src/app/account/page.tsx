'use client';

import { useState } from 'react';
import Link from 'next/link';

// This route is referenced by PLUGIN_LICENSE_URL in both installers
// (https://chromesphynx.com/account) — it must keep working under that path.
export default function AccountPage() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/account/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? 'Something went wrong. Please try again.');
      else setSent(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <style>{`
        .account-form { max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; gap: 1rem; text-align: left; }
        .account-form label { color: #d1d5db; font-weight: 600; }
        .account-form input {
          width: 100%; padding: 0.75rem 1rem; margin-top: 0.4rem;
          background: #111827; color: #e5e7eb; border: 1px solid #374151; border-radius: 0.5rem; font-size: 1rem;
        }
        .account-error { color: #f87171; }
      `}</style>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">My Licenses</h2>
            <p className="section-subtitle">
              There are no accounts and no passwords. Enter the email address you
              used and we&apos;ll send your licences again.
            </p>
          </div>

          {sent ? (
            <div className="prose" style={{ textAlign: 'center' }}>
              <p>
                If we have licences for that address, they&apos;re on their way. Check
                your inbox — and your spam folder, since the message carries an
                attachment.
              </p>
              <p>
                Nothing arrives within a few minutes? Email{' '}
                <a href="mailto:support@chromesphynx.com">support@chromesphynx.com</a>{' '}
                and a human will sort it out.
              </p>
            </div>
          ) : (
            <form className="account-form" onSubmit={submit}>
              <label>
                Email
                <input
                  type="email"
                  required
                  value={email}
                  placeholder="you@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              {error && <p className="account-error">{error}</p>}
              <button className="button primary" type="submit" disabled={busy}>
                {busy ? 'Sending…' : 'Resend my licenses'}
              </button>
            </form>
          )}

          <div className="prose" style={{ marginTop: '3rem' }}>
            <h2>How licensing works</h2>
            <p>
              Your licence is a small signed text block. Paste it into the plugin&apos;s
              licence panel — or drop the <code>.cslic</code> file onto the plugin
              window — and it unlocks. The plugin checks it on your own machine, so
              there is no online activation, no dongle, and nothing to log in to.
            </p>
            <p>
              Install on as many computers as you own. If you need a trial first,
              take the <Link href="/trial">free 20-day trial</Link>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
