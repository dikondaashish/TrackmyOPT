/**
 * Next.js Proxy for Route Protection
 * 
 * Protects dashboard routes by checking for valid Supabase session.
 * Redirects unauthenticated users to login page with returnTo parameter.
 * 
 * Protected routes (require login):
 * - /dashboard (main dashboard)
 * - /dashboard/opt-dates
 * - /dashboard/case-status
 * - /dashboard/opt-tools (main page only)
 * - /dashboard/documents
 * - /dashboard/settings
 * 
 * Public routes (no login required):
 * - /help
 * - /tools/opt-apply
 * - /tools/opt-clock
 * - /tools/stem-apply
 * - /tools/stem-clock
 *   (legacy /dashboard/... URLs 301 here via next.config)
 * 
 * This proxy runs before page rendering.
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { CRAWLER_NOINDEX_HEADERS, isSearchCrawler } from '@/lib/is-search-crawler';
import { DEFAULT_POST_AUTH_PATH } from '@/lib/auth/post-auth-landing';
import {
  applyPrivacyRegionCookie,
  detectPrivacyRegion,
} from '@/lib/privacy/region-detection';

// Routes that require authentication (redirect to login if not logged in)
const protectedRoutes = ['/dashboard', '/admin'];

// Legacy public tool URLs still under /dashboard — keep crawlable until 301s settle.
// Prefer /help and /tools/* as the canonical public destinations.
const publicRoutes = [
  '/help',
  '/tools/opt-apply',
  '/tools/opt-clock',
  '/tools/stem-apply',
  '/tools/stem-clock',
];

// Routes that should redirect authenticated users (optional)
const authRoutes = ['/login'];

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // Enforce canonical domain (Permanent 301 Redirect)
  // Prevents duplicate indexing from zyenereviews or non-www hits
  if (
    hostname === 'zyene.com' || 
    hostname === 'www.zyene.com' || 
    hostname === 'trackmyopt.com'
  ) {
    url.hostname = 'www.trackmyopt.com';
    url.port = ''; // Ensure no port is attached
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }

  const { pathname } = request.nextUrl;

  // Private API routes must never be indexed. Crawlers get 403 (not 401) so GSC
  // stops reporting "Blocked due to unauthorized request" for /api/me etc.
  if (pathname.startsWith('/api/')) {
    const userAgent = request.headers.get('user-agent');
    if (isSearchCrawler(userAgent)) {
      return new NextResponse('Forbidden', {
        status: 403,
        headers: {
          ...CRAWLER_NOINDEX_HEADERS,
          'Content-Type': 'text/plain; charset=utf-8',
        },
      });
    }
    return NextResponse.next();
  }

  // Check if current path is a public route (exceptions)
  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if current path needs protection (but not if it's a public exception)
  const isAdminLogin = pathname === '/admin/login' || pathname === '/admin/setup';
  const isEmailAdminRoute = pathname === '/admin' || pathname === '/admin/email-campaigns' || pathname.startsWith('/admin/email-campaigns/');
  const isProtectedRoute = !isPublicRoute && !isAdminLogin && protectedRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  const isAuthRoute = authRoutes.some(route => pathname === route);

  // Create response to modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Create Supabase client with cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Keep all refreshed/deleted chunks, including earlier auth batches.
          const previousCookies = response.cookies.getAll();
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: request.headers } });
          previousCookies.forEach(cookie => response.cookies.set(cookie));
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Check for valid session
  const { data: { user }, error } = await supabase.auth.getUser();

  const isAuthenticated = !!user && !error;

  // Protected route + not authenticated = redirect to login page
  if (isProtectedRoute && !isAuthenticated) {
    // Redirect to login page with return URL so user can come back after login
    const loginUrl = new URL(isEmailAdminRoute ? '/admin/login' : '/login', request.url);
    if (!isEmailAdminRoute) loginUrl.searchParams.set('returnTo', pathname + request.nextUrl.search);
    const redirect = NextResponse.redirect(loginUrl);
    response.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie));
    return redirect;
  }

  // Auth route + authenticated = send them into case status (Phase 4 activation path)
  if (isAuthRoute && isAuthenticated) {
    const redirect = NextResponse.redirect(new URL(DEFAULT_POST_AUTH_PATH, request.url));
    response.cookies.getAll().forEach(cookie => redirect.cookies.set(cookie));
    return redirect;
  }

  // Security headers (CSP, X-Frame-Options, etc.) are set site-wide in next.config.js
  // so marketing pages and the app share the same policy without duplicating headers.

  // Privacy jurisdiction group for the consent manager (lib/privacy).
  applyPrivacyRegionCookie(request, response, detectPrivacyRegion(request));

  return response;
}

// Configure which routes the proxy runs on
export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
    /*
     * Host canonicalization (zyene.com, trackmyopt.com → www.trackmyopt.com)
     * must run on marketing pages too — not only dashboard/API.
     * /ingest is the PostHog rewrite: Vercel proxies it at the edge, so a
     * PostHog reset or stall is not a TrackMyOPT function error or a 300 s
     * function timeout (TRACKMYOPT-2N, 2F), and beacons skip the auth lookup.
     */
    '/((?!_next/static|_next/image|ingest(?:/|$)|template-previews/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)',
  ],
};
