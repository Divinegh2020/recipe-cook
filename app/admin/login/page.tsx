'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      router.push('/admin'); router.refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'Login failed.'); }
    finally { setLoading(false); }
  }

  return <section className="auth-page shell"><form className="auth-card" onSubmit={submit}><span className="eyebrow">Store admin</span><h1>Sign in to Recipe Cook.</h1><p>Manage your cookbook catalog and upload new digital books.</p><label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label><label>Password<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label><button className="button button-dark full" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>{error && <p className="form-error">{error}</p>}</form></section>;
}