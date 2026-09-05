"use client";

import { useState, useEffect } from "react";
import { X, AlertTriangle, Clock, CheckCircle, Info, ChevronRight } from "lucide-react";
import Link from "next/link";
import { addDaysIso, parseValidDate, startOfLocalDayMs } from "@/lib/case-status/safe-dates";

interface Notification {
  id: string;
  type: "urgent" | "warning" | "info" | "success";
  title: string;
  message: string;
  action?: {
    label: string;
    href: string;
  };
  dismissible: boolean;
  expiresAt?: Date;
}

interface NotificationBannerProps {
  optStatus?: {
    program_end_date: string;
    opt_start_date: string;
    opt_ead_end_date: string;
    stem_start_date?: string | null;
  } | null;
  unemploymentDays?: number;
  maxUnemploymentDays?: number;
  hasEmployment?: boolean;
}

export function NotificationBanner({
  optStatus,
  unemploymentDays = 0,
  maxUnemploymentDays = 90,
  hasEmployment = false,
}: NotificationBannerProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  // Hydration fix: render nothing until the client has loaded dismissedIds
  // from localStorage. Without this guard the server renders all banners
  // and the client immediately hides some → hydration error #418.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load dismissed notifications from localStorage and mark as mounted.
    // Both happen together so there is exactly one render cycle with the real
    // dismissed list — the server-rendered HTML (no banners visible) stays
    // consistent with the initial client paint.
    const stored = localStorage.getItem("dismissed-notifications");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Filter out old dismissals (older than 7 days)
        const validDismissals = parsed.filter((item: { id: string; timestamp: number }) => {
          return Date.now() - item.timestamp < 7 * 24 * 60 * 60 * 1000;
        });
        setDismissedIds(validDismissals.map((item: { id: string }) => item.id));
      } catch {
        setDismissedIds([]);
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    const newNotifications: Notification[] = [];
    const todayMs = Date.now();
    const todayStartMs = startOfLocalDayMs(todayMs);

    const daysUntil = (iso: string) => {
      const end = parseValidDate(iso);
      if (!end) return null;
      return Math.ceil((end.getTime() - todayStartMs) / 86_400_000);
    };

    // Check unemployment days (only when employment history exists)
    if (hasEmployment && unemploymentDays >= maxUnemploymentDays * 0.9) {
      newNotifications.push({
        id: "unemployment-critical",
        type: "urgent",
        title: "Critical: Unemployment Limit Approaching",
        message: `You have used ${unemploymentDays} of ${maxUnemploymentDays} unemployment days. Find employment immediately to maintain your OPT status.`,
        action: {
          label: "Update Employment",
          href: "/dashboard/opt-dates",
        },
        dismissible: false,
      });
    } else if (hasEmployment && unemploymentDays >= maxUnemploymentDays * 0.75) {
      newNotifications.push({
        id: "unemployment-warning",
        type: "warning",
        title: "Warning: Unemployment Days Running Low",
        message: `You have used ${unemploymentDays} of ${maxUnemploymentDays} unemployment days. Consider finding employment soon.`,
        action: {
          label: "Track Employment",
          href: "/tools/opt-clock",
        },
        dismissible: true,
      });
    }

    if (optStatus) {
      const daysUntilEnd = daysUntil(optStatus.opt_ead_end_date);

      // OPT ending soon
      if (daysUntilEnd != null && daysUntilEnd <= 30 && daysUntilEnd > 0) {
        newNotifications.push({
          id: "opt-ending-soon",
          type: "urgent",
          title: "OPT Expiring Soon",
          message: `Your OPT EAD expires in ${daysUntilEnd} days. If you're STEM eligible, apply for extension now.`,
          action: {
            label: "Apply for STEM OPT",
            href: "/tools/stem-apply",
          },
          dismissible: false,
        });
      } else if (daysUntilEnd != null && daysUntilEnd <= 90 && daysUntilEnd > 30) {
        newNotifications.push({
          id: "opt-ending-warning",
          type: "warning",
          title: "OPT Expiration Reminder",
          message: `Your OPT EAD expires in ${daysUntilEnd} days. Plan ahead for your next steps.`,
          action: {
            label: "View Options",
            href: "/dashboard/opt-tools",
          },
          dismissible: true,
        });
      }

      // Filing deadline approaching
      const mustArriveBy = addDaysIso(optStatus.program_end_date, 60);
      const daysUntilDeadline =
        mustArriveBy != null ? daysUntil(mustArriveBy) : null;

      if (daysUntilDeadline != null && daysUntilDeadline <= 14 && daysUntilDeadline > 0) {
        newNotifications.push({
          id: "filing-deadline-urgent",
          type: "urgent",
          title: "Filing Deadline Approaching",
          message: `Your OPT application must arrive at USCIS within ${daysUntilDeadline} days.`,
          action: {
            label: "View Checklist",
            href: "/dashboard/documents",
          },
          dismissible: false,
        });
      }
    }

    // Welcome notification for new users
    if (!optStatus) {
      newNotifications.push({
        id: "welcome-setup",
        type: "info",
        title: "Welcome to TrackMyOPT!",
        message: "Get started by entering your OPT dates to unlock all features and deadline tracking.",
        action: {
          label: "Enter OPT Dates",
          href: "/dashboard/opt-dates",
        },
        dismissible: true,
      });
    }

    setNotifications(newNotifications);
  }, [optStatus, unemploymentDays, maxUnemploymentDays]);

  const dismissNotification = (id: string) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    
    // Save to localStorage with timestamp
    const stored = localStorage.getItem("dismissed-notifications");
    let existing: { id: string; timestamp: number }[] = [];
    if (stored) {
      try {
        existing = JSON.parse(stored);
      } catch {
        existing = [];
      }
    }
    existing.push({ id, timestamp: Date.now() });
    localStorage.setItem("dismissed-notifications", JSON.stringify(existing));
  };

  // Render nothing until localStorage has been read on the client.
  // This keeps the server HTML (null) identical to the first client render.
  if (!mounted) return null;

  const visibleNotifications = notifications.filter((n) => !dismissedIds.includes(n.id));

  if (visibleNotifications.length === 0) return null;

  const getTypeStyles = (type: Notification["type"]) => {
    switch (type) {
      case "urgent":
        return {
          bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50",
          icon: "text-red-500",
          title: "text-red-800 dark:text-red-300",
          message: "text-red-700 dark:text-red-400",
          button: "bg-red-600 hover:bg-red-700 text-white",
        };
      case "warning":
        return {
          bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50",
          icon: "text-amber-500",
          title: "text-amber-800 dark:text-amber-300",
          message: "text-amber-700 dark:text-amber-400",
          button: "bg-amber-600 hover:bg-amber-700 text-white",
        };
      case "success":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50",
          icon: "text-emerald-500",
          title: "text-emerald-800 dark:text-emerald-300",
          message: "text-emerald-700 dark:text-emerald-400",
          button: "bg-emerald-600 hover:bg-emerald-700 text-white",
        };
      default:
        return {
          bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50",
          icon: "text-blue-500",
          title: "text-blue-800 dark:text-blue-300",
          message: "text-blue-700 dark:text-blue-400",
          button: "bg-blue-600 hover:bg-blue-700 text-white",
        };
    }
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "urgent":
        return <AlertTriangle className="w-5 h-5" />;
      case "warning":
        return <Clock className="w-5 h-5" />;
      case "success":
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-3">
      {visibleNotifications.map((notification) => {
        const styles = getTypeStyles(notification.type);
        return (
          <div
            key={notification.id}
            className={`relative flex items-start gap-4 p-4 rounded-xl border ${styles.bg} animate-in slide-in-from-top-2`}
            role="alert"
          >
            <div className={`shrink-0 mt-0.5 ${styles.icon}`}>
              {getIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-sm ${styles.title}`}>
                {notification.title}
              </h3>
              <p className={`text-sm mt-1 ${styles.message}`}>
                {notification.message}
              </p>
              {notification.action && (
                <Link
                  href={notification.action.href}
                  className={`inline-flex items-center gap-1 mt-3 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${styles.button}`}
                >
                  {notification.action.label}
                  <ChevronRight className="w-3 h-3" />
                </Link>
              )}
            </div>
            {notification.dismissible && (
              <button
                onClick={() => dismissNotification(notification.id)}
                className="shrink-0 p-1 text-muted-foreground hover:text-foreground rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
