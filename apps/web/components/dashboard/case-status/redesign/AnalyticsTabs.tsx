"use client";

import { useState } from "react";
import { BarChart3, Users2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { CaseProcessingBenchmarks } from "@/components/dashboard/case-status/CaseProcessingBenchmarks";
import { NearbyCasesCohort } from "@/components/dashboard/case-status/NearbyCasesCohort";
import { PredictionPanel } from "@/components/dashboard/case-status/redesign/PredictionPanel";

type TabId = "prediction" | "nearby" | "heatmap";

interface AnalyticsTabsProps {
  receiptNumber: string;
  isPremium: boolean | null;
  onUpgrade: () => void;
  cohortSize?: number;
  daysSinceFiled?: number;
  prediction?: {
    cohortSize: number;
    approvalRate: number;
    medianDays: number;
    estimatedDecisionRange: [string, string];
    distribution: { label: string; count: number }[];
    cohortPosition: { behind: number; ahead: number; percentile: number };
    fastestDays?: number;
    approvalsLast24h?: number;
  };
}

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  { id: "prediction", label: "Prediction",     icon: <BarChart3 className="w-3.5 h-3.5" /> },
  { id: "nearby",     label: "Nearby Cases",   icon: <Users2 className="w-3.5 h-3.5" /> },
  { id: "heatmap",    label: "Heatmap",         icon: <Calendar className="w-3.5 h-3.5" /> },
];

function ProcessingHeatmap() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const buckets = ["<60d", "60–75d", "75–90d", "90–105d", "105–120d", "120d+"];

  // Mock relative heat values (0–10); will replace with real data
  const heat: number[][] = [
    [8, 12, 18, 22, 14, 9],
    [6, 11, 21, 28, 17, 7],
    [5, 9, 19, 34, 20, 8],
    [4, 8, 17, 30, 21, 10],
    [3, 7, 15, 28, 18, 11],
    [2, 5, 12, 22, 16, 10],
  ];

  const max = Math.max(...heat.flat());

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
        Approvals by filing month · I-765 at National Benefits Center · Premium Processing
      </p>
      <table className="text-xs w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left py-1 pr-3 text-muted-foreground font-medium">Month</th>
            {buckets.map((b) => (
              <th key={b} className="text-center py-1 px-2 text-muted-foreground font-medium min-w-[56px]">
                {b}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {months.map((month, mi) => (
            <tr key={month}>
              <td className="py-1 pr-3 font-semibold text-foreground">{month}</td>
              {heat[mi].map((val, bi) => (
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
        Green = fast approvals · Red = slow. Numbers = approvals in that time window.
        Data is indicative only.
      </p>
    </div>
  );
}

export function AnalyticsTabs({ receiptNumber, isPremium, onUpgrade, cohortSize = 0, daysSinceFiled = 0, prediction }: AnalyticsTabsProps) {
  const [active, setActive] = useState<TabId>("prediction");

  return (
    <div>
      {/* Tab bar */}
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

      {/* Tab panels */}
      <div className="min-h-[200px]">
        {active === "prediction" && (
          <div className="space-y-5">
            {/* Rich prediction summary (data-gated) */}
            <PredictionPanel
              daysSinceFiled={daysSinceFiled}
              prediction={prediction}
            />
            {/* Community benchmarks below */}
            <div className="border-t border-border pt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Community Reports</p>
              <CaseProcessingBenchmarks />
            </div>
          </div>
        )}

        {active === "nearby" && (
          <NearbyCasesCohort
            receiptNumber={receiptNumber}
            isPremium={isPremium}
            onUpgrade={onUpgrade}
          />
        )}

        {active === "heatmap" && <ProcessingHeatmap />}
      </div>
    </div>
  );
}
