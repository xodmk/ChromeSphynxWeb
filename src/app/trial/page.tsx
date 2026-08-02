'use client';

import { useState } from 'react';
import { PRODUCTS } from '../../lib/licensing/products';

export default function TrialPage() {
  const [email, setEmail] = useState('');
  const [product, setProduct] = useState(PRODUCTS[0].id as string);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<null | { sent: boolean; license?: string; expiresAt?: string }>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, product }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
      } else {
        setDone(data);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <style>{`
        .trial-form { max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; gap: 1rem; text-align: left; }
        .trial-form label { color: #d1d5db; font-weight: 600; }
        .trial-form input, .trial-form select {
          width: 100%; padding: 0.75rem 1rem; margin-top: 0.4rem;
          background: #111827; color: #e5e7eb; border: 1px solid #374151; border-radius: 0.5rem; font-size: 1rem;
        }
        .trial-error { color: #f87171; }
        .trial-license { width: 100%; height: 12rem; margin-top: 1rem; background: #111827; color: #e5e7eb;
          border: 1px solid #374151; border-radius: 0.5rem; padding: 1rem; font-family: monospace; font-size: 0.8rem; }
      `}</style>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Free 20-Day Trial</h2>
            <p className="section-subtitle">
              Get a fully-functional trial license by email. No account, no dongle, no online
              activation — the plugin verifies the license file offline.
            </p>
          </div>

          {done ? (
            <div className="trial-form">
              {done.sent ? (
                <p className="section-subtitle">
                  Your trial license is on its way — check your inbox. Paste the license block from
                  the email into the plugin&apos;s license panel to start your 20 days.
                </p>
              ) : (
                <>
                  <p className="section-subtitle">
                    Your trial license (valid until {done.expiresAt}). Copy the whole block and
                    paste it into the plugin&apos;s license panel — or download it as a file.
                  </p>
                  <textarea className="trial-license" readOnly value={done.license} />
                  <a
                    className="button primary"
                    download={`ChromeSphynx-${product}-trial.cslic`}
                    href={`data:application/octet-stream,${encodeURIComponent(done.license ?? '')}`}
                  >
                    Download license file
                  </a>
                </>
              )}
            </div>
          ) : (
            <form className="trial-form" onSubmit={submit}>
              <label>
                Plugin
                <select value={product} onChange={(e) => setProduct(e.target.value)}>
                  {PRODUCTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
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
              {error && <p className="trial-error">{error}</p>}
              <button className="button primary" type="submit" disabled={busy}>
                {busy ? 'Issuing…' : 'Email me a trial license'}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
