"use client";

import { useState } from "react";
import { BarChart3, BarChartHorizontal, Calendar, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { CaseProcessingBenchmarks } from "@/components/dashboard/case-status/CaseProcessingBenchmarks";
import { PredictionPanel } from "@/components/dashboard/case-status/redesign/PredictionPanel";
import { ProcessingTimeTrend } from "@/components/dashboard/case-status/redesign/ProcessingTimeTrend";
import { ProcessingTimeDistribution } from "@/components/dashboard/case-status/redesign/ProcessingTimeDistribution";
import { SimilarFilingCard } from "@/components/dashboard/case-status/redesign/SimilarFilingCard";
import { CommunitySummaryCard } from "@/components/dashboard/case-status/redesign/CommunitySummaryCard";
import { JourneyStagesCard } from "@/components/dashboard/case-status/redesign/JourneyStagesCard";
import { LockedAnalyticsPanel } from "@/components/dashboard/case-status/redesign/LockedAnalyticsPanel";
import type { ProcessingHistogram } from "@/lib/community-opt/estimate";
import type { CommunityEstimate, CommunitySummary } from "@/lib/community-opt/types";
import { filingCategoryToCaseKind } from "@/lib/case-status/filing-category";
import type { FilingCategory } from "@/lib/case-status/filing-category";
import type { JourneyPhase, JourneyStages } from "@/lib/community-opt/stages";
import { sequentialCell } from "@/lib/community-opt/chart-theme";
import type { SimilarFilingPeers } from "@/lib/community-opt/similar-filing";
import type { WeeklyTrendPoint } from "@/lib/community-opt/weekly-trend";
import { isoWeekStart } from "@/lib/community-opt/weekly-trend";

type TabId = "prediction" | "trend" | "spread" | "heatmap";

interface AnalyticsTabsProps {
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
}

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  { id: "prediction", label: "Estimate", icon: <BarChart3 className="w-3.5 h-3.5" /> },
  { id: "trend", label: "Trend", icon: <TrendingUp className="w-3.5 h-3.5" /> },
  {
    id: "spread",
    label: "Spread",
    icon: <BarChartHorizontal className="w-3.5 h-3.5" />,
  },
  { id: "heatmap", label: "Heatmap", icon: <Calendar className="w-3.5 h-3.5" /> },
];

const BUCKET_LABELS = ["<60d", "60–75d", "75–90d", "90–105d", "105–120d", "120d+"];

function monthLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m) return ym;
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleString("en-US", {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  });
}

function ProcessingHeatmap({
  rows,
}: {
  rows: Array<{ month: string; buckets: number[] }>;
}) {
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
        Shading is case count, not speed — a strongly shaded cell in a slow column
        means many cases took that long, not that the month went badly.
      </p>
    </div>
  );
}

export function AnalyticsTabs({
  isPremium,
  onUpgrade,
  daysSinceFiled = 0,
  prediction,
  summary = null,
  stages = null,
  phase = "filed",
  heatmap = [],
  weeklyTrend = [],
  histogram = null,
  similarFiling = null,
  receivedDate,
  premiumProcessing,
  estimateLoading = false,
  estimatesAvailable = true,
  filingCategory = null,
}: AnalyticsTabsProps) {
  const caseKind = filingCategoryToCaseKind(filingCategory);
  const [active, setActive] = useState<TabId>("prediction");

  // Treat an unresolved plan as free: the server has already withheld the Pro
  // payload, so showing the paid panels here would only render them empty.
  const isPro = isPremium === true;
  const upgrade = isPremium === false ? onUpgrade : undefined;

  const selectAdjacentTab = (current: TabId, direction: -1 | 1) => {
    const currentIndex = TABS.findIndex((tab) => tab.id === current);
    const nextIndex = (currentIndex + direction + TABS.length) % TABS.length;
    setActive(TABS[nextIndex].id);
  };

  return (
    <div>
      {/* Segmented control rather than underlined tabs: on a phone the row is
          only just wide enough, and a filled pill survives being cramped. */}
      <div
        role="tablist"
        aria-label="Community analytics"
        className="flex gap-1 mb-5 p-1 rounded-xl bg-muted/60 overflow-x-auto scrollbar-hide"
      >
        {TABS.map((tab) => {
          const selected = active === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`analytics-tab-${tab.id}`}
              aria-controls={`analytics-panel-${tab.id}`}
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(tab.id)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  selectAdjacentTab(tab.id, 1);
                } else if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  selectAdjacentTab(tab.id, -1);
                } else if (event.key === "Home") {
                  event.preventDefault();
                  setActive(TABS[0].id);
                } else if (event.key === "End") {
                  event.preventDefault();
                  setActive(TABS[TABS.length - 1].id);
                }
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-1.5 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer",
                selected
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Four labels plus icons overflow a 375px viewport, which clipped
                  the last tab. The label is the part that has to survive. */}
              <span
                className={cn(
                  "hidden sm:inline",
                  selected && "text-[var(--chart-series)]"
                )}
              >
                {tab.icon}
              </span>
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        id={`analytics-panel-${active}`}
        role="tabpanel"
        aria-labelledby={`analytics-tab-${active}`}
        className="min-h-[200px]"
      >
        {active === "prediction" && (
          <div className="space-y-5">
            {!estimatesAvailable ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Community approval-time estimates are available for Initial OPT and STEM OPT cases.
                Status tracking still works for all USCIS forms.
              </p>
            ) : estimateLoading && !prediction && !summary ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Loading community timeline estimate…
              </p>
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
              <>
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
                loading={estimateLoading}
              />
            ) : (
              <LockedAnalyticsPanel
                title="Cases that filed when you did"
                description="See what people who filed within days of you actually waited — median, middle 50%, and how many reports it is based on."
                onUpgrade={upgrade}
              />
            )}

            <div className="border-t border-border pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Community Reports
              </p>
              <CaseProcessingBenchmarks filingCategory={filingCategory} />
            </div>
              </>
            )}
          </div>
        )}

        {active === "trend" &&
          (!estimatesAvailable ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Community trends are available for Initial OPT and STEM OPT cases.
            </p>
          ) : !isPro ? (
            <LockedAnalyticsPanel
              title="Is processing speeding up or slowing down?"
              description="Weekly median wait by filing week, with your own week marked, so you can see which way the queue is moving instead of guessing."
              onUpgrade={upgrade}
            />
          ) : estimateLoading && !weeklyTrend.length ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Loading community trend…
            </p>
          ) : (
            <ProcessingTimeTrend
              points={weeklyTrend}
              filedWeekStart={isoWeekStart(receivedDate)}
              premiumProcessing={premiumProcessing}
            />
          ))}

        {active === "spread" &&
          (!estimatesAvailable ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Community processing spreads are available for Initial OPT and STEM OPT cases.
            </p>
          ) : !isPro ? (
            <LockedAnalyticsPanel
              title="The full spread, not just the middle"
              description="Every reported wait binned by week, with your own position marked — including how long the slow tail actually runs."
              onUpgrade={upgrade}
            />
          ) : estimateLoading && !histogram ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Loading community distribution…
            </p>
          ) : (
            <ProcessingTimeDistribution
              histogram={histogram}
              daysSinceFiled={daysSinceFiled}
              premiumProcessing={premiumProcessing}
            />
          ))}

        {active === "heatmap" &&
          (!estimatesAvailable ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Filing-month heatmaps are available for Initial OPT and STEM OPT cases.
            </p>
          ) : !isPro ? (
            <LockedAnalyticsPanel
              title="Does filing month matter?"
              description="Approvals by filing month and speed bucket, so you can see how the season you filed in compares with the rest of the year."
              onUpgrade={upgrade}
            />
          ) : (
            <ProcessingHeatmap rows={heatmap} />
          ))}
      </div>

      {/* Stated once for the whole section rather than under each card. It sat
          on four cards at once on the Estimate tab, which turned the notice
          that matters most into wallpaper people scroll past. Still beside the
          results, which is what the compliance checklist requires — it is the
          page footer that is not good enough. */}
      <div className="mt-6 pt-4 border-t border-border">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Every figure here comes from community-reported partner timelines
          (opt-tracker, opt-pulse) shared with permission — not from USCIS case
          lookups, and never from scanning receipt numbers near yours. These are
          planning estimates from what other people reported, not official USCIS
          processing times, not affiliated with USCIS, and not a prediction of
          your own outcome.
        </p>
      </div>
    </div>
  );
}
