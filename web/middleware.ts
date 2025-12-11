/**
 * Next.js Middleware for Route Protection & Subdomain Routing
 * 
 * Subdomain Architecture:
 * - trackmyopt.com (marketing/landing)
 * - login.trackmyopt.com (authentication)
 * - dashboard.trackmyopt.com (protected app)
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
 * Cookies are set on .trackmyopt.com for cross-subdomain authentication.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Subdomain configuration
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'trackmyopt.com';
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || '.trackmyopt.com';
const LOGIN_URL = process.env.NEXT_PUBLIC_LOGIN_URL || 'https://login.trackmyopt.com';
const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'https://dashboard.trackmyopt.com';
const MARKETING_URL = process.env.NEXT_PUBLIC_MARKETING_URL || 'https://trackmyopt.com';

// Check if running locally
const isLocalhost = (hostname: string) => 
  hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.');

// Routes that require authentication (redirect to login if not logged in)
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
  const hostname = request.headers.get('host') || '';
  const isLocal = isLocalhost(hostname);
  
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

  // Get cookie domain (only set in production, not localhost)
  const cookieDomain = isLocal ? undefined : COOKIE_DOMAIN;

  // Create Supabase client with root domain cookie handling
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
          const cookieOptions = {
            name,
            value,
            ...options,
            // Set domain for cross-subdomain sharing in production
            ...(cookieDomain && { domain: cookieDomain }),
          };
          request.cookies.set(cookieOptions);
          // Set cookie on response for browser
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set(cookieOptions);
        },
        remove(name: string, options: CookieOptions) {
          const cookieOptions = {
            name,
            value: '',
            ...options,
            ...(cookieDomain && { domain: cookieDomain }),
          };
          request.cookies.set(cookieOptions);
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set(cookieOptions);
        },
      },
    }
  );

  // Check for valid session
  const { data: { user }, error } = await supabase.auth.getUser();
  
  const isAuthenticated = !!user && !error;

  // Protected route + not authenticated = redirect to login subdomain
  if (isProtectedRoute && !isAuthenticated) {
    if (isLocal) {
      // Local development - redirect to login page on same host
      return NextResponse.redirect(new URL('/login', request.url));
    } else {
      // Production - redirect to login subdomain
      const redirectUrl = `${LOGIN_URL}/login?redirect=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Auth route (/login) + authenticated = redirect to dashboard subdomain
  if (isAuthRoute && isAuthenticated) {
    if (isLocal) {
      // Local development - redirect to dashboard on same host
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      // Production - redirect to dashboard subdomain
      return NextResponse.redirect(`${DASHBOARD_URL}/dashboard`);
    }
  }

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
