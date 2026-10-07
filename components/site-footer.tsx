import Link from 'next/link';

export function SiteFooter() {
  return <footer className="site-footer"><div className="shell footer-grid"><div><div className="brand footer-brand"><span className="brand-mark">RC</span><span>Recipe Cook</span></div><p>Cookbooks worth cooking from.</p></div><div className="footer-links"><Link href="/shop">Shop</Link><Link href="/admin/login">Admin</Link><a href="mailto:hello@example.com">Contact</a></div></div><div className="shell footer-bottom"><span>© {new Date().getFullYear()} Recipe Cook</span><span>Secure payments by Bachs</span></div></footer>;
}