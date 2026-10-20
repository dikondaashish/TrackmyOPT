import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';

export const CHECKOUT_PROFILE_COLUMNS =
  'email, first_name, last_name, stripe_customer_id, pro_free_trial_consumed';

export type CheckoutProfile = {
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  stripe_customer_id: string | null;
  pro_free_trial_consumed: boolean;
};

export type CheckoutProfileResult =
  | { ok: true; profile: CheckoutProfile }
  | { ok: false; error: PostgrestError };

/**
 * Load the billing profile for checkout, creating it when missing.
 *
 * Profiles are created lazily (first /api/me call), so an account can reach
 * checkout before it has a row. Create the same default row /api/me creates
 * and fall back to the sign-in email for the Stripe customer.
 */
export async function loadCheckoutProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<CheckoutProfileResult> {
  const read = () =>
    supabase
      .from('profiles')
      .select(CHECKOUT_PROFILE_COLUMNS)
      .eq('user_id', userId)
      .maybeSingle<CheckoutProfile>();

  let { data: profile, error } = await read();
  if (error) return { ok: false, error };

  if (!profile) {
    const { error: insertError } = await supabase.from('profiles').insert({
      user_id: userId,
      timezone: 'America/New_York',
      is_stem_eligible: false,
    });
    // 23505: a concurrent request created it first; read the winner.
    if (insertError && insertError.code !== '23505') {
      return { ok: false, error: insertError };
    }
    ({ data: profile, error } = await read());
    if (error) return { ok: false, error };
    if (!profile) {
      return {
        ok: false,
        error: {
          name: 'PostgrestError',
          code: 'PGRST116',
          details: 'Profile missing after create',
          hint: '',
          message: 'Profile missing after create',
        } as PostgrestError,
      };
    }
  }

  if (!profile.email) {
    const { data } = await supabase.auth.admin.getUserById(userId);
    profile = { ...profile, email: data?.user?.email ?? null };
  }

  return { ok: true, profile };
}
