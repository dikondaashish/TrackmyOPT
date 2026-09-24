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
import { CheckSchedule } from './CheckSchedule';

interface MonitorHealthStripProps {
  caseId?: string;
  monitorActive: boolean;
  lastCheckedAt: string | null;
  lastCheckFailedAt?: string | null;
  lastCheckErrorCode?: string | null;
  emailAlertsEnabled: boolean;
  emailAddress?: string;
  onEditEmail?: () => void;
  onUpgrade?: () => void;
}

const FAILURE_REASONS: Record<string, string> = {
  CHECK_RETRIES_EXHAUSTED: 'The automatic check exhausted its retries.',
  USCIS_UNAVAILABLE: 'The USCIS connection is temporarily unavailable.',
  USCIS_RATE_LIMITED: 'USCIS temporarily limited check requests.',
  USCIS_AUTH_UNAVAILABLE:
    'The USCIS connection needs an authorization check by our support team.',
  USCIS_TIMEOUT: 'The USCIS connection timed out.',
};

export function MonitorHealthStrip({
  caseId,
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
    <section
      aria-label="Case monitoring"
      className="rounded-xl border border-border bg-muted/20 p-4 text-xs text-muted-foreground"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
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
      </div>
      {health === 'failed' && lastCheckFailedAt && (
        <div className="mt-3 border-l-2 border-amber-500 pl-3 text-foreground">
          {FAILURE_REASONS[lastCheckErrorCode ?? ''] ??
            'The check did not complete; a detailed cause is not available.'}
          <span className="mt-1 block text-muted-foreground">
            Last failed attempt: {formatCheckedAt(lastCheckFailedAt)}. Refresh
            manually to retry.
          </span>
        </div>
      )}
      {health === 'delayed' && (
        <div className="mt-2">
          No recent successful check. Refresh manually to retry.
        </div>
      )}
      <dl className="mt-3 grid gap-4 border-t border-border pt-3 sm:grid-cols-3">
        <div className="min-w-0">
          <dt>Last successful check</dt>
          <dd className="mt-1 font-medium text-foreground tabular-nums">
            {lastCheckedAt ? formatCheckedAt(lastCheckedAt) : 'Not confirmed'}
          </dd>
          {lastCheckedAt && (
            <dd className="mt-1">
              {formatRelativePast(lastCheckedAt, now?.getTime() ?? NaN)}
            </dd>
          )}
        </div>
        <div className="min-w-0">
          <dt>Next automatic check</dt>
          <dd className="mt-1">
            {monitorActive && caseId ? (
              <CheckSchedule key={caseId} caseId={caseId} />
            ) : (
              <span className="font-medium text-foreground">
                {monitorActive
                  ? 'Queue time not confirmed'
                  : 'Automatic checks off'}
              </span>
            )}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="flex items-center gap-1.5">
            <Mail aria-hidden="true" className="h-3.5 w-3.5" />
            Email alerts
          </dt>
          <dd className="mt-1 flex min-w-0 items-center gap-1">
            {emailAlertsEnabled && emailAddress ? (
              <>
                <span
                  className="min-w-0 break-all font-medium text-foreground ph-mask"
                  data-ph-mask
                >
                  {emailAddress}
                </span>
                {onEditEmail && (
                  <button
                    onClick={onEditEmail}
                    type="button"
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-blue-600 hover:bg-muted focus-visible:outline focus-visible:outline-2 dark:text-blue-400"
                    aria-label="Edit notification email"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                )}
              </>
            ) : (
              <span className="flex items-center text-muted-foreground">
                {emailAlertsEnabled ? 'No email set' : 'Off'}
                {onEditEmail && (
                  <button
                    onClick={onEditEmail}
                    type="button"
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-blue-600 hover:bg-muted focus-visible:outline focus-visible:outline-2 dark:text-blue-400"
                    aria-label="Set notification email"
                  >
                    <Pencil className="w-3 h-3 inline-block" />
                  </button>
                )}
              </span>
            )}
          </dd>
        </div>
      </dl>
    </section>
  );
}
