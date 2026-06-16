"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
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
import { getCurrentStatusDetail } from "@/lib/case-status/current-status-detail";
import type { CaseStatusHistoryEntry } from "@/lib/case-status/normalize-status-history";

type CaseStatusExplainerCardProps = {
  currentStatus: string | null | undefined;
  lastCheckedAt: string | null | undefined;
  formatLastChecked: (iso: string) => string;
  statusHistory?: CaseStatusHistoryEntry[];
};

const TONE_STYLES = {
  neutral: {
    accent: "text-[#0A84FF] dark:text-[#0A84FF]",
    bg: "bg-[#0A84FF]",
    soft: "shadow-[0_0_0_4px_rgba(10,132,255,0.2)]",
  },
  positive: {
    accent: "text-[#34C759] dark:text-[#34C759]",
    bg: "bg-[#34C759]",
    soft: "shadow-[0_0_0_4px_rgba(52,199,89,0.2)]",
  },
  caution: {
    accent: "text-[#FF9F0A] dark:text-[#FF9F0A]",
    bg: "bg-[#FF9F0A]",
    soft: "shadow-[0_0_0_4px_rgba(255,159,10,0.2)]",
  },
  urgent: {
    accent: "text-[#FF3B30] dark:text-[#FF3B30]",
    bg: "bg-[#FF3B30]",
    soft: "shadow-[0_0_0_4px_rgba(255,59,48,0.2)]",
  },
} as const;

export function CaseStatusExplainerCard({
  currentStatus,
  lastCheckedAt,
  formatLastChecked,
  statusHistory = [],
}: CaseStatusExplainerCardProps) {
  const trackedKeyRef = useRef<string | null>(null);

  const explainer = getStatusExplainer(
    isPlaceholderStatus(currentStatus) ? null : currentStatus
  );
  const officialDetail = getCurrentStatusDetail({
    currentStatus,
    statusHistory,
  });

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

  return (
    <Card className="bg-white dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-[22px] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_18px_40px_-28px_rgba(0,0,0,0.22)] overflow-hidden" role="status" aria-live="polite">
      <div className="py-[26px] px-[28px]">
        <div className={cn("flex items-center gap-[8px] text-[11.5px] font-bold tracking-[0.4px] uppercase", tone.accent)}>
          <span className={cn("w-[8px] h-[8px] rounded-full", tone.bg, tone.soft)}></span>
          Current status
        </div>
        
        <h2 className="mt-[13px] mb-0 text-[27px] font-bold tracking-[-0.6px] leading-[1.15] text-[#1D1D1F] dark:text-white">
          {explainer.title}
        </h2>

        <div className="mt-[14px] py-[13px] px-[15px] bg-[#F5F7FA] dark:bg-zinc-900 rounded-[13px] border border-black/5 dark:border-white/5">
          {officialDetail.description ? (
            <>
              <div className="text-[11px] font-bold text-[#86868B] uppercase tracking-[0.4px] mb-[5px]">
                Official USCIS notice
              </div>
              <div className="text-[13.5px] leading-[1.55] text-[#3A3A3C] dark:text-zinc-300 whitespace-pre-line">
                {officialDetail.description}
              </div>
              {officialDetail.date && (
                <p className="text-[11px] text-[#86868B] mt-3">{officialDetail.date}</p>
              )}
            </>
          ) : (
            <>
              <div className="text-[11px] font-bold text-[#86868B] uppercase tracking-[0.4px] mb-[5px]">What this means for you</div>
              <div className="text-[13.5px] leading-[1.55] text-[#3A3A3C] dark:text-zinc-300">{explainer.meaning}</div>
            </>
          )}
          
          <div className="mt-[13px] text-[11px] font-bold text-[#86868B] uppercase tracking-[0.4px] mb-[5px]">What to do next</div>
          <div className="text-[13.5px] leading-[1.55] text-[#3A3A3C] dark:text-zinc-300 font-medium">{explainer.nextStep}</div>
        </div>

        <div className="mt-[13px] flex items-center gap-[10px] flex-wrap">
          <div className="flex items-center gap-[7px] text-[12.5px] text-[#3A3A3C] dark:text-zinc-300">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#34C759" strokeWidth="2"/><path d="M12 7.5V12l3 2" stroke="#34C759" strokeWidth="2" strokeLinecap="round"/></svg>
            <span>Last checked: <b className="text-[#1D1D1F] dark:text-white">{formatLastChecked(lastCheckedAt)}</b></span>
          </div>
        </div>

        {!isPlaceholderStatus(currentStatus) && (
          <details className="mt-[14px] group">
            <summary className="cursor-pointer text-[12px] text-[#86868B] list-none flex items-center gap-[5px]">
              View status title
              <svg className="w-[13px] h-[13px] transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none"><path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </summary>
            <div className="mt-[8px] text-[12.5px] leading-[1.5] text-[#6E6E73] dark:text-zinc-400 italic py-[10px] px-[12px] bg-[#FAFAFB] dark:bg-zinc-900/50 rounded-[10px] border border-black/5 dark:border-white/5">
              &ldquo;{currentStatus}&rdquo; — verify on USCIS.gov.
            </div>
          </details>
        )}
        
        {explainer.showUscisLink && (
          <div className="mt-[18px] pt-[14px] border-t border-black/5 dark:border-white/5">
            <Link
              href={USCIS_CASE_STATUS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#0A84FF] hover:underline"
            >
              View on USCIS.gov
              <ExternalLink className="w-3.5 h-3.5" aria-hidden />
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}
