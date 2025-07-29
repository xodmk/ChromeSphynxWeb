export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>Chrome Sphynx Audio</title>
        <meta name="description" content="Professional VST3 Plugins for Abstract Sound Design" />
        <style>{`
          /* Reset and base styles */
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #000;
            color: #e5e7eb;
            line-height: 1.6;
            min-height: 100vh;
          }

          /* Container */
          .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 0 2rem; 
          }

          /* Clean Header */
          .clean-header {
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%);
            padding: 4rem 0;
            text-align: center;
            border-bottom: 1px solid #333;
          }

          .main-title {
            font-size: 3.5rem;
            font-weight: 300;
            letter-spacing: 0.05em;
            margin-bottom: 2rem;
            background: linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .logo-container {
            margin: 2rem 0;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .main-logo {
            max-width: min(80vw, 600px);
            max-height: min(60vh, 400px);
            width: auto;
            height: auto;
            object-fit: contain;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
            transition: transform 0.3s ease;
          }

          .main-logo:hover {
            transform: scale(1.02);
          }

          .hero-subtitle {
            font-size: 1.5rem;
            font-weight: 400;
            color: #9ca3af;
            margin: 2rem 0 1rem;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
          }

          .hero-description {
            font-size: 1.1rem;
            color: #6b7280;
            max-width: 700px;
            margin: 0 auto;
            line-height: 1.7;
          }

          /* Section styles */
          .section { 
            padding: 4rem 0; 
          }

          .section-header {
            text-align: center;
            margin-bottom: 3rem;
          }

          .section-title { 
            font-size: 2.5rem; 
            font-weight: 600; 
            margin-bottom: 1rem;
            color: #ffffff;
          }

          .section-subtitle {
            font-size: 1.2rem;
            color: #9ca3af;
            max-width: 600px;
            margin: 0 auto;
          }

          /* Grid layouts */
          .grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); 
            gap: 2rem; 
          }

          .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            max-width: 1000px;
            margin: 0 auto;
          }

          /* Plugin cards */
          .plugin-card { 
            background: linear-gradient(145deg, #1f2937 0%, #111827 100%);
            border-radius: 1rem; 
            overflow: hidden; 
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: 1px solid #374151;
          }

          .plugin-card:hover { 
            transform: translateY(-5px); 
            box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
          }

          .plugin-image {
            width: 100%;
            height: 250px;
            object-fit: cover;
          }

          .card-image { 
            height: 250px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            font-size: 1.5rem; 
            font-weight: bold; 
            color: white; 
          }

          .card-image-1 { background: linear-gradient(135deg, #3b82f6, #06b6d4); }
          .card-image-2 { background: linear-gradient(135deg, #8b5cf6, #ec4899); }
          .card-image-3 { background: linear-gradient(135deg, #10b981, #14b8a6); }

          .card-content { 
            padding: 2rem; 
          }

          .plugin-title { 
            font-size: 1.5rem; 
            font-weight: 700; 
            margin-bottom: 0.5rem;
            color: #ffffff;
          }

          .plugin-short-desc {
            font-size: 1rem;
            color: #a1a1aa;
            font-weight: 500;
            margin-bottom: 1rem;
          }

          .plugin-description { 
            color: #9ca3af; 
            margin-bottom: 1.5rem;
            line-height: 1.6;
          }

          .plugin-price {
            font-size: 1.3rem;
            font-weight: 700;
            color: #10b981;
            margin-bottom: 1rem;
          }

          .plugin-features {
            list-style: none;
            margin-bottom: 1.5rem;
          }

          .plugin-features li {
            padding: 0.3rem 0;
            color: #d1d5db;
            position: relative;
            padding-left: 1.5rem;
          }

          .plugin-features li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #10b981;
            font-weight: bold;
          }

          .demo-audio {
            width: 100%;
            margin-bottom: 1.5rem;
            border-radius: 0.5rem;
          }

          /* Buttons */
          .button { 
            background: #6366f1; 
            color: white; 
            padding: 0.75rem 1.5rem; 
            border: none; 
            border-radius: 0.5rem; 
            cursor: pointer; 
            transition: all 0.2s ease;
            font-size: 1rem;
            font-weight: 600;
            text-decoration: none;
            display: inline-block;
          }

          .button:hover { 
            background: #4f46e5; 
            transform: translateY(-1px);
          }

          .button.primary {
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
          }

          .button.secondary {
            background: linear-gradient(135deg, #374151, #4b5563);
          }

          /* Showcase section */
          .showcase-section { 
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            padding: 4rem 0; 
          }

          .showcase-content {
            text-align: center;
          }

          .video-container {
            max-width: 800px;
            margin: 0 auto;
          }

          .showcase-video {
            width: 100%;
            border-radius: 1rem;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          }

          .placeholder-video {
            max-width: 600px;
            margin: 0 auto;
            padding: 3rem;
            background: linear-gradient(135deg, #374151, #4b5563);
            border-radius: 1rem;
            text-align: center;
          }

          .video-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
          }

          /* Features */
          .feature-item { 
            text-align: center;
            padding: 2rem;
            background: linear-gradient(145deg, #1f2937 0%, #111827 100%);
            border-radius: 1rem;
            border: 1px solid #374151;
            transition: transform 0.3s ease;
          }

          .feature-item:hover {
            transform: translateY(-3px);
          }

          .feature-icon { 
            font-size: 3rem; 
            margin-bottom: 1rem; 
          }

          .feature-title { 
            font-size: 1.3rem; 
            font-weight: 700; 
            margin-bottom: 1rem;
            color: #ffffff;
          }

          .feature-description { 
            color: #9ca3af;
            line-height: 1.6;
          }

          /* Testimonials */
          .testimonials-section {
            background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
            padding: 4rem 0;
          }

          .testimonials-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 2rem;
            max-width: 1000px;
            margin: 0 auto;
          }

          .testimonial {
            background: rgba(255, 255, 255, 0.05);
            padding: 2rem;
            border-radius: 1rem;
            border: 1px solid #374151;
          }

          .testimonial-quote {
            font-size: 1.2rem;
            font-style: italic;
            margin-bottom: 1.5rem;
            color: #e5e7eb;
            line-height: 1.6;
          }

          .testimonial-author {
            display: flex;
            flex-direction: column;
            gap: 0.2rem;
          }

          .testimonial-author strong {
            color: #ffffff;
            font-size: 1.1rem;
          }

          .testimonial-title {
            color: #a1a1aa;
            font-size: 0.9rem;
          }

          .testimonial-company {
            color: #6b7280;
            font-size: 0.9rem;
          }

          /* Footer */
          .footer { 
            background: linear-gradient(135deg, #111827 0%, #000000 100%);
            padding: 3rem 0; 
            text-align: center; 
            border-top: 1px solid #374151;
          }

          .footer-content {
            max-width: 800px;
            margin: 0 auto;
          }

          .footer-tagline {
            font-size: 1.2rem;
            color: #9ca3af;
            margin-bottom: 1rem;
            font-style: italic;
          }

          .footer-copyright {
            font-size: 0.9rem; 
            color: #6b7280; 
            margin-bottom: 1.5rem; 
          }

          .footer-nav {
            margin-bottom: 2rem;
          }

          .footer-link { 
            color: #6366f1; 
            text-decoration: none; 
            margin: 0 1rem; 
            transition: color 0.2s ease;
            font-size: 0.9rem;
          }

          .footer-link:hover { 
            color: #a5b4fc; 
          }

          .social-links {
            display: flex;
            justify-content: center;
            gap: 1rem;
          }

          .social-link {
            color: #9ca3af;
            text-decoration: none;
            transition: color 0.2s ease;
            font-size: 0.9rem;
          }

          .social-link:hover {
            color: #ffffff;
          }

          /* Responsive design */
          @media (max-width: 768px) {
            .main-title { font-size: 2.5rem; }
            .main-logo { 
              max-width: min(90vw, 400px);
              max-height: min(50vh, 300px);
            }
            .container { padding: 0 1rem; }
            .grid { grid-template-columns: 1fr; }
            .features-grid { grid-template-columns: 1fr; }
            .testimonials-grid { grid-template-columns: 1fr; }
          }
        `}</style>
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
