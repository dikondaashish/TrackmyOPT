'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2, Search } from 'lucide-react';
import { captureClientEvent } from '@/lib/posthog-client';

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

type ApiErr = { ok: false; error: string };

function todayIsoLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function OptDecisionWindowTool() {
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

    try {
      const params = new URLSearchParams({
        received: received.trim(),
        case_kind: caseKind,
      });
      const prefix = receiptPrefix.trim().toUpperCase().slice(0, 3);
      if (prefix) params.set('receipt_prefix', prefix);

      const res = await fetch(`/api/public/opt-decision-window?${params}`);
      const data = (await res.json()) as ApiOk | ApiErr;

      if (!res.ok || !data.ok) {
        setError(
          !data.ok ? data.error : 'Could not load your decision window.'
        );
        captureClientEvent('opt_decision_window_failed', {
          case_kind: caseKind,
          status: res.status,
        });
        return;
      }

      setResult(data);
      captureClientEvent('opt_decision_window_viewed', {
        case_kind: caseKind,
        has_estimate: Boolean(data.estimate),
        days_since_filed: data.daysSinceFiled,
        cohort_size: data.estimate?.cohortSize ?? 0,
      });
    } catch {
      setError('Network error. Please try again.');
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
        className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm dark:border-emerald-900 dark:bg-zinc-950 sm:p-7"
      >
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white">
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
                  className={`min-h-11 rounded-xl border px-3 text-sm font-semibold transition-colors ${
                    caseKind === value
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted/50'
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
              max={todayIsoLocal()}
              value={received}
              onChange={(e) => setReceived(e.target.value)}
              className="min-h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              From your I-797C receipt notice — the date USCIS received your I-765.
            </p>
          </div>

          <div>
            <label
              htmlFor="opt-dw-prefix"
              className="mb-2 block text-sm font-semibold text-foreground"
            >
              Receipt prefix{' '}
              <span className="font-normal text-muted-foreground">(optional)</span>
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
                setReceiptPrefix(e.target.value.replace(/[^a-zA-Z]/g, '').slice(0, 3))
              }
              className="min-h-11 w-full rounded-xl border border-border bg-background px-3 font-mono text-sm uppercase text-foreground"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              First 3 letters only (IOE, EAC, WAC…). Never enter your full receipt number here.
            </p>
          </div>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !received}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Checking similar cases…
              </>
            ) : (
              <>
                Show my decision window
                <ArrowRight className="h-4 w-4" aria-hidden />
              </>
            )}
          </button>
        </div>
      </form>

      {result && (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-7">
          {estimate && low != null && high != null ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                Where you stand
              </p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">
                Day {daysIn}
                <span className="ml-2 text-base font-medium text-muted-foreground">
                  of your wait
                </span>
              </p>

              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-muted/40 p-4">
                  <dt className="text-xs text-muted-foreground">
                    Typical decision wait
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold tabular-nums">
                    {estimate.medianDays}
                    <span className="ml-1 text-sm font-medium">days</span>
                  </dd>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
                  <dt className="text-xs text-emerald-800 dark:text-emerald-200">
                    Decision window · middle 50%
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                    {low}–{high}
                    <span className="ml-1 text-sm font-medium">days</span>
                  </dd>
                </div>
              </dl>

              <p className="mt-4 text-[9px] leading-snug text-muted-foreground/80">
                Based on {estimate.cohortSize.toLocaleString()} completed community
                reports for similar cases. Planning estimate only — not a USCIS
                decision date.
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              {result.message ??
                'Not enough matched reports yet. Track live USCIS status free instead.'}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login?next=/dashboard/case-status"
              onClick={() =>
                captureClientEvent('opt_decision_window_cta', {
                  cta: 'track_live_status',
                  case_kind: caseKind,
                })
              }
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Track live status free
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/features/case-status"
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-border px-4 text-sm font-semibold text-foreground hover:bg-muted/50"
            >
              How alerts work
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
