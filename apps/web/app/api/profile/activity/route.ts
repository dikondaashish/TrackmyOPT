import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { apiFail, apiOk, apiServerError, apiUnauthorized } from "@/lib/api/response";

/**
 * Lightweight activity markers for activation cron (server-side, idempotent).
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return apiUnauthorized();
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const updates: Record<string, string> = {};

    if (body.first_dashboard_viewed === true) {
      // Phase 4: stamp on any dashboard visit — do not require onboarding.
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_dashboard_viewed_at")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile?.first_dashboard_viewed_at) {
        updates.first_dashboard_viewed_at = new Date().toISOString();
      }
    }

    if (Object.keys(updates).length === 0) {
      return apiOk({ updated: [] });
    }

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", user.id);

    if (error) {
      return apiFail("Database error", { status: 500, code: "db_error" });
    }

    return apiOk({ updated: Object.keys(updates) });
  } catch (e) {
    return apiServerError(e);
  }
}
