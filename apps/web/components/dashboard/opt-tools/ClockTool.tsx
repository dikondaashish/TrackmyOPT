'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Plus, Trash2 } from 'lucide-react';
import {
  calendarDateISO,
  estimatedStemEndISO,
} from '@/lib/immigration/calendar-days';
import { clockPreview } from '@/lib/immigration/tool-calculations';
import {
  formatDate,
  getUnemploymentStatus,
} from '@/lib/immigration/opt-calculations';
import { useEmploymentSetupAck } from '@/hooks/useEmploymentSetupAck';
import { EmploymentHistoryLog } from '../opt/EmploymentHistoryLog';
import { DateInput } from '../opt/OptDateInput';
import {
  mapEmploymentSpans,
  type EmploymentSpan,
} from '../opt/employment-history-helpers';
import { useToolDates, type ToolDates } from './useToolDates';
import { ToolDateField, ToolSave, ToolWorkspace } from './ToolWorkspace';
import { panelClass, toolButtonClass, type ToolSlug } from './tool-config';
import { ResultCard, ProgressBar } from './ResultCard';
import { EmailReminder } from './EmailReminder';
import { PricingModal } from '@/components/pricing/PricingModal';

export function ClockTool({ kind }: { kind: 'opt' | 'stem' }) {
  const state = useToolDates();
  const [spans, setSpans] = useState<EmploymentSpan[]>([]);
  const [historyLoad, setHistoryState] = useState<
    'loading' | 'ready' | 'error' | 'guest'
  >('loading');
  // A history-only session failure must not look like an empty employment record.
  const historyState =
    historyLoad === 'guest'
      ? state.loading
        ? 'loading'
        : state.guest
          ? 'ready'
          : 'error'
      : historyLoad;
  const [attempt, setAttempt] = useState(0);
  const [confirmedEmpty, setConfirmedEmpty] = useState(false);
  const [pricing, setPricing] = useState(false);
  const { ack } = useEmploymentSetupAck();
  const stem = kind === 'stem';
  const slug = stem ? 'stem-clock' : 'opt-clock';
  const fields: (keyof ToolDates)[] = [
    'opt_start_date',
    'opt_ead_end_date',
    ...(stem ? ['stem_start_date' as const] : []),
  ];
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch('/api/employment-spans', {
          credentials: 'include',
          cache: 'no-store',
        });
        if (res.status === 401) {
          if (!cancelled) setHistoryState('guest');
          return;
        }
        if (!res.ok) throw new Error();
        const body = await res.json();
        if (!body.ok || !Array.isArray(body.spans)) throw new Error();
        if (!cancelled) {
          setSpans(mapEmploymentSpans(body.spans));
          setHistoryState('ready');
        }
      } catch {
        if (!cancelled) setHistoryState('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [attempt]);
  const dates = state.dates;
  const preview = clockPreview(
    kind,
    dates.opt_start_date,
    dates.opt_ead_end_date,
    dates.stem_start_date,
    spans,
    state.today
  );
  const historyConfirmed =
    spans.length > 0 ||
    confirmedEmpty ||
    (!state.guest && ack === 'between_jobs');
  const result =
    !state.loading &&
    !state.loadError &&
    historyState === 'ready' &&
    historyConfirmed
      ? preview
      : null;
  const status = result ? getUnemploymentStatus(result.used, result.max) : null;
  const initialStart = calendarDateISO(dates.opt_start_date);
  const initialEnd = calendarDateISO(dates.opt_ead_end_date);
  const stemStart = calendarDateISO(dates.stem_start_date);
  const invalidRange =
    !!initialStart && !!initialEnd && initialEnd < initialStart;
  const invalidStem =
    stem &&
    !!initialEnd &&
    !!stemStart &&
    new Date(stemStart).getTime() - new Date(initialEnd).getTime() !== 86400000;
  return (
    <ToolWorkspace
      slug={slug}
      audience={state.audience}
      aside={
        <div className={panelClass}>
          <h3 className="font-semibold">What stops the clock?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Only qualifying employment counts. Weekends and holidays count as
            unemployment when you are not employed. Keep your dates and
            supporting records up to date.
          </p>
          <details className="mt-3 border-t border-border pt-3">
            <summary className="min-h-11 cursor-pointer font-medium focus-visible:ring-2">
              Counting rules
            </summary>
            <p className="text-sm text-muted-foreground">
              Start and end dates count as employed. Overlapping jobs count
              once. Future days and days after the authorization period are
              excluded.{' '}
              {stem
                ? 'STEM adds 60 days to the initial allowance for a combined 150; it does not erase a previous initial-OPT overage.'
                : 'Initial OPT has a 90-day cumulative unemployment limit.'}
            </p>
          </details>
        </div>
      }
    >
      <div className={panelClass} aria-busy={state.loading}>
        <h3 className="font-semibold">Your authorization dates</h3>
        <p className="mb-5 mt-1 text-sm text-muted-foreground">
          {state.loading
            ? 'Loading saved dates…'
            : 'Enter actual EAD dates. Changing a start date will not overwrite your end date.'}
        </p>
        <fieldset
          disabled={state.loading}
          className="grid min-w-0 gap-5 sm:grid-cols-2"
        >
          <legend className="sr-only">Authorization dates</legend>
          <ToolDateField
            state={state}
            name="opt_start_date"
            label="OPT Start Date"
          />
          <ToolDateField
            state={state}
            name="opt_ead_end_date"
            label="OPT EAD End Date"
          />
          {stem && (
            <ToolDateField
              state={state}
              name="stem_start_date"
              label="STEM Extension Start Date"
              description="Day after initial OPT expires. Enter only your applicable extension start, not a planned approval."
            />
          )}
        </fieldset>
        {(invalidRange || invalidStem) && (
          <p
            role="alert"
            className="mt-3 text-sm text-red-700 dark:text-red-300"
          >
            {invalidRange
              ? 'OPT end must be on or after its start.'
              : 'STEM should start the day after initial OPT expires. Review these dates with your DSO.'}
          </p>
        )}
        <ToolSave slug={slug} state={state} fields={fields} valid={!!preview} />
      </div>
      <section className={panelClass} aria-label="Unemployment estimate">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">
            {stem
              ? 'Combined OPT + STEM estimate'
              : 'Initial OPT unemployment estimate'}
          </h3>
          <span className="text-xs text-muted-foreground">
            Through {formatDate(state.today)}
          </span>
        </div>
        {historyState === 'error' ? (
          <div role="alert">
            Could not load employment history. Your count is unavailable.{' '}
            <button
              type="button"
              className="min-h-11 px-2 font-semibold text-blue-700 underline dark:text-blue-300"
              onClick={() => {
                setHistoryState('loading');
                setAttempt((value) => value + 1);
              }}
            >
              Retry employment history
            </button>
          </div>
        ) : state.loading || historyState === 'loading' ? (
          <p role="status" className="text-muted-foreground">
            Loading dates and employment history…
          </p>
        ) : !preview ? (
          <p className="text-muted-foreground">
            Complete valid authorization dates and employment records to
            calculate.
          </p>
        ) : !historyConfirmed ? (
          <div className="space-y-3">
            <p className="text-muted-foreground">
              Add your employment history below, or confirm that you have had no
              qualifying employment during this OPT period.
            </p>
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={confirmedEmpty}
                onChange={(event) => setConfirmedEmpty(event.target.checked)}
                className="h-5 w-5 accent-blue-700"
              />
              I have no qualifying employment to record
            </label>
          </div>
        ) : result && status ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <ResultCard
                icon={<CalendarDays aria-hidden="true" className="h-4 w-4" />}
                label="Days used"
                value={String(result.used)}
                subtext={'of ' + result.max + ' available unemployment days'}
                status={
                  result.exceededInitialOptCap ? 'critical' : status.level
                }
              />
              <ResultCard
                icon={<CalendarDays aria-hidden="true" className="h-4 w-4" />}
                label="Days remaining"
                value={String(result.remaining)}
                subtext={
                  initialStart && state.today < initialStart
                    ? 'OPT has not started yet'
                    : result.phase === 'post'
                      ? 'Authorization window ended; not extra work days'
                      : status.label
                }
              />
            </div>
            <div className="mt-4">
              <ProgressBar
                used={result.used}
                max={result.max}
                label="Unemployment allowance used"
              />
            </div>
            {stem && (
              <p className="mt-3 text-sm text-muted-foreground">
                Initial OPT: {result.initialOptUnemploymentDays} days · STEM:{' '}
                {result.stemUnemploymentDays} days.{' '}
                {result.max === 90
                  ? 'The 90-day limit applies until STEM starts.'
                  : 'The combined limit is 150 days.'}
              </p>
            )}
            {result.warnings.map((message) => (
              <p
                role="alert"
                key={message}
                className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
              >
                {message}
              </p>
            ))}
            {stem && stemStart && (
              <p className="mt-3 text-sm text-muted-foreground">
                STEM end estimate: {formatDate(estimatedStemEndISO(stemStart))}.
                Based on 24 months; verify your EAD. This is not confirmation of
                extension approval.
              </p>
            )}
          </>
        ) : (
          <p className="text-muted-foreground">
            Your saved data is unavailable. Retry loading before relying on this
            estimate.
          </p>
        )}
      </section>
      {historyState === 'ready' &&
        !state.loading &&
        (state.guest ? (
          <GuestEmployment slug={slug} spans={spans} onChange={setSpans} />
        ) : (
          !state.loadError && (
            <EmploymentHistoryLog
              employmentSpans={spans}
              onSpansChange={setSpans}
              optStartDate={invalidRange ? undefined : dates.opt_start_date}
              optEndDate={invalidRange ? undefined : dates.opt_ead_end_date}
              stemStartDate={
                stem && !invalidStem ? dates.stem_start_date : undefined
              }
              asOfISO={state.today}
              maxUnemploymentDays={preview?.max ?? 90}
            />
          )
        ))}
      {!state.loading && !state.guest && !state.loadError && (
        <EmailReminder
          toolType={slug}
          isPremium={state.premium}
          onUpgradeClick={() => setPricing(true)}
        />
      )}
      <PricingModal open={pricing} onClose={() => setPricing(false)} />
    </ToolWorkspace>
  );
}

function GuestEmployment({
  spans,
  onChange,
  slug,
}: {
  spans: EmploymentSpan[];
  onChange: (spans: EmploymentSpan[]) => void;
  slug: ToolSlug;
}) {
  const update = (id: string, patch: Partial<EmploymentSpan>) =>
    onChange(
      spans.map((span) => (span.id === id ? { ...span, ...patch } : span))
    );
  return (
    <section className={panelClass} aria-label="Preview employment history">
      <h3 className="font-semibold">Employment history</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Preview only. These entries are not saved and will reset if you leave or
        reload.
      </p>
      <div className="mt-4 space-y-4">
        {spans.map((span, index) => (
          <fieldset
            key={span.id}
            className="space-y-3 rounded-xl border border-border p-3"
          >
            <legend className="px-1 text-sm font-semibold">
              Job {index + 1}
            </legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <DateInput
                id={span.id + '-start'}
                label="Employment start"
                value={span.start_date}
                onChange={(value) => update(span.id, { start_date: value })}
              />
              <DateInput
                id={span.id + '-end'}
                label="Employment end"
                optional
                description="Leave blank if still employed."
                value={span.end_date ?? ''}
                onChange={(value) =>
                  update(span.id, { end_date: value || null })
                }
              />
            </div>
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-2 px-2 text-sm text-red-700 underline dark:text-red-300"
              onClick={() =>
                onChange(spans.filter((item) => item.id !== span.id))
              }
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" />
              Remove job {index + 1}
            </button>
          </fieldset>
        ))}
      </div>
      <button
        type="button"
        className={toolButtonClass(slug) + ' mt-4'}
        onClick={() =>
          onChange([
            ...spans,
            {
              id: crypto.randomUUID(),
              employer_name: 'Preview employment',
              start_date: '',
              end_date: null,
              is_current: true,
            },
          ])
        }
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add employment
      </button>
    </section>
  );
}
