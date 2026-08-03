/**
 * Profile + login-email lookups for Stripe-driven sends. Not templates —
 * these resolve which user a Stripe event belongs to.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

/** Resolve profile + login email for Stripe-driven emails */
export async function resolveUserForStripeCustomer(
  supabase: SupabaseClient,
  stripeCustomerId: string
): Promise<{ userId: string; email: string; firstName: string | null } | null> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_id, email, first_name")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Stripe customer profile lookup failed: ${profileError.message}`);
  }
  if (!profile?.user_id) return null;

  let email = profile.email?.trim() || "";
  const firstName = profile.first_name;

  if (!email) {
    const { data: userData, error } = await supabase.auth.admin.getUserById(profile.user_id);
    if (!error && userData?.user?.email) {
      email = userData.user.email;
    }
  }

  if (!email) return null;

  return { userId: profile.user_id, email, firstName };
}

/** Resolve profile + email for a Supabase user id (PaymentIntent metadata path). */
export async function resolveUserById(
  supabase: SupabaseClient,
  userId: string
): Promise<{ userId: string; email: string; firstName: string | null } | null> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("user_id, email, first_name")
    .eq("user_id", userId)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Billing profile lookup failed: ${profileError.message}`);
  }
  if (!profile?.user_id) return null;

  let email = profile.email?.trim() || "";
  if (!email) {
    const { data: userData, error } = await supabase.auth.admin.getUserById(userId);
    if (!error && userData?.user?.email) {
      email = userData.user.email;
    }
  }

  if (!email) return null;

  return { userId: profile.user_id, email, firstName: profile.first_name };
}
