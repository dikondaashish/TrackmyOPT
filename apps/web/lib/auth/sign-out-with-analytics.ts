import { supabase } from "@/lib/supabase/client";
import { captureSignOut, type SignOutSource } from "@/lib/posthog-client";

/** Sign out from UI paths with PostHog tracking and identity reset. */
export async function signOutWithAnalytics(source: SignOutSource): Promise<void> {
  await captureSignOut(source);
  await supabase.auth.signOut();
}
