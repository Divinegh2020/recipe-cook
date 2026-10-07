import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  if (!request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname === '/admin/login') return response;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return NextResponse.redirect(new URL('/admin/login', request.url));

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL('/admin/login', request.url));

  const allowed = (process.env.ADMIN_EMAILS || '').split(',').map((item) => item.trim().toLowerCase()).filter(Boolean);
  if (!user.email || !allowed.includes(user.email.toLowerCase())) {
    return NextResponse.redirect(new URL('/admin/login?denied=1', request.url));
  }

  return response;
}

export const config = { matcher: ['/admin/:path*'] };