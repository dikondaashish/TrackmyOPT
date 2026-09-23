'use client';

import { AlertCircle, CheckCircle2, XCircle, Mail, Pencil } from 'lucide-react';
import { monitorHealth } from '@/lib/case-status/monitor-health';
import { useClientDate } from '@/hooks/useClientDate';
import {
  formatCheckedAt,
  formatRelativePast,
} from '@/lib/case-status/safe-dates';
import { CASE_STATUS_MESSAGING } from '@/lib/messaging/product-copy';
import { cn } from '@/lib/utils';

interface MonitorHealthStripProps {
  monitorActive: boolean;
  lastCheckedAt: string | null;
  lastCheckFailedAt?: string | null;
  lastCheckErrorCode?: string | null;
  emailAlertsEnabled: boolean;
  emailAddress?: string;
  onEditEmail?: () => void;
  onUpgrade?: () => void;
}

const Dot = () => (
  <span className="text-gray-300 dark:text-gray-700 mx-1.5">·</span>
);

export function MonitorHealthStrip({
  monitorActive,
  lastCheckedAt,
  lastCheckFailedAt,
  lastCheckErrorCode,
  emailAlertsEnabled,
  emailAddress,
  onEditEmail,
  onUpgrade,
}: MonitorHealthStripProps) {
  const now = useClientDate();
  const health = monitorHealth(
    monitorActive,
    lastCheckedAt,
    lastCheckFailedAt ?? null,
    now?.getTime() ?? NaN
  );
  const labels = {
    off: 'Auto-monitor off',
    recent: 'Daily monitoring · recent check',
    delayed: 'Monitoring delayed',
    failed: 'Latest check failed',
    unconfirmed: 'Awaiting a confirmed check',
  };
  return (
    <div className="flex flex-wrap items-center gap-y-1 text-xs text-muted-foreground py-2 px-1">
      <span className="flex items-center gap-1 font-medium">
        {health === 'recent' ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        ) : monitorActive ? (
          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
        ) : (
          <XCircle className="w-3.5 h-3.5 text-gray-400" />
        )}
        <span
          className={cn(
            health === 'recent'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-muted-foreground'
          )}
        >
          {labels[health]}
        </span>
      </span>

      {!monitorActive && (
        <>
          <Dot />
          {onUpgrade ? (
            <button
              type="button"
              onClick={onUpgrade}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
            >
              {CASE_STATUS_MESSAGING.upgradeForAutoChecks}
            </button>
          ) : (
            <span>{CASE_STATUS_MESSAGING.autoMonitorOffHint}</span>
          )}
        </>
      )}

      {lastCheckedAt && (
        <>
          <Dot />
          <span>
            Last successful check {formatCheckedAt(lastCheckedAt)}{' '}
            <span className="text-gray-400">
              ({formatRelativePast(lastCheckedAt, now?.getTime() ?? NaN)})
            </span>
          </span>
        </>
      )}

      {monitorActive && health !== 'recent' && (
        <>
          <Dot />
          <span>Daily checks enabled. Refresh manually to retry now.</span>
        </>
      )}
      {health === 'failed' && lastCheckFailedAt && (
        <span className="basis-full mt-1">
          Last failed attempt: {formatCheckedAt(lastCheckFailedAt)}.{' '}
          {lastCheckErrorCode === 'CHECK_RETRIES_EXHAUSTED'
            ? 'The automatic check exhausted its retries.'
            : 'The check did not complete; a detailed cause is not available.'}
        </span>
      )}
      {monitorActive && (
        <span className="basis-full mt-1">
          Configured daily batch: 14:00 UTC. Queue timing varies; the next case
          check is not yet confirmed.
        </span>
      )}

      <Dot />
      <span className="flex items-center gap-1">
        <Mail className="w-3 h-3" />
        Email alerts:
        {emailAlertsEnabled && emailAddress ? (
          <>
            <span
              className="font-medium text-foreground ml-0.5 ph-mask"
              data-ph-mask
            >
              {emailAddress}
            </span>
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
            {emailAlertsEnabled ? 'No email set' : 'Off'}
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
