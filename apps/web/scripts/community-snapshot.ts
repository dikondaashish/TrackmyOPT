/**
 * Monthly community timeline snapshot for the "timelines reported by users"
 * data posts.
 *
 *   pnpm exec tsx scripts/community-snapshot.ts            # writes data/community-snapshots/<today>.json
 *   pnpm exec tsx scripts/community-snapshot.ts --stdout   # prints instead of writing
 *
 * Reads the anonymised community_opt_timelines table (read-only) with the
 * service-role key from .env.local and writes aggregates only: cohort sizes,
 * medians and quartiles. No rows, IDs, dates of individual cases or receipt
 * numbers leave the database. The same usable-duration filter and percentile
 * function as the public decision-window estimate are used, so the post and
 * the tool can never disagree about the method.
 *
 * Receipt-month cohorts below MIN_COHORT_FOR_ESTIMATE completed cases are
 * reported as suppressed, the same threshold the tool uses.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import {
  MIN_COHORT_FOR_ESTIMATE,
  isUsableDuration,
  percentile,
} from '@/lib/community-opt/estimate';

type Row = {
  case_kind: string;
  premium_processing: boolean;
  init_date: string | null;
  days_to_approval: number | null;
};

type Stats = { n: number; median: number; p25: number; p75: number };

const PAGE_SIZE = 1000;
const MAX_PAGES = 20;

function loadEnv(file: string) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]!]) process.env[m[1]!] = m[2]!.replace(/^["']|["']$/g, '');
  }
}

export function stats(days: number[]): Stats {
  const sorted = [...days].sort((a, b) => a - b);
  return {
    n: sorted.length,
    median: percentile(sorted, 0.5),
    p25: percentile(sorted, 0.25),
    p75: percentile(sorted, 0.75),
  };
}

/** Pure aggregation, exported for the unit test. */
export function summarise(rows: Row[]) {
  const usable = rows.filter((r) => isUsableDuration(r.days_to_approval));
  const out: Record<string, unknown> = {};
  for (const kind of ['initial_opt', 'stem_extension']) {
    for (const premium of [false, true]) {
      const group = usable.filter((r) => r.case_kind === kind && r.premium_processing === premium);
      const byMonth = new Map<string, number[]>();
      for (const r of group) {
        const month = r.init_date?.slice(0, 7);
        if (!month || !/^\d{4}-\d{2}$/.test(month)) continue;
        byMonth.set(month, [...(byMonth.get(month) ?? []), r.days_to_approval as number]);
      }
      out[`${kind}${premium ? '_premium' : ''}`] = {
        pooled: stats(group.map((r) => r.days_to_approval as number)),
        byReceiptMonth: [...byMonth.entries()]
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([month, days]) =>
            days.length >= MIN_COHORT_FOR_ESTIMATE
              ? { month, ...stats(days) }
              : { month, n: days.length, suppressed: true }
          ),
      };
    }
  }
  return out;
}

async function main() {
  loadEnv(path.join(process.cwd(), '.env.local'));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const rows: Row[] = [];
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const from = page * PAGE_SIZE;
    const { data, error } = await supabase
      .from('community_opt_timelines')
      .select('case_kind, premium_processing, init_date, days_to_approval')
      .order('id', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(`Query failed: ${error.message}`);
    rows.push(...((data ?? []) as Row[]));
    if ((data ?? []).length < PAGE_SIZE) break;
    if (page === MAX_PAGES - 1) throw new Error('Pagination limit reached; raise MAX_PAGES');
  }

  const today = new Date().toISOString().slice(0, 10);
  const snapshot = {
    snapshotDate: today,
    method:
      'Completed cases with a usable receipt-to-approval duration (7 to 400 calendar days), split by case kind and premium processing. Receipt-month cohorts with fewer than ' +
      `${MIN_COHORT_FOR_ESTIMATE} completed cases are suppressed. Durations are calendar days. Community-reported data, not USCIS data.`,
    rowsRead: rows.length,
    ...summarise(rows),
  };

  const json = `${JSON.stringify(snapshot, null, 2)}\n`;
  if (process.argv.includes('--stdout')) {
    process.stdout.write(json);
    return;
  }
  const dir = path.join(process.cwd(), 'data/community-snapshots');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${today}.json`);
  fs.writeFileSync(file, json);
  console.log(`Wrote ${path.relative(process.cwd(), file)} (${rows.length} rows read)`);
}

if (process.argv[1]?.endsWith('community-snapshot.ts')) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
