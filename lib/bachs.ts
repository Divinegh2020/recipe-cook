import crypto from 'node:crypto';

const DEFAULT_BASE_URL = process.env.BACHS_API_BASE_URL || 'https://sandbox-api.bachs.io';

export async function createBachsCheckout(params: {
  email: string;
  title: string;
  amountUsd: string;
  reference: string;
  orderId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const apiKey = process.env.BACHS_API_KEY;
  if (!apiKey) throw new Error('BACHS_API_KEY is not configured.');

  const response = await fetch(`${DEFAULT_BASE_URL}/v1/checkout-sessions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': params.reference
    },
    body: JSON.stringify({
      pricing: { currency: 'USD', amount: params.amountUsd },
      customer: { email: params.email },
      reference: params.reference,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: { order_id: params.orderId, cookbook_title: params.title },
      expires_in_minutes: 60
    }),
    cache: 'no-store'
  });

  const raw = await response.text();
  let payload: any = null;
  try {
    payload = JSON.parse(raw);
  } catch {
    payload = { raw };
  }

  if (!response.ok) {
    const detail = payload?.message || payload?.error?.message || raw || `HTTP ${response.status}`;
    throw new Error(`Bachs checkout failed: ${detail}`);
  }

  const checkoutUrl = payload?.checkout_url ?? payload?.url ?? payload?.data?.checkout_url ?? payload?.data?.url;
  const checkoutId = payload?.checkout_id ?? payload?.id ?? payload?.data?.checkout_id ?? payload?.data?.id;
  if (!checkoutUrl || !checkoutId) throw new Error('Bachs response did not include a checkout URL and checkout ID.');
  return { checkoutUrl, checkoutId };
}

export function verifyBachsWebhook(rawBody: string, timestamp: string, signature: string, secret: string, toleranceSeconds = 300) {
  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  if (Math.abs(Date.now() / 1000 - ts) > toleranceSeconds) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
  return safeEqual(expected, signature);
}

function safeEqual(a: string, b: string) {
  const aa = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}