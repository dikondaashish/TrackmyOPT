'use client';

import { ArrowUpRight, Calendar, Clock, FileText } from 'lucide-react';
import type { OptDatesStatusSnapshot } from '@/lib/immigration/opt-dates-page-utils';
import { cn } from '@/lib/utils';

interface OptDatesStatusSummaryProps {
  status: OptDatesStatusSnapshot;
}

const toneStyles = {
  neutral:
    'border-blue-200/70 bg-blue-50/70 dark:border-blue-900 dark:bg-blue-950/30',
  good: 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30',
  warning:
    'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30',
  critical: 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30',
};

const valueStyles = {
  neutral: 'text-blue-900 dark:text-blue-100',
  good: 'text-emerald-700 dark:text-emerald-400',
  warning: 'text-amber-700 dark:text-amber-400',
  critical: 'text-red-700 dark:text-red-400',
};

const iconStyles = {
  neutral: 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300',
  good: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300',
  warning:
    'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300',
  critical: 'bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300',
};

type Progress = { used: number; total: number; percent: number };

function getProgress(value: string): Progress | null {
  const match = value.match(/^(\d+)\s*\/\s*(\d+)$/);
  if (!match) return null;

  const used = Number(match[1]);
  const total = Number(match[2]);
  if (!Number.isFinite(used) || !Number.isFinite(total) || total <= 0)
    return null;

  return {
    used,
    total,
    percent: Math.min(100, Math.round((used / total) * 100)),
  };
}

function StatCard({
  icon,
  label,
  value,
  detail,
  tone,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  tone: keyof typeof toneStyles;
  href?: string;
}) {
  const progress = label === 'Unemployment' ? getProgress(value) : null;
  const content = (
    <div
      className={cn(
        'group flex h-full min-w-0 flex-col rounded-2xl border p-4 transition-[border-color,box-shadow] duration-200 motion-reduce:transition-none sm:p-5',
        toneStyles[tone],
        href && 'cursor-pointer hover:border-primary/30 hover:shadow-md'
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 text-muted-foreground">
          <span
            className={cn(
              'grid h-8 w-8 shrink-0 place-items-center rounded-lg',
              iconStyles[tone]
            )}
          >
            {icon}
          </span>
          <span className="text-sm font-semibold text-foreground">{label}</span>
        </div>
        {href && (
          <ArrowUpRight
            aria-hidden="true"
            className="mt-1 h-4 w-4 text-muted-foreground"
          />
        )}
      </div>
      <div
        className={cn(
          'text-2xl font-semibold tabular-nums tracking-tight',
          valueStyles[tone]
        )}
      >
        {progress ? (
          <>
            {progress.used}
            <span className="ml-2 text-sm font-medium text-muted-foreground">
              / {progress.total} days used
            </span>
          </>
        ) : (
          value
        )}
      </div>
      <p className="mt-1.5 text-sm font-medium leading-5 text-muted-foreground">
        {detail}
      </p>
      {progress && (
        <div
          className="mt-3"
          role="progressbar"
          aria-label={`${label} days used`}
          aria-valuemin={0}
          aria-valuemax={progress.total}
          aria-valuenow={Math.min(progress.used, progress.total)}
          aria-valuetext={`${progress.used} of ${progress.total} unemployment days used. ${detail}.`}
        >
          <div className="h-1.5 overflow-hidden rounded-full bg-foreground/10">
            <div
              className={cn(
                'h-full rounded-full',
                tone === 'critical'
                  ? 'bg-red-500'
                  : tone === 'warning'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
              )}
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
      )}
      {href && (
        <span className="mt-auto flex items-center gap-1.5 pt-3 text-xs font-semibold text-foreground">
          View employment history{' '}
          <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block min-w-0 rounded-2xl no-underline outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label={`${label}: ${value}. ${detail}. Open employment history.`}
      >
        {content}
      </a>
    );
  }
  return content;
}

export function OptDatesStatusSummary({ status }: OptDatesStatusSummaryProps) {
  if (!status.hasProgramEnd && !status.hasOptStart) {
    return null;
  }

  return (
    <section
      aria-label="OPT status overview"
      className="grid grid-cols-1 gap-3 lg:grid-cols-[1.2fr_1fr_1fr]"
    >
      <StatCard
        icon={<Clock className="h-4 w-4" />}
        label="Unemployment"
        value={status.unemploymentLabel}
        detail={status.unemploymentDetail}
        tone={status.unemploymentTone}
        href={status.hasOptStart ? '#employment' : undefined}
      />
      <StatCard
        icon={<Calendar className="h-4 w-4" />}
        label={status.optEndHeading}
        value={status.optEndLabel}
        detail={status.optEndDetail}
        tone={
          status.optEndLabel === 'Expired'
            ? 'critical'
            : status.optEndDaysLeft !== null && status.optEndDaysLeft <= 90
              ? 'warning'
              : 'neutral'
        }
      />
      <StatCard
        icon={<FileText className="h-4 w-4" />}
        label="Initial OPT filing"
        value={status.filingLabel}
        detail={status.filingDetail}
        tone={status.filingTone}
      />
    </section>
  );
}
