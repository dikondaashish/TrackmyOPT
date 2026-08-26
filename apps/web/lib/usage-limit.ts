import { createClient } from '@supabase/supabase-js';
import { PLAN_LIMITS } from '@/lib/pricing/plan-config';

export const FREE_RESUME_LIMIT = PLAN_LIMITS.free.resumesPerMonth;
export const PRO_RESUME_LIMIT = PLAN_LIMITS.pro.resumesPerMonth;
export const DEDICATED_RESUME_LIMIT = PLAN_LIMITS.dedicated.resumesPerMonth;

const FREE_ATS_SCAN_LIMIT = PLAN_LIMITS.free.atsScansPerMonth;
export { FREE_ATS_SCAN_LIMIT };
// Exported so pricing copy can be tested against the real cap instead of
// claiming "Unlimited" — see plan-features.test.ts.
export const PRO_ATS_SCAN_LIMIT = PLAN_LIMITS.pro.atsScansPerMonth;
export const DEDICATED_ATS_SCAN_LIMIT =
  PLAN_LIMITS.dedicated.atsScansPerMonth;

/** Pure limit resolver — plan_tier only (no premium_status override). */
export function resolveResumeLimitForTier(tier: string | null | undefined): number {
  const t = (tier || 'free').toLowerCase();
  if (t === 'dedicated') return DEDICATED_RESUME_LIMIT;
  if (t === 'pro') return PRO_RESUME_LIMIT;
  return FREE_RESUME_LIMIT;
}

export function resolveAtsScanLimitForTier(tier: string | null | undefined): number {
  const t = (tier || 'free').toLowerCase();
  if (t === 'dedicated') return DEDICATED_ATS_SCAN_LIMIT;
  if (t === 'pro') return PRO_ATS_SCAN_LIMIT;
  return FREE_ATS_SCAN_LIMIT;
}

function getServiceUsageClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

type ResumeGenerationType = 'generate' | 'regenerate';

export interface ResumeUsageSummary {
  allowed: boolean;
  limit: number;
  usage: number;
  tier: string;
  creditBalance: number;
  canBuyCredits: boolean;
}

export interface ResumeGenerationReservation extends ResumeUsageSummary {
  reservationId: string | null;
  fundingSource: 'plan' | 'purchased' | null;
  denialReason: 'credits_required' | 'upgrade_required' | null;
}

export function hasActivePaidResumePlan(profile: {
  plan_tier?: string | null;
  premium_status?: boolean | null;
  subscription_expires_at?: string | null;
}): boolean {
  const tier = (profile.plan_tier || '').toLowerCase();
  const expiresAt = profile.subscription_expires_at
    ? Date.parse(profile.subscription_expires_at)
    : null;
  return (
    profile.premium_status === true &&
    (tier === 'pro' || tier === 'dedicated') &&
    (expiresAt === null || (Number.isFinite(expiresAt) && expiresAt > Date.now()))
  );
}

async function getResumeEntitlement(userId: string) {
  const supabase = getServiceUsageClient();
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('plan_tier, premium_status, subscription_expires_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (profileError) {
    console.error('Error fetching profile for limit check:', profileError);
    throw new Error('Failed to verify resume entitlement');
  }

  const tier = profile?.plan_tier || 'free';
  return {
    supabase,
    tier,
    limit: resolveResumeLimitForTier(tier),
    canBuyCredits: hasActivePaidResumePlan(profile || {}),
  };
}

export async function checkResumeLimit(userId: string): Promise<ResumeUsageSummary> {
  // Service role: cookie/JWT RLS must never make paid usage accounting fail open.
  const { supabase, tier, limit, canBuyCredits } = await getResumeEntitlement(userId);

  const now = new Date();
  const startOfMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
  ).toISOString();

  const { data: usageData, error: usageError } = await supabase
    .from('resume_generations')
    .select('credit_cost')
    .eq('user_id', userId)
    .eq('funding_source', 'plan')
    .in('generation_type', ['generate', 'regenerate'])
    .gte('created_at', startOfMonth);

  if (usageError) {
    console.error('Error fetching resume usage:', usageError);
    throw new Error('Failed to check usage limits');
  }

  const usage = usageData?.reduce((acc, row) => acc + Number(row.credit_cost || 0), 0) || 0;
  const { data: ledgerData, error: ledgerError } = await supabase
    .from('resume_credit_ledger')
    .select('credits_delta')
    .eq('user_id', userId);

  if (ledgerError) {
    console.error('Error fetching purchased resume credits:', ledgerError);
    throw new Error('Failed to check purchased resume credits');
  }

  const rawBalance =
    ledgerData?.reduce((total, row) => total + Number(row.credits_delta || 0), 0) || 0;
  const creditBalance = Math.max(0, rawBalance);
  const allowed = usage < limit || (canBuyCredits && creditBalance >= 1);

  return { allowed, limit, usage, tier, creditBalance, canBuyCredits };
}

export async function reserveResumeGeneration(
  userId: string,
  type: ResumeGenerationType,
): Promise<ResumeGenerationReservation> {
  const { supabase, tier, limit, canBuyCredits } = await getResumeEntitlement(userId);
  const reservationToken = crypto.randomUUID();
  const { data, error } = await supabase.rpc('reserve_resume_generation', {
    p_user_id: userId,
    p_generation_type: type,
    p_plan_limit: limit,
    p_reservation_token: reservationToken,
  });

  if (error) {
    console.error('Failed to reserve resume generation:', error);
    throw new Error('Failed to reserve resume generation entitlement');
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error('Resume reservation returned no result');

  return {
    allowed: row.allowed === true,
    reservationId: typeof row.reservation_id === 'string' ? row.reservation_id : null,
    fundingSource:
      row.funding_source === 'plan' || row.funding_source === 'purchased'
        ? row.funding_source
        : null,
    usage: Number(row.plan_usage || 0),
    limit,
    tier,
    creditBalance: Math.max(0, Number(row.credit_balance || 0)),
    canBuyCredits,
    denialReason:
      row.denial_reason === 'credits_required' || row.denial_reason === 'upgrade_required'
        ? row.denial_reason
        : null,
  };
}

export async function releaseResumeGenerationReservation(
  userId: string,
  reservationId: string,
): Promise<void> {
  const supabase = getServiceUsageClient();
  const { error } = await supabase.rpc('release_resume_generation_reservation', {
    p_user_id: userId,
    p_reservation_id: reservationId,
  });
  if (error) {
    console.error('Failed to release resume generation reservation:', error);
  }
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

export interface AtsScanReservation {
  /** The database operation completed successfully. */
  ok: boolean;
  /** The operation completed and recorded one scan. */
  allowed: boolean;
  usage?: number;
  limit?: number;
  error?: string;
}

/**
 * Atomically counts and records a completed ATS scan. Call this only after
 * provider output has passed validation; malformed/failed analysis must never
 * consume a customer's monthly quota.
 */
export async function trackAtsScan(
  userId: string,
  planLimit: number,
): Promise<AtsScanReservation> {
  const supabase = getAtsUsageClient();

  const { data, error } = await supabase.rpc('reserve_ats_scan', {
    p_user_id: userId,
    p_plan_limit: planLimit,
  });

  if (error) {
    console.error('Failed to log ATS scan:', error);
    return { ok: false, allowed: false, error: error.message };
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    console.error('ATS scan reservation returned no result');
    return { ok: false, allowed: false, error: 'No reservation result' };
  }

  return {
    ok: true,
    allowed: row.allowed === true,
    usage: Number(row.usage ?? 0),
    limit: Number(row.plan_limit ?? planLimit),
  };
}
