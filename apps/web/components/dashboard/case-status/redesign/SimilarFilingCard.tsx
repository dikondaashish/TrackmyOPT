"use client";

import { CalendarRange } from "lucide-react";
import { formatDisplayDateShort } from "@/lib/case-status/safe-dates";
import type { SimilarFilingPeers } from "@/lib/community-opt/similar-filing";

interface SimilarFilingCardProps {
  peers: SimilarFilingPeers | null;
  receivedDate?: string | null;
  premiumProcessing?: boolean;
  loading?: boolean;
}

/** "Aug 5" — day and month only, for describing a point in the calendar year. */
function formatDayOfYear(iso: string | null | undefined): string {
  const full = formatDisplayDateShort(iso);
  return full === "—" ? full : full.replace(/,\s*\d{4}$/, "");
}

function segmentLabel(premiumProcessing?: boolean): string {
  if (premiumProcessing === undefined) return "";
  return premiumProcessing ? " · premium" : " · regular";
}

export function SimilarFilingCard({
  peers,
  receivedDate,
  premiumProcessing,
  loading = false,
}: SimilarFilingCardProps) {
  if (loading && !peers) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        Looking up community cases with similar filing dates…
      </p>
    );
  }

  if (!receivedDate) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        Add your filing date to see community cases that filed around the same time.
      </p>
    );
  }

  if (!peers) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-1.5">
        <div className="flex items-center gap-2">
          <CalendarRange className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Similar filing dates</p>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Not enough resolved community reports yet for filings near{" "}
          {formatDisplayDateShort(receivedDate)}, or for the same point in earlier
          years. Weeks that are still too recent for their slower cases to have been
          decided are excluded so the wait is not understated.
        </p>
      </div>
    );
  }

  const seasonal = peers.basis === "seasonal";

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarRange className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              {seasonal ? "Same time of year" : "Similar filing dates"}
            </p>
            <p className="text-xs text-muted-foreground">
              {seasonal ? (
                <>
                  Community cases filed within ±{peers.windowDays}d of{" "}
                  {formatDayOfYear(receivedDate)} in{" "}
                  {peers.seasonYears.join(", ")}
                </>
              ) : (
                <>
                  Community cases filed ±{peers.windowDays}d of{" "}
                  {formatDisplayDateShort(receivedDate)}
                </>
              )}
              {segmentLabel(premiumProcessing)}
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground whitespace-nowrap">
          {peers.sampleSize.toLocaleString()} reports
        </p>
      </div>

      {seasonal && (
        <p className="text-xs text-muted-foreground leading-relaxed rounded-lg bg-muted/40 px-3 py-2">
          Filings from your own window are still too recent for their slower cases to
          have been decided, so a median from them would be misleadingly short. These
          are the same weeks of the calendar in earlier years instead.
        </p>
      )}

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-muted/40 px-2 py-2">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Median
          </p>
          <p className="text-base font-bold text-foreground">{peers.medianDays}d</p>
        </div>
        <div className="rounded-lg bg-muted/40 px-2 py-2">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Middle 50%
          </p>
          <p className="text-base font-bold text-foreground">
            {peers.p25Days}–{peers.p75Days}d
          </p>
        </div>
        <div className="rounded-lg bg-muted/40 px-2 py-2">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {seasonal ? "Years" : "Window"}
          </p>
          <p className="text-xs font-semibold text-foreground leading-snug pt-0.5">
            {seasonal
              ? peers.seasonYears.join(" · ")
              : `${formatDisplayDateShort(peers.windowRange[0])} – ${formatDisplayDateShort(peers.windowRange[1])}`}
          </p>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground leading-relaxed">
        Partner community timelines (opt-tracker / opt-pulse) matched by filing date —
        not USCIS case lookups, not sequential receipt scanning, and not a prediction of
        your outcome. {peers.sourceNote}.
      </p>
    </div>
  );
}
