import { CookbookCard } from '@/components/cookbook-card';
import { getPublishedCookbooks } from '@/lib/catalog';

export default async function ShopPage() {
  const cookbooks = await getPublishedCookbooks();
  return <section className="section shell shop-page"><div className="section-heading stacked"><div><span className="eyebrow">Shop</span><h1>Choose your next cookbook.</h1><p>Instant digital cookbooks. USD pricing. Secure checkout.</p></div></div><div className="card-grid">{cookbooks.map((book) => <CookbookCard key={book.id} cookbook={book} />)}</div></section>;
}