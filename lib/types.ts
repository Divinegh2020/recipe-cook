export type Cookbook = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price_usd: number | string;
  cover_path: string | null;
  pdf_path: string;
  published: boolean;
  created_at: string;
};

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'underpaid' | 'expired' | 'refunded';