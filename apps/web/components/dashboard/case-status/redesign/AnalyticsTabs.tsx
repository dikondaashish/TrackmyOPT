"use client";

import { useState } from "react";
import { BarChart3, BarChartHorizontal, Calendar, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { CaseProcessingBenchmarks } from "@/components/dashboard/case-status/CaseProcessingBenchmarks";
import { PredictionPanel } from "@/components/dashboard/case-status/redesign/PredictionPanel";
import { ProcessingTimeTrend } from "@/components/dashboard/case-status/redesign/ProcessingTimeTrend";
import { ProcessingTimeDistribution } from "@/components/dashboard/case-status/redesign/ProcessingTimeDistribution";
import type { ProcessingHistogram } from "@/lib/community-opt/estimate";
import type { CommunityEstimate } from "@/lib/community-opt/types";
import type { WeeklyTrendPoint } from "@/lib/community-opt/weekly-trend";
import { isoWeekStart } from "@/lib/community-opt/weekly-trend";

type TabId = "prediction" | "trend" | "spread" | "heatmap";

interface AnalyticsTabsProps {
  receiptNumber: string;
  isPremium: boolean | null;
  onUpgrade: () => void;
  cohortSize?: number;
  daysSinceFiled?: number;
  prediction?: CommunityEstimate;
  heatmap?: Array<{ month: string; buckets: number[] }>;
  weeklyTrend?: WeeklyTrendPoint[];
  histogram?: ProcessingHistogram | null;
  /** Filing date, used to highlight the user's week in the trend chart. */
  receivedDate?: string | null;
  premiumProcessing?: boolean;
  estimateLoading?: boolean;
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

  function cellBg(val: number): string {
    const pct = val / max;
    if (pct > 0.8) return "bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-200";
    if (pct > 0.6) return "bg-orange-200 dark:bg-orange-900/40 text-orange-800 dark:text-orange-200";
    if (pct > 0.4) return "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200";
    if (pct > 0.2) return "bg-lime-100 dark:bg-lime-900/20 text-lime-800 dark:text-lime-200";
    return "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200";
  }

  return (
    <div className="overflow-x-auto">
      <p className="text-xs text-muted-foreground mb-3">
        Approvals by filing month · days to approval · matched community cohort
      </p>
      <table className="text-xs w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left py-1 pr-3 text-muted-foreground font-medium">Month</th>
            {BUCKET_LABELS.map((b) => (
              <th key={b} className="text-center py-1 px-2 text-muted-foreground font-medium min-w-[56px]">
                {b}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.month}>
              <td className="py-1 pr-3 font-semibold text-foreground">{monthLabel(row.month)}</td>
              {row.buckets.map((val, bi) => (
                <td key={bi} className="py-1 px-1">
                  <div className={cn("rounded text-center py-1 font-semibold", cellBg(val))}>
                    {val}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[10px] text-muted-foreground mt-2">
        Green = more approvals in faster buckets · Red = slower. Community-reported · not USCIS official.
      </p>
    </div>
  );
}

export function AnalyticsTabs({
  isPremium: _isPremium,
  onUpgrade: _onUpgrade,
  daysSinceFiled = 0,
  prediction,
  heatmap = [],
  weeklyTrend = [],
  histogram = null,
  receivedDate,
  premiumProcessing,
  estimateLoading = false,
}: AnalyticsTabsProps) {
  const [active, setActive] = useState<TabId>("prediction");

  return (
    <div>
      <div className="flex gap-1 mb-4 border-b border-border overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 pb-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap cursor-pointer",
              active === tab.id
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[200px]">
        {active === "prediction" && (
          <div className="space-y-5">
            {estimateLoading && !prediction ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Loading community timeline estimate…
              </p>
            ) : (
              <PredictionPanel daysSinceFiled={daysSinceFiled} prediction={prediction} />
            )}
            <div className="border-t border-border pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Community Reports
              </p>
              <CaseProcessingBenchmarks />
            </div>
          </div>
        )}

        {active === "trend" &&
          (estimateLoading && !weeklyTrend.length ? (
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
          (estimateLoading && !histogram ? (
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

        {active === "heatmap" && <ProcessingHeatmap rows={heatmap} />}
      </div>
    </div>
  );
}
