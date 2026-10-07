export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { hashAccessToken } from '@/lib/security';

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token') || '';
  if (!token) return NextResponse.json({ error: 'Missing token.' }, { status: 400 });
  const expected = hashAccessToken(token);
  const supabase = getSupabaseAdminClient();
  const { data: order, error } = await supabase.from('orders').select('*, cookbooks(*)').eq('access_token_hash', expected).maybeSingle();
  if (error) return NextResponse.json({ error: 'Unable to check order.' }, { status: 500 });
  if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

  let downloadUrl: string | null = null;
  if (order.status === 'paid' && order.cookbooks?.pdf_path) {
    const { data } = await supabase.storage.from('cookbooks').createSignedUrl(order.cookbooks.pdf_path, 3600);
    downloadUrl = data?.signedUrl ?? null;
  }

  return NextResponse.json({ status: order.status, title: order.cookbooks?.title ?? 'your cookbook', download_url: downloadUrl });
}