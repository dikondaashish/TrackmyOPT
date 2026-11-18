import type { SupabaseClient } from '@supabase/supabase-js';
import { resolveActivePlanTier } from '@/lib/premium/user-plan-tier';

/** Days after the paid introduction starts before the progress email is due. */
export const TRIAL_PROGRESS_MIN_DAYS = 3;
/** After this the "trial ending" email is close; do not send a late progress note. */
export const TRIAL_PROGRESS_MAX_DAYS = 5;
export const TRIAL_PROGRESS_DEFAULT_BATCH = 25;

const DAY_MS = 24 * 60 * 60 * 1000;

export type TrialProgressCandidate = {
  userId: string;
  email: string;
  firstName: string | null;
  trialStartedId: string;
  introEndDate: string | null;
  checks: number;
  cases: number;
  changes: number;
};

type TrialStartedRow = {
  id: string;
  user_id: string | null;
  email_address: string;
  email_data: unknown;
  created_at: string;
};

function countChangesSince(changeLog: unknown, sinceMs: number): number {
  if (!Array.isArray(changeLog)) return 0;
  return changeLog.filter((entry) => {
    if (!entry || typeof entry !== 'object') return false;
    const date = (entry as { date?: unknown }).date;
    return typeof date === 'string' && Date.parse(date) >= sinceMs;
  }).length;
}

/**
 * Accounts three to five days into the paid Pro introduction that are still
 * on a paid plan and have not had the progress email. The start is taken from
 * the `trial_started` email the Stripe webhook queued.
 */
export async function findTrialProgressCandidates(
  supabase: SupabaseClient,
  options?: { limit?: number; now?: Date }
): Promise<TrialProgressCandidate[]> {
  const limit = options?.limit ?? TRIAL_PROGRESS_DEFAULT_BATCH;
  const now = options?.now ?? new Date();
  const started = await supabase
    .from('email_queue')
    .select('id, user_id, email_address, email_data, created_at')
    .eq('email_type', 'trial_started')
    .eq('status', 'sent')
    .gte(
      'created_at',
      new Date(now.getTime() - TRIAL_PROGRESS_MAX_DAYS * DAY_MS).toISOString()
    )
    .lte(
      'created_at',
      new Date(now.getTime() - TRIAL_PROGRESS_MIN_DAYS * DAY_MS).toISOString()
    )
    .order('created_at', { ascending: true })
    .limit(limit * 2);
  if (started.error) throw new Error('Trial start lookup failed');
  const rows = ((started.data ?? []) as TrialStartedRow[]).filter(
    (row): row is TrialStartedRow & { user_id: string } => Boolean(row.user_id)
  );
  if (!rows.length) return [];
  const userIds = [...new Set(rows.map((row) => row.user_id))];

  const [sent, profiles, prefs, cases] = await Promise.all([
    supabase
      .from('email_queue')
      .select('user_id')
      .in('user_id', userIds)
      .eq('email_type', 'trial_progress'),
    supabase
      .from('profiles')
      .select(
        'user_id, first_name, premium_status, subscription_expires_at, plan_tier'
      )
      .in('user_id', userIds),
    supabase
      .from('email_preferences')
      .select('user_id, email_enabled')
      .in('user_id', userIds),
    supabase
      .from('case_status')
      .select('user_id, change_log')
      .in('user_id', userIds),
  ]);
  if (sent.error || profiles.error || prefs.error || cases.error)
    throw new Error('Trial progress lookup failed');

  const alreadySent = new Set((sent.data ?? []).map((row) => row.user_id));
  const optedOut = new Set(
    (prefs.data ?? [])
      .filter((row) => row.email_enabled === false)
      .map((row) => row.user_id)
  );
  const profileByUser = new Map(
    (profiles.data ?? []).map((row) => [row.user_id as string, row])
  );

  const candidates: TrialProgressCandidate[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    if (candidates.length >= limit) break;
    if (seen.has(row.user_id)) continue;
    seen.add(row.user_id);
    const profile = profileByUser.get(row.user_id);
    if (
      alreadySent.has(row.user_id) ||
      optedOut.has(row.user_id) ||
      !profile ||
      resolveActivePlanTier(profile) === 'free' ||
      !row.email_address?.trim()
    )
      continue;

    const startedMs = Date.parse(row.created_at);
    const ownCases = (cases.data ?? []).filter(
      (item) => item.user_id === row.user_id
    );
    const checks = await supabase
      .from('case_check_jobs')
      .select('job_id', { count: 'exact', head: true })
      .eq('user_id', row.user_id)
      .eq('state', 'succeeded')
      .gte('completed_at', row.created_at);
    if (checks.error) throw new Error('Trial check count failed');

    const data =
      row.email_data && typeof row.email_data === 'object'
        ? (row.email_data as { trial_end_date?: unknown })
        : {};
    candidates.push({
      userId: row.user_id,
      email: row.email_address.trim(),
      firstName: (profile.first_name as string | null) ?? null,
      trialStartedId: row.id,
      introEndDate:
        typeof data.trial_end_date === 'string' ? data.trial_end_date : null,
      checks: checks.count ?? 0,
      cases: ownCases.length,
      changes: ownCases.reduce(
        (sum, item) => sum + countChangesSince(item.change_log, startedMs),
        0
      ),
    });
  }
  return candidates;
}
