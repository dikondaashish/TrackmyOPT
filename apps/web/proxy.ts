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
 * - /dashboard/help
 * - /dashboard/opt-tools/opt-apply
 * - /dashboard/opt-tools/opt-clock
 * - /dashboard/opt-tools/stem-apply
 * - /dashboard/opt-tools/stem-clock
 * 
 * This proxy runs before page rendering.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { CRAWLER_NOINDEX_HEADERS, isSearchCrawler } from '@/lib/is-search-crawler';
import { DEFAULT_POST_AUTH_PATH } from '@/lib/auth/post-auth-landing';

// Routes that require authentication (redirect to login if not logged in)
const protectedRoutes = ['/dashboard', '/admin'];

// Public routes that don't require authentication (exceptions within protected routes)
// These pages are accessible without login
const publicRoutes = [
  '/dashboard/help',
  '/dashboard/opt-tools/opt-apply',      // OPT Apply tool - public
  '/dashboard/opt-tools/opt-clock',      // OPT Clock Tracker - public
  '/dashboard/opt-tools/stem-apply',     // STEM OPT Apply - public
  '/dashboard/opt-tools/stem-clock',     // STEM Clock Tracker - public
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
  const isProtectedRoute = !isPublicRoute && protectedRoutes.some(route =>
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
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Set cookie on request for subsequent proxy/pages
          request.cookies.set({
            name,
            value,
            ...options,
          });
          // Set cookie on response for browser
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
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
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnTo', pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // Auth route + authenticated = send them into case status (Phase 4 activation path)
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL(DEFAULT_POST_AUTH_PATH, request.url));
  }

  // Security headers (CSP, X-Frame-Options, etc.) are set site-wide in next.config.js
  // so marketing pages and the app share the same policy without duplicating headers.

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
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)',
  ],
};
