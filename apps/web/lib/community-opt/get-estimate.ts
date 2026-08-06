import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { inferCaseKind, serviceCenterFromReceipt } from "./centers";
import {
  buildEstimateFromSamples,
  buildHeatmap,
  buildProcessingHistogram,
  selectCohort,
  type ProcessingHistogram,
  type TimelineSample,
} from "./estimate";
import {
  buildWeeklyProcessingTrend,
  filterMatureRows,
  type WeeklyTrendPoint,
} from "./weekly-trend";
import {
  buildSimilarFilingPeers,
  type SimilarFilingPeers,
} from "./similar-filing";
import { buildJourneyStages, type JourneyStages, type StageRow } from "./stages";
import type { CommunityEstimate, CommunityHeatmapRow } from "./types";

export type CommunityEstimateQuery = {
  /** First 3 receipt characters only — enough to infer the service center. */
  receiptPrefix?: string | null;
  caseType?: string | null;
  label?: string | null;
  ppStartDate?: string | null;
  receivedDate?: string | null;
  daysSinceFiled?: number;
};

export type CommunityEstimateResult = {
  prediction: CommunityEstimate | null;
  heatmap: CommunityHeatmapRow[];
  weeklyTrend: WeeklyTrendPoint[];
  histogram: ProcessingHistogram | null;
  similarFiling: SimilarFilingPeers | null;
  stages: JourneyStages | null;
};

const SELECT_COLUMNS =
  "days_to_approval, approve_date, init_date, biometrics_date, card_produce_date, delivered_date, service_center, premium_processing, case_kind";
/** PostgREST caps a single response at the project's `max_rows` (1000 by
 *  default), so a plain `.limit()` silently truncates. */
const PAGE_SIZE = 1000;
const MAX_PAGES = 20;

type TimelineRow = {
  days_to_approval: number | null;
  approve_date: string | null;
  init_date: string | null;
  biometrics_date: string | null;
  card_produce_date: string | null;
  delivered_date: string | null;
  service_center: string | null;
  premium_processing: boolean | null;
  case_kind: string;
};

/**
 * Page through every matching row.
 *
 * Truncating here is not a size problem but a correctness one: rows come back
 * in physical order, which groups by the source they were ingested from, so a
 * truncated read would silently compute every estimate from one partner's
 * cases only.
 *
 * Rows without an approval duration are kept. They are useless to the estimate,
 * which filters them out itself, but they are most of the biometrics evidence:
 * a case reports its fingerprint date long before it reports a decision, so
 * filtering on `days_to_approval` here would discard the majority of the
 * sample for the earliest stage of the wait.
 */
export async function fetchAllTimelines(
  supabase: SupabaseClient,
  caseKind: string
): Promise<TimelineRow[]> {
  const all: TimelineRow[] = [];
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const from = page * PAGE_SIZE;
    const { data, error } = await supabase
      .from("community_opt_timelines")
      .select(SELECT_COLUMNS)
      .eq("case_kind", caseKind)
      .range(from, from + PAGE_SIZE - 1);

    if (error) break;
    const rows = (data ?? []) as unknown as TimelineRow[];
    all.push(...rows);
    if (rows.length < PAGE_SIZE) break;
  }
  return all;
}

/**
 * Load cleaned partner timelines and build a matched processing-time estimate.
 */
export async function getCommunityEstimate(
  query: CommunityEstimateQuery
): Promise<CommunityEstimateResult> {
  const empty: CommunityEstimateResult = {
    prediction: null,
    heatmap: [],
    weeklyTrend: [],
    histogram: null,
    similarFiling: null,
    stages: null,
  };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return empty;

  const caseKind = inferCaseKind({
    caseType: query.caseType,
    label: query.label,
  });
  const serviceCenter = serviceCenterFromReceipt(query.receiptPrefix);
  const premiumProcessing = Boolean(query.ppStartDate?.trim());
  const daysSinceFiled = Math.max(0, Math.floor(query.daysSinceFiled ?? 0));

  const supabase = createClient(url, key);
  const data = await fetchAllTimelines(supabase, caseKind);
  if (!data.length) return empty;

  const rows: TimelineSample[] = data
    .filter((r) => typeof r.days_to_approval === "number")
    .map((r) => ({
      days_to_approval: r.days_to_approval as number,
      approve_date: r.approve_date,
      init_date: r.init_date,
      service_center: (r.service_center ?? null) as TimelineSample["service_center"],
      premium_processing: Boolean(r.premium_processing),
      case_kind: r.case_kind as TimelineSample["case_kind"],
    }));

  const { samples, matchLevel } = selectCohort(rows, {
    caseKind,
    serviceCenter,
    premiumProcessing,
  });

  const prediction = buildEstimateFromSamples(samples, {
    daysSinceFiled,
    receivedDate: query.receivedDate ?? null,
    matchLevel,
    caseKind,
    serviceCenter,
    premiumProcessing,
  });

  const heatmap = buildHeatmap(samples.length ? samples : rows);

  // Trend and histogram use the same premium-processing segment as the
  // estimate — mixing PP and regular cases makes both meaningless, since the
  // two populations differ by roughly a factor of two (the histogram in
  // particular comes out bimodal).
  const segment = rows.filter(
    (r) => r.premium_processing === premiumProcessing
  );
  const weeklyTrend = buildWeeklyProcessingTrend(segment);
  const histogram = buildProcessingHistogram(
    filterMatureRows(samples.length ? samples : segment).map(
      (r) => r.days_to_approval
    )
  );
  const similarFiling = buildSimilarFilingPeers(rows, {
    receivedDate: query.receivedDate ?? null,
    premiumProcessing,
  });

  // Stage waits come off the raw rows, not `rows`: a case reports its
  // biometrics date long before it reports a decision, and TimelineSample
  // requires an approval duration those rows do not have yet.
  const stageRows: StageRow[] = data.map((r) => ({
    init_date: r.init_date,
    biometrics_date: r.biometrics_date,
    approve_date: r.approve_date,
    card_produce_date: r.card_produce_date,
    delivered_date: r.delivered_date,
    premium_processing: Boolean(r.premium_processing),
  }));
  const stages = buildJourneyStages(stageRows, { premiumProcessing });

  return { prediction, heatmap, weeklyTrend, histogram, similarFiling, stages };
}
