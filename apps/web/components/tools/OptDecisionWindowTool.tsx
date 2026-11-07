'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2, Search } from 'lucide-react';
import { captureClientEvent } from '@/lib/posthog-client';
import { useClientDate } from '@/hooks/useClientDate';

type CaseKind = 'initial_opt' | 'stem_opt';

type Estimate = {
  medianDays: number;
  p25Days: number | null;
  p75Days: number | null;
  cohortSize: number;
  caseKind: string;
  matchLevel: string;
  sourceNote: string;
};

type ApiOk = {
  ok: true;
  daysSinceFiled: number;
  estimate: Estimate | null;
  message?: string;
};

function todayIsoLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function OptDecisionWindowTool() {
  const clientDate = useClientDate();
  const [caseKind, setCaseKind] = useState<CaseKind>('initial_opt');
  const [received, setReceived] = useState('');
  const [receiptPrefix, setReceiptPrefix] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ApiOk | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    let stage = 'network';
    let status: number | 'none' = 'none';
    try {
      const params = new URLSearchParams({
        received: received.trim(),
        case_kind: caseKind,
      });
      const prefix = receiptPrefix.trim().toUpperCase().slice(0, 3);
      if (prefix) params.set('receipt_prefix', prefix);

      const res = await fetch(`/api/public/opt-decision-window?${params}`);
      status = res.status;
      stage = 'http';
      if (res.status >= 400 && res.status < 500) {
        const body = await res.json().catch(() => null);
        setError(
          typeof body?.error === 'string'
            ? body.error
            : 'Could not load your decision window.'
        );
        captureClientEvent('opt_decision_window_failed', {
          case_kind: caseKind,
          status: res.status,
          failure_kind: 'api',
        });
        return;
      }
      if (!res.ok) throw new Error();
      stage = 'json';
      const data = (await res.json()) as ApiOk | null;
      stage = 'payload';
      if (
        !data ||
        data.ok !== true ||
        !Number.isFinite(data.daysSinceFiled) ||
        (data.message !== undefined && typeof data.message !== 'string') ||
        (data.estimate !== null &&
          (!data.estimate ||
            !Number.isFinite(data.estimate.medianDays) ||
            !Number.isFinite(data.estimate.cohortSize) ||
            (data.estimate.p25Days !== null &&
              !Number.isFinite(data.estimate.p25Days)) ||
            (data.estimate.p75Days !== null &&
              !Number.isFinite(data.estimate.p75Days))))
      ) {
        throw new Error();
      }
      stage = 'processing';
      setResult(data);
      captureClientEvent('opt_decision_window_viewed', {
        case_kind: caseKind,
        has_estimate: Boolean(data.estimate),
        days_since_filed: data.daysSinceFiled,
        cohort_size: data.estimate?.cohortSize ?? 0,
      });
    } catch {
      console.error(
        `OPT decision window: failed to load estimate (stage=${stage}, status=${status})`
      );
      setError('Network error. Please try again.');
      captureClientEvent('opt_decision_window_failed', {
        case_kind: caseKind,
        failure_kind: 'network_or_response',
      });
    } finally {
      setLoading(false);
    }
  };

  const estimate = result?.estimate;
  const low = estimate?.p25Days ?? estimate?.medianDays;
  const high = estimate?.p75Days ?? estimate?.medianDays;
  const daysIn = result?.daysSinceFiled ?? 0;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <form
        onSubmit={onSubmit}
        className="rounded-xl border border-border bg-card p-6 shadow-elevated sm:p-7"
      >
        <div className="mb-6 flex items-center gap-3 border-b border-border pb-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
            <Search className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">
              See your decision window
            </p>
            <p className="text-sm text-muted-foreground">
              No account needed for the first look.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-foreground">
              Case type
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ['initial_opt', 'Initial OPT'],
                  ['stem_opt', 'STEM OPT'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setCaseKind(value)}
                  className={`min-h-11 rounded-lg border px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    caseKind === value
                      ? 'border-primary bg-primary-soft text-blue-800 ring-1 ring-primary dark:text-blue-200'
                      : 'border-input bg-background text-muted-foreground shadow-card hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label
              htmlFor="opt-dw-received"
              className="mb-2 block text-sm font-semibold text-foreground"
            >
              USCIS received / receipt date
            </label>
            <input
              id="opt-dw-received"
              type="date"
              required
              max={clientDate ? todayIsoLocal(clientDate) : undefined}
              value={received}
              onChange={(e) => setReceived(e.target.value)}
              className="min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-card transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              From your I-797C receipt notice — the date USCIS received your
              I-765.
            </p>
          </div>

          <div>
            <label
              htmlFor="opt-dw-prefix"
              className="mb-2 block text-sm font-semibold text-foreground"
            >
              Receipt prefix{' '}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <input
              id="opt-dw-prefix"
              type="text"
              inputMode="text"
              autoComplete="off"
              maxLength={3}
              placeholder="IOE"
              value={receiptPrefix}
              onChange={(e) =>
                setReceiptPrefix(
                  e.target.value.replace(/[^a-zA-Z]/g, '').slice(0, 3)
                )
              }
              className="min-h-11 w-full font-mono placeholder:text-muted-foreground rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-card transition-colors focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              First 3 letters only (IOE, EAC, WAC…). Never enter your full
              receipt number here.
            </p>
          </div>

          {error && (
            <p className="rounded-lg border-l-4 border-l-red-500 bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !received}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-button transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                <span>Checking similar cases…</span>
              </>
            ) : (
              <>
                <span>Show my decision window</span>
                <ArrowRight className="h-4 w-4" aria-hidden />
              </>
            )}
          </button>
        </div>
      </form>

      {result && (
        <div className="surface-card p-6 sm:p-7">
          {estimate && low != null && high != null ? (
            <>
              <p className="text-sm font-medium text-muted-foreground">
                Where you stand
              </p>
              <p className="mt-1 text-4xl font-bold tabular-nums text-foreground">
                Day {daysIn}
                <span className="ml-2 text-base font-medium text-muted-foreground">
                  of your wait
                </span>
              </p>

              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-surface p-4">
                  <dt className="text-xs text-muted-foreground">
                    Typical decision wait
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                    {estimate.medianDays}
                    <span className="ml-1 text-sm font-medium">days</span>
                  </dd>
                </div>
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
                  <dt className="text-xs font-medium text-blue-800 dark:text-blue-200">
                    Decision window · middle 50%
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold tabular-nums text-blue-900 dark:text-blue-100">
                    {low}–{high}
                    <span className="ml-1 text-sm font-medium">days</span>
                  </dd>
                </div>
              </dl>

              <p className="mt-4 text-xs leading-5 text-muted-foreground">
                Based on {estimate.cohortSize.toLocaleString()} completed
                community reports for similar cases. Planning estimate only —
                not a USCIS decision date.
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {result.message ??
                'Not enough matched reports yet. Track live USCIS status free instead.'}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row">
            <Link
              href="/login?next=/dashboard/case-status"
              onClick={() =>
                captureClientEvent('opt_decision_window_cta', {
                  cta: 'track_live_status',
                  case_kind: caseKind,
                })
              }
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-button transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Track live status free
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/features/case-status"
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-semibold text-foreground shadow-card transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              How alerts work
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
