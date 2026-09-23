'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
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
      <h3 className="font-semibold">Employment milestones</h3>
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
        <ul className="mt-2 space-y-2 ph-mask" data-ph-mask>
          {state.spans.map((s) => (
            <li
              key={s.id ?? `${s.employer_name}-${s.start_date}-${s.end_date}`}
            >
              <span className="font-medium">{s.employer_name}</span>
              <span className="ml-2 text-muted-foreground">
                {formatDisplayDateNoon(s.start_date)} to{' '}
                {s.end_date
                  ? formatDisplayDateNoon(s.end_date)
                  : 'Present (saved record)'}
              </span>
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/dashboard/opt-dates#employment"
        className="inline-flex min-h-11 items-center text-blue-600 underline dark:text-blue-400"
      >
        Manage employment history
      </Link>
      <p className="text-xs text-muted-foreground">
        Saved records do not confirm qualifying employment or that a change was
        reported. Confirm DSO tasks below, then save a confirmed reminder in
        Notices &amp; confirmed deadlines.
      </p>
    </section>
  );
}
