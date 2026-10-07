'use client';

import { useState } from 'react';

export function BuyButton({ cookbookId }: { cookbookId: string }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function startCheckout() {
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError('Enter a valid email address.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cookbook_id: cookbookId, email }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to start checkout.');
      window.location.href = data.checkout_url;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to start checkout.');
      setLoading(false);
    }
  }

  return <div className="checkout-form"><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} /><button className="button button-dark full" onClick={startCheckout} disabled={loading}>{loading ? 'Opening secure checkout…' : 'Buy cookbook · USD'}</button>{error && <p className="form-error">{error}</p>}</div>;
}