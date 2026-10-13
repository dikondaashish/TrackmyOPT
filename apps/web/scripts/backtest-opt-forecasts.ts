/** Run from apps/web. Receipts, rows and credentials are never printed or exported. */
import { readFileSync, writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { addDays } from '../lib/opt-forecast/normalize';
import { backtest } from '../lib/opt-forecast/backtest';
import { runBacktest } from '../lib/opt-forecast/service';

async function main() {
  const args = process.argv.slice(2);
  const option = (name: string) => {
    const i = args.indexOf(name);
    return i < 0 ? undefined : args[i + 1];
  };
  const cutoff = option('--as-of') ?? new Date().toISOString();
  if (!Number.isFinite(Date.parse(cutoff)))
    throw new Error('Invalid evaluation cutoff');
  const landmarks = (
    option('--landmarks')?.split(',') ??
    [90, 60, 30, 14, 7].map((n) => addDays(cutoff, -n))
  ).map((d) => (d.includes('T') ? d : d + 'T23:59:59.999Z'));
  if (landmarks.some((d) => !Number.isFinite(Date.parse(d)) || d >= cutoff))
    throw new Error('Invalid historical landmarks');
  let report;
  const fixture = option('--fixture');
  if (args.includes('--empty-readiness'))
    report = backtest({
      observations: [],
      community: [],
      landmarks,
      evaluationCutoff: cutoff,
    });
  else if (fixture) {
    const data = JSON.parse(readFileSync(fixture, 'utf8'));
    report = backtest({
      observations: data.observations,
      community: data.community,
      landmarks,
      evaluationCutoff: cutoff,
    });
  } else {
    const project = option('--project');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!project || url !== `https://${project}.supabase.co` || !key)
      throw new Error(
        'Explicit matching project and server environment required'
      );
    const db = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await db
      .from('opt_forecast_policy')
      .select('uscis_training_authorized')
      .eq('singleton', true)
      .single();
    if (error || !data?.uscis_training_authorized)
      throw new Error('Pooled evidence review is required before evaluation');
    report = await runBacktest(db, landmarks, cutoff);
  }
  const out = option('--out');
  if (out)
    writeFileSync(out, JSON.stringify(report, null, 2) + '\n', { mode: 0o600 });
  console.log(
    JSON.stringify({
      ok: true,
      asOf: report.asOf,
      models: report.models,
      promotionEligible: report.promotionEligible,
    })
  );
}
main().catch(() => {
  console.error(
    'OPT forecast evaluation failed. Check project access, authorization and input dates; no private details were logged.'
  );
  process.exitCode = 1;
});
