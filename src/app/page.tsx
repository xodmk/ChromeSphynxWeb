import Link from 'next/link';
import content from '../content/content.json';
import { PRODUCTS } from '../lib/products';
import { PURCHASING_ENABLED } from '../lib/status';
import WipNotice from './components/WipNotice';

export default function Home() {
  const { header = {}, hero = {}, showcase = {}, features = {}, site = {} } = content as any;

  return (
    <main>
      {/* Clean Header with Logo */}
      <header className="clean-header">
        <div className="container">
          <h1 className="main-title">{header.title ?? site.title ?? 'Chrome Sphynx Audio'}</h1>

          <div className="logo-container">
            {header.logo && (
              <img src={header.logo} alt={header.logoAlt ?? 'Logo'} className="main-logo" />
            )}
          </div>

          {hero.subtitle && <p className="hero-subtitle">{hero.subtitle}</p>}
          {hero.description && <p className="hero-description">{hero.description}</p>}
        </div>
      </header>

      {/* Plugins — the two shipping products */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Plugins</h2>
            <p className="section-subtitle">
              Every plugin runs a free, fully functional demo. One licence covers all the
              computers you own — no dongle, no online activation.
            </p>
          </div>

          {!PURCHASING_ENABLED && (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <WipNotice />
            </div>
          )}

          <div className="grid">
            {PRODUCTS.map((plugin) => (
              <div key={plugin.slug} className="plugin-card">
                <img src={plugin.image} alt={plugin.name} className="plugin-image" />

                <div className="card-content">
                  <h3 className="plugin-title">{plugin.name}</h3>
                  <p className="plugin-short-desc">{plugin.tagline}</p>
                  <p className="plugin-description">{plugin.summary}</p>
                  <div className="plugin-price">{plugin.price}</div>

                  <ul className="plugin-features">
                    {plugin.highlights.slice(0, 4).map((h) => (
                      <li key={h.title}>{h.title}</li>
                    ))}
                  </ul>

                  <div className="buy-row" style={{ margin: 0 }}>
                    <Link className="button primary" href={`/plugins/${plugin.slug}`}>
                      Learn More
                    </Link>
                    <Link className="button secondary" href="/trial">
                      Free Demo
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase */}
      {showcase.title && (
        <section className="showcase-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">{showcase.title}</h2>
              {showcase.subtitle && <p className="section-subtitle">{showcase.subtitle}</p>}
            </div>

            <div className="showcase-content">
              {showcase.video ? (
                <div className="video-container">
                  <video controls poster={showcase.poster} className="showcase-video">
                    <source src={showcase.video} type="video/mp4" />
                  </video>
                </div>
              ) : (
                <div className="placeholder-video">
                  <div className="video-icon">🎵</div>
                  {showcase.description && <p>{showcase.description}</p>}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      {features.items && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">{features.title ?? 'Why Choose Us?'}</h2>
              {features.subtitle && <p className="section-subtitle">{features.subtitle}</p>}
            </div>

            <div className="features-grid">
              {features.items.map((feature: any, i: number) => (
                <div key={i} className="feature">
                  {feature.icon && <div className="feature-icon">{feature.icon}</div>}
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
