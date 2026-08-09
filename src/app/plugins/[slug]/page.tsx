import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PRODUCTS, getProduct } from '../../../lib/products';
import { PURCHASING_ENABLED } from '../../../lib/status';
import WipNotice from '../../components/WipNotice';

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const product = getProduct(params.slug);
  if (!product) return {};
  return {
    title: `${product.name} — Chrome Sphynx Audio`,
    description: product.summary,
    alternates: { canonical: `/plugins/${product.slug}` },
    openGraph: {
      title: `${product.name} — Chrome Sphynx Audio`,
      description: product.summary,
      url: `/plugins/${product.slug}`,
      images: [product.image],
    },
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProduct(params.slug);
  if (!product) notFound();

  return (
    <main>
      <section className="section">
        <div className="container">
          <div className="product-hero">
            <div>
              <h1 className="section-title" style={{ textAlign: 'left' }}>{product.name}</h1>
              <p className="product-tagline">{product.tagline}</p>
              <p style={{ color: '#9ca3af', lineHeight: 1.75 }}>{product.summary}</p>

              {!PURCHASING_ENABLED && <WipNotice />}

              <div className="buy-row">
                <span className="price-tag">{product.price}</span>
                {PURCHASING_ENABLED ? (
                  // TODO(mor): swap for the Paddle checkout overlay once the
                  // account is verified.
                  <Link className="button primary" href="/support#buying">
                    Buy {product.name}
                  </Link>
                ) : (
                  <span className="button primary is-disabled" aria-disabled="true">
                    Not yet on sale
                  </span>
                )}
                <Link className="button secondary" href="/trial">Try the free demo</Link>
              </div>

              <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                One licence covers every computer you own. No dongle, no online
                activation, no account required.
              </p>
            </div>

            <img src={product.image} alt={`${product.name} interface`} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="prose">
            <h2>What it does</h2>
            {product.highlights.map((h) => (
              <div className="highlight-item" key={h.title}>
                <h3>{h.title}</h3>
                <p>{h.body}</p>
              </div>
            ))}

            <h2>Specifications</h2>
            <table className="spec-table">
              <tbody>
                {product.specs.map(([label, value]) => (
                  <tr key={label}>
                    <td>{label}</td>
                    <td>{value}</td>
                  </tr>
                ))}
                <tr>
                  <td>Formats</td>
                  <td>{product.formats.join(' · ')}</td>
                </tr>
              </tbody>
            </table>

            <h2>System requirements</h2>
            <ul>
              {product.requirements.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>

            <h2>Who it&apos;s for</h2>
            <p>{product.audience}</p>

            <h2>What&apos;s included</h2>
            <ul>
              <li>{product.name} in {product.formats.join(' and ')} format</li>
              <li>Factory preset banks</li>
              <li>A perpetual licence — yours to keep, with no subscription</li>
              <li>Free updates within the current major version</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
