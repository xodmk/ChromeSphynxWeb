
import content from '../content/content.json';

export default function Home() {
  // Safe defaults so missing sections don’t crash prerender
  const {
    header = {},
    hero = {},
    plugins = {},
    showcase = {},
    features = {},
    testimonials = null,
    footer = {},
    site = {}
  } = content as any;

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

      {/* Plugins Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{plugins.title ?? 'Available Plugins'}</h2>
            {plugins.subtitle && <p className="section-subtitle">{plugins.subtitle}</p>}
          </div>

          <div className="grid">
            {(plugins.items ?? []).map((plugin: any, i: number) => (
              <div key={plugin?.id ?? i} className="plugin-card">
                {plugin?.image ? (
                  <img src={plugin.image} alt={plugin?.name ?? 'Plugin'} className="plugin-image" />
                ) : (
                  <div className={`card-image ${plugin?.gradient ?? ''}`}>
                    <span>Plugin Image</span>
                  </div>
                )}

                <div className="card-content">
                  <h3 className="plugin-title">{plugin?.name ?? plugin?.title ?? 'Untitled'}</h3>
                  {plugin?.shortDescription && <p className="plugin-short-desc">{plugin.shortDescription}</p>}
                  {plugin?.description && <p className="plugin-description">{plugin.description}</p>}

                  {plugin?.price && <div className="plugin-price">{plugin.price}</div>}

                  {(plugin?.features ?? []).length > 0 && (
                    <ul className="plugin-features">
                      {plugin.features.map((feature: string, index: number) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  )}

                  {plugin?.demoAudio && (
                    <audio controls className="demo-audio">
                      <source src={plugin.demoAudio} type="audio/mpeg" />
                      Your browser does not support audio playback.
                    </audio>
                  )}

                  <button className="button primary">Learn More</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="showcase-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{showcase.title ?? 'Experience the Sound'}</h2>
            {showcase.subtitle && <p className="section-subtitle">{showcase.subtitle}</p>}
          </div>

          <div className="showcase-content">
            {showcase.video ? (
              <div className="video-container">
                <video controls poster={showcase.poster} className="showcase-video">
                  <source src={showcase.video} type="video/mp4" />
                  Your browser does not support video playback.
                </video>
              </div>
            ) : (
              <div className="placeholder-video">
                <div className="video-icon">🎵</div>
                {showcase.subtitle && <h3>{showcase.subtitle}</h3>}
                {showcase.description && <p>{showcase.description}</p>}
                {showcase.buttonText && <button className="button secondary">{showcase.buttonText}</button>}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{features.title ?? 'Why Choose Us?'}</h2>
            {features.subtitle && <p className="section-subtitle">{features.subtitle}</p>}
          </div>

          <div className="features-grid">
            {(features.items ?? []).map((feature: any, index: number) => (
              <div key={index} className="feature-item">
                {feature?.icon && <div className="feature-icon">{feature.icon}</div>}
                <h3 className="feature-title">{feature?.title ?? ''}</h3>
                <p className="feature-description">{feature?.description ?? ''}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section (optional) */}
      {testimonials?.items?.length ? (
        <section className="testimonials-section">
          <div className="container">
            <h2 className="section-title">{testimonials.title}</h2>

            <div className="testimonials-grid">
              {testimonials.items.map((testimonial: any, index: number) => (
                <div key={index} className="testimonial">
                  {testimonial?.quote && (
                    <blockquote className="testimonial-quote">"{testimonial.quote}"</blockquote>
                  )}
                  <div className="testimonial-author">
                    {testimonial?.author && <strong>{testimonial.author}</strong>}
                    {testimonial?.title && <span className="testimonial-title">{testimonial.title}</span>}
                    {testimonial?.company && (
                      <span className="testimonial-company">{testimonial.company}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            {footer.tagline && <p className="footer-tagline">{footer.tagline}</p>}
            {footer.copyright && <p className="footer-copyright">{footer.copyright}</p>}

            <nav className="footer-nav">
              {(footer.links ?? []).map((link: any, index: number) => (
                <a key={index} href={link.href} className="footer-link">
                  {link.text}
                </a>
              ))}
            </nav>

            {(footer.social ?? []).length > 0 && (
              <div className="social-links">
                {footer.social.map((social: any, index: number) => (
                  <a
                    key={index}
                    href={social.url}
                    className="social-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {social.platform}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </footer>
    </main>
  );
}
