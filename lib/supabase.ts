import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getSupabaseBrowserClient() {
  if (!url || !anon) throw new Error('Supabase public environment variables are missing.');
  return createBrowserClient(url, anon);
}

export function getSupabaseServerClient() {
  if (!url || !anon) return null;
  return createBrowserClient(url, anon);
}

export function getSupabaseAdminClient() {
  if (!url || !service) throw new Error('Supabase server environment variables are missing.');
  return createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } });
}