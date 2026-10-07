import { demoCookbooks } from './demo';
import { getSupabaseAdminClient } from './supabase';
import type { Cookbook } from './types';

export async function getPublishedCookbooks(): Promise<Cookbook[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return demoCookbooks;
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from('cookbooks').select('*').eq('published', true).order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Cookbook[];
}

export async function getCookbookBySlug(slug: string): Promise<Cookbook | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return demoCookbooks.find((item) => item.slug === slug) ?? null;
  }
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from('cookbooks').select('*').eq('slug', slug).eq('published', true).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as Cookbook | null) ?? null;
}

export function getPublicCoverUrl(cookbook: Cookbook) {
  if (!cookbook.cover_path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/covers/${cookbook.cover_path}`;
}