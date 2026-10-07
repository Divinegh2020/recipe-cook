'use client';

import { type FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase';

export default function AdminUploadPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', slug: '', description: '', price: '' });
  const [pdf, setPdf] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setError('');
    if (!pdf) { setError('Choose the cookbook PDF.'); return; }
    setLoading(true);
    try {
      const prep = await fetch('/api/admin/cookbooks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: form.title, slug: form.slug, pdf_name: pdf.name, cover_name: cover?.name || '' }) });
      const prepBody = await prep.json();
      if (!prep.ok) throw new Error(prepBody.error || 'Could not prepare upload.');

      const supabase = getSupabaseBrowserClient();
      const { error: pdfError } = await supabase.storage.from('cookbooks').uploadToSignedUrl(prepBody.pdf.path, prepBody.pdf.token, pdf);
      if (pdfError) throw pdfError;

      let coverPath: string | null = null;
      if (cover && prepBody.cover) {
        const { error: coverError } = await supabase.storage.from('covers').uploadToSignedUrl(prepBody.cover.path, prepBody.cover.token, cover);
        if (coverError) throw coverError;
        coverPath = prepBody.cover.path;
      }

      const finalize = await fetch('/api/admin/cookbooks/finalize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: form.title, slug: form.slug, description: form.description, price: form.price, pdf_path: prepBody.pdf.path, cover_path: coverPath }) });
      const body = await finalize.json();
      if (!finalize.ok) throw new Error(body.error || 'Could not save cookbook.');
      router.push('/admin'); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'Upload failed.'); }
    finally { setLoading(false); }
  }

  return <section className="auth-page shell"><form className="auth-card wide" onSubmit={submit}><span className="eyebrow">New cookbook</span><h1>Upload a cookbook.</h1><p>Large files go directly to Supabase Storage; the Vercel function only prepares the secure upload.</p><label>Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label><label>Slug<input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} placeholder="easy-family-dinners" /></label><label>Description<textarea required rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label><label>Price (USD)<input required type="number" min="0.50" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label><label>Cookbook PDF<input required type="file" accept="application/pdf" onChange={(e) => setPdf(e.target.files?.[0] ?? null)} /></label><label>Cover image<input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setCover(e.target.files?.[0] ?? null)} /></label><button className="button button-dark full" disabled={loading}>{loading ? 'Uploading securely…' : 'Publish cookbook'}</button>{error && <p className="form-error">{error}</p>}</form></section>;
}