/**
 * Next.js Middleware for Route Protection
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
 * This middleware runs at the edge before page rendering for optimal performance.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Routes that require authentication (redirect to home if not logged in)
const protectedRoutes = ['/dashboard'];

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
          // Set cookie on request for subsequent middleware/pages
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

  // Log for debugging (remove in production)

  // Protected route + not authenticated = redirect to login page
  if (isProtectedRoute && !isAuthenticated) {
    // Redirect to login page with return URL so user can come back after login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnTo', pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // Auth route + authenticated = optionally redirect to dashboard
  // Uncomment below if you want to redirect already-logged-in users away from login page
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Security headers (CSP, X-Frame-Options, etc.) are set site-wide in next.config.js
  // so marketing pages and the app share the same policy without duplicating headers.

  return response;
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all routes under /dashboard
     * Excludes:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (images, etc.)
     * - API routes (they handle their own auth)
     */
    '/dashboard/:path*',
    '/login',
  ],
};
