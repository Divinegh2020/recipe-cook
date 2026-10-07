import Link from 'next/link';
import { CookbookCard } from '@/components/cookbook-card';
import { getPublishedCookbooks } from '@/lib/catalog';

export default async function HomePage() {
  const cookbooks = await getPublishedCookbooks();
  const featured = cookbooks[0];

  return (
    <>
      <section className="hero shell">
        <div className="hero-copy">
          <span className="eyebrow">Digital cookbooks · Instant access</span>
          <h1>Recipes you will actually want to cook.</h1>
          <p>Beautiful, practical cookbooks for everyday food, family tables, weekend baking, and the moments worth sharing.</p>
          <div className="hero-actions">
            <Link className="button button-dark" href="/shop">Shop cookbooks</Link>
            <Link className="text-link" href="#featured">Explore featured →</Link>
          </div>
          <div className="trust-row"><span>✓ PDF download</span><span>✓ Pay in USD</span><span>✓ Secure checkout</span></div>
        </div>
        <div className="hero-card" aria-label="Featured cookbook preview">
          <div className="cover-art cover-art-large"><span>RECIPE<br/>COOK</span><small>Cookbooks worth cooking from.</small></div>
          <div className="hero-card-meta"><div><strong>{featured?.title ?? 'Everyday Comfort Kitchen'}</strong><span>Instant digital download</span></div><b>${Number(featured?.price_usd ?? 14.99).toFixed(2)}</b></div>
        </div>
      </section>

      <section className="feature-strip shell">
        <div><span className="feature-icon">01</span><strong>Made for real kitchens</strong><p>Clear instructions, sensible ingredients, practical recipes.</p></div>
        <div><span className="feature-icon">02</span><strong>Buy once, keep it</strong><p>Your digital cookbook is available after payment.</p></div>
        <div><span className="feature-icon">03</span><strong>Fresh collections</strong><p>New themed books can be added whenever you are ready.</p></div>
      </section>

      <section className="section shell" id="featured">
        <div className="section-heading"><div><span className="eyebrow">The collection</span><h2>Cookbooks for every kind of day.</h2></div><Link className="text-link" href="/shop">View all →</Link></div>
        <div className="card-grid">{cookbooks.slice(0, 3).map((book) => <CookbookCard key={book.id} cookbook={book} />)}</div>
      </section>

      <section className="story-band">
        <div className="shell story-inner"><div><span className="eyebrow">A better digital cookbook</span><h2>Less searching. More cooking.</h2></div><p>Every book is built around recipes that earn their place in your kitchen—approachable enough for Tuesday night, special enough for Saturday.</p></div>
      </section>
    </>
  );
}