'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BriefcaseBusiness } from 'lucide-react';
import {
  calendarDateISO,
  localTodayISO,
} from '@/lib/immigration/calendar-days';
import { formatDisplayDateNoon } from '@/lib/case-status/safe-dates';

type Span = {
  id?: string;
  employer_name: string;
  start_date: string;
  end_date: string | null;
};
export function EmploymentContext({
  onChangeDate,
}: {
  onChangeDate: (value: string | null) => void;
}) {
  const [state, setState] = useState<{
    spans: Span[];
    status: 'loading' | 'ready' | 'error';
  }>({ spans: [], status: 'loading' });
  useEffect(() => {
    const abort = new AbortController();
    fetch('/api/employment-spans', {
      credentials: 'include',
      signal: abort.signal,
    })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok || !body.ok || !Array.isArray(body.spans))
          throw new Error();
        return body;
      })
      .then((body) => {
        if (abort.signal.aborted) return;
        setState({ spans: body.spans, status: 'ready' });
        const today = localTodayISO();
        const dates = (body.spans as Span[])
          .flatMap((s) => [s.start_date, s.end_date])
          .flatMap((v) =>
            v && calendarDateISO(v) && calendarDateISO(v)! <= today
              ? [calendarDateISO(v)!]
              : []
          )
          .sort();
        onChangeDate(dates.at(-1) ?? null);
      })
      .catch(() => {
        if (!abort.signal.aborted) setState({ spans: [], status: 'error' });
      });
    return () => abort.abort();
  }, [onChangeDate]);
  return (
    <section
      aria-label="Saved employment milestones"
      className="mt-4 border-t border-border pt-4 text-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-semibold">
          <BriefcaseBusiness
            aria-hidden="true"
            className="h-4 w-4 text-blue-600 dark:text-blue-400"
          />
          Employment milestones
        </h3>
        <Link
          href="/dashboard/opt-dates#employment"
          className="inline-flex min-h-11 items-center text-sm font-medium text-blue-700 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 dark:text-blue-300"
        >
          Manage employment history →
        </Link>
      </div>
      {state.status === 'loading' ? (
        <p role="status">Loading employment records…</p>
      ) : state.status === 'error' ? (
        <p role="status">
          Employment records could not load. No reporting deadline was inferred.
        </p>
      ) : state.spans.length === 0 ? (
        <p className="text-muted-foreground">
          No employment records saved yet.
        </p>
      ) : (
        <ul className="mt-2 ph-mask" data-ph-mask>
          {state.spans.map((s) => (
            <li
              key={s.id ?? `${s.employer_name}-${s.start_date}-${s.end_date}`}
              className="relative ml-1 border-l-2 border-blue-200 pb-4 pl-5 last:pb-0 dark:border-blue-800"
            >
              <span
                aria-hidden="true"
                className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-blue-500"
              />
              <span className="block break-words font-medium">
                {s.employer_name}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground tabular-nums">
                {formatDisplayDateNoon(s.start_date)} to{' '}
                {s.end_date
                  ? formatDisplayDateNoon(s.end_date)
                  : 'Present (saved record)'}
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 text-xs text-muted-foreground">
        Saved records · eligibility and DSO reporting are not verified.
      </div>
    </section>
  );
}
