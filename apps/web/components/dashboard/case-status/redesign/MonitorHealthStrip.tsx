"use client";

import { CheckCircle2, XCircle, Mail, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface MonitorHealthStripProps {
  monitorActive: boolean;
  lastCheckedAt: string | null;
  nextCheckAt?: string | null;
  emailAlertsEnabled: boolean;
  emailAddress?: string;
  onEditEmail?: () => void;
}

function formatRelative(iso: string | null): string {
  if (!iso) return "—";
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch { return "—"; }
}

function formatNextCheck(iso: string | null): string {
  if (!iso) return "—";
  try {
    const diff = new Date(iso).getTime() - Date.now();
    if (diff <= 0) return "soon";
    const hrs = Math.floor(diff / 3_600_000);
    const mins = Math.floor((diff % 3_600_000) / 60_000);
    if (hrs > 0) return `${hrs}h ${String(mins).padStart(2, "0")}m`;
    return `${mins}m`;
  } catch { return "—"; }
}

function formatCheckedAt(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
      " @ " + d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  } catch { return "—"; }
}

const Dot = () => <span className="text-gray-300 dark:text-gray-700 mx-1.5">·</span>;

export function MonitorHealthStrip({
  monitorActive,
  lastCheckedAt,
  nextCheckAt,
  emailAlertsEnabled,
  emailAddress,
  onEditEmail,
}: MonitorHealthStripProps) {
  return (
    <div className="flex flex-wrap items-center gap-y-1 text-xs text-muted-foreground py-2 px-1">
      {/* Monitor status */}
      <span className="flex items-center gap-1 font-medium">
        {monitorActive ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <XCircle className="w-3.5 h-3.5 text-gray-400" />
        )}
        <span className={cn(monitorActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground")}>
          {monitorActive ? "Auto-monitor active" : "Auto-monitor off"}
        </span>
      </span>

      {lastCheckedAt && (
        <>
          <Dot />
          <span>
            Last checked {formatCheckedAt(lastCheckedAt)}{" "}
            <span className="text-gray-400">({formatRelative(lastCheckedAt)})</span>
          </span>
        </>
      )}

      {nextCheckAt && monitorActive && (
        <>
          <Dot />
          <span>Next check in {formatNextCheck(nextCheckAt)}</span>
        </>
      )}

      {/* Email alerts */}
      <Dot />
      <span className="flex items-center gap-1">
        <Mail className="w-3 h-3" />
        Email alerts:
        {emailAlertsEnabled && emailAddress ? (
          <>
            <span className="font-medium text-foreground ml-0.5 ph-mask" data-ph-mask>{emailAddress}</span>
            {onEditEmail && (
              <button
                onClick={onEditEmail}
                className="ml-1 text-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
                aria-label="Edit notification email"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}
          </>
        ) : (
          <span className="ml-0.5 text-amber-500">
            {emailAlertsEnabled ? "No email set" : "Off"}
            {onEditEmail && (
              <button
                onClick={onEditEmail}
                className="ml-1 text-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
                aria-label="Set notification email"
              >
                <Pencil className="w-3 h-3 inline-block" />
              </button>
            )}
          </span>
        )}
      </span>
    </div>
  );
}
