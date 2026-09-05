"use client";

import { useMemo } from "react";
import { Calendar, Clock, AlertTriangle, ChevronRight, FileText, Briefcase, Bell } from "lucide-react";
import Link from "next/link";
import {
  addDays,
  daysBetween,
  getFilingWindow,
} from "@/lib/immigration/opt-calculations";

interface Deadline {
  id: string;
  title: string;
  date: Date;
  daysLeft: number;
  type: "filing" | "employment" | "document" | "general";
  priority: "urgent" | "warning" | "normal";
  action?: {
    label: string;
    href: string;
  };
}

interface UpcomingDeadlinesPanelProps {
  optStatus?: {
    program_end_date: string;
    opt_start_date: string;
    opt_ead_end_date: string;
    stem_start_date?: string | null;
  } | null;
  isStemEligible?: boolean;
}

export function UpcomingDeadlinesPanel({ optStatus, isStemEligible }: UpcomingDeadlinesPanelProps) {
  const deadlines = useMemo<Deadline[]>(() => {
    if (!optStatus) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const calculatedDeadlines: Deadline[] = [];

    // Calculate filing window dates
    const filingWindow = getFilingWindow(optStatus.program_end_date);
    const earliestFileDate = new Date(`${filingWindow.earliestFile}T00:00:00`);
    const mustArriveBy = new Date(`${filingWindow.hardDeadline}T00:00:00`);

    // OPT EAD End Date
    const optEndDate = new Date(optStatus.opt_ead_end_date);
    const optEndDaysLeft = daysBetween(today, optEndDate);

    // Filing window open
    const filingOpenDaysLeft = daysBetween(today, earliestFileDate);
    if (filingOpenDaysLeft > 0) {
      calculatedDeadlines.push({
        id: "filing-open",
        title: "OPT Filing Window Opens",
        date: earliestFileDate,
        daysLeft: filingOpenDaysLeft,
        type: "filing",
        priority: filingOpenDaysLeft <= 7 ? "urgent" : filingOpenDaysLeft <= 30 ? "warning" : "normal",
        action: {
          label: "Prepare Documents",
          href: "/dashboard/documents",
        },
      });
    }

    // Filing deadline
    const filingDeadlineDaysLeft = daysBetween(today, mustArriveBy);
    if (filingDeadlineDaysLeft > 0) {
      calculatedDeadlines.push({
        id: "filing-deadline",
        title: "OPT Application Must Arrive",
        date: mustArriveBy,
        daysLeft: filingDeadlineDaysLeft,
        type: "filing",
        priority: filingDeadlineDaysLeft <= 14 ? "urgent" : filingDeadlineDaysLeft <= 30 ? "warning" : "normal",
        action: {
          label: "File I-765",
          href: "/dashboard/opt-tools",
        },
      });
    }

    // OPT End Date
    if (optEndDaysLeft > 0) {
      calculatedDeadlines.push({
        id: "opt-end",
        title: "OPT EAD Expires",
        date: optEndDate,
        daysLeft: optEndDaysLeft,
        type: "general",
        priority: optEndDaysLeft <= 30 ? "urgent" : optEndDaysLeft <= 90 ? "warning" : "normal",
        action: isStemEligible ? {
          label: "Apply STEM Extension",
          href: "/tools/stem-apply",
        } : undefined,
      });
    }

    // STEM Extension deadline (if eligible and on OPT)
    if (isStemEligible && optEndDaysLeft > 0 && optEndDaysLeft <= 120) {
      const stemDeadline = new Date(`${addDays(optStatus.opt_ead_end_date, -90)}T00:00:00`);
      const stemDeadlineDaysLeft = daysBetween(today, stemDeadline);
      
      if (stemDeadlineDaysLeft > 0) {
        calculatedDeadlines.push({
          id: "stem-deadline",
          title: "STEM OPT Application Window Opens",
          date: stemDeadline,
          daysLeft: stemDeadlineDaysLeft,
          type: "filing",
          priority: stemDeadlineDaysLeft <= 14 ? "urgent" : stemDeadlineDaysLeft <= 30 ? "warning" : "normal",
          action: {
            label: "Prepare I-983",
            href: "/tools/stem-apply",
          },
        });
      }
    }

    // Employment reporting reminder (every 6 months on STEM)
    if (optStatus.stem_start_date) {
      const stemStart = new Date(optStatus.stem_start_date);
      const sixMonthsFromStem = new Date(stemStart);
      sixMonthsFromStem.setMonth(sixMonthsFromStem.getMonth() + 6);
      
      while (sixMonthsFromStem < today) {
        sixMonthsFromStem.setMonth(sixMonthsFromStem.getMonth() + 6);
      }
      
      const reportingDaysLeft = Math.ceil((sixMonthsFromStem.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (reportingDaysLeft <= 30) {
        calculatedDeadlines.push({
          id: "stem-reporting",
          title: "STEM OPT Validation Report Due",
          date: sixMonthsFromStem,
          daysLeft: reportingDaysLeft,
          type: "employment",
          priority: reportingDaysLeft <= 7 ? "urgent" : "warning",
          action: {
            label: "Update Employment",
            href: "/dashboard#employment",
          },
        });
      }
    }

    // Sort by days left
    calculatedDeadlines.sort((a, b) => a.daysLeft - b.daysLeft);
    return calculatedDeadlines.slice(0, 5);
  }, [optStatus, isStemEligible]);

  const getTypeIcon = (type: Deadline["type"]) => {
    switch (type) {
      case "filing":
        return <FileText className="w-4 h-4" />;
      case "employment":
        return <Briefcase className="w-4 h-4" />;
      case "document":
        return <FileText className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getPriorityStyles = (priority: Deadline["priority"]) => {
    switch (priority) {
      case "urgent":
        return {
          badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
          border: "border-l-red-500",
          icon: "text-red-500",
        };
      case "warning":
        return {
          badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
          border: "border-l-amber-500",
          icon: "text-amber-500",
        };
      default:
        return {
          badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
          border: "border-l-blue-500",
          icon: "text-blue-500",
        };
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!optStatus) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Upcoming Deadlines</h2>
            <p className="text-sm text-muted-foreground">Track your important dates</p>
          </div>
        </div>
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Enter your OPT dates to see upcoming deadlines</p>
          <Link 
            href="/dashboard/opt-dates" 
            className="inline-flex items-center gap-1 mt-3 text-sm text-primary hover:underline"
          >
            Add OPT Dates <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Upcoming Deadlines</h2>
            <p className="text-sm text-muted-foreground">{deadlines.length} upcoming events</p>
          </div>
        </div>
        <Link 
          href="/dashboard/opt-dates" 
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          View All <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {deadlines.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <Bell className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No upcoming deadlines</p>
        </div>
      ) : (
        <div className="space-y-3">
          {deadlines.map((deadline) => {
            const styles = getPriorityStyles(deadline.priority);
            return (
              <div
                key={deadline.id}
                className={`relative pl-4 border-l-4 ${styles.border} bg-muted/30 rounded-r-lg p-4 transition-all hover:bg-muted/50`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={styles.icon}>{getTypeIcon(deadline.type)}</span>
                      <h3 className="font-medium text-sm truncate">{deadline.title}</h3>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(deadline.date)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full font-medium ${styles.badge}`}>
                        {deadline.daysLeft === 0
                          ? "Today"
                          : deadline.daysLeft === 1
                          ? "Tomorrow"
                          : `${deadline.daysLeft} days`}
                      </span>
                    </div>
                  </div>
                  {deadline.action && (
                    <Link
                      href={deadline.action.href}
                      className="shrink-0 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      {deadline.action.label}
                    </Link>
                  )}
                </div>
                {deadline.priority === "urgent" && (
                  <div className="absolute -top-1 -right-1">
                    <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
