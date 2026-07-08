import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Service-role client for server-only data access (bypasses RLS). */
export function getSupabaseAdminClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
