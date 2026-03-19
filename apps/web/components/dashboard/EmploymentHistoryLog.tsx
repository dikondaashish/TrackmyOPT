"use client";

import { useState, useEffect } from "react";
import { Briefcase, Calendar, Clock, Plus, ChevronDown, ChevronUp, Building2, MapPin } from "lucide-react";
import Link from "next/link";

interface EmploymentSpan {
  id: string;
  employer_name: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  job_title?: string;
  location?: string;
}

interface EmploymentHistoryLogProps {
  employmentSpans?: EmploymentSpan[];
  optStartDate?: string;
  optEndDate?: string;
  maxUnemploymentDays?: number;
}

export function EmploymentHistoryLog({
  employmentSpans = [],
  optStartDate,
  optEndDate,
  maxUnemploymentDays = 90,
}: EmploymentHistoryLogProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [stats, setStats] = useState({
    totalEmployedDays: 0,
    totalUnemployedDays: 0,
    currentStreak: 0,
    longestGap: 0,
  });

  useEffect(() => {
    if (!optStartDate) {
      setStats({
        totalEmployedDays: 0,
        totalUnemployedDays: 0,
        currentStreak: 0,
        longestGap: 0,
      });
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const optStart = new Date(optStartDate);
    const optEnd = optEndDate ? new Date(optEndDate) : today;
    const effectiveEnd = optEnd < today ? optEnd : today;

    // Sort spans by start date
    const sortedSpans = [...employmentSpans].sort(
      (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );

    let totalEmployed = 0;
    let longestGap = 0;
    let lastEndDate = optStart;

    sortedSpans.forEach((span) => {
      const spanStart = new Date(span.start_date);
      const spanEnd = span.end_date ? new Date(span.end_date) : today;

      // Calculate gap before this employment
      if (spanStart > lastEndDate) {
        const gapDays = Math.ceil((spanStart.getTime() - lastEndDate.getTime()) / (1000 * 60 * 60 * 24));
        if (gapDays > longestGap) longestGap = gapDays;
      }

      // Calculate employed days
      const effectiveSpanEnd = spanEnd < effectiveEnd ? spanEnd : effectiveEnd;
      const effectiveSpanStart = spanStart > optStart ? spanStart : optStart;
      if (effectiveSpanEnd > effectiveSpanStart) {
        totalEmployed += Math.ceil((effectiveSpanEnd.getTime() - effectiveSpanStart.getTime()) / (1000 * 60 * 60 * 24));
      }

      if (spanEnd > lastEndDate) lastEndDate = spanEnd;
    });

    // Current streak means currently employed duration OR currently unemployed duration.
    const currentSpan = sortedSpans.find((s) => {
      if (!s.is_current) return false;
      const start = new Date(s.start_date);
      const end = s.end_date ? new Date(s.end_date) : null;
      return start <= today && (!end || end >= today);
    });
    let currentStreak = 0;
    if (currentSpan) {
      currentStreak = Math.ceil((today.getTime() - new Date(currentSpan.start_date).getTime()) / (1000 * 60 * 60 * 24));
    } else {
      const endedSpans = sortedSpans
        .map((s) => (s.end_date ? new Date(s.end_date) : null))
        .filter((d): d is Date => !!d && d <= today);

      const lastEmploymentEnd = endedSpans.length > 0
        ? new Date(Math.max(...endedSpans.map((d) => d.getTime())))
        : optStart;

      currentStreak = Math.max(
        0,
        Math.ceil((today.getTime() - lastEmploymentEnd.getTime()) / (1000 * 60 * 60 * 24))
      );
    }

    // Total days in OPT period
    const totalOPTDays = Math.ceil((effectiveEnd.getTime() - optStart.getTime()) / (1000 * 60 * 60 * 24));
    const totalUnemployed = Math.max(0, totalOPTDays - totalEmployed);

    setStats({
      totalEmployedDays: totalEmployed,
      totalUnemployedDays: totalUnemployed,
      currentStreak,
      longestGap,
    });
  }, [employmentSpans, optStartDate, optEndDate]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateDuration = (start: string, end: string | null) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days < 30) return `${days} days`;
    if (days < 365) {
      const months = Math.floor(days / 30);
      return `${months} month${months > 1 ? "s" : ""}`;
    }
    const years = Math.floor(days / 365);
    const remainingMonths = Math.floor((days % 365) / 30);
    return `${years}y ${remainingMonths}m`;
  };

  const sortedSpans = [...employmentSpans].sort(
    (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
  );

  const displayedSpans = isExpanded ? sortedSpans : sortedSpans.slice(0, 3);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <Briefcase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Employment History</h2>
            <p className="text-sm text-muted-foreground">
              {employmentSpans.length} employment record{employmentSpans.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/opt-dates"
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Employment
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-muted/30">
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.totalEmployedDays}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Days Employed</p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-bold ${
            stats.totalUnemployedDays >= maxUnemploymentDays * 0.9
              ? "text-red-600 dark:text-red-400"
              : stats.totalUnemployedDays >= maxUnemploymentDays * 0.75
              ? "text-amber-600 dark:text-amber-400"
              : "text-blue-600 dark:text-blue-400"
          }`}>
            {stats.totalUnemployedDays}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Days Unemployed</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">
            {stats.currentStreak}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Current Streak</p>
        </div>
        <div className="text-center">
          <p className={`text-2xl font-bold ${
            stats.longestGap > 30 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
          }`}>
            {stats.longestGap}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Longest Gap</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Unemployment Days Used</span>
          <span>{stats.totalUnemployedDays} / {maxUnemploymentDays}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              stats.totalUnemployedDays >= maxUnemploymentDays * 0.9
                ? "bg-red-500"
                : stats.totalUnemployedDays >= maxUnemploymentDays * 0.75
                ? "bg-amber-500"
                : "bg-emerald-500"
            }`}
            style={{ width: `${Math.min(100, (stats.totalUnemployedDays / maxUnemploymentDays) * 100)}%` }}
          />
        </div>
      </div>

      {/* Employment List */}
      {employmentSpans.length === 0 ? (
        <div className="p-8 text-center">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground mb-3">No employment records yet</p>
          <Link
            href="/dashboard/opt-dates"
            className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Your First Job
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {displayedSpans.map((span, index) => (
            <div
              key={span.id}
              className="p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  span.is_current
                    ? "bg-emerald-100 dark:bg-emerald-900/30"
                    : "bg-muted"
                }`}>
                  <Building2 className={`w-5 h-5 ${
                    span.is_current
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm truncate">{span.employer_name}</h3>
                    {span.is_current && (
                      <span className="shrink-0 px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  {span.job_title && (
                    <p className="text-xs text-muted-foreground mt-0.5">{span.job_title}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(span.start_date)} - {span.end_date ? formatDate(span.end_date) : "Present"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {calculateDuration(span.start_date, span.end_date)}
                    </span>
                    {span.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {span.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Show More/Less */}
      {sortedSpans.length > 3 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center justify-center gap-1 border-t border-border"
        >
          {isExpanded ? (
            <>
              Show Less <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Show All ({sortedSpans.length}) <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
