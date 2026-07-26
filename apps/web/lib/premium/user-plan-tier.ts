import type { SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export type ActivePlanTier = 'free' | 'pro' | 'dedicated';

export interface PlanProfileRow {
  premium_status?: boolean | null;
  plan_tier?: string | null;
  subscription_expires_at?: string | null;
}

export function resolveActivePlanTier(
  profile: PlanProfileRow | null | undefined,
  now: Date = new Date(),
): ActivePlanTier {
  if (profile?.premium_status !== true) return 'free';
  if (profile.subscription_expires_at) {
    const expiresAt = Date.parse(profile.subscription_expires_at);
    if (!Number.isFinite(expiresAt) || expiresAt <= now.getTime()) return 'free';
  }
  return String(profile.plan_tier || '').toLowerCase() === 'dedicated'
    ? 'dedicated'
    : 'pro';
}

export async function getActiveUserPlanTier(
  userId: string,
  client: SupabaseClient = getSupabaseAdminClient(),
): Promise<ActivePlanTier> {
  const { data, error } = await client
    .from('profiles')
    .select('premium_status, plan_tier, subscription_expires_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    console.error(
      'Unable to resolve AI generation plan tier:',
      error.message || 'unknown datastore error',
    );
    return 'free';
  }
  return resolveActivePlanTier(data);
}
