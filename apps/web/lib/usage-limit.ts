import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const FREE_RESUME_LIMIT = 5;
export const PRO_RESUME_LIMIT = 500;
export const DEDICATED_RESUME_LIMIT = 1000;

const FREE_ATS_SCAN_LIMIT = 3;
export { FREE_ATS_SCAN_LIMIT };
const PRO_ATS_SCAN_LIMIT = 10_000;

/** Pure limit resolver — plan_tier only (no premium_status override). */
export function resolveResumeLimitForTier(tier: string | null | undefined): number {
  const t = (tier || 'free').toLowerCase();
  if (t === 'dedicated') return DEDICATED_RESUME_LIMIT;
  if (t === 'pro') return PRO_RESUME_LIMIT;
  return FREE_RESUME_LIMIT;
}

export function resolveAtsScanLimitForTier(tier: string | null | undefined): number {
  const t = (tier || 'free').toLowerCase();
  if (t === 'pro' || t === 'dedicated') return PRO_ATS_SCAN_LIMIT;
  return FREE_ATS_SCAN_LIMIT;
}

function getServiceUsageClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export async function checkResumeLimit(userId: string) {
  // Service role: same as ATS — cookie anon RLS can miscount / fail open under Bearer JWT.
  const supabase = getServiceUsageClient();

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('plan_tier')
    .eq('user_id', userId)
    .single();

  if (profileError) {
    console.error('Error fetching profile for limit check:', profileError);
  }

  const tier = profile?.plan_tier || 'free';
  const limit = resolveResumeLimitForTier(tier);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data: usageData, error: usageError } = await supabase
    .from('resume_generations')
    .select('credit_cost')
    .eq('user_id', userId)
    .gte('created_at', startOfMonth);

  if (usageError) {
    console.error('Error fetching resume usage:', usageError);
    throw new Error('Failed to check usage limits');
  }

  const usage = usageData?.reduce((acc, row) => acc + Number(row.credit_cost || 0), 0) || 0;
  const allowed = usage < limit;

  return { allowed, limit, usage, tier };
}

/**
 * Logs a resume generation. Returns `{ ok: boolean }` so callers can choose to
 * fail-closed (block the generation) when accounting fails — ISS-023.
 */
export async function trackResumeGeneration(
  userId: string,
  type: 'generate' | 'regenerate',
): Promise<{ ok: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const creditCost = type === 'regenerate' ? 0.5 : 1.0;

  const { error } = await supabase.from('resume_generations').insert({
    user_id: userId,
    generation_type: type,
    credit_cost: creditCost,
  });

  if (error) {
    console.error('Failed to log resume generation:', error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

// ATS routes accept the extension's custom Bearer JWT as well as web cookies.
function getAtsUsageClient() {
  return getServiceUsageClient();
}

export async function checkAtsScanLimit(userId: string) {
  const supabase = getAtsUsageClient();

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('plan_tier')
    .eq('user_id', userId)
    .single();

  if (profileError) {
    console.error('Error fetching profile for ATS limit check:', profileError);
  }

  const tier = profile?.plan_tier || 'free';
  const limit = resolveAtsScanLimitForTier(tier);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const { data: usageData, error: usageError } = await supabase
    .from('resume_generations')
    .select('id')
    .eq('user_id', userId)
    .eq('generation_type', 'ats_scan')
    .gte('created_at', startOfMonth);

  if (usageError) {
    console.error('Error fetching ATS scan usage:', usageError);
    throw new Error('Failed to check ATS scan limits');
  }

  const usage = usageData?.length ?? 0;
  const allowed = usage < limit;

  return { allowed, limit, usage, tier };
}

export async function trackAtsScan(userId: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = getAtsUsageClient();

  const { error } = await supabase.from('resume_generations').insert({
    user_id: userId,
    generation_type: 'ats_scan',
  });

  if (error) {
    console.error('Failed to log ATS scan:', error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
