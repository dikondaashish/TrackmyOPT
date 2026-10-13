import type { CommunityObservation } from './backtest';
import { addDays, isoDay } from './normalize';
import type { Observation } from './types';

/**
 * RETROSPECTIVE evaluation only. Rebuilds what each enrolled case's USCIS history
 * showed on past dates, from the dated events in today's stored history. This is
 * weaker than the prospective archive: USCIS posting delays and history rewrites
 * are invisible, and the tracked population is self-selected. Never feed these
 * synthetic observations into the served model or the immutable evidence tables.
 */
export type CaseHistoryRow = {
  case_id: string;
  application_id: string;
  case_type: string | null;
  received_date: string | null;
  current_status: string | null;
  status_history: unknown;
  last_checked_at: string | null;
  filing_category: string | null;
  filing_category_confirmed_at: string | null;
  reported_filing_date: string | null;
  reported_premium_start: string | null;
  pp_start_date: string | null;
};
export type CommunityTimelineRow = {
  id: string;
  external_id: string;
  case_kind: string;
  premium_processing: boolean;
  init_date: string | null;
  approve_date: string | null;
  days_to_approval: number | null;
};

const at = (day: string) => day + 'T12:00:00.000Z';

function datedEvents(history: unknown) {
  if (!Array.isArray(history)) return [];
  return history
    .map((e) => ({
      status: typeof e?.status === 'string' ? e.status : '',
      date: isoDay(typeof e?.date === 'string' ? e.date : null),
    }))
    .filter((e): e is { status: string; date: string } => !!e.status && !!e.date)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * One synthetic check every `stepDays` from receipt, plus one on each landmark,
 * plus today's real check. A check on day d sees only events dated <= d.
 * `assumeCategory` is a sensitivity analysis: it treats the stored but
 * unconfirmed category as confirmed.
 */
export function reconstructObservations(
  rows: CaseHistoryRow[],
  opts: { landmarks: string[]; stepDays?: number; assumeCategory?: boolean }
): Observation[] {
  const step = opts.stepDays ?? 14;
  const landmarkDays = opts.landmarks.map((l) => l.slice(0, 10));
  const out: Observation[] = [];
  let id = 0;
  for (const row of rows) {
    const events = datedEvents(row.status_history);
    const today = isoDay(row.last_checked_at);
    const start = isoDay(row.received_date) ?? events[0]?.date ?? null;
    if (!today || !start || start > today || !row.current_status) continue;
    const confirmedAt =
      row.filing_category_confirmed_at ??
      (opts.assumeCategory ? at(start) : null);
    const checkDays = new Set<string>([today]);
    for (let d = start; d < today; d = addDays(d, step)) checkDays.add(d);
    for (const d of landmarkDays) if (d >= start && d < today) checkDays.add(d);
    for (const d of [...checkDays].sort()) {
      const seen = events.filter((e) => e.date <= d);
      const isToday = d === today;
      if (!isToday && !seen.length) continue;
      const known = (value: string | null) =>
        value && (isToday || value <= d) ? value : null;
      out.push({
        id: ++id,
        case_id: row.case_id,
        application_id: row.application_id,
        observed_at: isToday ? row.last_checked_at! : at(d),
        synced_at: isToday ? row.last_checked_at! : at(d),
        provider: {
          status: isToday ? row.current_status : seen.at(-1)!.status,
          form: row.case_type ?? '',
          received: known(row.received_date),
          events: seen.map((e) => ({ date: e.date, status: e.status })),
        },
        reported: {
          category: row.filing_category,
          category_confirmed_at: confirmedAt,
          filing_date: known(row.reported_filing_date),
          premium_start: known(row.reported_premium_start),
          legacy_premium_start: known(row.pp_start_date),
        },
      });
    }
  }
  return out;
}

/** Community approvals become visible to the legacy baseline from their approval date. */
export function communityAsOfLandmarks(
  rows: CommunityTimelineRow[],
  landmarks: string[]
): CommunityObservation[] {
  const out: CommunityObservation[] = [];
  let id = 0;
  for (const landmark of [...landmarks].sort())
    for (const r of rows) {
      const approved = isoDay(r.approve_date);
      if (!approved || approved > landmark.slice(0, 10)) continue;
      out.push({
        id: ++id,
        timeline_id: r.id,
        observed_at: landmark,
        payload: {
          external_id: r.external_id,
          case_kind: r.case_kind,
          premium_processing: r.premium_processing,
          init_date: r.init_date,
          approve_date: r.approve_date,
          days_to_approval: r.days_to_approval,
          external_updated_at: null,
        },
      });
    }
  return out;
}
