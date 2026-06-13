"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Crown,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePremiumStatus } from "@/lib/premium/usePremiumStatus";
import { resolveDashboardNextStep } from "@/lib/dashboard/resolve-dashboard-next-step";
import {
  captureDashboardNextStepClicked,
  captureDashboardNextStepShown,
} from "@/lib/posthog-client";

type CaseStatusSnapshot = {
  receipt_number: string | null;
  current_status: string | null;
  last_checked_at: string | null;
};

export function DashboardNextStepCard() {
  const premium = usePremiumStatus();
  const [caseStatus, setCaseStatus] = useState<CaseStatusSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const shownRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch("/api/case-status", {
          credentials: "include",
          cache: "no-store",
        });
        if (!response.ok) return;
        const payload = await response.json();
        if (!cancelled && payload?.ok && payload.data) {
          setCaseStatus({
            receipt_number: payload.data.receipt_number ?? null,
            current_status: payload.data.current_status ?? null,
            last_checked_at: payload.data.last_checked_at ?? null,
          });
        }
      } catch {
        /* non-blocking */
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const step = useMemo(() => {
    if (premium.isLoading || isLoading) return null;
    return resolveDashboardNextStep({
      isPremium: premium.isPremium === true,
      hasReceipt: Boolean(caseStatus?.receipt_number),
      lastCheckedAt: caseStatus?.last_checked_at ?? null,
      currentStatus: caseStatus?.current_status ?? null,
    });
  }, [premium.isLoading, premium.isPremium, isLoading, caseStatus]);

  useEffect(() => {
    if (!step || shownRef.current) return;
    shownRef.current = true;
    captureDashboardNextStepShown({
      state: step.state,
      ...(step.statusCategory ? { status_category: step.statusCategory } : {}),
    });
  }, [step]);

  const handleClick = () => {
    if (!step) return;
    captureDashboardNextStepClicked({ action: step.action });
  };

  if (premium.isLoading || isLoading) {
    return (
      <Card className="p-4 border-border">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading your next step…
        </div>
      </Card>
    );
  }

  if (!step) return null;

  const content = (() => {
    switch (step.state) {
      case "no_receipt":
        return {
          icon: ClipboardList,
          iconClass: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30",
          title: "Add your USCIS receipt",
          description:
            "Track your case in one place — we'll check USCIS and show plain-English updates.",
          cta: "Add receipt",
        };
      case "free_upsell":
        return {
          icon: Crown,
          iconClass: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30",
          title: "We check daily — get alerted instantly with Pro",
          description:
            "Your receipt is saved. Upgrade for automatic daily checks and email alerts when your status changes.",
          cta: "Upgrade to Pro",
        };
      case "status_live":
        return {
          icon: Sparkles,
          iconClass: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30",
          title: "Your case is up to date",
          description: `Last checked ${step.lastCheckedLabel}. Status: ${step.plainEnglishStatus}.`,
          cta: "View case status",
        };
      case "pro_active":
        return {
          icon: CheckCircle2,
          iconClass: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30",
          title: "Auto-checks on",
          description: step.lastCheckedLabel
            ? `We check USCIS daily and email you when your status changes. Last checked ${step.lastCheckedLabel}.`
            : "We check USCIS daily and email you the moment your status changes.",
          cta: "View case status",
        };
    }
  })();

  const Icon = content.icon;

  return (
    <Card className="p-4 sm:p-5 border-border bg-gradient-to-r from-card to-muted/30">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className={`p-2.5 rounded-lg shrink-0 ${content.iconClass}`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
              Next step
            </p>
            <h2 className="text-base font-semibold text-foreground">{content.title}</h2>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {content.description}
            </p>
            {step.state === "pro_active" && (
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-2 inline-flex items-center gap-1">
                <Bell className="w-3.5 h-3.5" />
                Email alerts enabled
              </p>
            )}
          </div>
        </div>
        <Button
          asChild
          variant={step.state === "free_upsell" ? "default" : "outline"}
          className={
            step.state === "free_upsell"
              ? "bg-purple-600 hover:bg-purple-700 text-white shrink-0 w-full sm:w-auto"
              : "shrink-0 w-full sm:w-auto"
          }
          onClick={handleClick}
        >
          <Link href={step.href} className="inline-flex items-center gap-1.5">
            {content.cta}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}
