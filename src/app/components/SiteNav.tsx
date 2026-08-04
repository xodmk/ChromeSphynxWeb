import Link from 'next/link';

// Paddle's domain review requires Terms, Refund Policy and Privacy Policy to be
// reachable through site navigation — not only from the footer.
export default function SiteNav() {
  return (
    <nav className="site-nav">
      <div className="container nav-inner">
        <Link href="/" className="nav-brand">
          Chrome Sphynx Audio
        </Link>
        <div className="nav-links">
          <Link href="/plugins/block-rotator" className="nav-link">Block Rotator</Link>
          <Link href="/plugins/poltergeist" className="nav-link">Poltergeist</Link>
          <Link href="/trial" className="nav-link">Free Trial</Link>
          <Link href="/account" className="nav-link">My Licenses</Link>
          <Link href="/support" className="nav-link">Support</Link>
        </div>
      </div>
    </nav>
  );
}
