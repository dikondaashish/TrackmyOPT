'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  formatDisplayDateNoon,
  parseValidDate,
} from '@/lib/case-status/safe-dates';

const FIELDS = [
  ['program_end_date', 'Program end'],
  ['dso_recommendation_date', 'OPT DSO recommendation'],
  ['opt_start_date', 'OPT start'],
  ['opt_ead_end_date', 'OPT EAD end'],
  ['stem_dso_recommendation_date', 'STEM DSO recommendation'],
  ['stem_start_date', 'STEM start'],
] as const;

type SavedDates = Partial<Record<(typeof FIELDS)[number][0], string | null>>;
type LoadState = {
  status: 'loading' | 'error' | 'ready';
  data: SavedDates | null;
};

/** Display the same saved dates used by OPT Tools, without inferring legal status. */
export function SavedOptDates() {
  const [state, setState] = useState<LoadState>({
    status: 'loading',
    data: null,
  });
  useEffect(() => {
    const controller = new AbortController();
    void fetch('/api/opt/calculator', {
      credentials: 'include',
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Dates unavailable');
        const body = await response.json();
        if (!body.ok) throw new Error('Dates unavailable');
        if (!controller.signal.aborted)
          setState({ status: 'ready', data: body.data ?? null });
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setState({ status: 'error', data: null });
      });
    return () => controller.abort();
  }, []);

  const dates = FIELDS.filter(([key]) => parseValidDate(state.data?.[key]));
  return (
    <section
      className="mt-5 rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-950/20"
      aria-labelledby="saved-opt-dates-title"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="saved-opt-dates-title" className="text-sm font-semibold">
          Your saved OPT dates
        </h3>
        <Link
          href="/dashboard/opt-dates"
          className="inline-flex min-h-11 items-center text-sm font-medium text-blue-700 underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 dark:text-blue-300"
        >
          Manage OPT dates →
        </Link>
      </div>
      {state.status === 'loading' ? (
        <p role="status" className="text-sm text-muted-foreground">
          Loading saved dates…
        </p>
      ) : state.status === 'error' ? (
        <p role="status" className="text-sm text-muted-foreground">
          Could not load your saved dates. Open OPT Dates to check them.
        </p>
      ) : dates.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Add your OPT dates to see them alongside your case.
        </p>
      ) : (
        <>
          <dl data-ph-mask className="ph-mask mt-2 grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 lg:grid-cols-3">
            {dates.map(([key, label]) => (
              <div key={key}>
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-1 text-sm font-semibold tabular-nums">
                  {formatDisplayDateNoon(state.data?.[key])}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            From your OPT Dates settings, not a USCIS approval or confirmation
            of work authorization. Verify against your I-20 and EAD.
          </p>
        </>
      )}
    </section>
  );
}
