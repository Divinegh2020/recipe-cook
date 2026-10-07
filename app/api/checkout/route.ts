export const runtime = 'nodejs';

import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { createAccessToken, hashAccessToken, normalizeEmail } from '@/lib/security';
import { createBachsCheckout } from '@/lib/bachs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const cookbookId = String(body?.cookbook_id || '');
    const email = normalizeEmail(String(body?.email || ''));
    if (!cookbookId || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: 'A valid cookbook and email are required.' }, { status: 400 });

    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!hasSupabase) return NextResponse.json({ error: 'The store database is not configured yet. Add the Supabase environment variables first.' }, { status: 503 });
    if (!process.env.BACHS_API_KEY) return NextResponse.json({ error: 'Bachs payments are not configured yet.' }, { status: 503 });

    const supabase = getSupabaseAdminClient();
    const { data: cookbook, error: cookbookError } = await supabase.from('cookbooks').select('*').eq('id', cookbookId).eq('published', true).maybeSingle();
    if (cookbookError) throw new Error(cookbookError.message);
    const book = cookbook;
    if (!book) return NextResponse.json({ error: 'Cookbook not found.' }, { status: 404 });

    const accessToken = createAccessToken();
    const accessTokenHash = hashAccessToken(accessToken);
    const amountUsd = Number(book.price_usd).toFixed(2);
    const orderId = crypto.randomUUID();
    const reference = `recipe_${orderId.replaceAll('-', '')}`;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

    const { error: orderError } = await supabase.from('orders').insert({
      id: orderId,
      cookbook_id: book.id,
      email,
      amount_usd: amountUsd,
      status: 'pending',
      bachs_reference: reference,
      access_token_hash: accessTokenHash
    });
    if (orderError) throw new Error(orderError.message);

    let checkout;
    try {
      checkout = await createBachsCheckout({
        email,
        title: book.title,
        amountUsd,
        reference,
        orderId,
        successUrl: `${baseUrl}/success?token=${accessToken}`,
        cancelUrl: `${baseUrl}/cookbooks/${book.slug}`
      });
    } catch (error) {
      await supabase.from('orders').update({ status: 'failed' }).eq('id', orderId);
      throw error;
    }

    await supabase.from('orders').update({ bachs_checkout_id: checkout.checkoutId }).eq('id', orderId);
    return NextResponse.json({ checkout_url: checkout.checkoutUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to start checkout.' }, { status: 500 });
  }
}