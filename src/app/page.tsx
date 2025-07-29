import content from '../content/content.json';

export default function Home() {
  const { header, hero, plugins, showcase, features, testimonials, footer } = content;

  return (
    <main>
      {/* Clean Header with Logo */}
      <header className="clean-header">
        <div className="container">
          <h1 className="main-title">{header.title}</h1>
          
          <div className="logo-container">
            <img
              src={header.logo}
              alt={header.logoAlt}
              className="main-logo"
            />
          </div>
          
          <p className="hero-subtitle">{hero.subtitle}</p>
          <p className="hero-description">{hero.description}</p>
        </div>
      </header>

      {/* Plugins Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{plugins.title}</h2>
            <p className="section-subtitle">{plugins.subtitle}</p>
          </div>

          <div className="grid">
            {plugins.items.map((plugin) => (
              <div key={plugin.id} className="plugin-card">
                {plugin.image ? (
                  <img
                    src={plugin.image}
                    alt={plugin.name}
                    className="plugin-image"
                  />
                ) : (
                  <div className={`card-image ${plugin.gradient}`}>
                    <span>Plugin Image</span>
                  </div>
                )}
                
                <div className="card-content">
                  <h3 className="plugin-title">{plugin.name}</h3>
                  <p className="plugin-short-desc">{plugin.shortDescription}</p>
                  <p className="plugin-description">{plugin.description}</p>
                  
                  {plugin.price && (
                    <div className="plugin-price">{plugin.price}</div>
                  )}

                  {plugin.features && (
                    <ul className="plugin-features">
                      {plugin.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  )}

                  {plugin.demoAudio && (
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
            <h2 className="section-title">{showcase.title}</h2>
            <p className="section-subtitle">{showcase.subtitle}</p>
          </div>
          
          <div className="showcase-content">
            {showcase.video ? (
              <div className="video-container">
                <video
                  controls
                  poster={showcase.poster}
                  className="showcase-video"
                >
                  <source src={showcase.video} type="video/mp4" />
                  Your browser does not support video playback.
                </video>
              </div>
            ) : (
              <div className="placeholder-video">
                <div className="video-icon">🎵</div>
                <h3>{showcase.subtitle}</h3>
                <p>{showcase.description}</p>
                <button className="button secondary">{showcase.buttonText}</button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">{features.title}</h2>
            <p className="section-subtitle">{features.subtitle}</p>
          </div>
          
          <div className="features-grid">
            {features.items.map((feature, index) => (
              <div key={index} className="feature-item">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <h2 className="section-title">{testimonials.title}</h2>
          
          <div className="testimonials-grid">
            {testimonials.items.map((testimonial, index) => (
              <div key={index} className="testimonial">
                <blockquote className="testimonial-quote">
                  "{testimonial.quote}"
                </blockquote>
                <div className="testimonial-author">
                  <strong>{testimonial.author}</strong>
                  <span className="testimonial-title">{testimonial.title}</span>
                  <span className="testimonial-company">{testimonial.company}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <p className="footer-tagline">{footer.tagline}</p>
            <p className="footer-copyright">{footer.copyright}</p>
            
            <nav className="footer-nav">
              {footer.links.map((link, index) => (
                <a key={index} href={link.href} className="footer-link">
                  {link.text}
                </a>
              ))}
            </nav>

            {footer.social && (
              <div className="social-links">
                {footer.social.map((social, index) => (
                  <a key={index} href={social.url} className="social-link" target="_blank" rel="noopener noreferrer">
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
