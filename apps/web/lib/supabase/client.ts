import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabase client for client-side usage
 * Uses cookies for session storage to ensure compatibility between client and server
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

