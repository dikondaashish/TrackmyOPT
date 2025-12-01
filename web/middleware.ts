/**
 * Next.js Middleware for Route Protection
 * 
 * Protects all /dashboard/* routes by checking for valid Supabase session.
 * Redirects unauthenticated users to /login page.
 * 
 * This middleware runs at the edge before page rendering for optimal performance.
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/dashboard'];

// Routes that should redirect authenticated users (optional)
const authRoutes = ['/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if current path needs protection
  const isProtectedRoute = protectedRoutes.some(route => 
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
  console.log(`🛡️ Middleware: ${pathname} | Authenticated: ${isAuthenticated} | User: ${user?.email || 'none'}`);

  // Protected route + not authenticated = redirect to login
  if (isProtectedRoute && !isAuthenticated) {
    console.log(`🚫 Middleware: Redirecting unauthenticated user to /login from ${pathname}`);
    
    const loginUrl = new URL('/login', request.url);
    // Add redirect parameter so user returns to intended page after login
    loginUrl.searchParams.set('redirect', pathname);
    
    return NextResponse.redirect(loginUrl);
  }

  // Auth route + authenticated = optionally redirect to dashboard
  // Uncomment below if you want to redirect already-logged-in users away from login page
  // if (isAuthRoute && isAuthenticated) {
  //   console.log(`✅ Middleware: Redirecting authenticated user to /dashboard from ${pathname}`);
  //   return NextResponse.redirect(new URL('/dashboard', request.url));
  // }

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
