"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Info, CheckCircle2, AlertTriangle, AlertCircle, ExternalLink } from "lucide-react";
import {
  getStatusExplainer,
  isPlaceholderStatus,
  USCIS_CASE_STATUS_URL,
} from "@/lib/uscis/status-explainer";
import { captureCaseStatusExplainerViewed } from "@/lib/posthog-client";
import { cn } from "@/lib/utils";

type CaseStatusExplainerCardProps = {
  currentStatus: string | null | undefined;
  lastCheckedAt: string | null | undefined;
  formatLastChecked: (iso: string) => string;
};

const TONE_STYLES = {
  neutral: {
    card: "border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
    icon: "text-blue-600 dark:text-blue-400",
    Icon: Info,
  },
  positive: {
    card: "border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20",
    icon: "text-emerald-600 dark:text-emerald-400",
    Icon: CheckCircle2,
  },
  caution: {
    card: "border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20",
    icon: "text-amber-600 dark:text-amber-400",
    Icon: AlertTriangle,
  },
  urgent: {
    card: "border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20",
    icon: "text-red-600 dark:text-red-400",
    Icon: AlertCircle,
  },
} as const;

export function CaseStatusExplainerCard({
  currentStatus,
  lastCheckedAt,
  formatLastChecked,
}: CaseStatusExplainerCardProps) {
  const trackedKeyRef = useRef<string | null>(null);

  const explainer = getStatusExplainer(
    isPlaceholderStatus(currentStatus) ? null : currentStatus
  );

  useEffect(() => {
    if (!lastCheckedAt) return;
    const trackKey = `${explainer.category}:${lastCheckedAt}`;
    if (trackedKeyRef.current === trackKey) return;
    trackedKeyRef.current = trackKey;
    captureCaseStatusExplainerViewed({ status_category: explainer.category });
  }, [explainer.category, lastCheckedAt]);

  if (!lastCheckedAt) {
    return null;
  }

  const tone = TONE_STYLES[explainer.tone];
  const ToneIcon = tone.Icon;

  return (
    <Card className={cn("p-5 sm:p-6", tone.card)} role="status" aria-live="polite">
      <div className="flex items-start gap-3">
        <ToneIcon className={cn("w-5 h-5 shrink-0 mt-0.5", tone.icon)} aria-hidden />
        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">{explainer.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{explainer.meaning}</p>
          </div>

          <div className="rounded-lg bg-background/60 dark:bg-background/40 border border-border/60 px-3 py-2.5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
              What to do next
            </p>
            <p className="text-sm text-foreground leading-relaxed">{explainer.nextStep}</p>
          </div>

          {!isPlaceholderStatus(currentStatus) && (
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground/80">Official USCIS status: </span>
              {currentStatus}
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            Last checked: {formatLastChecked(lastCheckedAt)}
          </p>

          {explainer.showUscisLink && (
            <Link
              href={USCIS_CASE_STATUS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              View on USCIS.gov
              <ExternalLink className="w-3.5 h-3.5" aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}
