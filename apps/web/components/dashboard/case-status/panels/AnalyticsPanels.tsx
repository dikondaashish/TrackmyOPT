'use client';

import { useId } from 'react';
import { ComparisonEvidence } from './ComparisonEvidence';
import { OfficialProcessingComparison } from './OfficialProcessingComparison';
import { I765ObservedTrends } from './I765ObservedTrends';
import type {
  CommunityEvidence,
  PremiumUpgradeStats,
} from '@/lib/community-opt/evidence';
import {
  BarChart3,
  BarChartHorizontal,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import { CaseProcessingBenchmarks } from '@/components/dashboard/case-status/CaseProcessingBenchmarks';
import { PredictionPanel } from '@/components/dashboard/case-status/panels/PredictionPanel';
import { ProcessingTimeTrend } from '@/components/dashboard/case-status/panels/ProcessingTimeTrend';
import { ProcessingTimeDistribution } from '@/components/dashboard/case-status/panels/ProcessingTimeDistribution';
import { SimilarFilingCard } from '@/components/dashboard/case-status/panels/SimilarFilingCard';
import { CommunitySummaryCard } from '@/components/dashboard/case-status/panels/CommunitySummaryCard';
import { JourneyStagesCard } from '@/components/dashboard/case-status/panels/JourneyStagesCard';
import { LockedAnalyticsPanel } from '@/components/dashboard/case-status/panels/LockedAnalyticsPanel';
import type { ProcessingHistogram } from '@/lib/community-opt/estimate';
import type {
  CommunityEstimate,
  CommunitySummary,
} from '@/lib/community-opt/types';
import { filingCategoryToCaseKind } from '@/lib/case-status/filing-category';
import type { FilingCategory } from '@/lib/case-status/filing-category';
import type { JourneyPhase, JourneyStages } from '@/lib/community-opt/stages';
import { sequentialCell } from '@/lib/community-opt/chart-theme';
import type { SimilarFilingPeers } from '@/lib/community-opt/similar-filing';
import type { WeeklyTrendPoint } from '@/lib/community-opt/weekly-trend';
import { isoWeekStart } from '@/lib/community-opt/weekly-trend';

type ComparisonId = 'prediction' | 'trend' | 'spread' | 'heatmap';

interface AnalyticsPanelsProps {
  evidence?: CommunityEvidence | null;
  premiumUpgrade?: PremiumUpgradeStats | null;
  currentStatus?: string | null;
  receiptNumber: string;
  isPremium: boolean | null;
  onUpgrade: () => void;
  cohortSize?: number;
  daysSinceFiled?: number;
  /** Pro only — the server sends null on free plans. */
  prediction?: CommunityEstimate;
  /** The headline wait, sent on every plan. */
  summary?: CommunitySummary | null;
  stages?: JourneyStages | null;
  phase?: JourneyPhase;
  heatmap?: Array<{ month: string; buckets: number[] }>;
  weeklyTrend?: WeeklyTrendPoint[];
  histogram?: ProcessingHistogram | null;
  similarFiling?: SimilarFilingPeers | null;
  /** Filing date, used to highlight the user's week in the trend chart. */
  receivedDate?: string | null;
  premiumProcessing?: boolean;
  estimateLoading?: boolean;
  /** False for non-OPT filing types — community estimates are OPT-only. */
  estimatesAvailable?: boolean;
  filingCategory?: FilingCategory | string | null;
  caseType?: string | null;
}

interface AnalyticsPanel {
  id: ComparisonId;
  label: string;
  icon: React.ReactNode;
}

const ANALYTICS_PANELS: AnalyticsPanel[] = [
  {
    id: 'prediction',
    label: 'Similar cases',
    icon: <BarChart3 className="w-3.5 h-3.5" />,
  },
  { id: 'trend', label: 'Trend', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  {
    id: 'spread',
    label: 'Spread',
    icon: <BarChartHorizontal className="w-3.5 h-3.5" />,
  },
  {
    id: 'heatmap',
    label: 'Heatmap',
    icon: <Calendar className="w-3.5 h-3.5" />,
  },
];

const BUCKET_LABELS = [
  '<60d',
  '60–75d',
  '75–90d',
  '90–105d',
  '105–120d',
  '120d+',
];

function monthLabel(ym: string): string {
  const [y, m] = ym.split('-').map(Number);
  if (!y || !m) return ym;
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleString('en-US', {
    month: 'short',
    year: '2-digit',
    timeZone: 'UTC',
  });
}

function ProcessingHeatmap({
  rows,
  loading,
}: {
  rows: Array<{ month: string; buckets: number[] }>;
  loading: boolean;
}) {
  if (loading && !rows.length) {
    return (
      <p
        role="status"
        className="text-sm text-muted-foreground py-8 text-center"
      >
        Loading community heatmap…
      </p>
    );
  }

  if (!rows.length) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        Heatmap appears after community timelines are synced for your case type.
      </p>
    );
  }

  const max = Math.max(...rows.flatMap((r) => r.buckets), 1);

  return (
    <div>
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-foreground">
          Approvals by filing month
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          How each month&apos;s filings were spread across processing speeds
        </p>
      </div>

      {/* The table is wider than a phone; it scrolls inside its own box so the
          page itself never scrolls sideways. */}
      <div className="overflow-x-auto -mx-1 px-1">
        <table className="text-xs w-full border-collapse min-w-[420px]">
          <thead>
            <tr>
              <th className="text-left pb-2 pr-3 text-muted-foreground font-medium sticky left-0 bg-card">
                Month
              </th>
              {BUCKET_LABELS.map((b) => (
                <th
                  key={b}
                  className="text-center pb-2 px-1 text-muted-foreground font-medium min-w-[52px] tabular-nums"
                >
                  {b}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.month}>
                <td className="py-0.5 pr-3 font-semibold text-foreground whitespace-nowrap sticky left-0 bg-card">
                  {monthLabel(row.month)}
                </td>
                {row.buckets.map((val, bi) => {
                  const { fill, ink } = sequentialCell(val, max);
                  return (
                    <td key={bi} className="p-0.5">
                      <div
                        className="rounded-md text-center py-1.5 font-semibold tabular-nums"
                        style={{ background: fill, color: ink }}
                        title={`${val} approvals · filed ${monthLabel(row.month)} · ${BUCKET_LABELS[bi]}`}
                      >
                        {val}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground">Fewer</span>
        <div className="flex gap-0.5" aria-hidden>
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <span
              key={step}
              className="w-5 h-2.5 rounded-sm first:rounded-l-md last:rounded-r-md"
              style={{ background: `var(--chart-seq-${step})` }}
            />
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground">More cases</span>
      </div>

      {/* Deliberately avoids "dark cell": the ramp runs light→dark on the light
          surface and dark→light on the dark one, so only "strongly shaded" is
          true in both themes. */}
      <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
        Shading is case count, not speed — a strongly shaded cell in a slow
        column means many cases took that long, not that the month went badly.
      </p>
    </div>
  );
}

export function AnalyticsPanels({
  evidence,
  premiumUpgrade,
  currentStatus,
  isPremium,
  onUpgrade,
  daysSinceFiled = 0,
  prediction,
  summary = null,
  stages = null,
  phase = 'filed',
  heatmap = [],
  weeklyTrend = [],
  histogram = null,
  similarFiling = null,
  receivedDate,
  premiumProcessing,
  estimateLoading = false,
  estimatesAvailable = true,
  filingCategory = null,
  caseType = null,
}: AnalyticsPanelsProps) {
  const caseKind = filingCategoryToCaseKind(filingCategory);
  const id = useId();

  // Treat an unresolved plan as free: the server has already withheld the Pro
  // payload, so showing the paid panels here would only render them empty.
  const isPro = isPremium === true;
  const upgrade = isPremium === false ? onUpgrade : undefined;
  const postApproval = ['approved', 'card_produced', 'delivered'].includes(
    phase
  );
  const closedWithoutApproval = /denied|withdraw|revoked|terminated/i.test(
    currentStatus ?? ''
  );

  const renderAnalyticsPanel = (panel: ComparisonId) => {
    switch (panel) {
      case 'prediction':
        return (
          <div className="space-y-5">
            <JourneyStagesCard
              stages={stages}
              phase={phase}
              premiumProcessing={premiumProcessing}
              caseKind={caseKind}
              isPro={isPro}
              onUpgrade={upgrade}
              loading={estimateLoading}
            />

            {isPro ? (
              <SimilarFilingCard
                peers={similarFiling}
                receivedDate={receivedDate}
                premiumProcessing={premiumProcessing}
                caseKind={caseKind}
                loading={estimateLoading}
              />
            ) : (
              <LockedAnalyticsPanel
                title="Cases that filed when you did"
                description="See what people who filed within days of you actually waited — median, middle 50%, and how many reports it is based on."
                onUpgrade={upgrade}
              />
            )}
          </div>
        );
      case 'trend':
        return !isPro ? (
          <LockedAnalyticsPanel
            title="Is processing speeding up or slowing down?"
            description="Weekly median wait by filing week, with your own week marked, so you can see which way the queue is moving instead of guessing."
            onUpgrade={upgrade}
          />
        ) : estimateLoading && !weeklyTrend.length ? (
          <p
            role="status"
            className="text-sm text-muted-foreground py-8 text-center"
          >
            Loading community trend…
          </p>
        ) : (
          <ProcessingTimeTrend
            points={weeklyTrend}
            filedWeekStart={isoWeekStart(receivedDate)}
            premiumProcessing={premiumProcessing}
            caseKind={caseKind}
          />
        );
      case 'spread':
        return !isPro ? (
          <LockedAnalyticsPanel
            title="The full spread, not just the middle"
            description="Every reported wait binned by week, with your own position marked — including how long the slow tail actually runs."
            onUpgrade={upgrade}
          />
        ) : estimateLoading && !histogram ? (
          <p
            role="status"
            className="text-sm text-muted-foreground py-8 text-center"
          >
            Loading community distribution…
          </p>
        ) : (
          <ProcessingTimeDistribution
            histogram={histogram}
            daysSinceFiled={daysSinceFiled}
            premiumProcessing={premiumProcessing}
            caseKind={caseKind}
          />
        );
      case 'heatmap':
        return !isPro ? (
          <LockedAnalyticsPanel
            title="Does filing month matter?"
            description="Approvals by filing month and speed bucket, so you can see how the season you filed in compares with the rest of the year."
            onUpgrade={upgrade}
          />
        ) : (
          <ProcessingHeatmap rows={heatmap} loading={estimateLoading} />
        );
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight">
          {postApproval
            ? 'After your decision'
            : closedWithoutApproval
              ? 'Historical comparisons'
              : 'How your wait compares'}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Historical reports, not your place in a USCIS queue.
        </p>
      </div>
      {postApproval || closedWithoutApproval ? (
        <div className="rounded-xl bg-muted/40 p-4 text-sm">
          <p>
            {closedWithoutApproval
              ? 'Review your official decision notice and next steps above. An approval-wait estimate no longer applies to this status.'
              : phase === 'delivered'
                ? 'Your card is reported delivered. Check the name and authorization dates on your EAD, save a copy, and update your OPT dates and employment records.'
                : 'Your case has moved beyond the approval wait. The card timings below describe completed community reports, not a delivery promise.'}
          </p>
          {postApproval && phase !== 'delivered' && (
            <JourneyStagesCard
              stages={stages}
              phase={phase}
              isPro={isPro}
              premiumProcessing={premiumProcessing}
              caseKind={caseKind}
              onUpgrade={upgrade}
            />
          )}
        </div>
      ) : !estimatesAvailable ? (
        <p className="text-sm text-muted-foreground py-4">
          Community approval-time estimates are available for Initial OPT and
          STEM OPT cases. Status tracking still works for all USCIS forms.
        </p>
      ) : estimateLoading && !prediction && !summary ? (
        <div
          role="status"
          className="rounded-xl bg-muted/40 p-5 text-sm text-muted-foreground"
        >
          Loading community timeline comparison…
        </div>
      ) : isPro ? (
        <PredictionPanel
          daysSinceFiled={daysSinceFiled}
          prediction={prediction}
          caseKind={prediction?.caseKind ?? caseKind}
        />
      ) : (
        <CommunitySummaryCard
          summary={summary}
          daysSinceFiled={daysSinceFiled}
          onUpgrade={upgrade}
        />
      )}

      {estimatesAvailable && (
        <section
          className="mt-5 border-t border-border"
          aria-labelledby={`${id}-details-title`}
        >
          <h3 id={`${id}-details-title`} className="py-3 text-sm font-semibold">
            Explore detailed comparisons
          </h3>
          {/* Keep all four comparisons visible together; stack only on phones. */}
          <div className="mt-3 grid grid-cols-1 items-start gap-4 md:grid-cols-2">
            {ANALYTICS_PANELS.map((panel) => {
              const titleId = `${id}-${panel.id}-title`;
              return (
                <section
                  key={panel.id}
                  aria-labelledby={titleId}
                  className="min-w-0 rounded-xl border border-border bg-card p-4 sm:p-5"
                >
                  <h4
                    id={titleId}
                    className="flex items-center gap-2 text-sm font-semibold text-foreground"
                  >
                    <span
                      className="text-[var(--chart-series)]"
                      aria-hidden="true"
                    >
                      {panel.icon}
                    </span>
                    {panel.label}
                  </h4>
                  <div className="mt-4 min-w-0">
                    {renderAnalyticsPanel(panel.id)}
                  </div>
                </section>
              );
            })}
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <CaseProcessingBenchmarks filingCategory={filingCategory} />
          </div>
        </section>
      )}

      {caseType?.trim().toUpperCase() === 'I-765' && <I765ObservedTrends />}

      {/* State the data-source and USCIS disclaimer once below all four charts,
          keeping it beside the results without repeating it in every panel. */}
      <div className="mt-6 pt-4 border-t border-border">
        <ComparisonEvidence
          evidence={evidence}
          premiumUpgrade={premiumUpgrade}
        />
        {estimatesAvailable && (
          <OfficialProcessingComparison
            medianDays={prediction?.medianDays ?? summary?.medianDays}
            premium={premiumProcessing}
          />
        )}
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Community charts use partner-reported timelines (opt-tracker,
          opt-pulse) shared with permission. TrackMyOPT benchmarks are
          separately labeled and use enrolled cases, never scans of neighboring
          receipt numbers. These are historical comparisons, not official USCIS
          processing times, not affiliated with USCIS, and not a prediction of
          your own outcome.
        </p>
      </div>
    </div>
  );
}
