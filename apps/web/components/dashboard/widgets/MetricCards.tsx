"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Briefcase, GraduationCap } from "lucide-react";
import { calculateUnemploymentDays, type EmploymentSpan as CalculationEmploymentSpan } from "@/lib/immigration/optCalculations";

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  status: "good" | "warning" | "critical" | "neutral";
  subtitle?: string;
}

function MetricCard({ title, value, icon, status, subtitle }: MetricCardProps) {
  const statusStyles = {
    good: "border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20",
    warning: "border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20",
    critical: "border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20",
    neutral: "border-border bg-card",
  };

  const iconStyles = {
    good: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50",
    warning: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50",
    critical: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/50",
    neutral: "text-muted-foreground bg-muted",
  };

  const badgeStyles = {
    good: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400",
    critical: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
    neutral: "bg-muted text-muted-foreground",
  };

  return (
    <div className={`group border rounded-xl p-5 transition-all duration-200 hover:shadow-lg ${statusStyles[status]}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${iconStyles[status]}`}>
          {icon}
        </div>
        {subtitle && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeStyles[status]}`}>
            {subtitle}
          </span>
        )}
      </div>
      <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
      <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
    </div>
  );
}

interface MetricCardsApiData {
  optStatus?: Record<string, any> | null;
  employmentSpans?: any[];
  profile?: Record<string, any> | null;
  unemploymentDays?: number;
}

interface MetricCardsProps {
  /** Pass already-fetched /api/me data to avoid a duplicate network request. */
  apiData?: MetricCardsApiData | null;
}

export function MetricCards({ apiData }: MetricCardsProps = {}) {
  const [metrics, setMetrics] = useState({
    filingWindowDays: null as number | null,
    filingDeadlineDays: null as number | null, // days until 60-day-post-program-end deadline
    unemploymentUsed: 0,
    maxUnemployment: 90 as 90 | 150,
    daysUntilOPTEnd: null as number | null,
    isStemEligible: false,
    hasStemStarted: false,
    // Phase-aware unemployment breakdown (ISS-001)
    initialOptUnemploymentDays: 0,
    stemUnemploymentDays: 0,
    phase: "initial" as "initial" | "stem" | "post",
    exceededInitialOptCap: false,
    exceededCumulativeCap: false,
  });
  const [isLoading, setIsLoading] = useState(!apiData);

  useEffect(() => {
    // If parent already fetched /api/me data, skip the duplicate request.
    if (apiData !== undefined) {
      if (apiData) processData(apiData);
      setIsLoading(false);
      return;
    }

    const fetchMetrics = async () => {
      try {
        const response = await fetch("/api/me", { credentials: "include", cache: "no-store" });
        if (response.ok) {
          processData(await response.json());
        }
      } catch (error) {
        console.error("Failed to fetch metrics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function processData(data: MetricCardsApiData) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filingWindowDays = null;
    let filingDeadlineDays: number | null = null;
    let daysUntilOPTEnd = null;
    let maxUnemployment: 90 | 150 = 90;

    if (data.optStatus) {
      const programEnd = new Date(data.optStatus.program_end_date);
      const earliestFileDate = new Date(programEnd);
      earliestFileDate.setDate(earliestFileDate.getDate() - 90);
      filingWindowDays = Math.ceil((earliestFileDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // 60-day-after-program-end hard deadline (ISS-004)
      const filingHardDeadline = new Date(programEnd);
      filingHardDeadline.setDate(filingHardDeadline.getDate() + 60);
      filingDeadlineDays = Math.ceil((filingHardDeadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      const optEnd = new Date(data.optStatus.opt_ead_end_date);
      daysUntilOPTEnd = Math.ceil((optEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (data.optStatus.stem_start_date) {
        maxUnemployment = 150;
      }
    }

    let unemploymentUsed = data.unemploymentDays || 0;
    let initialOptUnemploymentDays = 0;
    let stemUnemploymentDays = 0;
    let phase: "initial" | "stem" | "post" = "initial";
    let exceededInitialOptCap = false;
    let exceededCumulativeCap = false;
    if (data.optStatus?.opt_start_date && data.optStatus?.opt_ead_end_date) {
      const spansForCalc: CalculationEmploymentSpan[] = (data.employmentSpans || []).map((s: any) => ({
        id: s.id,
        employer_name: s.employer_name || "",
        start_date: s.start_date,
        end_date: s.end_date,
        is_current: !!s.is_current,
        job_title: s.job_title,
        location: s.location,
      }));
      const calc = calculateUnemploymentDays(
        data.optStatus.opt_start_date,
        data.optStatus.opt_ead_end_date,
        spansForCalc,
        data.optStatus.stem_start_date,
        data.optStatus.stem_end_date
      );
      unemploymentUsed = calc.used;
      // Authoritative cap from phase-aware engine — guarantees numerator/denominator align.
      maxUnemployment = calc.max;
      initialOptUnemploymentDays = calc.initialOptUnemploymentDays;
      stemUnemploymentDays = calc.stemUnemploymentDays;
      phase = calc.phase;
      exceededInitialOptCap = calc.exceededInitialOptCap;
      exceededCumulativeCap = calc.exceededCumulativeCap;
    }

    setMetrics({
      filingWindowDays,
      filingDeadlineDays,
      unemploymentUsed,
      maxUnemployment,
      daysUntilOPTEnd,
      isStemEligible: data.profile?.is_stem_eligible || false,
      hasStemStarted: !!data.optStatus?.stem_start_date,
      initialOptUnemploymentDays,
      stemUnemploymentDays,
      phase,
      exceededInitialOptCap,
      exceededCumulativeCap,
    });
  }

  // Determine status for each metric
  const getFilingStatus = () => {
    if (metrics.filingWindowDays === null) return "neutral";
    if (metrics.filingWindowDays > 30) return "neutral";
    if (metrics.filingWindowDays > 0) return "warning";
    // Window is open — escalate as deadline approaches
    if (metrics.filingDeadlineDays === null || metrics.filingDeadlineDays < 0) return "neutral";
    if (metrics.filingDeadlineDays <= 14) return "critical";
    if (metrics.filingDeadlineDays <= 30) return "warning";
    return "good";
  };

  const getUnemploymentStatus = () => {
    // Hard-critical: either cap was breached at any point in the user's OPT/STEM journey.
    if (metrics.exceededCumulativeCap || metrics.exceededInitialOptCap) return "critical";
    const percentage = metrics.maxUnemployment > 0
      ? metrics.unemploymentUsed / metrics.maxUnemployment
      : 0;
    if (percentage >= 0.9) return "critical";
    if (percentage >= 0.75) return "warning";
    return "good";
  };

  const getOPTEndStatus = () => {
    if (metrics.daysUntilOPTEnd === null) return "neutral";
    if (metrics.daysUntilOPTEnd <= 30) return "critical";
    if (metrics.daysUntilOPTEnd <= 90) return "warning";
    return "good";
  };

  const getStemStatus = () => {
    if (metrics.hasStemStarted) return "good";
    if (metrics.isStemEligible) return "warning";
    return "neutral";
  };

  // Format values — window-open state shows the closing deadline countdown (ISS-004)
  const filingValue = metrics.filingWindowDays === null
    ? "—"
    : metrics.filingWindowDays <= 0
      ? metrics.filingDeadlineDays !== null && metrics.filingDeadlineDays >= 0
        ? `${metrics.filingDeadlineDays} days left`
        : "Window Closed"
      : `${metrics.filingWindowDays} days`;

  // Always shows the CURRENT-phase compliance number (X / 90 in initial, X / 150 after STEM).
  // STEM never resets — the cumulative number carries over.
  const unemploymentValue = `${metrics.unemploymentUsed}/${metrics.maxUnemployment}`;
  
  const optEndValue = metrics.daysUntilOPTEnd === null 
    ? "—" 
    : metrics.daysUntilOPTEnd < 0 
      ? "Expired" 
      : `${metrics.daysUntilOPTEnd} days`;

  const stemValue = metrics.hasStemStarted 
    ? "Active" 
    : metrics.isStemEligible 
      ? "Eligible" 
      : "Not Eligible";

  // Status labels — within window, escalate based on deadline proximity (ISS-004)
  const filingSubtitle = metrics.filingWindowDays === null
    ? undefined
    : metrics.filingWindowDays <= 0
      ? metrics.filingDeadlineDays !== null && metrics.filingDeadlineDays <= 14
        ? "File ASAP"
        : metrics.filingDeadlineDays !== null && metrics.filingDeadlineDays <= 30
          ? "Closing Soon"
          : "Window Open"
      : metrics.filingWindowDays <= 30
        ? "Opening Soon"
        : undefined;

  // Phase-aware subtitle so the card never looks identical between initial OPT
  // and STEM OPT, and so it never suggests STEM "resets" the counter.
  const unemploymentSubtitle = (() => {
    if (metrics.exceededInitialOptCap && metrics.phase !== "initial") {
      return "Initial 90 exceeded";
    }
    if (metrics.exceededCumulativeCap) return "Limit Exceeded";
    if (getUnemploymentStatus() === "critical") return "Critical";
    if (getUnemploymentStatus() === "warning") return "Caution";
    return metrics.phase === "stem" ? "Cumulative (OPT + STEM)" : "Initial OPT";
  })();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
            <div className="w-10 h-10 bg-muted rounded-lg mb-3" />
            <div className="h-4 bg-muted rounded w-24 mb-2" />
            <div className="h-8 bg-muted rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  // Phase-aware breakdown shown UNDER the unemployment card when the user is
  // in (or past) the STEM phase. Makes it crystal clear that STEM does NOT
  // reset the counter and that the initial-90 portion is still tracked.
  const showBreakdown = metrics.phase !== "initial" && metrics.hasStemStarted;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Filing Window"
          value={filingValue}
          icon={<Calendar className="w-5 h-5" />}
          status={getFilingStatus()}
          subtitle={filingSubtitle}
        />
        <MetricCard
          title="Unemployment Days"
          value={unemploymentValue}
          icon={<Clock className="w-5 h-5" />}
          status={getUnemploymentStatus()}
          subtitle={unemploymentSubtitle}
        />
        <MetricCard
          title="Until OPT Expires"
          value={optEndValue}
          icon={<Briefcase className="w-5 h-5" />}
          status={getOPTEndStatus()}
          subtitle={metrics.daysUntilOPTEnd !== null && metrics.daysUntilOPTEnd <= 90 ? "Plan Ahead" : undefined}
        />
        <MetricCard
          title="STEM Extension"
          value={stemValue}
          icon={<GraduationCap className="w-5 h-5" />}
          status={getStemStatus()}
          subtitle={metrics.hasStemStarted ? "24-Month" : undefined}
        />
      </div>

      {showBreakdown && (
        <div
          className="rounded-xl border border-border bg-card/50 p-4 text-sm space-y-2"
          role="region"
          aria-label="OPT and STEM unemployment breakdown"
        >
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <div>
              <span className="text-muted-foreground">Cumulative OPT + STEM:</span>{" "}
              <strong className={metrics.exceededCumulativeCap ? "text-red-600 dark:text-red-400" : "text-foreground"}>
                {metrics.unemploymentUsed} / 150 days
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground">Initial OPT portion:</span>{" "}
              <strong className={metrics.exceededInitialOptCap ? "text-red-600 dark:text-red-400" : "text-foreground"}>
                {metrics.initialOptUnemploymentDays} / 90 days
              </strong>
            </div>
            <div>
              <span className="text-muted-foreground">STEM-period portion:</span>{" "}
              <strong className="text-foreground">{metrics.stemUnemploymentDays} days</strong>
            </div>
          </div>
          {metrics.exceededInitialOptCap && (
            <p className="text-xs text-red-700 dark:text-red-400" role="alert">
              ⚠️ Initial OPT unemployment exceeded 90 days. STEM approval does not erase this — contact your DSO.
            </p>
          )}
          {!metrics.exceededInitialOptCap && (
            <p className="text-xs text-muted-foreground">
              STEM OPT extends your cumulative allowance to 150 days total. It does <em>not</em> reset the counter.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

