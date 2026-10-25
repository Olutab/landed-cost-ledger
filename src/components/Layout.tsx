import { Link } from 'react-router-dom';

function LogoMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="1" y="1" width="22" height="22" rx="6" fill="#1D4ED8" />
      <path d="M6 9h12M6 13h12M6 17h8" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="topbar">
        <div className="wrap topbar-inner">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', color: 'inherit' }}>
            <LogoMark />
            <span className="brand">Landed Cost Ledger</span>
          </Link>
          <nav className="nav-links">
            <Link to="/">Calculator</Link>
            <a href="/scenarios/">Scenarios</a>
            <Link to="/method">Method</Link>
            <Link to="/about">About</Link>
            <Link to="/faq">FAQ</Link>
          </nav>
          <span className="asof">Data as of 21 Oct 2026</span>
        </div>
      </header>

      <main>{children}</main>

      <footer className="footer">
        <div className="wrap">
          <nav className="footer-nav">
            <Link to="/about">About Us</Link>
            <Link to="/method">Method & Expert Advice</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/contact">Contact</Link>
          </nav>
          <p className="footer-small">© 2026 Landed Cost Ledger · Static, client-side tool · No cookies, no tracking, no uploads.</p>
        </div>
      </footer>
    </>
  );
}