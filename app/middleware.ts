import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getUserSubscription } from '@/lib/supabase/queries';

/**
 * Middleware to enforce subscription for routes under /dashboard/pro
 * Put pages that require an active subscription under `/dashboard/pro/...`.
 * Users without an active subscription will be redirected to `/dashboard/billing`.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith('/dashboard/pro')) {
    return NextResponse.next();
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Not authenticated — let other auth middleware handle or redirect to login
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    const sub = await getUserSubscription(user.id);
    if (!sub || sub.status !== 'active') {
      // Redirect to billing page
      return NextResponse.redirect(new URL('/dashboard/billing', req.url));
    }

    return NextResponse.next();
  } catch (e) {
    console.error('Subscription middleware error:', e);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/dashboard/pro/:path*'],
};
