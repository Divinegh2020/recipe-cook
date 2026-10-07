import { notFound } from 'next/navigation';
import { getCookbookBySlug, getPublicCoverUrl } from '@/lib/catalog';
import { BuyButton } from '@/components/buy-button';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cookbook = await getCookbookBySlug(slug);
  if (!cookbook) return {};
  return { title: `${cookbook.title} — Recipe Cook`, description: cookbook.description };
}

export default async function CookbookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cookbook = await getCookbookBySlug(slug);
  if (!cookbook) notFound();
  const cover = getPublicCoverUrl(cookbook);
  const price = Number(cookbook.price_usd);

  return <section className="product-page shell"><div className="product-visual">{cover ? <img src={cover} alt="" /> : <div className="cover-art"><span>RECIPE<br/>COOK</span><small>Digital cookbook</small></div>}</div><div className="product-copy"><span className="eyebrow">Digital cookbook</span><h1>{cookbook.title}</h1><p className="product-description">{cookbook.description}</p><div className="price">${price.toFixed(2)} <span>USD</span></div><div className="buy-panel"><p>Your email is used to create your order and give you access to your download after successful payment.</p><BuyButton cookbookId={cookbook.id} /></div><div className="mini-notes"><span>PDF format</span><span>Instant access</span><span>Secure Bachs checkout</span></div></div></section>;
}