import { cleanPartnerCase, daysBetweenDates } from './clean';
import { percentile } from './estimate';
import type { CleanedCommunityCase, PartnerCasePayload } from './types';

export type EvidenceRow = Omit<PartnerCasePayload, 'id'> & {
  external_id?: string;
  case_kind: string;
  updated_at?: string | null;
};

export type CommunityEvidence = {
  totalReports: number;
  includedReports: number;
  excludedStale: number;
  excludedOlderImport: number;
  excludedUnknownFreshness: number;
  duplicateIdsRemoved: number;
  /** Reddit posts imported by both partners, counted once. */
  crossSourceDuplicatesRemoved: number;
  possibleCrossSourceDuplicates: number;
  sources: Array<{
    name: string;
    reports: number;
    lastRefreshedAt: string | null;
  }>;
  filingRange: [string, string] | null;
  freshnessDays: number;
};

export type PremiumUpgradeStats = {
  sampleSize: number;
  medianDays: number | null;
  p25Days: number | null;
  p75Days: number | null;
};

export const FRESHNESS_DAYS = 30;
// Vercel allows this import five minutes; one successful batch fits within ten.
const MAX_IMPORT_SPAN_MS = 10 * 60 * 1000;
export function partnerName(id: string) {
  return id.startsWith('optt_')
    ? 'OPT Tracker'
    : id.startsWith('optp_')
      ? 'OPT Pulse'
      : 'Other partner';
}

/** Freshness is last observed in an import, not the date the applicant edited it.
 * Never merge different applicants just because they share filing dates. */
export function prepareEvidence(
  rows: EvidenceRow[],
  now = new Date(),
  latestSourceTimes?: ReadonlyMap<string, number>
) {
  const nowMs = now.getTime();
  const cutoff = nowMs - FRESHNESS_DAYS * 86400000;
  const latestImportBySource = new Map<string, number>();
  for (const row of rows) {
    if (!row.external_id) continue;
    const stamp = Date.parse(row.updated_at ?? '');
    if (!Number.isFinite(stamp) || stamp > nowMs) continue;
    const name = partnerName(row.external_id);
    latestImportBySource.set(name, Math.max(stamp, latestImportBySource.get(name) ?? 0));
  }
  for (const [name, stamp] of latestSourceTimes ?? []) {
    if (Number.isFinite(stamp) && stamp <= nowMs) {
      latestImportBySource.set(name, Math.max(stamp, latestImportBySource.get(name) ?? 0));
    }
  }
  const seen = new Set<string>();
  const sourceRows = new Map<
    string,
    { name: string; reports: number; lastRefreshedAt: string | null }
  >();
  const signatures = new Map<string, string>();
  const evidence: CommunityEvidence = {
    totalReports: rows.length,
    includedReports: 0,
    excludedStale: 0,
    excludedOlderImport: 0,
    excludedUnknownFreshness: 0,
    duplicateIdsRemoved: 0,
    crossSourceDuplicatesRemoved: 0,
    possibleCrossSourceDuplicates: 0,
    sources: [],
    filingRange: null,
    freshnessDays: FRESHNESS_DAYS,
  };
  const included = [];
  for (const raw of rows) {
    const id = raw.external_id;
    if (!id) {
      evidence.excludedUnknownFreshness++;
      continue;
    }
    if (seen.has(id)) {
      evidence.duplicateIdsRemoved++;
      continue;
    }
    seen.add(id);
    const stamp = Date.parse(raw.updated_at ?? '');
    const validStamp = Number.isFinite(stamp) && stamp <= nowMs;
    const name = partnerName(id);
    const source = sourceRows.get(name) ?? {
      name,
      reports: 0,
      lastRefreshedAt: null,
    };
    source.reports++;
    if (
      validStamp &&
      (!source.lastRefreshedAt || stamp > Date.parse(source.lastRefreshedAt))
    ) {
      source.lastRefreshedAt = new Date(stamp).toISOString();
    }
    sourceRows.set(name, source);
    if (!validStamp) {
      evidence.excludedUnknownFreshness++;
      continue;
    }
    if (stamp < cutoff) {
      evidence.excludedStale++;
      continue;
    }
    if (stamp < (latestImportBySource.get(name) ?? stamp) - MAX_IMPORT_SPAN_MS) {
      evidence.excludedOlderImport++;
      continue;
    }
    const row = cleanPartnerCase({ ...raw, id, type: raw.case_kind }, now);
    if (!row) continue;
    included.push(row);
  }
  const kept = removeCrossPartnerRedditDuplicates(included);
  evidence.crossSourceDuplicatesRemoved = included.length - kept.length;
  for (const row of kept) {
    const name = partnerName(row.external_id);
    // Surface remaining possible overlap without claiming to identify unique people.
    if (
      row.init_date &&
      row.approve_date &&
      row.card_produce_date &&
      row.delivered_date
    ) {
      const signature = JSON.stringify([
        row.case_kind,
        row.premium_processing,
        row.service_center,
        row.init_date,
        row.pp_date,
        row.approve_date,
        row.card_produce_date,
        row.delivered_date,
      ]);
      const prior = signatures.get(signature);
      if (prior && prior !== name) evidence.possibleCrossSourceDuplicates++;
      else signatures.set(signature, name);
    }
  }
  evidence.includedReports = kept.length;
  // The evidence object is returned to the browser; keep partner names internal.
  evidence.sources = [...sourceRows.values()].map((source, index) => ({
    ...source,
    name: `Community source ${index + 1}`,
  }));
  const dates = kept
    .flatMap((r) => (r.init_date ? [r.init_date] : []))
    .sort();
  evidence.filingRange = dates.length
    ? [dates[0], dates[dates.length - 1]]
    : null;
  return { rows: kept, evidence };
}

const PAIR_CHECK_FIELDS = [
  'biometrics_date',
  'pp_date',
  'card_produce_date',
  'delivered_date',
  'service_center',
] as const;
const COMPLETENESS_FIELDS = [
  ...PAIR_CHECK_FIELDS,
  'nationality',
  'rfe_date',
  'noid_date',
  'biometrics_requested_date',
] as const;

/**
 * OPT Pulse collects r/f1visa comments, and most OPT Tracker reports are
 * imported from Reddit too, so one Reddit post can arrive through both
 * partners. Count such a pair once.
 *
 * Only a Reddit-sourced OPT Tracker report and a Reddit-sourced OPT Pulse
 * report can pair, and only with the same OPT type, processing, filing date
 * and approval date and no conflicting other date or service center. Each
 * report pairs at most once, so two applicants with identical dates are never
 * folded into one unless both partners carry both of them. Reports from the
 * same partner, or non-Reddit reports, are never merged. The more complete
 * report of a pair is kept (ties keep OPT Tracker).
 *
 * Evidence (Nov 18, 2026): 2,157 of 2,863 OPT Pulse approvals matched an OPT
 * Tracker Reddit report this way, but only 22 matched OPT Tracker's directly
 * registered reports, which are about a third of its feed. Coincidental
 * matches would hit both alike.
 */
export function removeCrossPartnerRedditDuplicates<
  T extends Pick<
    CleanedCommunityCase,
    | 'external_id'
    | 'source'
    | 'case_kind'
    | 'premium_processing'
    | 'init_date'
    | 'approve_date'
  > &
    Partial<CleanedCommunityCase>,
>(rows: T[]): T[] {
  const groups = new Map<string, { tracker: T[]; pulse: T[] }>();
  for (const row of rows) {
    if (row.source !== 'reddit' || !row.init_date || !row.approve_date) continue;
    const partner = row.external_id.startsWith('optt_')
      ? 'tracker'
      : row.external_id.startsWith('optp_')
        ? 'pulse'
        : null;
    if (!partner) continue;
    const key = JSON.stringify([
      row.case_kind,
      row.premium_processing,
      row.init_date,
      row.approve_date,
    ]);
    const group = groups.get(key) ?? { tracker: [], pulse: [] };
    group[partner].push(row);
    groups.set(key, group);
  }
  const compatible = (a: T, b: T) =>
    PAIR_CHECK_FIELDS.every((field) => {
      const x = a[field];
      const y = b[field];
      return x == null || y == null || x === y;
    });
  const completeness = (row: T) =>
    COMPLETENESS_FIELDS.filter((field) => row[field] != null).length;
  const byId = (a: T, b: T) => a.external_id.localeCompare(b.external_id);
  const drop = new Set<string>();
  for (const { tracker, pulse } of groups.values()) {
    if (!tracker.length || !pulse.length) continue;
    const unpaired = [...tracker].sort(byId);
    for (const p of [...pulse].sort(byId)) {
      const index = unpaired.findIndex((t) => compatible(t, p));
      if (index < 0) continue;
      const [t] = unpaired.splice(index, 1);
      drop.add(
        completeness(p) > completeness(t) ? t.external_id : p.external_id
      );
    }
  }
  return drop.size ? rows.filter((row) => !drop.has(row.external_id)) : rows;
}

/** Calendar days after an explicitly reported upgrade, NOT the USCIS action clock.
 * Same-day approvals are valid; missing/reversed/future pairs are excluded. */
export function premiumUpgradeStats(
  rows: EvidenceRow[],
  now = new Date()
): PremiumUpgradeStats {
  const days = rows
    .flatMap((raw) => {
      const row = cleanPartnerCase(
        { ...raw, id: raw.external_id || 'sample', type: raw.case_kind },
        now
      );
      if (!row?.premium_processing || !row.pp_date || !row.approve_date)
        return [];
      const duration = daysBetweenDates(row.pp_date, row.approve_date);
      return duration !== null && duration <= 400 ? [duration] : [];
    })
    .sort((a, b) => a - b);
  return {
    sampleSize: days.length,
    medianDays: days.length >= 15 ? percentile(days, 0.5) : null,
    p25Days: days.length >= 15 ? percentile(days, 0.25) : null,
    p75Days: days.length >= 15 ? percentile(days, 0.75) : null,
  };
}
