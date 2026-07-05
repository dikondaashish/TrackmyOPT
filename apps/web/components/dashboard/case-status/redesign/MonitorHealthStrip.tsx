"use client";

import { CheckCircle2, XCircle, Mail, Pencil } from "lucide-react";
import {
  formatCheckedAt,
  formatRelativePast,
  formatUntilFuture,
} from "@/lib/case-status/safe-dates";
import { cn } from "@/lib/utils";

interface MonitorHealthStripProps {
  monitorActive: boolean;
  lastCheckedAt: string | null;
  nextCheckAt?: string | null;
  emailAlertsEnabled: boolean;
  emailAddress?: string;
  onEditEmail?: () => void;
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
            <span className="text-gray-400">({formatRelativePast(lastCheckedAt)})</span>
          </span>
        </>
      )}

      {nextCheckAt && monitorActive && (
        <>
          <Dot />
          <span>Next check in {formatUntilFuture(nextCheckAt)}</span>
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
