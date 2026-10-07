export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { verifyBachsWebhook } from '@/lib/bachs';

export async function POST(request: Request) {
  const secret = process.env.BACHS_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: 'Webhook secret is not configured.' }, { status: 503 });

  const rawBody = await request.text();
  const timestamp = request.headers.get('X-Bachs-Timestamp') || '';
  const signature = request.headers.get('X-Bachs-Signature') || '';
  if (!verifyBachsWebhook(rawBody, timestamp, signature, secret)) return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });

  try {
    const event = JSON.parse(rawBody);
    const supabase = getSupabaseAdminClient();
    const type = event?.type;
    const eventId = String(event?.id || '');
    const data = event?.data || {};
    const metadata = data?.metadata || data?.meta || {};
    const reference = data?.reference || data?.payment?.reference || null;
    const orderId = metadata?.order_id || data?.metadata?.order_id || null;
    if (!eventId) return NextResponse.json({ error: 'Missing event id.' }, { status: 400 });

    const { data: duplicate } = await supabase.from('orders').select('id').eq('bachs_event_id', eventId).maybeSingle();
    if (duplicate) return NextResponse.json({ received: true, duplicate: true });

    const lookup = orderId ? supabase.from('orders').select('*').eq('id', orderId).maybeSingle() : supabase.from('orders').select('*').eq('bachs_reference', reference).maybeSingle();
    const { data: order, error: orderError } = await lookup;
    if (orderError) throw new Error(orderError.message);
    if (!order) return NextResponse.json({ received: true, ignored: true });

    if (type === 'collection.succeeded') {
      const { error } = await supabase.from('orders').update({ status: 'paid', bachs_event_id: eventId, paid_at: new Date().toISOString() }).eq('id', order.id);
      if (error) throw new Error(error.message);
    } else if (type === 'collection.failed') {
      const { error } = await supabase.from('orders').update({ status: 'failed', bachs_event_id: eventId }).eq('id', order.id);
      if (error) throw new Error(error.message);
    } else if (type === 'collection.underpaid') {
      const { error } = await supabase.from('orders').update({ status: 'underpaid', bachs_event_id: eventId }).eq('id', order.id);
      if (error) throw new Error(error.message);
    } else if (type === 'checkout.expired') {
      const { error } = await supabase.from('orders').update({ status: 'expired', bachs_event_id: eventId }).eq('id', order.id);
      if (error) throw new Error(error.message);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 });
  }
}