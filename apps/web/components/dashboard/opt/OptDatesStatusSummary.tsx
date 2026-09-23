'use client';

import { ArrowUpRight, Calendar, Clock, FileText } from 'lucide-react';
import type { OptDatesStatusSnapshot } from '@/lib/immigration/opt-dates-page-utils';
import { cn } from '@/lib/utils';

interface OptDatesStatusSummaryProps {
  status: OptDatesStatusSnapshot;
}

const toneStyles = {
  neutral:
    'border-blue-100 bg-gradient-to-br from-white via-white to-blue-50/70 dark:border-blue-950 dark:from-card dark:via-card dark:to-blue-950/30',
  good: 'border-emerald-200 bg-gradient-to-br from-white via-emerald-50/60 to-emerald-100/70 dark:border-emerald-900 dark:from-card dark:via-emerald-950/20 dark:to-emerald-950/40',
  warning:
    'border-amber-200 bg-gradient-to-br from-white via-amber-50/60 to-orange-50/70 dark:border-amber-900 dark:from-card dark:via-amber-950/20 dark:to-orange-950/30',
  critical:
    'border-red-200 bg-gradient-to-br from-white via-red-50/60 to-rose-100/70 dark:border-red-900 dark:from-card dark:via-red-950/20 dark:to-rose-950/30',
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
        'group relative h-full overflow-hidden rounded-2xl border p-4 shadow-sm transition-[border-color,box-shadow,background-color] duration-200 sm:p-5',
        toneStyles[tone],
        href && 'cursor-pointer hover:border-primary/30 hover:shadow-md'
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-blue-400 to-cyan-400 opacity-80"
      />
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 text-muted-foreground">
          <span
            className={cn(
              'grid h-9 w-9 shrink-0 place-items-center rounded-xl',
              iconStyles[tone]
            )}
          >
            {icon}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em]">
            {label}
          </span>
        </div>
        {href && (
          <ArrowUpRight
            aria-hidden="true"
            className="mt-1 h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        )}
      </div>
      <p
        className={cn(
          'text-2xl font-bold tracking-[-0.03em] sm:text-[1.65rem]',
          valueStyles[tone]
        )}
      >
        {value}
      </p>
      <p className="mt-1.5 text-sm font-medium leading-5 text-muted-foreground">
        {detail}
      </p>
      {progress && (
        <div
          className="mt-4"
          role="progressbar"
          aria-label={`${label} days used`}
          aria-valuemin={0}
          aria-valuemax={progress.total}
          aria-valuenow={progress.used}
        >
          <div className="h-1.5 overflow-hidden rounded-full bg-foreground/10">
            <div
              className={cn(
                'h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none',
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
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block rounded-2xl no-underline outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
      className="grid grid-cols-1 gap-3 sm:grid-cols-3"
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
