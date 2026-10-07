'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function SuccessPage() {
  const [status, setStatus] = useState<'loading'|'pending'|'paid'|'failed'|'missing'>('loading');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) { setStatus('missing'); return; }
    let attempts = 0;
    const check = async () => {
      attempts += 1;
      const res = await fetch(`/api/orders/status?token=${encodeURIComponent(token)}`, { cache: 'no-store' });
      if (!res.ok) { setStatus('missing'); return; }
      const data = await res.json();
      setTitle(data.title ?? 'your cookbook');
      if (data.status === 'paid') { setDownloadUrl(data.download_url); setStatus('paid'); return; }
      if (data.status === 'failed' || data.status === 'expired') { setStatus('failed'); return; }
      setStatus('pending');
      if (attempts < 8) setTimeout(check, 2500);
    };
    check();
  }, []);

  return <section className="success-page shell"><div className="success-card"><span className="eyebrow">Order</span>{status === 'loading' && <><h1>Confirming your payment…</h1><p>We are checking the payment status.</p></>}{status === 'pending' && <><h1>Payment received for processing.</h1><p>Your checkout is still being confirmed. This page will update automatically.</p></>}{status === 'paid' && <><h1>Your cookbook is ready.</h1><p><strong>{title}</strong> is unlocked. Your download link is temporary for security.</p><a className="button button-dark" href={downloadUrl ?? '#'}>Download cookbook</a></>}{status === 'failed' && <><h1>Payment was not completed.</h1><p>Your order is not marked as paid. You can return to the shop and try again.</p><Link className="button button-dark" href="/shop">Back to shop</Link></>}{status === 'missing' && <><h1>We could not find that order.</h1><p>Open the original payment confirmation link again or return to the shop.</p><Link className="button button-dark" href="/shop">Back to shop</Link></>}</div></section>;
}