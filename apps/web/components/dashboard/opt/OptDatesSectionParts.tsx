import { AlertTriangle, CalendarDays, ChevronDown, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { JargonTooltip } from '@/components/ui/jargon-tooltip';
import { DateInput } from './OptDateInput';
import type { OptDatesFormData } from '@/lib/immigration/opt-dates-page-utils';

export function OptDatesLoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Card className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-3 w-64" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function OptDatesHeader() {
  return (
    <header className="flex items-center justify-between gap-4 rounded-2xl bg-blue-800 px-4 py-4 text-blue-50 dark:bg-blue-950 sm:px-5 sm:py-5">
      <div className="max-w-2xl">
        <p className="mb-1 text-xs font-medium tracking-wide text-blue-200">
          Your OPT timeline
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          OPT Dates
        </h1>
        <p className="mt-1 text-sm leading-6 text-blue-100">
          Track filing windows, OPT dates, and employment history in one place.
        </p>
      </div>
      <CalendarDays
        aria-hidden="true"
        strokeWidth={1.25}
        className="hidden h-10 w-10 shrink-0 text-blue-200 sm:block"
      />
    </header>
  );
}

export function OptDatesUnemploymentWarning({
  warning,
}: {
  warning: string | null;
}) {
  return (
    <>
      {warning && (
        <div
          role="alert"
          className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900 dark:border-red-900 dark:bg-red-950/30 dark:text-red-100"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
          <p>{warning}</p>
        </div>
      )}
    </>
  );
}

export function OptDatesDayCountExplainer() {
  return (
    <details className="group rounded-xl border border-border bg-muted/25 text-xs leading-5 text-muted-foreground">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2.5 rounded-xl px-4 py-3 font-medium text-foreground outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
        <Info aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" />
        How your days are counted
        <ChevronDown
          aria-hidden="true"
          className="ml-auto h-4 w-4 shrink-0 group-open:rotate-180"
        />
      </summary>
      <p className="max-w-[75ch] px-4 pb-4">
        Calendar-day estimate through today, including weekends. Job start and
        end dates count as employed. Only qualifying employment stops the clock;
        confirm your records and status with your DSO.
      </p>
    </details>
  );
}

interface OptDatesFormFieldsProps {
  dates: OptDatesFormData;
  errors: Record<string, string>;
  onDateChange: (field: keyof OptDatesFormData, value: string) => void;
}

/** The three grouped date sections: Before OPT, On OPT, STEM extension. */
export function OptDatesFormFields({
  dates,
  errors,
  onDateChange: handleDateChange,
}: OptDatesFormFieldsProps) {
  return (
    <>
      <div
        id="dates-before-opt"
        className="scroll-mt-24 space-y-4 rounded-2xl border border-blue-100 bg-blue-50/35 p-4 dark:border-blue-950 dark:bg-blue-950/15 sm:p-5"
      >
        <div>
          <h2 className="text-base font-semibold">Before OPT</h2>
          <p className="text-xs text-muted-foreground mt-1">
            School and filing dates — start here if you have not applied yet.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <DateInput
            id="program_end_date"
            label="Program End Date"
            value={dates.program_end_date || ''}
            onChange={(value) => handleDateChange('program_end_date', value)}
            description="The date your academic program officially ends"
          />
          <DateInput
            id="dso_recommendation_date"
            label={
              <span className="flex items-center gap-1">
                <JargonTooltip term="DSO" showIcon={true} /> Recommendation Date
              </span>
            }
            value={dates.dso_recommendation_date || ''}
            onChange={(value) =>
              handleDateChange('dso_recommendation_date', value)
            }
            description="Actual date your DSO entered the OPT recommendation in SEVIS — not your graduation date"
            optional
          />
        </div>
      </div>

      <div
        id="dates-on-opt"
        className="scroll-mt-24 space-y-4 rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4 dark:border-emerald-950 dark:bg-emerald-950/15 sm:p-5"
      >
        <div>
          <h2 className="text-base font-semibold">On OPT</h2>
          <p className="text-xs text-muted-foreground mt-1">
            From your EAD card — required to track unemployment days.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <DateInput
            id="opt_start_date"
            label={
              <span className="flex items-center gap-1">
                <JargonTooltip term="OPT" showIcon={true} /> Start Date
              </span>
            }
            value={dates.opt_start_date || ''}
            onChange={(value) => handleDateChange('opt_start_date', value)}
            description="Start date printed on your EAD — save to unlock employment tracking"
            optional
          />
          <DateInput
            id="opt_ead_end_date"
            label={
              <span className="flex items-center gap-1">
                <JargonTooltip term="OPT" showIcon={false} />{' '}
                <JargonTooltip term="EAD" showIcon={true} /> End Date
              </span>
            }
            value={dates.opt_ead_end_date || ''}
            onChange={(value) => handleDateChange('opt_ead_end_date', value)}
            description="Enter the actual expiration printed on your initial OPT EAD; do not estimate"
            optional
          />
        </div>
      </div>

      <div
        id="dates-stem"
        className="scroll-mt-24 space-y-4 rounded-2xl border border-violet-100 bg-violet-50/30 p-4 dark:border-violet-950 dark:bg-violet-950/15 sm:p-5"
      >
        <div>
          <h2 className="text-base font-semibold">STEM extension</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Add your STEM recommendation when applying. Add a start date once
            your extension is approved.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          <DateInput
            id="stem_dso_recommendation_date"
            label="STEM DSO Recommendation Date"
            value={dates.stem_dso_recommendation_date || ''}
            onChange={(value) =>
              handleDateChange('stem_dso_recommendation_date', value)
            }
            description="Date your DSO recommended the STEM extension in SEVIS; separate from your initial OPT recommendation. Clear to remove."
            error={errors.stem_dso_recommendation_date}
            optional
          />
          <DateInput
            id="stem_start_date"
            label={
              <span className="flex items-center gap-1">
                <JargonTooltip term="STEM OPT" showIcon={true}>
                  STEM Extension
                </JargonTooltip>{' '}
                Start Date
              </span>
            }
            value={dates.stem_start_date || ''}
            onChange={(value) => handleDateChange('stem_start_date', value)}
            description="Start date of STEM OPT extension (if applicable)"
            optional
          />
          <DateInput
            id="stem_ead_end_date"
            label="STEM EAD End Date"
            value={dates.stem_ead_end_date || ''}
            onChange={(value) => handleDateChange('stem_ead_end_date', value)}
            description="Actual expiration printed on your STEM EAD, not a 24-month estimate. Used for your final evaluation task."
            error={errors.stem_ead_end_date}
            optional
          />
        </div>
      </div>
    </>
  );
}

export function EmploymentHistoryLoadingCard({
  loadState,
  onRetry,
}: {
  loadState: 'loading' | 'ready' | 'error';
  onRetry: () => void;
}) {
  const employmentLoadState = loadState;
  return (
    <Card id="employment" className="rounded-2xl p-6">
      <p role={employmentLoadState === 'error' ? 'alert' : 'status'}>
        {employmentLoadState === 'error'
          ? 'Could not load employment history. Counts are unavailable.'
          : 'Loading employment history…'}
      </p>
      {employmentLoadState === 'error' && (
        <Button variant="outline" onClick={() => onRetry()}>
          Retry employment history
        </Button>
      )}
    </Card>
  );
}

export function EmploymentHistoryEmptyCard() {
  return (
    <Card
      id="employment"
      className="scroll-mt-24 overflow-hidden rounded-2xl border-dashed border-primary/30 bg-gradient-to-br from-primary/[0.04] via-card to-cyan-50/40"
    >
      <div className="p-6 sm:p-8 text-center">
        <h2 className="text-lg font-semibold mb-2">Employment History</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
          Save your <strong>OPT start date</strong> above to track jobs and
          calculate unemployment days.
        </p>
        <Button variant="outline" size="sm" asChild>
          <a href="#dates-on-opt">Go to OPT start date</a>
        </Button>
      </div>
    </Card>
  );
}
