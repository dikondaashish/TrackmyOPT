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
  Sparkles,
  CheckCircle2,
  Clock,
  Info,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CohortAnalytics, CohortCase } from "@/lib/case-status/cohort-analytics";

type NearbyCasesCohortProps = {
  receiptNumber: string;
  isPremium: boolean | null;
  onUpgrade: () => void;
};

const RANGE_OPTIONS = [25, 50, 100, 250, 500];

const CATEGORY_META: Record<
  CohortCase["category"],
  { label: string; dot: string; bar: string; pill: string }
> = {
  approved: {
    label: "Approved",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
    pill: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  in_progress: {
    label: "In progress",
    dot: "bg-blue-500",
    bar: "bg-blue-500",
    pill: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  denied: {
    label: "Denied",
    dot: "bg-red-500",
    bar: "bg-red-500",
    pill: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  },
  invalid: {
    label: "No case / invalid",
    dot: "bg-gray-300 dark:bg-gray-600",
    bar: "bg-gray-200 dark:bg-gray-700",
    pill: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500",
  },
};

/* ── Probability ring ─────────────────────────────────────────────── */
function ProbabilityRing({ pct }: { pct: number | null }) {
  const value = pct ?? 0;
  return (
    <div
      className="relative h-24 w-24 shrink-0"
      role="img"
      aria-label={pct !== null ? `${pct}% approval probability` : "Probability not yet available"}
    >
      <div
        className="h-full w-full rounded-full"
        style={{
          background: `conic-gradient(rgb(16 185 129) ${value * 3.6}deg, rgb(148 163 184 / 0.25) 0deg)`,
        }}
      />
      <div className="absolute inset-[10px] rounded-full bg-card flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-foreground leading-none">
          {pct !== null ? `${pct}%` : "—"}
        </span>
        <span className="text-[10px] text-muted-foreground mt-0.5">approval</span>
      </div>
    </div>
  );
}

/* ── Stat tile ────────────────────────────────────────────────────── */
function StatTile({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-1.5">{sub}</p>}
    </div>
  );
}

/* ── Case-number range strip (the signature visual) ───────────────── */
function RangeStrip({ cases }: { cases: CohortCase[] }) {
  if (!cases.length) return null;
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h4 className="text-sm font-semibold text-foreground">
            Cases around yours
          </h4>
        </div>
        <span className="text-xs text-muted-foreground">
          older filings ← → newer filings
        </span>
      </div>
      <div className="flex items-end gap-[2px] overflow-x-auto pb-2">
        {cases.map((c) => (
          <div
            key={c.receiptNumber}
            title={`${c.receiptNumber}${c.caseType ? ` · ${c.caseType}` : ""}\n${c.currentStatus || "No data"}`}
            className={cn(
              "shrink-0 rounded-sm transition-colors",
              CATEGORY_META[c.category].bar,
              c.isCenter ? "w-2.5 h-10 ring-2 ring-indigo-500 ring-offset-1 ring-offset-card" : "w-1.5 h-6"
            )}
          />
        ))}
      </div>
      <div className="relative h-4 text-[10px] text-muted-foreground">
        <span className="absolute left-0">−range</span>
        <span className="absolute left-1/2 -translate-x-1/2 font-semibold text-indigo-600 dark:text-indigo-400">
          your case
        </span>
        <span className="absolute right-0">+range</span>
      </div>
    </div>
  );
}

/* ── Distribution bars ────────────────────────────────────────────── */
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
      <div className="space-y-2.5">
        {items.slice(0, 6).map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-foreground/80 truncate pr-2">{item.label}</span>
              <span className="font-semibold text-foreground whitespace-nowrap tabular-nums">
                {item.count}{" "}
                <span className="text-muted-foreground font-normal">({item.pct}%)</span>
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-500"
                style={{ width: `${Math.max(item.pct, 2)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Legend ───────────────────────────────────────────────────────── */
function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {(["approved", "in_progress", "denied", "invalid"] as const).map((key) => (
        <span key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className={cn("w-2.5 h-2.5 rounded-full", CATEGORY_META[key].dot)} />
          {CATEGORY_META[key].label}
        </span>
      ))}
    </div>
  );
}

/* ── Loading skeleton ─────────────────────────────────────────────── */
function CohortSkeleton() {
  return (
    <div className="animate-pulse space-y-5" aria-hidden>
      <div className="h-24 rounded-xl bg-muted" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-16 rounded-xl bg-muted" />
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
        setError(data.error || "We couldn't load nearby cases. Please try again.");
        return;
      }
      setAnalytics(data.analytics as CohortAnalytics);
    } catch {
      setError("We couldn't load nearby cases. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [receiptNumber, range, isPremium]);

  useEffect(() => {
    if (isPremium === true) void loadCohort();
  }, [loadCohort, isPremium]);

  /* ── Free / locked state ──────────────────────────────────────── */
  if (isPremium !== true) {
    return (
      <Card className="overflow-hidden border-indigo-200/80 dark:border-indigo-800/80">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 px-5 py-6 sm:px-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold">Nearby Case Insights</h3>
              <p className="text-sm text-indigo-100 mt-1 max-w-prose">
                USCIS issues receipt numbers in order, so cases filed right before
                and after yours are often the same type. See how that group is
                moving — approval rates, typical processing time, and an outcome
                prediction for cases like yours.
              </p>
            </div>
          </div>
        </div>
        <div className="p-5 sm:p-6">
          <ul className="grid sm:grid-cols-3 gap-3 mb-5">
            {[
              { icon: TrendingUp, text: "Approval rate of nearby cases" },
              { icon: Clock, text: "Real processing-time estimates" },
              { icon: Sparkles, text: "AI prediction for your case" },
            ].map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-2.5 rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-foreground"
              >
                <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                {text}
              </li>
            ))}
          </ul>
          <Button onClick={onUpgrade} className="gap-2 w-full sm:w-auto">
            <Crown className="w-4 h-4" />
            Unlock with Pro
          </Button>
        </div>
      </Card>
    );
  }

  const prediction = analytics?.prediction;
  const coveragePct = analytics
    ? Math.round((analytics.totalScanned / Math.max(1, analytics.totalRequested)) * 100)
    : 0;

  /* ── Pro state ────────────────────────────────────────────────── */
  return (
    <Card className="overflow-hidden border-indigo-200/70 dark:border-indigo-800/70">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 px-5 py-5 sm:px-6 text-white">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold leading-tight">Nearby Case Insights</h3>
              <p className="text-xs text-indigo-100 truncate">
                How cases filed near{" "}
                <span className="font-mono">{receiptNumber}</span> are moving
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="cohort-range" className="sr-only">
              Cohort range
            </label>
            <select
              id="cohort-range"
              value={range}
              onChange={(e) => setRange(Number(e.target.value))}
              className="text-sm rounded-lg bg-white/15 text-white border border-white/25 px-2.5 py-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 [&>option]:text-gray-900"
            >
              {RANGE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  ±{r} cases
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void loadCohort()}
              disabled={isLoading}
              className="bg-white/15 text-white border-white/25 hover:bg-white/25 gap-1.5"
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 px-3 py-2.5 text-sm text-red-700 dark:text-red-300">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {isLoading && !analytics && <CohortSkeleton />}

        {analytics && (
          <>
            {/* Prediction hero */}
            {prediction && (
              <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/60 dark:bg-indigo-950/30 p-4 sm:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
                    Prediction for cases like yours
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                  <ProbabilityRing pct={prediction.probabilityPct} />
                  <div className="flex-1 space-y-2">
                    <p className="text-base font-semibold text-foreground">
                      {prediction.label}
                    </p>
                    <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
                      <span className="text-muted-foreground">
                        Typical time{" "}
                        <span className="font-bold text-foreground">
                          {prediction.avgDays !== null ? `${prediction.avgDays} days` : "—"}
                        </span>
                      </span>
                      <span className="text-muted-foreground">
                        Case type{" "}
                        <span className="font-bold text-foreground">
                          {prediction.caseType || "—"}
                        </span>
                      </span>
                      <span className="text-muted-foreground">
                        Based on{" "}
                        <span className="font-bold text-foreground">
                          {prediction.sampleSize} similar
                        </span>{" "}
                        cases
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stat tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatTile
                icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                label="Approval rate"
                value={analytics.approvalRatePct !== null ? `${analytics.approvalRatePct}%` : "—"}
                sub={`${analytics.completedCount} decided cases`}
              />
              <StatTile
                icon={<Clock className="w-4 h-4 text-blue-500" />}
                label="Avg processing"
                value={
                  analytics.processing.avgMonths !== null
                    ? `${analytics.processing.avgMonths} mo`
                    : "—"
                }
                sub={
                  analytics.processing.fastestMonths !== null
                    ? `as fast as ${analytics.processing.fastestMonths} mo`
                    : "gathering data"
                }
              />
              <StatTile
                icon={<Users className="w-4 h-4 text-indigo-500" />}
                label="Cases found"
                value={String(analytics.totalValid)}
                sub={`of ${analytics.totalRequested} in range`}
              />
              <StatTile
                icon={<TrendingUp className="w-4 h-4 text-violet-500" />}
                label="Still scanning"
                value={String(analytics.pending)}
                sub="fills in over time"
              />
            </div>

            {/* Coverage progress */}
            {analytics.pending > 0 && (
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Scan coverage</span>
                  <span className="tabular-nums">
                    {analytics.totalScanned}/{analytics.totalRequested} ({coveragePct}%)
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${Math.max(coveragePct, 2)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Range strip + legend */}
            {analytics.totalValid > 0 ? (
              <div className="space-y-3">
                <RangeStrip cases={analytics.cases} />
                <Legend />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
                <RefreshCw className="w-5 h-5 mx-auto mb-2 text-muted-foreground animate-spin" />
                <p className="text-sm font-medium text-foreground">
                  Gathering nearby cases…
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  We&apos;re checking receipts around yours with USCIS. This builds up
                  over a few minutes — check back shortly.
                </p>
              </div>
            )}

            {/* Distributions */}
            {analytics.totalValid > 0 && (
              <div className="grid md:grid-cols-2 gap-6">
                <DistributionBars
                  title="Status breakdown"
                  items={analytics.statusDistribution}
                  icon={<TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                />
                <DistributionBars
                  title="Case types nearby"
                  items={analytics.caseTypeDistribution}
                  icon={<Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                />
              </div>
            )}

            {/* Cases list */}
            {analytics.totalValid > 0 && (
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer list-none rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
                  <span>
                    View all {analytics.cases.filter((c) => c.isValid).length} found cases
                  </span>
                  <ChevronDownIcon />
                </summary>
                <div className="mt-2 max-h-72 overflow-y-auto rounded-xl border border-border divide-y divide-border">
                  {analytics.cases
                    .filter((c) => c.isValid || c.isCenter)
                    .map((c) => (
                      <div
                        key={c.receiptNumber}
                        className={cn(
                          "flex items-center justify-between gap-3 px-3 py-2 text-sm",
                          c.isCenter && "bg-indigo-50/70 dark:bg-indigo-950/30"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={cn("w-2 h-2 rounded-full shrink-0", CATEGORY_META[c.category].dot)}
                            aria-hidden
                          />
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
                          className={cn(
                            "text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap max-w-[55%] truncate",
                            CATEGORY_META[c.category].pill
                          )}
                        >
                          {c.currentStatus || "Status not available"}
                        </span>
                      </div>
                    ))}
                </div>
              </details>
            )}

            <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
              <Info className="w-3.5 h-3.5 mt-px shrink-0" />
              Estimates from anonymized nearby USCIS receipts. Nearby cases can include
              other form types. Not affiliated with USCIS and not legal advice.
            </p>
          </>
        )}
      </div>
    </Card>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
