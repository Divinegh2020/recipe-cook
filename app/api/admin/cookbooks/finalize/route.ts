export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { isAdminEmail } from '@/lib/admin';

async function requireAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return false;
  const cookieStore = await cookies();
  const client = createServerClient(url, anon, { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } });
  const { data: { user } } = await client.auth.getUser();
  return isAdminEmail(user?.email);
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  try {
    const body = await request.json();
    const title = String(body?.title || '').trim();
    const slug = String(body?.slug || '').trim().toLowerCase();
    const description = String(body?.description || '').trim();
    const price = Number(body?.price);
    const pdfPath = String(body?.pdf_path || '').trim();
    const coverPath = body?.cover_path ? String(body.cover_path).trim() : null;
    if (!title || !slug || !description || !Number.isFinite(price) || price <= 0 || !pdfPath) return NextResponse.json({ error: 'Incomplete cookbook details.' }, { status: 400 });
    if (!pdfPath.startsWith(`${slug}/`) || (coverPath && !coverPath.startsWith(`${slug}/`))) return NextResponse.json({ error: 'Invalid storage path.' }, { status: 400 });

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from('cookbooks').insert({ title, slug, description, price_usd: price.toFixed(2), cover_path: coverPath, pdf_path: pdfPath, published: true });
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to save cookbook.' }, { status: 500 });
  }
}