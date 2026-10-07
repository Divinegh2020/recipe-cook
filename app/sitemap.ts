import type { MetadataRoute } from 'next';
import { getPublishedCookbooks } from '@/lib/catalog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const cookbooks = await getPublishedCookbooks();

  return [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/shop`, changeFrequency: 'weekly', priority: 0.9 },
    ...cookbooks.map((book) => ({
      url: `${base}/cookbooks/${book.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8
    }))
  ];
}