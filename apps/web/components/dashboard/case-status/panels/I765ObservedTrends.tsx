'use client';

import { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import type { I765ObservedTrends as Trends } from '@/lib/case-status/i765-observed-trends';

export function I765ObservedTrends() {
  const [trends, setTrends] = useState<Trends | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    void fetch('/api/case-status/i765-observed-trends', {
      signal: controller.signal,
    })
      .then(async (response) =>
        response.ok ? (response.json() as Promise<{ trends: Trends }>) : null
      )
      .then((result) => {
        if (!controller.signal.aborted) setTrends(result?.trends ?? null);
      })
      .catch(() => {
        if (!controller.signal.aborted) setTrends(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  return (
    <section
      aria-label="Broader I-765 data"
      className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-3.5 sm:px-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <BarChart3
            className="h-4 w-4 text-blue-600 dark:text-blue-400"
            aria-hidden="true"
          />
          Broader I-765 data
        </h3>
        <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground">
          All I-765 types · 6-month sample
        </span>
      </div>
      {loading ? (
        <p
          role="status"
          className="px-4 py-8 text-sm text-muted-foreground sm:px-5"
        >
          Loading broader case data…
        </p>
      ) : !trends ? (
        <p className="px-4 py-8 text-sm text-muted-foreground sm:px-5">
          Broader case data is temporarily unavailable. Your OPT/STEM
          comparisons above are unaffected.
        </p>
      ) : (
        <div className="p-4 sm:p-5">
          <dl className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-[var(--chart-seq-1)] p-4">
              <dt className="text-xs font-medium text-muted-foreground">
                Median decision time
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight tabular-nums text-foreground">
                {trends.medianDays}
                <span className="ml-1 text-sm font-medium">days</span>
              </dd>
            </div>
            <div className="rounded-xl bg-muted/40 p-4">
              <dt className="text-xs font-medium text-muted-foreground">
                Middle 50%
              </dt>
              <dd className="mt-1 text-2xl font-semibold tracking-tight tabular-nums text-foreground">
                {trends.p25Days}–{trends.p75Days}
                <span className="ml-1 text-sm font-medium">days</span>
              </dd>
            </div>
            <div className="rounded-xl bg-muted/40 p-4">
              <dt className="text-xs font-medium text-muted-foreground">
                Decided cases
              </dt>
              <dd className="mt-1 text-2xl font-semibold tracking-tight tabular-nums text-foreground">
                {trends.decidedCases.toLocaleString()}
              </dd>
            </div>
          </dl>

          <figure className="mt-5" aria-label="Decision time distribution">
            <figcaption className="mb-2 flex flex-wrap items-baseline justify-between gap-2 text-xs">
              <span className="font-semibold text-foreground">
                When decisions were recorded
              </span>
              <span className="text-muted-foreground">
                Share of this sample
              </span>
            </figcaption>
            <div
              className="flex h-5 overflow-hidden rounded-full bg-muted"
              aria-hidden="true"
            >
              {trends.distribution.map((group, index) => (
                <div
                  key={group.label}
                  style={{
                    width: `${(group.count / trends.decidedCases) * 100}%`,
                    background: `var(--chart-seq-${index + 2})`,
                  }}
                />
              ))}
            </div>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-5">
              {trends.distribution.map((group, index) => (
                <li key={group.label} className="min-w-0">
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-sm border border-border"
                      style={{ background: `var(--chart-seq-${index + 2})` }}
                      aria-hidden="true"
                    />
                    {group.label}
                  </span>
                  <span className="ml-4 text-muted-foreground tabular-nums">
                    {group.count.toLocaleString()} ·{' '}
                    {Math.round((group.count / trends.decidedCases) * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          </figure>
          <p className="mt-5 text-xs font-medium text-muted-foreground">
            All I-765 types, not an OPT- or STEM-only sample. Not a forecast for
            your case.
          </p>
          <details className="mt-2 text-xs text-muted-foreground">
            <summary className="w-fit cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              About this dataset
            </summary>
            <p className="mt-2 max-w-prose leading-relaxed">
              Reported aggregate decisions, not an official USCIS processing
              time. The dataset does not provide a precise date range or
              last-updated time. Use the OPT/STEM comparisons above for a closer
              match to your filing.
            </p>
          </details>
        </div>
      )}
    </section>
  );
}
