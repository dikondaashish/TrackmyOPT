"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
const POLL_INTERVAL_MS = 10_000;
const MAX_POLL_ATTEMPTS = 12;

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

/* ── Probability ring with glow ──────────────────────────────── */
function ProbabilityRing({ pct }: { pct: number | null }) {
  const value = pct ?? 0;
  return (
    <div
      className="relative h-28 w-28 shrink-0 animate-ring-glow"
      role="img"
      aria-label={pct !== null ? `${pct}% approval probability` : "Probability not yet available"}
    >
      <div
        className="h-full w-full rounded-full shadow-lg"
        style={{
          background: `conic-gradient(rgb(16 185 129) ${value * 3.6}deg, rgb(148 163 184 / 0.15) 0deg)`,
        }}
      />
      <div className="absolute inset-[8px] rounded-full bg-card flex flex-col items-center justify-center shadow-inner">
        <span className="text-2xl font-extrabold text-foreground leading-none animate-fade-in-scale">
          {pct !== null ? `${pct}%` : "—"}
        </span>
        <span className="text-[10px] text-muted-foreground mt-1 font-medium uppercase tracking-wider">approval</span>
      </div>
    </div>
  );
}

/* ── Stat tile with hover lift ───────────────────────────────── */
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
    <div className="rounded-xl border border-border bg-card p-4 hover-lift transition-all">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-2">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-extrabold text-foreground leading-none animate-fade-in-scale">{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-1.5">{sub}</p>}
    </div>
  );
}

/* ── Case-number range strip (the signature visual) ───────────── */
function RangeStrip({ cases }: { cases: CohortCase[] }) {
  if (!cases.length) return null;
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h4 className="text-sm font-bold text-foreground">
            Cases around yours
          </h4>
        </div>
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
          older ← → newer
        </span>
      </div>
      <div className="flex items-end gap-[2px] overflow-x-auto pb-2 py-2">
        {cases.map((c, i) => (
          <div
            key={c.receiptNumber}
            title={`${c.receiptNumber}${c.caseType ? ` · ${c.caseType}` : ""}\n${c.currentStatus || "No data"}`}
            className={cn(
              "shrink-0 rounded-sm transition-all duration-300 animate-bar-grow",
              CATEGORY_META[c.category].bar,
              c.isCenter
                ? "w-3 h-12 ring-2 ring-indigo-500 ring-offset-2 ring-offset-card shadow-lg shadow-indigo-500/20"
                : "w-[5px] h-7 hover:h-9 cursor-pointer"
            )}
            style={{ animationDelay: `${i * 8}ms` }}
          />
        ))}
      </div>
      <div className="relative h-4 text-[10px] text-muted-foreground font-medium">
        <span className="absolute left-0">−range</span>
        <span className="absolute left-1/2 -translate-x-1/2 font-bold text-indigo-600 dark:text-indigo-400">
          your case
        </span>
        <span className="absolute right-0">+range</span>
      </div>
    </div>
  );
}

/* ── Distribution bars with animated fill ────────────────────── */
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
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h4 className="text-sm font-bold text-foreground">{title}</h4>
      </div>
      <div className="space-y-3">
        {items.slice(0, 6).map((item, i) => (
          <div key={item.label}>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-foreground/80 truncate pr-2 font-medium">{item.label}</span>
              <span className="font-bold text-foreground whitespace-nowrap tabular-nums">
                {item.count}{" "}
                <span className="text-muted-foreground font-normal">({item.pct}%)</span>
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 animate-bar-grow"
                style={{
                  width: `${Math.max(item.pct, 2)}%`,
                  animationDelay: `${i * 100}ms`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Legend ───────────────────────────────────────────────────── */
function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
      {(["approved", "in_progress", "denied", "invalid"] as const).map((key) => (
        <span key={key} className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
          <span className={cn("w-3 h-3 rounded-full shadow-sm", CATEGORY_META[key].dot)} />
          {CATEGORY_META[key].label}
        </span>
      ))}
    </div>
  );
}

/* ── Loading skeleton ─────────────────────────────────────────── */
function CohortSkeleton() {
  return (
    <div className="animate-pulse space-y-5" aria-hidden>
      <div className="h-28 rounded-xl bg-muted" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-20 rounded-xl bg-muted" />
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
  const pollAttemptsRef = useRef(0);

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

  useEffect(() => {
    pollAttemptsRef.current = 0;
  }, [receiptNumber, range]);

  useEffect(() => {
    if (isPremium !== true || !analytics || analytics.pending <= 0) return;
    if (pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) return;

    const timer = setInterval(() => {
      if (pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) {
        clearInterval(timer);
        return;
      }
      pollAttemptsRef.current += 1;
      void loadCohort();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [analytics?.pending, analytics?.totalScanned, isPremium, loadCohort]);

  const isLiveScanning = Boolean(analytics && analytics.pending > 0);

  /* ── Free / locked state ──────────────────────────────────── */
  if (isPremium !== true) {
    return (
      <Card className="overflow-hidden border-0 shadow-2xl shadow-indigo-900/10 dark:shadow-indigo-900/20">
        <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-5 py-7 sm:px-7 text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/8 blur-xl" />

          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-lg">
              <Users className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-extrabold">Nearby Case Insights</h3>
              <p className="text-sm text-indigo-100 mt-1.5 max-w-prose leading-relaxed">
                USCIS issues receipt numbers in order, so cases filed right before
                and after yours are often the same type. See how that group is
                moving — approval rates, typical processing time, and an outcome
                prediction for cases like yours.
              </p>
            </div>
          </div>
        </div>
        <div className="p-5 sm:p-7">
          <ul className="grid sm:grid-cols-3 gap-3 mb-6">
            {[
              { icon: TrendingUp, text: "Approval rate of nearby cases" },
              { icon: Clock, text: "Real processing-time estimates" },
              { icon: Sparkles, text: "AI prediction for your case" },
            ].map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/30 px-3.5 py-3 text-sm text-foreground hover-lift transition-all"
              >
                <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                {text}
              </li>
            ))}
          </ul>
          <Button onClick={onUpgrade} className="gap-2 w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/20">
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

  /* ── Pro state ────────────────────────────────────────────── */
  return (
    <Card className="overflow-hidden border-0 shadow-2xl shadow-indigo-900/10 dark:shadow-indigo-900/20">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 px-5 py-5 sm:px-7 text-white relative overflow-hidden animate-gradient-flow">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />

        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-extrabold leading-tight">Nearby Case Insights</h3>
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
              className="text-sm rounded-xl bg-white/15 text-white border border-white/20 px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50 [&>option]:text-gray-900 backdrop-blur-sm"
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
              className="bg-white/15 text-white border-white/20 hover:bg-white/25 gap-1.5 backdrop-blur-sm"
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-7 space-y-7">
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {isLoading && !analytics && <CohortSkeleton />}

        {analytics && (
          <>
            {/* Prediction hero */}
            {prediction && (
              <div className="rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50/80 to-violet-50/50 dark:from-indigo-950/30 dark:to-violet-950/20 p-5 sm:p-6 shadow-lg shadow-indigo-500/5">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-700 dark:text-indigo-300">
                    Prediction for cases like yours
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-7">
                  <ProbabilityRing pct={prediction.probabilityPct} />
                  <div className="flex-1 space-y-3">
                    <p className="text-lg font-bold text-foreground">
                      {prediction.label}
                    </p>
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
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
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 font-medium">
                  <span>
                    Scan coverage
                    {isLiveScanning && (
                      <span className="ml-2 text-indigo-600 dark:text-indigo-400">
                        · Scanning nearby cases… updating live
                      </span>
                    )}
                  </span>
                  <span className="tabular-nums">
                    {analytics.totalScanned}/{analytics.totalRequested} ({coveragePct}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 animate-progress-fill shadow-sm shadow-indigo-500/20"
                    style={{ width: `${Math.max(coveragePct, 2)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Range strip + legend */}
            {analytics.totalValid > 0 ? (
              <div className="space-y-4">
                <RangeStrip cases={analytics.cases} />
                <Legend />
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-center">
                <RefreshCw className="w-5 h-5 mx-auto mb-2 text-muted-foreground animate-spin" />
                <p className="text-sm font-semibold text-foreground">
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
              <div className="grid md:grid-cols-2 gap-7">
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
                <summary className="flex items-center justify-between cursor-pointer list-none rounded-xl border border-border bg-muted/30 px-4 py-3.5 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors">
                  <span>
                    View all {analytics.cases.filter((c) => c.isValid).length} found cases
                  </span>
                  <ChevronDownIcon />
                </summary>
                <div className="mt-2 max-h-72 overflow-y-auto rounded-xl border border-border divide-y divide-border scrollbar-thin">
                  {analytics.cases
                    .filter((c) => c.isValid || c.isCenter)
                    .map((c) => (
                      <div
                        key={c.receiptNumber}
                        className={cn(
                          "flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors",
                          c.isCenter && "bg-indigo-50/70 dark:bg-indigo-950/30"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={cn("w-2.5 h-2.5 rounded-full shrink-0", CATEGORY_META[c.category].dot)}
                            aria-hidden
                          />
                          <span className="font-mono text-xs text-foreground truncate">
                            {c.receiptNumber}
                          </span>
                          {c.isCenter && (
                            <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase bg-indigo-100 dark:bg-indigo-900/40 px-1.5 py-0.5 rounded">
                              You
                            </span>
                          )}
                          {c.caseType && (
                            <span className="text-[10px] text-muted-foreground">{c.caseType}</span>
                          )}
                        </div>
                        <span
                          className={cn(
                            "text-[11px] px-2.5 py-0.5 rounded-full whitespace-nowrap max-w-[55%] truncate font-medium",
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
