import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabase client for client-side usage
 * 
 * Uses cookies for session storage with cross-subdomain support:
 * - Cookies are set on .trackmyopt.com (root domain) by server
 * - Browser client can read these cookies across all subdomains
 * - Works with: login.trackmyopt.com, dashboard.trackmyopt.com
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  // Browser client uses default cookie handling
  // Root domain cookies (.trackmyopt.com) are automatically available
);

/**
 * Helper to get the current user session
 */
export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  
  return session;
}

/**
 * Helper to get the current user
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  
  return user;
}

