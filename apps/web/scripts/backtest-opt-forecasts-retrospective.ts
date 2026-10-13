/**
 * RETROSPECTIVE accuracy check (read-only). Run from apps/web:
 *   pnpm exec tsx --env-file=.env.local scripts/backtest-opt-forecasts-retrospective.ts \
 *     --project deknauqkqqzwuvopqott --landmarks 2026-05-01,2026-06-01 --out /private/path.json
 * Receipts stay in memory (hashed to an internal id); only aggregates are written.
 * No USCIS calls and no database writes.
 */
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { backtest } from '../lib/opt-forecast/backtest';
import { fatalFlags, normalizeObservations } from '../lib/opt-forecast/normalize';
import {
  communityAsOfLandmarks,
  reconstructObservations,
  type CaseHistoryRow,
  type CommunityTimelineRow,
} from '../lib/opt-forecast/retrospective';

async function readAll<T>(
  db: SupabaseClient,
  table: string,
  columns: string
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db
      .from(table)
      .select(columns)
      .order('id')
      .range(from, from + 999);
    if (error) throw new Error(`${table} read failed`);
    rows.push(...((data ?? []) as T[]));
    if (!data || data.length < 1000) return rows;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const option = (name: string) => {
    const i = args.indexOf(name);
    return i < 0 ? undefined : args[i + 1];
  };
  const project = option('--project');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!project || url !== `https://${project}.supabase.co` || !key)
    throw new Error('Explicit matching project and server environment required');
  const cutoff = new Date().toISOString();
  const landmarks = (option('--landmarks') ?? '')
    .split(',')
    .filter(Boolean)
    .map((d) => d + 'T23:59:59.999Z');
  if (!landmarks.length || landmarks.some((d) => !Number.isFinite(Date.parse(d)) || d >= cutoff))
    throw new Error('Invalid historical landmarks');

  const db = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const policy = await db
    .from('opt_forecast_policy')
    .select('uscis_training_authorized')
    .eq('singleton', true)
    .single();
  if (policy.error || !policy.data?.uscis_training_authorized)
    throw new Error('Pooled evidence review is required before evaluation');

  const cases = (
    await readAll<Omit<CaseHistoryRow, 'case_id' | 'application_id'> & {
      id: string;
      receipt_number: string | null;
    }>(
      db,
      'case_status',
      'id,receipt_number,case_type,received_date,current_status,status_history,last_checked_at,filing_category,filing_category_confirmed_at,reported_filing_date,reported_premium_start,pp_start_date'
    )
  )
    .filter((r) => r.receipt_number?.trim())
    .map(({ id, receipt_number, ...rest }) => ({
      ...rest,
      case_id: id,
      application_id: createHash('sha256')
        .update(receipt_number!.trim().toUpperCase())
        .digest('hex')
        .slice(0, 32),
    }));
  const community = await readAll<CommunityTimelineRow>(
    db,
    'community_opt_timelines',
    'id,external_id,case_kind,premium_processing,init_date,approve_date,days_to_approval'
  );
  const communityRows = communityAsOfLandmarks(community, landmarks);

  const variants: Record<string, unknown> = {};
  for (const [name, assumeCategory] of [
    ['confirmed_category_only', false],
    ['stored_category_assumed', true],
  ] as const) {
    const observations = reconstructObservations(cases, { landmarks, assumeCategory });
    const finalTimelines = normalizeObservations(observations, cutoff);
    const exclusions: Record<string, number> = {};
    for (const t of finalTimelines)
      for (const f of t.flags.filter((f) => fatalFlags.has(f)))
        exclusions[f] = (exclusions[f] ?? 0) + 1;
    const outcomes: Record<string, number> = {};
    for (const t of finalTimelines)
      outcomes[t.outcome] = (outcomes[t.outcome] ?? 0) + 1;
    variants[name] = {
      applications: finalTimelines.length,
      outcomes,
      fatalExclusions: exclusions,
      report: backtest({
        observations,
        community: communityRows,
        landmarks,
        evaluationCutoff: cutoff,
      }),
    };
  }
  const result = {
    kind: 'retrospective',
    generatedAt: cutoff,
    landmarks,
    enrolledCases: cases.length,
    communityTimelines: community.length,
    caveats: [
      'Past states are rebuilt from dated events in the current USCIS history, not from archived checks.',
      'USCIS posting delays and history rewrites are invisible; tracked users are self-selected.',
      'A_legacy uses community approvals dated on or before each landmark; reporting lag is ignored.',
    ],
    variants,
  };
  const out = option('--out');
  if (out) writeFileSync(out, JSON.stringify(result, null, 2) + '\n', { mode: 0o600 });
  console.log('Retrospective evaluation complete.');
}
main().catch((error: unknown) => {
  console.error(
    'Retrospective OPT evaluation failed:',
    error instanceof Error ? error.message : 'unknown error'
  );
  process.exitCode = 1;
});
