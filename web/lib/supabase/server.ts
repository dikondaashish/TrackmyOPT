/**
 * Server-side Supabase client
 * For use in API routes and server components
 * 
 * Supports cross-subdomain authentication via root domain cookies:
 * - login.trackmyopt.com (auth)
 * - dashboard.trackmyopt.com (app)
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { subdomainConfig } from '@/lib/subdomain-config';

/**
 * Create a Supabase client for server-side usage
 * Handles cookies for session management with cross-subdomain support
 */
export async function createClient() {
  const cookieStore = await cookies();
  const cookieDomain = subdomainConfig.cookieDomain;

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            // Add root domain for cross-subdomain cookie sharing
            const cookieOptions = {
              name,
              value,
              ...options,
              // Only set domain in production (subdomains)
              ...(cookieDomain && { domain: cookieDomain }),
            };
            cookieStore.set(cookieOptions);
          } catch (error) {
            // Cookie setting might fail in middleware/server actions
            console.error('Error setting cookie:', error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            const cookieOptions = {
              name,
              value: '',
              ...options,
              // Only set domain in production (subdomains)
              ...(cookieDomain && { domain: cookieDomain }),
            };
            cookieStore.set(cookieOptions);
          } catch (error) {
            console.error('Error removing cookie:', error);
          }
        },
      },
    }
  );
}

