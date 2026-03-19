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

export function MetricCards() {
  const [metrics, setMetrics] = useState({
    filingWindowDays: null as number | null,
    unemploymentUsed: 0,
    maxUnemployment: 90,
    daysUntilOPTEnd: null as number | null,
    isStemEligible: false,
    hasStemStarted: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch("/api/me", { credentials: "include", cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          let filingWindowDays = null;
          let daysUntilOPTEnd = null;
          let maxUnemployment = 90;

          if (data.optStatus) {
            // Calculate filing window days
            const programEnd = new Date(data.optStatus.program_end_date);
            const earliestFileDate = new Date(programEnd);
            earliestFileDate.setDate(earliestFileDate.getDate() - 90);
            filingWindowDays = Math.ceil((earliestFileDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            // Calculate days until OPT end
            const optEnd = new Date(data.optStatus.opt_ead_end_date);
            daysUntilOPTEnd = Math.ceil((optEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            // Check if on STEM OPT
            if (data.optStatus.stem_start_date) {
              maxUnemployment = 150;
            }
          }

          let unemploymentUsed = data.unemploymentDays || 0;
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
            unemploymentUsed = calculateUnemploymentDays(
              data.optStatus.opt_start_date,
              data.optStatus.opt_ead_end_date,
              spansForCalc
            ).used;
          }

          setMetrics({
            filingWindowDays,
            unemploymentUsed,
            maxUnemployment,
            daysUntilOPTEnd,
            isStemEligible: data.profile?.is_stem_eligible || false,
            hasStemStarted: !!data.optStatus?.stem_start_date,
          });
        }
      } catch (error) {
        console.error("Failed to fetch metrics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  // Determine status for each metric
  const getFilingStatus = () => {
    if (metrics.filingWindowDays === null) return "neutral";
    if (metrics.filingWindowDays <= 0) return "good";
    if (metrics.filingWindowDays <= 30) return "warning";
    return "neutral";
  };

  const getUnemploymentStatus = () => {
    const percentage = metrics.unemploymentUsed / metrics.maxUnemployment;
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

  // Format values
  const filingValue = metrics.filingWindowDays === null 
    ? "—" 
    : metrics.filingWindowDays <= 0 
      ? "Open Now" 
      : `${metrics.filingWindowDays} days`;

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

  // Status labels
  const filingSubtitle = metrics.filingWindowDays === null 
    ? undefined 
    : metrics.filingWindowDays <= 0 
      ? "Apply Now" 
      : metrics.filingWindowDays <= 30 
        ? "Opening Soon" 
        : undefined;

  const unemploymentSubtitle = getUnemploymentStatus() === "critical" 
    ? "Critical" 
    : getUnemploymentStatus() === "warning" 
      ? "Caution" 
      : "On Track";

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

  return (
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
  );
}

