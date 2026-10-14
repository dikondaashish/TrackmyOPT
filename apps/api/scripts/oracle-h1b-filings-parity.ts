import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  FILING_PAGE_LIMIT,
  FILING_PROFILE_COLUMNS,
  OracleH1bFilingsReader,
  type FilingRow,
} from '../src/sponsor-data/oracle-h1b-filings-reader';

/**
 * Read-only parity check for the sponsor-profile filings lookup.
 *
 *   ts-node scripts/oracle-h1b-filings-parity.ts [--sponsors 300]
 *
 * For an evenly spaced sample of h1b_sponsors (main project), runs the
 * Oracle reader and the former Supabase three-step lookup (filings project)
 * and compares the returned filings as sets, field by field.
 */

function argument(name: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function client(url?: string, key?: string) {
  if (!url || !key) throw new Error('Supabase credentials are not configured');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

const COLUMNS = FILING_PROFILE_COLUMNS.join(', ');

async function supabaseLookup(
  filings: SupabaseClient,
  sponsorId: string,
  name: string | null,
): Promise<Record<string, unknown>[]> {
  const base = () =>
    filings
      .from('h1b_filings')
      .select(COLUMNS)
      .order('received_date', { ascending: false })
      .limit(FILING_PAGE_LIMIT);
  const steps = [
    () => base().eq('sponsor_id', sponsorId),
    ...(name
      ? [
          () => base().eq('employer_name', name),
          () => base().ilike('employer_name', name),
        ]
      : []),
  ];
  for (const step of steps) {
    const { data, error } = await step();
    if (error) throw new Error(`Supabase lookup failed: ${error.message}`);
    const rows = (data ?? []) as unknown as Record<string, unknown>[];
    if (rows.length) return rows;
  }
  return [];
}

function canonical(row: Record<string, unknown> | FilingRow) {
  return JSON.stringify(
    FILING_PROFILE_COLUMNS.map((name) => {
      const value = row[name];
      if (value === null || value === undefined || value === '') return null;
      if (typeof value === 'number' || typeof value === 'string') return value;
      return JSON.stringify(value);
    }),
  );
}

async function main() {
  const sampleSize = Number(argument('--sponsors') ?? 300);
  const main = client(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
  const filings = client(
    process.env.SUPABASE_FILINGS_URL,
    process.env.SUPABASE_FILINGS_SERVICE_ROLE_KEY,
  );
  const reader = new OracleH1bFilingsReader(process.env);

  // Keyset-walk sponsor ids (avoids deep offsets) and keep every Nth one.
  const sponsors: { id: string; name: string | null }[] = [];
  let lastId: string | null = null;
  let seen = 0;
  const every = Math.max(1, Math.floor(24_682 / sampleSize));
  for (;;) {
    let query = main
      .from('h1b_sponsors')
      .select('id, name')
      .order('id')
      .limit(1000);
    if (lastId) query = query.gt('id', lastId);
    const { data, error } = await query;
    if (error) throw new Error(`Sponsor scan failed: ${error.message}`);
    const rows = (data ?? []) as { id: string; name: string | null }[];
    if (!rows.length) break;
    for (const row of rows) {
      if (seen % every === 0 && sponsors.length < sampleSize)
        sponsors.push(row);
      seen += 1;
    }
    lastId = rows[rows.length - 1].id;
  }

  let compared = 0;
  let withFilings = 0;
  let filingRows = 0;
  let countMismatches = 0;
  let rowMismatches = 0;
  let oracleMs = 0;
  let supabaseMs = 0;
  const failures: string[] = [];
  try {
    for (const sponsor of sponsors) {
      let started = Date.now();
      const oracle = await reader.listFilings(
        sponsor.id,
        sponsor.name ?? undefined,
      );
      oracleMs += Date.now() - started;
      started = Date.now();
      const source = await supabaseLookup(filings, sponsor.id, sponsor.name);
      supabaseMs += Date.now() - started;

      compared += 1;
      if (source.length) withFilings += 1;
      filingRows += source.length;
      if (oracle.length !== source.length) {
        countMismatches += 1;
        if (failures.length < 10)
          failures.push(
            `count sponsor#${compared}: oracle=${oracle.length} supabase=${source.length}`,
          );
        continue;
      }
      // Ties on received_date have no defined order in either database, and
      // a 500-row cap can cut ties differently; compare sets below the cap.
      const expected = new Set(source.map(canonical));
      const differing = oracle.filter((row) => !expected.has(canonical(row)));
      if (differing.length && source.length < FILING_PAGE_LIMIT) {
        rowMismatches += differing.length;
        if (failures.length < 10)
          failures.push(
            `rows sponsor#${compared}: ${differing.length} differ (column-level detail withheld)`,
          );
      }
    }
  } finally {
    await reader.close();
  }

  const passed = countMismatches === 0 && rowMismatches === 0;
  console.log(
    JSON.stringify({
      status: passed ? 'parity' : 'mismatch',
      sponsorsCompared: compared,
      sponsorsWithFilings: withFilings,
      filingRowsCompared: filingRows,
      countMismatches,
      rowMismatches,
      avgOracleMs: Math.round(oracleMs / Math.max(1, compared)),
      avgSupabaseMs: Math.round(supabaseMs / Math.max(1, compared)),
      failures,
    }),
  );
  if (!passed) process.exitCode = 1;
}

if (require.main === module) {
  main().catch((error) => {
    console.error(
      JSON.stringify({
        status: 'failed',
        code: (error as { code?: unknown })?.code,
        message:
          error instanceof Error ? error.message.split('\n')[0] : 'failed',
      }),
    );
    process.exitCode = 1;
  });
}
