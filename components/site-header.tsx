import Link from 'next/link';

export function SiteHeader() {
  return <header className="site-header"><div className="shell nav"><Link href="/" className="brand"><span className="brand-mark">RC</span><span>Recipe Cook</span></Link><nav><Link href="/shop">Shop</Link><Link href="/#featured">Featured</Link></nav><Link href="/shop" className="nav-cta">Browse cookbooks</Link></div></header>;
}