import Link from 'next/link';
import type { Cookbook } from '@/lib/types';
import { getPublicCoverUrl } from '@/lib/catalog';

export function CookbookCard({ cookbook }: { cookbook: Cookbook }) {
  const cover = getPublicCoverUrl(cookbook);
  return <article className="cookbook-card"><Link href={`/cookbooks/${cookbook.slug}`} className="card-cover">{cover ? <img src={cover} alt="" /> : <div className="cover-art"><span>RECIPE<br/>COOK</span><small>Digital cookbook</small></div>}</Link><div className="card-body"><div><span className="card-kicker">Cookbook</span><h3>{cookbook.title}</h3><p>{cookbook.description}</p></div><div className="card-foot"><strong>${Number(cookbook.price_usd).toFixed(2)}</strong><Link className="text-link" href={`/cookbooks/${cookbook.slug}`}>View book →</Link></div></div></article>;
}