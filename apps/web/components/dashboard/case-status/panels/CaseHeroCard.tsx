'use client';

import {
  RefreshCw,
  Copy,
  Settings2,
  CheckCircle2,
  Loader2,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CaseProgressStepper } from '@/components/dashboard/case-status/CaseProgressStepper';
import {
  getServiceCenterLabel,
  getServiceCenterLocation,
} from '@/lib/case-status/case-status-display';
import { getFilingCategoryLabel } from '@/lib/case-status/filing-category';
import {
  daysSinceEpochMs,
  formatDisplayDateNoon,
  parseValidDate,
} from '@/lib/case-status/safe-dates';
import { useClientDate } from '@/hooks/useClientDate';
import { cn } from '@/lib/utils';
import type { CaseState } from './StickyCaseSwitcher';
import type { CaseStatusHistoryEntry } from '@/lib/case-status/normalize-status-history';
import { useEffect, useRef, useState } from 'react';

interface CaseHeroCardProps {
  caseStatus: {
    id: string;
    receipt_number: string;
    case_type?: string | null;
    filing_category?: string | null;
    received_date?: string | null;
    last_status_change_at?: string | null;
    current_status?: string | null;
    status_history?: CaseStatusHistoryEntry[];
    pp_start_date?: string | null;
  };
  caseState: CaseState;
  ppOverdueDays?: number;
  ppDeadlineDate?: string | null;
  updateCount?: number;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onManageCase?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
  refreshError?: string | null;
}

export function CaseHeroCard({
  caseStatus,
  caseState,
  ppOverdueDays = 0,
  ppDeadlineDate,
  updateCount = 0,
  isRefreshing = false,
  onRefresh,
  onManageCase,
  onDelete,
  isDeleting = false,
  refreshError,
}: CaseHeroCardProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    []
  );

  const now = useClientDate();
  const hasFilingDate = Boolean(parseValidDate(caseStatus.received_date));
  const days = now
    ? daysSinceEpochMs(caseStatus.received_date, now.getTime())
    : null;
  const serviceCenter = getServiceCenterLabel(caseStatus.receipt_number);
  const serviceCenterLocation = getServiceCenterLocation(
    caseStatus.receipt_number
  );
  const lastChangeDate = caseStatus.last_status_change_at
    ? formatDisplayDateNoon(caseStatus.last_status_change_at)
    : 'Not recorded';
  const ppActive = Boolean(ppDeadlineDate);
  const isUrgent = caseState === 'urgent';

  const handleCopy = async () => {
    setCopyError(false);
    setCopied(false);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    try {
      await navigator.clipboard.writeText(caseStatus.receipt_number);
      setCopied(true);
      copyTimer.current = setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopyError(true);
    }
  };

  return (
    <Card className="p-4 sm:p-6 border-border shadow-sm overflow-hidden">
      {/* Identity header */}
      <div className="mb-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {getFilingCategoryLabel(caseStatus.filing_category)}
            </span>
            <span className="text-gray-300 dark:text-gray-700">·</span>
            <span className="font-mono font-semibold ph-mask" data-ph-mask>
              {caseStatus.receipt_number}
            </span>
          </div>
          <p className="mt-4 text-xs font-medium text-muted-foreground">
            Latest USCIS status
          </p>
          <h2 className="mt-1 text-xl sm:text-2xl font-semibold tracking-tight leading-snug break-words">
            {caseStatus.current_status?.trim() || 'Awaiting USCIS status'}
          </h2>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-xs text-muted-foreground">
            {hasFilingDate ? (
              <span>
                Filed: {formatDisplayDateNoon(caseStatus.received_date)}
              </span>
            ) : (
              <span>Filing date not added</span>
            )}
            {ppActive && (
              <>
                <span className="text-gray-300 dark:text-gray-700">·</span>
                <span
                  className={cn(
                    'font-semibold',
                    isUrgent
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-amber-600 dark:text-amber-400'
                  )}
                >
                  {ppOverdueDays > 0
                    ? 'Past PP estimate'
                    : 'Premium Processing Active'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stepper */}
      {caseStatus.current_status && (
        <details className="mb-4">
          <summary className="min-h-11 cursor-pointer py-3 text-sm font-medium rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            Case milestones
          </summary>
          <CaseProgressStepper
            currentStatus={caseStatus.current_status}
            statusHistory={caseStatus.status_history}
          />
        </details>
      )}

      <dl className="grid grid-cols-2 gap-x-5 gap-y-3 border-y border-border py-4 mb-4 sm:grid-cols-4 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Since filed</dt>
          <dd className="mt-1 font-semibold tabular-nums">
            {!hasFilingDate
              ? 'Not added'
              : days === null
                ? 'Calculating…'
                : `${days} days`}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Recorded updates</dt>
          <dd className="mt-1 font-semibold tabular-nums">{updateCount}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Last status change</dt>
          <dd className="mt-1 font-semibold">{lastChangeDate}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Receipt origin</dt>
          <dd className="mt-1 font-semibold">
            {serviceCenter}
            {serviceCenterLocation ? ` · ${serviceCenterLocation}` : ''}
          </dd>
        </div>
      </dl>

      {/* Inline actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="default"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="gap-2 min-h-11"
        >
          {isRefreshing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          {isRefreshing ? 'Checking…' : 'Check for updates'}
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleCopy}
          className="gap-2 min-h-11"
        >
          {copied ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          {copied ? 'Copied!' : 'Copy receipt'}
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={onManageCase}
          className="gap-2 min-h-11"
        >
          <Settings2 className="w-3.5 h-3.5" />
          Manage case
        </Button>

        {onDelete && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            disabled={isDeleting}
            className="gap-2 min-h-11 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 sm:ml-auto"
          >
            {isDeleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            {isDeleting ? 'Removing…' : 'Stop tracking'}
          </Button>
        )}
      </div>
      <p
        role="status"
        className="text-xs text-muted-foreground empty:hidden mt-2"
      >
        {copyError
          ? 'Could not copy. Select the receipt number above to copy it manually.'
          : copied
            ? 'Receipt copied.'
            : ''}
      </p>

      {refreshError && (
        <p className="mt-3 text-xs text-red-600 dark:text-red-400">
          {refreshError}
        </p>
      )}
    </Card>
  );
}
