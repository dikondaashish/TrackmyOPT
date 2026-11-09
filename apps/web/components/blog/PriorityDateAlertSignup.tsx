'use client';

import { useId, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { BellRing, CheckCircle2, Loader2 } from 'lucide-react';
import { captureClientEvent } from '@/lib/posthog-client';
import {
  ALERT_CATEGORIES,
  ALERT_COUNTRIES,
  CATEGORY_LABELS,
  COUNTRY_LABELS,
  type AlertCategory,
  type AlertCountry,
} from '@/data/visa-bulletin/employment-cutoffs';

type State = { kind: 'idle' } | { kind: 'sending' } | { kind: 'done' } | { kind: 'error'; message: string };

const fieldClass =
  'mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30';

/** Email sign-up for monthly Visa Bulletin priority-date alerts (double opt-in). */
export function PriorityDateAlertSignup({ sourcePage }: { sourcePage: string }) {
  const id = useId();
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<AlertCategory>('eb2');
  const [country, setCountry] = useState<AlertCountry>('india');
  const [priorityDate, setPriorityDate] = useState('');
  const [state, setState] = useState<State>({ kind: 'idle' });
  const today = new Date().toISOString().slice(0, 10);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ kind: 'sending' });
    try {
      const response = await fetch('/api/visa-bulletin-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, category, chargeability: country, priorityDate, sourcePage }),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setState({ kind: 'error', message: data.error ?? 'Something went wrong. Try again shortly.' });
        return;
      }
      setState({ kind: 'done' });
      captureClientEvent('priority_date_alert_requested', {
        category,
        chargeability: country,
        has_priority_date: Boolean(priorityDate),
        source_page: sourcePage,
      });
    } catch {
      setState({ kind: 'error', message: 'Network error. Check your connection and try again.' });
    }
  }

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="not-prose my-10 rounded-xl border border-border bg-card p-6 shadow-card sm:p-7"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
          <BellRing className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <h2 id={`${id}-title`} className="text-lg font-bold text-foreground">
            Get an email when your priority date moves
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            One email when each new Visa Bulletin is out: your category&apos;s Final Action Date, Dates for
            Filing, which chart USCIS is using, and how far your priority date is from current. Free, no
            account needed.
          </p>
        </div>
      </div>

      {state.kind === 'done' ? (
        <p className="mt-5 flex items-start gap-2 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100" role="status">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Check your inbox and press the confirmation button. Alerts start only after you confirm.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-foreground sm:col-span-2">
            Email
            <input
              type="email"
              required
              autoComplete="email"
              maxLength={320}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
            />
          </label>
          <label className="block text-sm font-medium text-foreground">
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value as AlertCategory)} className={fieldClass}>
              {ALERT_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {CATEGORY_LABELS[value]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-foreground">
            Country of birth (chargeability)
            <select value={country} onChange={(e) => setCountry(e.target.value as AlertCountry)} className={fieldClass}>
              {ALERT_COUNTRIES.map((value) => (
                <option key={value} value={value}>
                  {COUNTRY_LABELS[value]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-foreground sm:col-span-2">
            Priority date <span className="font-normal text-muted-foreground">(optional, from your I-140 or PERM)</span>
            <input
              type="date"
              min="1990-01-01"
              max={today}
              value={priorityDate}
              onChange={(e) => setPriorityDate(e.target.value)}
              className={fieldClass}
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={state.kind === 'sending'}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {state.kind === 'sending' && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Email me each new bulletin
            </button>
            {state.kind === 'error' && (
              <p className="mt-2 text-sm text-red-700 dark:text-red-300" role="alert">
                {state.message}
              </p>
            )}
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Born in Mexico or the Philippines? Those columns usually match &quot;All other countries&quot; but not
              always, so check the official bulletin. Unsubscribe in one click from any email. See our{' '}
              <Link href="/privacy" className="underline">
                privacy policy
              </Link>
              .
            </p>
          </div>
        </form>
      )}
    </section>
  );
}
