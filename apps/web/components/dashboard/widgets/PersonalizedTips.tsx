"use client";

import { useState, useEffect } from "react";
import { Lightbulb, X, ChevronRight, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { addDays, daysBetween } from "@/lib/immigration/opt-calculations";

interface Tip {
  id: string;
  type: "urgent" | "warning" | "info" | "success";
  title: string;
  message: string;
  action?: {
    label: string;
    href: string;
  };
  condition: (data: TipData) => boolean;
}

interface TipData {
  unemploymentDays: number;
  maxUnemploymentDays: number;
  daysUntilOPTEnd: number | null;
  daysUntilFilingWindow: number | null;
  isStemEligible: boolean;
  hasStemStarted: boolean;
  hasEmployment: boolean;
  hasDocuments: boolean;
  hasCaseStatus: boolean;
}

interface PersonalizedTipsProps {
  optStatus?: {
    program_end_date: string;
    opt_start_date: string;
    opt_ead_end_date: string;
    stem_start_date?: string | null;
  } | null;
  unemploymentDays?: number;
  maxUnemploymentDays?: number;
  isStemEligible?: boolean;
  hasEmployment?: boolean;
}

const ALL_TIPS: Tip[] = [
  {
    id: "unemployment-critical",
    type: "urgent",
    title: "Unemployment Limit Critical",
    message: "You're close to the unemployment day limit. Log employment on OPT Dates and talk to your DSO about next steps.",
    action: { label: "Job Search Resources", href: "/help#job-search" },
    condition: (data) => data.hasEmployment && data.unemploymentDays >= data.maxUnemploymentDays * 0.9,
  },
  {
    id: "unemployment-warning",
    type: "warning",
    title: "Monitor Your Unemployment Days",
    message: "You've used most of your allowed unemployment days. Update employment on OPT Dates and plan your job search.",
    action: { label: "View Employment", href: "/dashboard/opt-dates#employment" },
    condition: (data) => data.hasEmployment && data.unemploymentDays >= data.maxUnemploymentDays * 0.75 && data.unemploymentDays < data.maxUnemploymentDays * 0.9,
  },
  {
    id: "filing-soon",
    type: "info",
    title: "Filing Window Opens Soon",
    message: "Your I-765 filing window opens in less than 30 days. Gather I-20, passport, and photos now.",
    action: { label: "Document Checklist", href: "/dashboard/documents" },
    condition: (data) => data.daysUntilFilingWindow !== null && data.daysUntilFilingWindow > 0 && data.daysUntilFilingWindow <= 30,
  },
  {
    id: "filing-open",
    type: "success",
    title: "Filing Window is Open",
    message: "You can now submit your OPT application. Don't wait until the last minute!",
    action: { label: "OPT Apply Tool", href: "/tools/opt-apply" },
    condition: (data) => data.daysUntilFilingWindow !== null && data.daysUntilFilingWindow <= 0,
  },
  {
    id: "opt-expiring-soon",
    type: "urgent",
    title: "OPT Expiring Soon",
    message: "Your OPT expires in less than 60 days. If you're STEM eligible, apply for the extension now.",
    action: { label: "STEM Extension", href: "/tools/stem-apply" },
    condition: (data) => data.daysUntilOPTEnd !== null && data.daysUntilOPTEnd <= 60 && data.daysUntilOPTEnd > 0 && data.isStemEligible && !data.hasStemStarted,
  },
  {
    id: "stem-eligible",
    type: "info",
    title: "STEM Extension Available",
    message: "You're eligible for a 24-month STEM OPT extension. Learn about the requirements and timeline.",
    action: { label: "Learn More", href: "/tools/stem-apply" },
    condition: (data) => data.isStemEligible && !data.hasStemStarted && (data.daysUntilOPTEnd === null || data.daysUntilOPTEnd > 60),
  },
  {
    id: "no-employment",
    type: "warning",
    title: "No Employment Recorded",
    message: "Add your job history on OPT Dates so we can calculate unemployment days accurately. Without employment records, the count isn't reliable yet.",
    action: { label: "Add Employment", href: "/dashboard/opt-dates#employment" },
    condition: (data) => !data.hasEmployment && data.daysUntilOPTEnd !== null,
  },
  {
    id: "stem-reporting",
    type: "info",
    title: "STEM OPT Reporting Reminder",
    message: "On STEM OPT, validate employment in the SEVP Portal every 6 months. Set a calendar reminder with your DSO's guidance.",
    action: { label: "Learn More", href: "/help#stem-reporting" },
    condition: (data) => data.hasStemStarted,
  },
  {
    id: "upload-ead",
    type: "info",
    title: "Keep Your EAD Safe",
    message: "Upload a copy of your EAD card to your secure document vault for easy access.",
    action: { label: "Upload Now", href: "/dashboard/documents" },
    condition: (data) => !data.hasDocuments && data.daysUntilOPTEnd !== null,
  },
];

export function PersonalizedTips({
  optStatus,
  unemploymentDays = 0,
  maxUnemploymentDays = 90,
  isStemEligible = false,
  hasEmployment = false,
}: PersonalizedTipsProps) {
  const [dismissedTips, setDismissedTips] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("dismissed-tips");
    if (stored) {
      try {
        setDismissedTips(JSON.parse(stored));
      } catch {
        setDismissedTips([]);
      }
    }
    setIsLoaded(true);
  }, []);

  const dismissTip = (tipId: string) => {
    const updated = [...dismissedTips, tipId];
    setDismissedTips(updated);
    localStorage.setItem("dismissed-tips", JSON.stringify(updated));
  };

  // Calculate tip data
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let daysUntilOPTEnd: number | null = null;
  let daysUntilFilingWindow: number | null = null;

  if (optStatus) {
    daysUntilOPTEnd = daysBetween(today, optStatus.opt_ead_end_date);
    daysUntilFilingWindow = daysBetween(
      today,
      addDays(optStatus.program_end_date, -90),
    );
  }

  const tipData: TipData = {
    unemploymentDays,
    maxUnemploymentDays,
    daysUntilOPTEnd,
    daysUntilFilingWindow,
    isStemEligible,
    hasStemStarted: !!optStatus?.stem_start_date,
    hasEmployment,
    hasDocuments: false, // Could be fetched from API
    hasCaseStatus: false, // Could be fetched from API
  };

  // Filter tips based on conditions and dismissals
  const activeTips = ALL_TIPS.filter(
    (tip) => tip.condition(tipData) && !dismissedTips.includes(tip.id)
  ).slice(0, 3); // Show max 3 tips

  const getTypeStyles = (type: Tip["type"]) => {
    switch (type) {
      case "urgent":
        return {
          bg: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50",
          icon: "text-red-500",
          iconBg: "bg-red-100 dark:bg-red-900/30",
        };
      case "warning":
        return {
          bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50",
          icon: "text-amber-500",
          iconBg: "bg-amber-100 dark:bg-amber-900/30",
        };
      case "success":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50",
          icon: "text-emerald-500",
          iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
        };
      default:
        return {
          bg: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50",
          icon: "text-blue-500",
          iconBg: "bg-blue-100 dark:bg-blue-900/30",
        };
    }
  };

  const getIcon = (type: Tip["type"]) => {
    switch (type) {
      case "urgent":
        return <AlertTriangle className="w-5 h-5" />;
      case "warning":
        return <Clock className="w-5 h-5" />;
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Lightbulb className="w-5 h-5" />;
    }
  };

  if (!isLoaded || activeTips.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Lightbulb className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-medium text-muted-foreground">Personalized Tips</h3>
      </div>
      
      {activeTips.map((tip) => {
        const styles = getTypeStyles(tip.type);
        return (
          <div
            key={tip.id}
            className={`relative flex items-start gap-4 p-4 rounded-xl border ${styles.bg}`}
          >
            <div className={`shrink-0 p-2 rounded-lg ${styles.iconBg} ${styles.icon}`}>
              {getIcon(tip.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm">{tip.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{tip.message}</p>
              {tip.action && (
                <Link
                  href={tip.action.href}
                  className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-primary hover:underline"
                >
                  {tip.action.label}
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
            <button
              onClick={() => dismissTip(tip.id)}
              className="shrink-0 p-1.5 text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
              title="Dismiss tip"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
