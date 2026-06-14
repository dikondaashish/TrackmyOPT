"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Crown,
  RefreshCw,
  TrendingUp,
  Layers,
  CircleHelp,
  Sparkles,
} from "lucide-react";
import type { CohortAnalytics, CohortCase } from "@/lib/case-status/cohort-analytics";

type NearbyCasesCohortProps = {
  receiptNumber: string;
  isPremium: boolean | null;
  onUpgrade: () => void;
};

const RANGE_OPTIONS = [25, 50, 100, 250, 500];

const CATEGORY_STYLES: Record<CohortCase["category"], string> = {
  approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  denied: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  invalid: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500",
};

function StatBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-center">
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
      {sub && <p className="text-[11px] text-muted-foreground/80 mt-0.5">{sub}</p>}
    </div>
  );
}

function DistributionBars({
  title,
  items,
  icon,
}: {
  title: string;
  items: CohortAnalytics["statusDistribution"];
  icon: React.ReactNode;
}) {
  if (!items.length) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      </div>
      <div className="space-y-2">
        {items.slice(0, 7).map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground truncate pr-2">{item.label}</span>
              <span className="font-medium text-foreground whitespace-nowrap">
                {item.count} ({item.pct}%)
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                style={{ width: `${item.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NearbyCasesCohort({
  receiptNumber,
  isPremium,
  onUpgrade,
}: NearbyCasesCohortProps) {
  const [range, setRange] = useState(100);
  const [analytics, setAnalytics] = useState<CohortAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCohort = useCallback(async () => {
    if (isPremium !== true) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/case-status/nearby?receipt=${encodeURIComponent(receiptNumber)}&before=${range}&after=${range}`,
        { credentials: "include", cache: "no-store" }
      );
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to load nearby cases.");
        return;
      }
      setAnalytics(data.analytics as CohortAnalytics);
    } catch {
      setError("Failed to load nearby cases.");
    } finally {
      setIsLoading(false);
    }
  }, [receiptNumber, range, isPremium]);

  useEffect(() => {
    if (isPremium === true) void loadCohort();
  }, [loadCohort, isPremium]);

  if (isPremium !== true) {
    return (
      <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground mb-1">
              Nearby Case Insights
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              See how cases filed around the same time as yours are progressing —
              approval rates, processing times, and an AI outcome prediction based on
              similar cases.
            </p>
            <Button onClick={onUpgrade} className="gap-2">
              <Crown className="w-4 h-4" />
              Unlock with Pro
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  const prediction = analytics?.prediction;

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Nearby Case Insights</h3>
            <p className="text-xs text-muted-foreground">
              Cases filed around {receiptNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={range}
            onChange={(e) => setRange(Number(e.target.value))}
            className="text-sm rounded-lg border border-border bg-background px-2 py-1.5"
            aria-label="Cohort range"
          >
            {RANGE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                ±{r} cases
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void loadCohort()}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
      )}

      {prediction && (
        <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-900/20 p-4 mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
              AI prediction · based on similar nearby cases
            </span>
          </div>
          <p className="text-sm font-semibold text-foreground">{prediction.label}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2 text-sm">
            <span className="text-muted-foreground">
              Probability:{" "}
              <span className="font-bold text-foreground">
                {prediction.probabilityPct !== null ? `${prediction.probabilityPct}%` : "—"}
              </span>
            </span>
            <span className="text-muted-foreground">
              Avg time:{" "}
              <span className="font-bold text-foreground">
                {prediction.avgDays !== null ? `${prediction.avgDays} days` : "—"}
              </span>
            </span>
            <span className="text-muted-foreground">
              Case type:{" "}
              <span className="font-bold text-foreground">
                {prediction.caseType || "—"}
              </span>
            </span>
            <span className="text-muted-foreground">
              Sample: <span className="font-bold text-foreground">{prediction.sampleSize}</span>
            </span>
          </div>
        </div>
      )}

      {analytics && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatBox
              label="Approval rate"
              value={
                analytics.approvalRatePct !== null ? `${analytics.approvalRatePct}%` : "—"
              }
              sub={`${analytics.completedCount} completed`}
            />
            <StatBox
              label="Avg processing"
              value={
                analytics.processing.avgMonths !== null
                  ? `${analytics.processing.avgMonths} mo`
                  : "—"
              }
            />
            <StatBox
              label="Fastest"
              value={
                analytics.processing.fastestMonths !== null
                  ? `${analytics.processing.fastestMonths} mo`
                  : "—"
              }
            />
            <StatBox
              label="Valid cases"
              value={String(analytics.totalValid)}
              sub={`${analytics.pending} pending scan`}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <DistributionBars
              title="Status distribution"
              items={analytics.statusDistribution}
              icon={<TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
            />
            <DistributionBars
              title="Case type distribution"
              items={analytics.caseTypeDistribution}
              icon={<Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
            />
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">
              Cases in range ({analytics.cases.filter((c) => c.isValid).length} valid of{" "}
              {analytics.totalRequested})
            </h4>
            <div className="max-h-72 overflow-y-auto rounded-xl border border-border divide-y divide-border">
              {analytics.cases
                .filter((c) => c.isValid || c.isCenter)
                .map((c) => (
                  <div
                    key={c.receiptNumber}
                    className={`flex items-center justify-between gap-3 px-3 py-2 text-sm ${
                      c.isCenter ? "bg-indigo-50/70 dark:bg-indigo-900/20" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-xs text-foreground truncate">
                        {c.receiptNumber}
                      </span>
                      {c.isCenter && (
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                          You
                        </span>
                      )}
                      {c.caseType && (
                        <span className="text-[10px] text-muted-foreground">{c.caseType}</span>
                      )}
                    </div>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap ${CATEGORY_STYLES[c.category]}`}
                    >
                      {c.currentStatus || "Status not available"}
                    </span>
                  </div>
                ))}
              {analytics.totalValid === 0 && (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                  <CircleHelp className="w-5 h-5 mx-auto mb-2 opacity-60" />
                  We&apos;re still scanning nearby cases. Check back shortly — data fills in
                  over time.
                </div>
              )}
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground mt-4">
            Estimates from anonymized nearby USCIS receipts. Not affiliated with USCIS and
            not legal advice. Nearby cases may include other form types.
          </p>
        </>
      )}

      {isLoading && !analytics && (
        <div className="py-10 text-center text-sm text-muted-foreground">
          <RefreshCw className="w-5 h-5 mx-auto mb-2 animate-spin" />
          Loading nearby cases…
        </div>
      )}
    </Card>
  );
}
