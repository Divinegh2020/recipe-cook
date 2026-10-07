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
    const pdfName = String(body?.pdf_name || '').trim();
    const coverName = String(body?.cover_name || '').trim();
    if (!title || !slug || !pdfName) return NextResponse.json({ error: 'Title, slug and PDF filename are required.' }, { status: 400 });
    if (!/^[a-z0-9-]+$/.test(slug)) return NextResponse.json({ error: 'Slug may contain only lowercase letters, numbers and hyphens.' }, { status: 400 });
    if (!pdfName.toLowerCase().endsWith('.pdf')) return NextResponse.json({ error: 'Cookbook must be a PDF.' }, { status: 400 });
    if (coverName && !/\.(jpg|jpeg|png|webp)$/i.test(coverName)) return NextResponse.json({ error: 'Cover must be JPG, PNG or WebP.' }, { status: 400 });

    const supabase = getSupabaseAdminClient();
    const stamp = Date.now();
    const pdfPath = `${slug}/${stamp}-${pdfName.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
    const { data: pdfUpload, error: pdfError } = await supabase.storage.from('cookbooks').createSignedUploadUrl(pdfPath);
    if (pdfError || !pdfUpload) throw new Error(pdfError?.message || 'Unable to create PDF upload URL.');

    let coverUpload: { path: string; token: string } | null = null;
    if (coverName) {
      const coverPath = `${slug}/${stamp}-${coverName.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
      const { data, error } = await supabase.storage.from('covers').createSignedUploadUrl(coverPath);
      if (error || !data) throw new Error(error?.message || 'Unable to create cover upload URL.');
      coverUpload = { path: data.path, token: data.token };
    }

    return NextResponse.json({ pdf: { path: pdfUpload.path, token: pdfUpload.token }, cover: coverUpload });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to prepare upload.' }, { status: 500 });
  }
}