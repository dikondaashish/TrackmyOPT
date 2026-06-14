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
import { hasAnalyticsConsent } from "@/lib/cookie-consent";
import {
  captureCaseStatusExplainerViewed,
  ANALYTICS_CONSENT_CHANGE_EVENT,
} from "@/lib/posthog-client";
import { cn } from "@/lib/utils";

type CaseStatusExplainerCardProps = {
  currentStatus: string | null | undefined;
  lastCheckedAt: string | null | undefined;
  formatLastChecked: (iso: string) => string;
};

const TONE_STYLES = {
  neutral: {
    card: "border-0 bg-gradient-to-br from-blue-50/80 to-cyan-50/60 dark:from-blue-900/20 dark:to-cyan-900/15 shadow-lg shadow-blue-500/5",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    icon: "text-blue-600 dark:text-blue-400",
    Icon: Info,
    accentDot: "bg-blue-500",
  },
  positive: {
    card: "border-0 bg-gradient-to-br from-emerald-50/80 to-green-50/60 dark:from-emerald-900/20 dark:to-green-900/15 shadow-lg shadow-emerald-500/5",
    iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
    icon: "text-emerald-600 dark:text-emerald-400",
    Icon: CheckCircle2,
    accentDot: "bg-emerald-500",
  },
  caution: {
    card: "border-0 bg-gradient-to-br from-amber-50/80 to-orange-50/60 dark:from-amber-900/20 dark:to-orange-900/15 shadow-lg shadow-amber-500/5",
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
    icon: "text-amber-600 dark:text-amber-400",
    Icon: AlertTriangle,
    accentDot: "bg-amber-500",
  },
  urgent: {
    card: "border-0 bg-gradient-to-br from-red-50/80 to-rose-50/60 dark:from-red-900/20 dark:to-rose-900/15 shadow-lg shadow-red-500/5",
    iconBg: "bg-red-100 dark:bg-red-900/40",
    icon: "text-red-600 dark:text-red-400",
    Icon: AlertCircle,
    accentDot: "bg-red-500",
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

    const tryTrack = () => {
      if (!hasAnalyticsConsent()) return;
      if (trackedKeyRef.current === trackKey) return;
      trackedKeyRef.current = trackKey;
      captureCaseStatusExplainerViewed({ status_category: explainer.category });
    };

    tryTrack();

    const onConsentChange = (event: Event) => {
      const accepted = (event as CustomEvent<{ accepted: boolean }>).detail?.accepted;
      if (accepted) tryTrack();
    };

    window.addEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, onConsentChange);
    return () => {
      window.removeEventListener(ANALYTICS_CONSENT_CHANGE_EVENT, onConsentChange);
    };
  }, [explainer.category, lastCheckedAt]);

  if (!lastCheckedAt) {
    return null;
  }

  const tone = TONE_STYLES[explainer.tone];
  const ToneIcon = tone.Icon;

  return (
    <Card className={cn("p-5 sm:p-7 animate-slide-in", tone.card)} role="status" aria-live="polite">
      <div className="flex items-start gap-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm", tone.iconBg)}>
          <ToneIcon className={cn("w-5 h-5", tone.icon)} aria-hidden />
        </div>
        <div className="flex-1 min-w-0 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("w-2 h-2 rounded-full", tone.accentDot)} />
              <h3 className="text-base font-extrabold text-foreground">{explainer.title}</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{explainer.meaning}</p>
          </div>

          <div className="rounded-xl bg-background/60 dark:bg-background/40 border border-border/50 px-4 py-3.5 hover-lift transition-all">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground mb-1.5">
              What to do next
            </p>
            <p className="text-sm text-foreground leading-relaxed font-medium">{explainer.nextStep}</p>
          </div>

          {!isPlaceholderStatus(currentStatus) && (
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground/80">Official USCIS status: </span>
              {currentStatus}
            </p>
          )}

          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-xs text-muted-foreground">
              Last checked: {formatLastChecked(lastCheckedAt)}
            </p>

            {explainer.showUscisLink && (
              <Link
                href={USCIS_CASE_STATUS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                View on USCIS.gov
                <ExternalLink className="w-3.5 h-3.5" aria-hidden />
              </Link>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
