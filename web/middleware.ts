/**
 * Next.js Middleware for Route Protection & Subdomain Routing
 * 
 * Subdomain Architecture:
 * - trackmyopt.com (marketing/landing)
 * - login.trackmyopt.com (authentication)
 * - dashboard.trackmyopt.com (protected app)
 * 
 * URL Rewriting for Dashboard Subdomain:
 * - dashboard.trackmyopt.com → internally serves /dashboard
 * - dashboard.trackmyopt.com/opt-tools → internally serves /dashboard/opt-tools
 * 
 * Protected routes (require login):
 * - / (dashboard home on dashboard subdomain)
 * - /opt-dates
 * - /case-status
 * - /opt-tools (main page only)
 * - /documents
 * - /settings
 * 
 * Public routes (no login required):
 * - /help
 * - /opt-tools/opt-apply
 * - /opt-tools/opt-clock
 * - /opt-tools/stem-apply
 * - /opt-tools/stem-clock
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

// Check if on dashboard subdomain
const isDashboardSubdomain = (hostname: string) => 
  hostname === `dashboard.${ROOT_DOMAIN}` || hostname === 'dashboard.trackmyopt.com';

// Routes that require authentication on dashboard subdomain (clean URLs)
const protectedPaths = ['/', '/opt-dates', '/case-status', '/opt-tools', '/documents', '/settings', '/premium'];

// Public routes on dashboard subdomain (no login required)
const publicPaths = [
  '/help',
  '/opt-tools/opt-apply',
  '/opt-tools/opt-clock', 
  '/opt-tools/stem-apply',
  '/opt-tools/stem-clock',
  '/api',  // API routes handle their own auth
];

// Routes that should redirect authenticated users
const authRoutes = ['/login'];

export async function middleware(request: NextRequest) {
  let { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  const isLocal = isLocalhost(hostname);
  const isDashboard = isDashboardSubdomain(hostname);
  
  // === URL REWRITING FOR DASHBOARD SUBDOMAIN ===
  // On dashboard.trackmyopt.com, rewrite URLs to add /dashboard prefix internally
  // Example: dashboard.trackmyopt.com/opt-tools → serves /dashboard/opt-tools
  let rewritePath = pathname;
  if (isDashboard && !pathname.startsWith('/dashboard') && !pathname.startsWith('/api') && !pathname.startsWith('/_next') && !pathname.startsWith('/auth')) {
    rewritePath = `/dashboard${pathname === '/' ? '' : pathname}`;
  }
  
  // Check if path is public (no auth needed)
  const isPublicPath = publicPaths.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Check if path needs protection
  const isProtectedPath = !isPublicPath && protectedPaths.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  const isAuthRoute = authRoutes.some(route => pathname === route);

  // Create response - use rewrite for dashboard subdomain
  let response: NextResponse;
  if (isDashboard && rewritePath !== pathname) {
    // Rewrite the URL internally (user sees clean URL, server sees /dashboard/...)
    response = NextResponse.rewrite(new URL(rewritePath, request.url));
  } else {
    response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }

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

  // Protected path + not authenticated = redirect to login subdomain
  if (isProtectedPath && !isAuthenticated) {
    if (isLocal) {
      // Local development - redirect to login page on same host
      return NextResponse.redirect(new URL('/login', request.url));
    } else {
      // Production - redirect to login subdomain with clean URL as redirect
      const redirectUrl = `${LOGIN_URL}/login?redirect=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Auth route (/login) + authenticated = redirect to dashboard subdomain (clean URL)
  if (isAuthRoute && isAuthenticated) {
    if (isLocal) {
      // Local development - redirect to dashboard on same host
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else {
      // Production - redirect to dashboard subdomain root (clean URL)
      return NextResponse.redirect(DASHBOARD_URL);
    }
  }

  return response;
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match routes for:
     * - Dashboard subdomain (all paths for URL rewriting)
     * - Login route
     * - Dashboard routes (for localhost)
     * 
     * Excludes:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
