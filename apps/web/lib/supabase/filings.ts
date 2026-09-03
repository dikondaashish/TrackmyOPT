import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let filingsClient: SupabaseClient | undefined;

/** Server-only client for the secondary H-1B filings project. */
export function getSupabaseFilingsClient(): SupabaseClient {
  if (!filingsClient) {
    const url = process.env.SUPABASE_FILINGS_URL;
    const serviceRoleKey = process.env.SUPABASE_FILINGS_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
      throw new Error("Secondary Supabase filings configuration is missing");
    }

    filingsClient = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }

  return filingsClient;
}
