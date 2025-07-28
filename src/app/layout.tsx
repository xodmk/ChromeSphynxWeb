export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>Chrome Sphynx Audio</title>
        <meta name="description" content="VST3 Plugins for Abstract Sound Design" />
        <style>{`
          body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #000;
            color: #e5e7eb;
            min-height: 100vh;
          }
          .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
          .header { background: linear-gradient(to bottom, #1f2937, #000); padding: 2rem 0; text-align: center; }
          .logo-circle { width: 128px; height: 128px; background: linear-gradient(to bottom right, #6366f1, #8b5cf6); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-size: 2rem; font-weight: bold; }
          .title { font-size: 2.5rem; font-weight: 800; margin: 0; }
          .subtitle { font-size: 1.25rem; font-style: italic; color: #9ca3af; margin: 0.5rem 0 0; }
          .section { padding: 3rem 0; }
          .section-title { font-size: 2rem; font-weight: bold; text-align: center; margin-bottom: 2rem; }
          .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
          .card { background: #1f2937; border-radius: 0.5rem; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); transition: transform 0.2s; }
          .card:hover { transform: scale(1.05); }
          .card-image { height: 192px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold; color: white; }
          .card-image-1 { background: linear-gradient(to right, #3b82f6, #06b6d4); }
          .card-image-2 { background: linear-gradient(to right, #8b5cf6, #ec4899); }
          .card-image-3 { background: linear-gradient(to right, #10b981, #14b8a6); }
          .card-content { padding: 1.5rem; }
          .card-title { font-size: 1.25rem; font-weight: bold; margin: 0 0 0.5rem; }
          .card-description { color: #9ca3af; margin: 0 0 1rem; }
          .button { background: #6366f1; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.25rem; cursor: pointer; transition: background 0.2s; }
          .button:hover { background: #4f46e5; }
          .promo-section { background: #0f172a; padding: 3rem 0; }
          .promo-box { max-width: 768px; margin: 0 auto; background: linear-gradient(to right, #374151, #4b5563); padding: 3rem; border-radius: 0.75rem; text-align: center; }
          .promo-icon { font-size: 4rem; margin-bottom: 1rem; }
          .promo-title { font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem; }
          .promo-description { color: #d1d5db; margin-bottom: 1.5rem; }
          .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; max-width: 1024px; margin: 0 auto; }
          .feature { text-align: center; }
          .feature-icon { font-size: 2.5rem; margin-bottom: 1rem; }
          .feature-title { font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem; }
          .feature-description { color: #9ca3af; }
          .footer { background: linear-gradient(to top, #1f2937, #000); padding: 2rem 0; text-align: center; }
          .footer-text { font-size: 0.875rem; color: #6b7280; margin-bottom: 0.5rem; }
          .footer-nav a { color: #6366f1; text-decoration: none; margin: 0 0.5rem; transition: color 0.2s; }
          .footer-nav a:hover { color: #a5b4fc; }
        `}</style>
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
