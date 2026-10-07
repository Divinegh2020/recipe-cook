import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { isAdminEmail } from '@/lib/admin';

async function getAdminUser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  const cookieStore = await cookies();
  const client = createServerClient(url, anon, { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } });
  const { data: { user } } = await client.auth.getUser();
  return user;
}

export default async function AdminPage() {
  const user = await getAdminUser();
  if (!user || !isAdminEmail(user.email)) redirect('/admin/login');
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase.from('cookbooks').select('*').order('created_at', { ascending: false });
  return <section className="section shell admin-page"><div className="admin-top"><div><span className="eyebrow">Store admin</span><h1>Your cookbooks</h1><p>{data?.length ?? 0} books in the catalog.</p></div><Link className="button button-dark" href="/admin/upload">Upload cookbook</Link></div><div className="admin-list">{(data ?? []).map((book: any) => <div className="admin-row" key={book.id}><div><strong>{book.title}</strong><span>/{book.slug} · ${Number(book.price_usd).toFixed(2)} · {book.published ? 'Published' : 'Draft'}</span></div><Link className="text-link" href={`/cookbooks/${book.slug}`}>View →</Link></div>)}{!data?.length && <div className="empty-state">No cookbooks yet. Upload your first book.</div>}</div></section>;
}