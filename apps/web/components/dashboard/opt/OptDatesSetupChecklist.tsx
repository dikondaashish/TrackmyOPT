'use client';

import Link from 'next/link';
import { CheckCircle2, Circle, ListChecks } from 'lucide-react';
import type { OptDatesStatusSnapshot } from '@/lib/immigration/opt-dates-page-utils';
import { cn } from '@/lib/utils';

interface OptDatesSetupChecklistProps {
  status: OptDatesStatusSnapshot;
  isDirty?: boolean;
  onScrollToEmployment?: () => void;
}

const STEPS = [
  {
    key: 'hasProgramEnd' as const,
    label: 'Program end date saved',
    hint: 'Needed for OPT filing window',
    anchor: '#dates-before-opt',
  },
  {
    key: 'hasOptStart' as const,
    label: 'OPT start date saved',
    hint: 'From your EAD card',
    anchor: '#dates-on-opt',
  },
  {
    key: 'hasEmployment' as const,
    label: 'At least one job added',
    hint: 'Required for unemployment tracking',
    anchor: '#employment',
    isEmployment: true,
  },
  {
    key: 'clockActive' as const,
    label: 'Unemployment clock active',
    hint: 'Estimates days from your saved records',
    anchor: '#employment',
    isEmployment: true,
  },
];

export function OptDatesSetupChecklist({
  status,
  isDirty,
  onScrollToEmployment,
}: OptDatesSetupChecklistProps) {
  const allDone = status.checklistComplete === status.checklistTotal;

  if (allDone) {
    return (
      <section className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-blue-50 px-4 py-4 shadow-sm dark:border-emerald-900 dark:from-emerald-950/40 dark:via-card dark:to-blue-950/30 sm:px-5">
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-1 bg-emerald-500"
        />
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-100">
              Setup complete — your OPT dates and employment history are
              tracked.
            </p>
            <p className="mt-0.5 text-xs leading-5 text-emerald-900/75 dark:text-emerald-200/80">
              Check the summary above anytime. Update jobs when you change
              employers.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-blue-100 bg-card p-4 shadow-sm dark:border-blue-950 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
            <ListChecks className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold">Your setup checklist</h2>
            <p className="text-xs text-muted-foreground">
              Complete only what applies to your OPT stage.
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary dark:bg-primary/20">
          {status.checklistComplete}/{status.checklistTotal} done
        </span>
      </div>
      {isDirty && (
        <p className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          You have unsaved date changes — click <strong>Save Dates</strong> to
          keep them.
        </p>
      )}
      <ul className="grid gap-2 sm:grid-cols-2">
        {STEPS.map((step) => {
          const done = status[step.key];
          const Icon = done ? CheckCircle2 : Circle;
          const handleClick =
            step.isEmployment && onScrollToEmployment
              ? (e: React.MouseEvent) => {
                  if (step.isEmployment) {
                    e.preventDefault();
                    onScrollToEmployment();
                  }
                }
              : undefined;

          return (
            <li key={step.key}>
              <Link
                href={step.anchor}
                onClick={handleClick}
                className={cn(
                  'flex min-h-16 items-start gap-3 rounded-xl border border-transparent px-3 py-2.5 outline-none transition-[background-color,border-color,box-shadow] duration-200 hover:border-primary/15 hover:bg-primary/[0.03] focus-visible:border-primary/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  done &&
                    'bg-emerald-50/60 hover:border-emerald-200 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:hover:border-emerald-900'
                )}
              >
                <Icon
                  className={cn(
                    'mt-0.5 h-4 w-4 shrink-0',
                    done
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-muted-foreground'
                  )}
                />
                <div>
                  <p
                    className={cn(
                      'text-sm font-medium',
                      done && 'text-emerald-900 dark:text-emerald-100'
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.hint}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
