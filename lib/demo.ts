import type { Cookbook } from './types';

export const demoCookbooks: Cookbook[] = [
  {
    id: 'demo-1',
    title: 'Everyday Comfort Kitchen',
    slug: 'everyday-comfort-kitchen',
    description: '30 comforting recipes designed for weeknights, relaxed weekends, and the people you love feeding.',
    price_usd: 14.99,
    cover_path: null,
    pdf_path: '',
    published: true,
    created_at: '2026-10-01T00:00:00.000Z'
  },
  {
    id: 'demo-2',
    title: 'Quick Family Dinners',
    slug: 'quick-family-dinners',
    description: 'Fast, practical dinner recipes with simple ingredients and big flavor.',
    price_usd: 12.99,
    cover_path: null,
    pdf_path: '',
    published: true,
    created_at: '2026-10-02T00:00:00.000Z'
  },
  {
    id: 'demo-3',
    title: 'Weekend Baking Notes',
    slug: 'weekend-baking-notes',
    description: 'A warm collection of breads, cakes, cookies, and small treats for slow weekend mornings.',
    price_usd: 16.99,
    cover_path: null,
    pdf_path: '',
    published: true,
    created_at: '2026-10-03T00:00:00.000Z'
  }
];