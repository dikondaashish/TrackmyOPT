"use client";

import { CalendarRange } from "lucide-react";
import { formatDisplayDateShort } from "@/lib/case-status/safe-dates";
import { communityChartSegmentSuffix } from "@/lib/case-status/filing-category";
import type { CommunityCaseKind } from "@/lib/community-opt/types";
import type { SimilarFilingPeers } from "@/lib/community-opt/similar-filing";

interface SimilarFilingCardProps {
  peers: SimilarFilingPeers | null;
  receivedDate?: string | null;
  premiumProcessing?: boolean;
  caseKind?: CommunityCaseKind;
  loading?: boolean;
}

/** "Aug 5" — day and month only, for describing a point in the calendar year. */
function formatDayOfYear(iso: string | null | undefined): string {
  const full = formatDisplayDateShort(iso);
  return full === "—" ? full : full.replace(/,\s*\d{4}$/, "");
}

export function SimilarFilingCard({
  peers,
  receivedDate,
  premiumProcessing,
  caseKind = "initial_opt",
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
          Not enough resolved community reports yet — for filings near{" "}
          {formatDisplayDateShort(receivedDate)}, for the same point in earlier years,
          or for any recent stretch that has finished processing. Weeks that are still
          too recent for their slower cases to have been decided are excluded so the
          wait is not understated.
        </p>
      </div>
    );
  }

  const seasonal = peers.basis === "seasonal";
  const latest = peers.basis === "latest";
  const span = `${formatDisplayDateShort(peers.windowRange[0])} – ${formatDisplayDateShort(peers.windowRange[1])}`;

  const title = seasonal
    ? "Same time of year"
    : latest
      ? "Most recent finished filings"
      : "Similar filing dates";

  // Each tier is a weaker claim than the last, so each says plainly what it is.
  const caveat = seasonal
    ? "Filings from your own window are still too recent for their slower cases to have been decided, so a median from them would be misleadingly short. These are the same weeks of the calendar in earlier years instead."
    : latest
      ? "Not enough resolved reports from your own filing window yet, and no earlier years to compare against. These are the most recent community filings that have finished processing — a picture of current throughput, not of people who filed when you did."
      : null;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarRange className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <div>
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="text-xs text-muted-foreground">
              {seasonal ? (
                <>
                  Community cases filed within ±{peers.windowDays}d of{" "}
                  {formatDayOfYear(receivedDate)} in{" "}
                  {peers.seasonYears.join(", ")}
                </>
              ) : latest ? (
                <>Community cases filed {span}</>
              ) : (
                <>
                  Community cases filed ±{peers.windowDays}d of{" "}
                  {formatDisplayDateShort(receivedDate)}
                </>
              )}
              {communityChartSegmentSuffix({ caseKind, premiumProcessing })}
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground whitespace-nowrap">
          {peers.sampleSize.toLocaleString()} reports
        </p>
      </div>

      {caveat && (
        <p className="text-xs text-muted-foreground leading-relaxed rounded-lg bg-muted/40 px-3 py-2">
          {caveat}
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
            {seasonal ? peers.seasonYears.join(" · ") : span}
          </p>
        </div>
      </div>

    </div>
  );
}
