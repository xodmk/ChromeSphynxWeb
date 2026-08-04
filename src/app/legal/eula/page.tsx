import type { Metadata } from 'next';
import { SUPPORT_EMAIL } from '../../../lib/site';

export const metadata: Metadata = {
  title: 'End User Licence Agreement — Chrome Sphynx Audio',
  description: 'The licence terms that accompany Chrome Sphynx Audio plugins.',
  alternates: { canonical: '/legal/eula' },
};

// Mirrors EULA.txt shipped in the installers (csphxAudioPLUGX/*_INSTALL).
// Keep the two in sync — the installer copy is shown during installation.
export default function EulaPage() {
  return (
    <main>
      <section className="section">
        <div className="container">
          <article className="prose">
            <h1>End User Licence Agreement</h1>
            <p className="prose-meta">
              Last updated: 4 August 2026 · This is the same agreement shown during
              installation.
            </p>

            <p>
              By installing, copying, or otherwise using Chrome Sphynx Audio
              software (the &quot;Software&quot;), you agree to be bound by this
              agreement. If you do not agree, do not install or use the Software.
            </p>

            <h2>1. Licence grant</h2>
            <p>
              <span className="todo-token">[LEGAL NAME]</span>, trading as Chrome
              Sphynx Audio (&quot;Licensor&quot;), grants you a non-exclusive,
              non-transferable licence to install and use the Software on any
              computer or computers that you own or control, for personal or
              commercial music production.
            </p>

            <h2>2. Restrictions</h2>
            <p>You may not:</p>
            <ul>
              <li>redistribute, sublicense, rent, lease, or lend the Software;</li>
              <li>reverse-engineer, decompile, or disassemble the Software;</li>
              <li>remove or alter any proprietary notices;</li>
              <li>use the Software to develop a competing product.</li>
            </ul>
            <p>
              Music you create with the Software is entirely yours. There are no
              royalties and no attribution requirement.
            </p>

            <h2>3. Intellectual property</h2>
            <p>
              The Software remains the property of the Licensor. All rights not
              expressly granted are reserved.
            </p>

            <h2>4. Trials</h2>
            <p>
              Trial licences permit evaluation for the stated period. When a trial
              expires the Software passes audio through without processing until a
              purchased licence is entered.
            </p>

            <h2>5. No warranty</h2>
            <p>
              The Software is provided &quot;as is&quot; without warranty of any
              kind, express or implied, including the warranties of
              merchantability, fitness for a particular purpose, and
              non-infringement.
            </p>

            <h2>6. Limitation of liability</h2>
            <p>
              In no event shall the Licensor be liable for any indirect,
              incidental, special, consequential, or punitive damages arising out
              of or related to your use of the Software.
            </p>

            <h2>7. Termination</h2>
            <p>
              This agreement is effective until terminated, and terminates
              automatically if you fail to comply with any term. On termination you
              must destroy all copies of the Software.
            </p>

            <h2>8. Governing law</h2>
            <p>
              This agreement is governed by the laws of Japan. Questions:{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
