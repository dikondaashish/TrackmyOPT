'use client';

import { useEffect, useState } from 'react';
import type { CaseStatus } from '@/components/dashboard/case-status/case-status-section-helpers';
import { daysSinceEpochMs } from '@/lib/case-status/safe-dates';
import { isOptFilingCategory } from '@/lib/case-status/filing-category';
import type { WeeklyTrendPoint } from '@/lib/community-opt/weekly-trend';
import type { ProcessingHistogram } from '@/lib/community-opt/estimate';
import type {
  CommunityEstimate,
  CommunitySummary,
} from '@/lib/community-opt/types';
import type { SimilarFilingPeers } from '@/lib/community-opt/similar-filing';
import type { JourneyStages } from '@/lib/community-opt/stages';
import type {
  CommunityEvidence,
  PremiumUpgradeStats,
} from '@/lib/community-opt/evidence';

/** Community processing-time estimate state for the active case. */
export function useCommunityEstimate(
  caseStatus: CaseStatus | null,
  clientNowMs: number | null,
  enabled = true
) {
  const [communityPrediction, setCommunityPrediction] =
    useState<CommunityEstimate | null>(null);
  const [communityHeatmap, setCommunityHeatmap] = useState<
    Array<{ month: string; buckets: number[] }>
  >([]);
  const [communityWeeklyTrend, setCommunityWeeklyTrend] = useState<
    WeeklyTrendPoint[]
  >([]);
  const [communityHistogram, setCommunityHistogram] =
    useState<ProcessingHistogram | null>(null);
  const [communitySimilarFiling, setCommunitySimilarFiling] =
    useState<SimilarFilingPeers | null>(null);
  const [communitySummary, setCommunitySummary] =
    useState<CommunitySummary | null>(null);
  const [communityStages, setCommunityStages] = useState<JourneyStages | null>(
    null
  );
  const [communityEstimateLoading, setCommunityEstimateLoading] =
    useState(false);
  const [communityEvidence, setCommunityEvidence] = useState<{
    evidence: CommunityEvidence | null;
    premiumUpgrade: PremiumUpgradeStats | null;
  } | null>(null);

  // Community processing-time estimate (partner timelines — not USCIS API).
  useEffect(() => {
    if (!enabled || !caseStatus?.receipt_number) {
      setCommunityEvidence(null);
      setCommunityEstimateLoading(false);
      setCommunityPrediction(null);
      setCommunitySummary(null);
      setCommunityStages(null);
      setCommunityHeatmap([]);
      setCommunityWeeklyTrend([]);
      setCommunityHistogram(null);
      setCommunitySimilarFiling(null);
      return;
    }

    if (!isOptFilingCategory(caseStatus.filing_category)) {
      setCommunityEvidence(null);
      setCommunityPrediction(null);
      setCommunitySummary(null);
      setCommunityStages(null);
      setCommunityHeatmap([]);
      setCommunityWeeklyTrend([]);
      setCommunityHistogram(null);
      setCommunitySimilarFiling(null);
      setCommunityEstimateLoading(false);
      return;
    }

    const controller = new AbortController();
    const days =
      clientNowMs !== null
        ? daysSinceEpochMs(caseStatus.received_date, clientNowMs)
        : 0;

    // Prefix only — it is all the service-center lookup needs, and it keeps
    // full receipt numbers out of request logs.
    const params = new URLSearchParams({
      receipt_prefix: caseStatus.receipt_number.slice(0, 3),
      days: String(days),
    });
    if (caseStatus.case_type) params.set('case_type', caseStatus.case_type);
    if (caseStatus.label) params.set('label', caseStatus.label);
    if (caseStatus.filing_category) {
      params.set('filing_category', caseStatus.filing_category);
    }
    if (caseStatus.pp_start_date)
      params.set('pp_start', caseStatus.pp_start_date);
    if (caseStatus.received_date)
      params.set('received', caseStatus.received_date);

    setCommunityEstimateLoading(true);
    setCommunityEvidence(null);
    setCommunityPrediction(null);
    setCommunitySummary(null);
    setCommunityStages(null);
    setCommunityHeatmap([]);
    setCommunityWeeklyTrend([]);
    setCommunityHistogram(null);
    setCommunitySimilarFiling(null);
    void fetch(`/api/case-status/community-estimate?${params}`, {
      signal: controller.signal,
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) return null;
        return res.json() as Promise<{
          ok?: boolean;
          evidence?: CommunityEvidence | null;
          premiumUpgrade?: PremiumUpgradeStats | null;
          prediction?: CommunityEstimate | null;
          summary?: CommunitySummary | null;
          stages?: JourneyStages | null;
          heatmap?: Array<{ month: string; buckets: number[] }>;
          weeklyTrend?: WeeklyTrendPoint[];
          histogram?: ProcessingHistogram | null;
          similarFiling?: SimilarFilingPeers | null;
        }>;
      })
      .then((body) => {
        if (!body || controller.signal.aborted) return;
        setCommunityEvidence({
          evidence: body.evidence ?? null,
          premiumUpgrade: body.premiumUpgrade ?? null,
        });
        setCommunityPrediction(body.prediction ?? null);
        setCommunitySummary(body.summary ?? null);
        setCommunityStages(body.stages ?? null);
        setCommunityHeatmap(body.heatmap ?? []);
        setCommunityWeeklyTrend(body.weeklyTrend ?? []);
        setCommunityHistogram(body.histogram ?? null);
        setCommunitySimilarFiling(body.similarFiling ?? null);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setCommunityPrediction(null);
          setCommunitySummary(null);
          setCommunityStages(null);
          setCommunityHeatmap([]);
          setCommunityWeeklyTrend([]);
          setCommunityHistogram(null);
          setCommunitySimilarFiling(null);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setCommunityEstimateLoading(false);
      });

    return () => controller.abort();
  }, [
    caseStatus?.receipt_number,
    caseStatus?.case_type,
    caseStatus?.label,
    caseStatus?.filing_category,
    caseStatus?.pp_start_date,
    caseStatus?.received_date,
    clientNowMs,
    enabled,
  ]);

  return {
    communityPrediction,
    communityHeatmap,
    communityWeeklyTrend,
    communityHistogram,
    communitySimilarFiling,
    communitySummary,
    communityStages,
    communityEstimateLoading,
    communityEvidence,
  };
}
