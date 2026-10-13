import { createHash } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { USCISStatus } from '@/lib/immigration/uscis-checker';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { backtest, type CommunityObservation } from './backtest';
import { addDays, normalizeObservations, trainingRecords } from './normalize';
import { reconstructObservations, type CaseHistoryRow } from './retrospective';
import { emptyForecast, fitCurve, predict } from './survival';
import {
  MODEL_VERSION,
  type Curve,
  type Forecast,
  type Observation,
} from './types';

/** Static errors only: caught database errors can contain applicant data. */
function checked<T>(result: { data: T; error: unknown }, operation: string): T {
  if (result.error) throw new Error(`OPT forecast ${operation} failed`);
  return result.data;
}
export async function recordObservation(
  db: SupabaseClient,
  caseId: string,
  status: USCISStatus,
  syncedAt: string
): Promise<boolean> {
  return (
    checked(
      await db.rpc('record_opt_case_observation', {
        p_case_id: caseId,
        p_synced_at: syncedAt,
        p_provider: {
          status: status.status,
          form: status.caseType,
          received: status.receivedDate,
          events: status.histCaseStatus.map((e) => ({
            date: e.date,
            status: e.completedText,
          })),
          // Only when USCIS sends it (non-IOE receipts), for the silent-update study.
          ...(status.modifiedDate ? { modified: status.modifiedDate } : {}),
        },
      }),
      'observation write'
    ) === true
  );
}
export async function loadObservations(
  db: SupabaseClient,
  cutoff: string
): Promise<Observation[]> {
  const rows: Observation[] = [];
  let after = 0;
  for (let page = 0; page < 250; page++) {
    const batch = checked(
      await db.rpc('read_opt_case_observations', {
        p_cutoff: cutoff,
        p_after: after,
        p_limit: 1000,
      }),
      'evidence read'
    ) as Observation[];
    if (!Array.isArray(batch))
      throw new Error('OPT forecast evidence shape invalid');
    rows.push(...batch);
    if (batch.length < 1000) return rows;
    after = batch.at(-1)!.id;
  }
  throw new Error('OPT forecast evidence capacity exceeded');
}
export async function loadCommunity(
  db: SupabaseClient,
  cutoff: string
): Promise<CommunityObservation[]> {
  const rows: CommunityObservation[] = [];
  let after = 0;
  for (let page = 0; page < 250; page++) {
    const batch = checked(
      await db.rpc('read_opt_community_asof', {
        p_cutoff: cutoff,
        p_after: after,
        p_limit: 1000,
      }),
      'community history read'
    ) as CommunityObservation[];
    rows.push(...batch);
    if (batch.length < 1000) return rows;
    after = batch.at(-1)!.id;
  }
  throw new Error('OPT forecast community history capacity exceeded');
}
export async function runBacktest(
  db: SupabaseClient,
  landmarks: string[],
  cutoff: string
) {
  const observations = new Map<number, Observation>();
  const community = new Map<number, CommunityObservation>();
  // Read first/last evidence AS OF EACH landmark; reading today's boundaries alone
  // would discard the intermediate daily follow-up and distort historical freshness.
  for (const asOf of [...landmarks, cutoff]) {
    for (const row of await loadObservations(db, asOf))
      observations.set(row.id, row);
    for (const row of await loadCommunity(db, asOf)) community.set(row.id, row);
  }
  return backtest({
    observations: [...observations.values()],
    community: [...community.values()],
    landmarks,
    evaluationCutoff: cutoff,
  });
}
const CASE_COLUMNS =
  'id,receipt_number,case_type,received_date,current_status,status_history,last_checked_at,filing_category,filing_category_confirmed_at,reported_filing_date,reported_premium_start,pp_start_date';
type CaseRow = Omit<CaseHistoryRow, 'case_id' | 'application_id'> & {
  id: string;
  receipt_number?: string | null;
};
const toHistory = (
  { id, receipt_number: _receipt, ...rest }: CaseRow,
  applicationId: string
): CaseHistoryRow => ({ ...rest, case_id: id, application_id: applicationId });

/**
 * v2 trains on each enrolled case's dated USCIS history (the method validated in
 * docs/predictions/OPT_FORECAST_RETROSPECTIVE_2026-10-13.md). Receipts stay in
 * memory and are only used, hashed, to count shared enrollments once.
 */
export async function loadCaseHistories(
  db: SupabaseClient
): Promise<CaseHistoryRow[]> {
  const rows: CaseHistoryRow[] = [];
  for (let page = 0; page < 100; page++) {
    const batch = checked(
      await db
        .from('case_status')
        .select(CASE_COLUMNS)
        .order('id')
        .range(page * 1000, page * 1000 + 999),
      'case history read'
    ) as CaseRow[] | null;
    if (!Array.isArray(batch))
      throw new Error('OPT forecast case history shape invalid');
    for (const row of batch) {
      const receipt = row.receipt_number?.trim().toUpperCase();
      if (!receipt) continue;
      rows.push(
        toHistory(
          row,
          createHash('sha256').update(receipt).digest('hex').slice(0, 32)
        )
      );
    }
    if (batch.length < 1000) return rows;
  }
  throw new Error('OPT forecast case history capacity exceeded');
}
type Policy = {
  uscis_training_authorized: boolean;
  promoted_model: string | null;
  validation: unknown;
};
async function policy(db: SupabaseClient): Promise<Policy> {
  return checked(
    await db
      .from('opt_forecast_policy')
      .select('uscis_training_authorized,promoted_model,validation')
      .eq('singleton', true)
      .single(),
    'policy read'
  ) as Policy;
}
/** No self-promotion. Validation is a locked, reviewed artifact for this exact version. */
export function isPromoted(p: Policy, cohort: string): boolean {
  const v = p.validation as {
    modelVersion?: string;
    reviewedAt?: string;
    reportReference?: string;
    cohorts?: string[];
    approved?: boolean;
  } | null;
  return (
    p.uscis_training_authorized &&
    p.promoted_model === MODEL_VERSION &&
    v?.modelVersion === MODEL_VERSION &&
    v.approved === true &&
    Boolean(v.reviewedAt && v.reportReference) &&
    Boolean(v.cohorts?.includes(cohort))
  );
}

/** Daily model inputs/forecasts include every enrolled plan. No email side effects. */
export async function refreshForecasts(
  db: SupabaseClient = getSupabaseAdminClient(),
  now = new Date()
) {
  const cutoff = now.toISOString();
  const asOf = cutoff.slice(0, 10) + 'T00:00:00.000Z';
  const p = await policy(db);
  if (p.uscis_training_authorized) {
    const queue = await db
      .from('case_check_jobs')
      .select('job_id', { count: 'exact', head: true })
      .gte('scheduled_for', asOf)
      .lte('scheduled_for', cutoff)
      .in('state', ['scheduling', 'queued', 'running']);
    checked(queue, 'sync coverage read');
    if (queue.count) {
      if (now.getUTCHours() >= 20)
        console.error(
          'OPT forecast refresh blocked by overdue daily synchronization'
        );
      return { ok: true, state: 'waiting_for_sync', pendingJobs: queue.count };
    }
  }
  const run = checked(
    await db.rpc('claim_opt_forecast_run', {
      p_day: cutoff.slice(0, 10),
      p_version: MODEL_VERSION,
    }),
    'run claim'
  ) as { id?: string; state: string };
  if (run.state === 'already_refreshed' || run.state === 'busy')
    return { ok: true, state: run.state };
  if (!run.id) throw new Error('OPT forecast run claim invalid');
  if (!p.uscis_training_authorized)
    return {
      ok: true,
      state: 'review_required',
      reason:
        'USCIS agreement and privacy authorization for cross-case training must be recorded first.',
    };
  try {
    const histories = await loadCaseHistories(db);
    // The stored (possibly unconfirmed) category is used, as in the validated run.
    const observations = reconstructObservations(histories, {
      landmarks: [],
      assumeCategory: true,
    });
    const timelines = normalizeObservations(observations, cutoff);
    const curves: Record<string, Curve> = {};
    for (const kind of ['initial_opt', 'stem_extension'] as const)
      for (const processing of ['regular_unconfirmed', 'premium'] as const) {
        curves[`${kind}:${processing}`] = fitCurve(
          trainingRecords(observations, cutoff, kind, processing)
        );
      }
    const landmarks = [90, 60, 30, 14, 7].map(
      (n) => addDays(cutoff, -n) + 'T23:59:59.999Z'
    );
    // Prospective archive check, kept to monitor live accuracy as outcomes arrive.
    const report = await runBacktest(db, landmarks, cutoff);
    const ids = [...new Set(observations.map((o) => o.case_id))];
    // Insert memberships BEFORE publishing curves. FK failure means deletion raced us:
    // abort the entire run, so a deleted applicant never remains in a served model.
    for (let i = 0; i < ids.length; i += 200)
      checked(
        await db.from('opt_forecast_run_cases').upsert(
          ids.slice(i, i + 200).map((case_id) => ({ run_id: run.id, case_id })),
          { onConflict: 'run_id,case_id' }
        ),
        'membership write'
      );
    // Only pending cases need a stored daily forecast; this bounds storage growth.
    const pending = timelines.filter((t) => t.outcome === 'pending');
    for (let i = 0; i < pending.length; i += 100) {
      const batch = pending.slice(i, i + 100).flatMap((t) =>
        t.caseIds.map((case_id) => ({
          case_id,
          run_id: run.id,
          calculated_at: cutoff,
          payload: {
            ...predict(t, curves[`${t.kind}:${t.processing}`] ?? null, cutoff),
            modelUpdatedAt: cutoff,
          },
        }))
      );
      if (batch.length)
        checked(
          await db.from('opt_case_forecasts').insert(batch),
          'prediction write'
        );
    }
    const done = checked(
      await db
        .from('opt_forecast_runs')
        .update({ state: 'ready', curves, report, completed_at: cutoff })
        .eq('id', run.id)
        .select('id')
        .maybeSingle(),
      'run completion'
    );
    if (!done) throw new Error('OPT forecast run invalidated during refresh');
    return {
      ok: true,
      state: 'ready',
      applications: timelines.length,
      pendingForecasts: pending.length,
      modelVersion: MODEL_VERSION,
      promotionEligible: report.promotionEligible,
    };
  } catch {
    const failure = await db
      .from('opt_forecast_runs')
      .update({ state: 'error', curves: null, report: null })
      .eq('id', run.id);
    if (failure.error)
      console.error('OPT forecast failure state persistence failed');
    throw new Error('OPT forecast refresh failed');
  }
}

export async function getCaseForecast(
  db: SupabaseClient,
  caseId: string,
  userId: string,
  now = new Date()
): Promise<Forecast | null> {
  const owned = checked(
    await db
      .from('case_status')
      .select(CASE_COLUMNS)
      .eq('id', caseId)
      .eq('user_id', userId)
      .maybeSingle(),
    'ownership read'
  ) as CaseRow | null;
  if (!owned) return null;
  const cutoff = now.toISOString();
  // Same reconstruction as the daily fit, so the case is read the way it was trained.
  const t =
    normalizeObservations(
      reconstructObservations([toHistory(owned, caseId)], {
        landmarks: [],
        assumeCategory: true,
      }),
      cutoff
    )[0] ?? null;
  let forecast = emptyForecast(
    t,
    cutoff,
    'A successful USCIS check with a confirmed receipt date and application category is needed before this case can be modeled.'
  );
  let runId: string | null = null;
  if (t) {
    forecast = predict(t, null, cutoff);
    if (t.outcome === 'pending') {
      const p = await policy(db);
      const cohort = `${t.kind}:${t.processing}`;
      if (isPromoted(p, cohort)) {
        const run = checked(
          await db
            .from('opt_forecast_runs')
            .select('id,curves,completed_at')
            .eq('model_version', MODEL_VERSION)
            .eq('state', 'ready')
            .order('as_of', { ascending: false })
            .limit(1)
            .maybeSingle(),
          'model read'
        );
        if (
          run &&
          Date.parse(cutoff) - Date.parse(run.completed_at) <=
            48 * 60 * 60 * 1000
        ) {
          forecast = {
            ...predict(
              t,
              (run.curves as Record<string, Curve>)[cohort] ?? null,
              cutoff
            ),
            modelUpdatedAt: run.completed_at,
          };
          runId = run.id;
        } else
          forecast.explanation =
            'The verified forecast model needs a fresh daily update.';
      } else if (forecast.state === 'limited_data')
        forecast = {
          ...forecast,
          state: 'shadow',
          explanation:
            'The daily verified-data prediction is being validated. The historical community comparison remains available below.',
        };
    }
  }
  // The exact delivered forecast is retained, even if tomorrow's conditional estimate changes.
  checked(
    await db.from('opt_case_forecasts').insert({
      case_id: caseId,
      run_id: runId,
      calculated_at: cutoff,
      shown_at: cutoff,
      payload: forecast,
    }),
    'shown forecast write'
  );
  return forecast;
}
