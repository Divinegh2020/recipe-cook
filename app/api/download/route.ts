export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { hashAccessToken } from '@/lib/security';

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token') || '';
  if (!token) return NextResponse.json({ error: 'Missing token.' }, { status: 400 });
  const expected = hashAccessToken(token);
  const supabase = getSupabaseAdminClient();
  const { data: order, error } = await supabase.from('orders').select('*, cookbooks(*)').eq('status', 'paid').eq('access_token_hash', expected).maybeSingle();
  if (error) return NextResponse.json({ error: 'Unable to create download.' }, { status: 500 });
  if (!order?.cookbooks?.pdf_path) return NextResponse.json({ error: 'Download unavailable.' }, { status: 404 });
  const { data, error: signedError } = await supabase.storage.from('cookbooks').createSignedUrl(order.cookbooks.pdf_path, 900);
  if (signedError || !data?.signedUrl) return NextResponse.json({ error: 'Unable to create download link.' }, { status: 500 });
  return NextResponse.redirect(data.signedUrl);
}