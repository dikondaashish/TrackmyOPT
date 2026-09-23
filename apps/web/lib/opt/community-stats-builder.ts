import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { normalizeStatusHistory } from '@/lib/case-status/normalize-status-history';
import { calendarDateISO } from '@/lib/immigration/calendar-days';

export type ToolType = 'opt-apply' | 'opt-clock' | 'stem-apply' | 'stem-clock';
export interface CommunityStatsBlock {
  mainStat: { value: number | null; label: string; unit: string };
  secondaryStat: { value: number | null; label: string };
  trend: 'faster' | 'slower' | 'stable';
  recentReports: {
    value: number;
    label: string;
    timestamp: string;
    positive: boolean;
  }[];
  lastUpdated: string;
  sampleSize: number;
  dataSource: 'trackmyopt' | 'insufficient';
}
export type ApprovalRow = Pick<
  Database['public']['Tables']['case_status']['Row'],
  | 'receipt_number'
  | 'user_id'
  | 'received_date'
  | 'status_history'
  | 'current_status'
  | 'case_type'
  | 'filing_category'
  | 'filing_category_confirmed_at'
  | 'pp_start_date'
>;

const DAY = 86400000;
const TTL = 3600000;
let cache: { at: number; data: Record<ToolType, CommunityStatsBlock> } | null =
  null;

function unavailable(now: Date): CommunityStatsBlock {
  return {
    mainStat: {
      value: null,
      label: 'Median recorded approval time',
      unit: 'days',
    },
    secondaryStat: {
      value: null,
      label: 'Sample approvals in the last 7 days',
    },
    trend: 'stable',
    recentReports: [],
    sampleSize: 0,
    dataSource: 'insufficient',
    lastUpdated: now.toISOString(),
  };
}

/** Only explicitly classified, dated records; never invent activity when samples are sparse. */
export function aggregateApprovalStats(
  rows: ApprovalRow[],
  category: 'initial_opt' | 'stem_extension',
  now = new Date()
): CommunityStatsBlock {
  const seen = new Set<string>();
  const samples: { days: number; time: number; user: string }[] = [];
  for (const row of rows) {
    if (
      row.filing_category !== category ||
      !row.filing_category_confirmed_at ||
      !row.case_type?.replace(/[^0-9]/g, '').includes('765') ||
      row.pp_start_date
    )
      continue;
    if (
      /denied|revoked|terminated|withdrawn|not approved/i.test(
        row.current_status || ''
      )
    )
      continue;
    const received = row.received_date && calendarDateISO(row.received_date);
    if (!received) continue; // Creation/observation time is not the receipt date.
    const times = normalizeStatusHistory(row.status_history)
      .filter((entry) =>
        /\b(?:case|application) was approved\b/i.test(entry.status)
      )
      .map((entry) => new Date(entry.date).getTime())
      .filter(Number.isFinite)
      .sort((a, b) => a - b);
    const time = times[0];
    if (
      time === undefined ||
      time > now.getTime() ||
      now.getTime() - time > 90 * DAY
    )
      continue;
    const elapsed =
      Math.floor(time / DAY) - Math.floor(Date.parse(received) / DAY);
    if (
      elapsed < 0 ||
      elapsed > 500 ||
      !row.receipt_number ||
      seen.has(row.receipt_number)
    )
      continue;
    seen.add(row.receipt_number);
    samples.push({ days: elapsed, time, user: row.user_id });
  }
  // Suppress small cohorts, including many cases belonging to one person.
  if (
    samples.length < 5 ||
    new Set(samples.map((sample) => sample.user)).size < 5
  )
    return unavailable(now);
  const values = samples.map((sample) => sample.days).sort((a, b) => a - b);
  const mid = Math.floor(values.length / 2);
  const median =
    values.length % 2
      ? values[mid]
      : Math.round((values[mid - 1] + values[mid]) / 2);
  return {
    ...unavailable(now),
    mainStat: {
      value: median,
      label: 'Median recorded approval time',
      unit: 'days',
    },
    secondaryStat: {
      value: samples.filter((sample) => now.getTime() - sample.time <= 7 * DAY)
        .length,
      label: 'Sample approvals in the last 7 days',
    },
    sampleSize: samples.length,
    dataSource: 'trackmyopt',
  };
}

export async function buildCommunityStats(): Promise<
  Record<ToolType, CommunityStatsBlock>
> {
  if (cache && Date.now() - cache.at < TTL) return cache.data;
  const now = new Date();
  const empty = {
    'opt-apply': unavailable(now),
    'stem-apply': unavailable(now),
    'opt-clock': unavailable(now),
    'stem-clock': unavailable(now),
  };
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  )
    return empty;
  const client = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  // Bounded sample. No applicant identifiers, receipt numbers, or raw histories leave the server.
  const { data: cases, error } = await client
    .from('case_status')
    .select(
      'receipt_number,user_id,received_date,status_history,current_status,case_type,filing_category,filing_category_confirmed_at,pp_start_date'
    )
    .in('filing_category', ['initial_opt', 'stem_extension'])
    .not('filing_category_confirmed_at', 'is', null)
    .order('received_date', { ascending: false })
    .limit(1000);
  if (error) throw new Error('Approval statistics query failed');
  const data = {
    ...empty,
    'opt-apply': aggregateApprovalStats(cases ?? [], 'initial_opt', now),
    'stem-apply': aggregateApprovalStats(cases ?? [], 'stem_extension', now),
  };
  cache = { at: now.getTime(), data };
  return data;
}
