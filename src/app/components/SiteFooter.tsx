import Link from 'next/link';
import { SUPPORT_EMAIL } from '../../lib/site';

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <p className="footer-tagline">Pushing the boundaries of digital audio</p>
        <nav className="footer-nav">
          <Link href="/legal/terms" className="footer-link">Terms &amp; Conditions</Link>
          <Link href="/legal/refunds" className="footer-link">Refund Policy</Link>
          <Link href="/legal/privacy" className="footer-link">Privacy Policy</Link>
          <Link href="/legal/eula" className="footer-link">EULA</Link>
          <Link href="/support" className="footer-link">Support</Link>
        </nav>
        <p className="footer-copyright">
          © {new Date().getFullYear()} Chrome Sphynx Audio · <a className="footer-link" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
        </p>
      </div>
    </footer>
  );
}
