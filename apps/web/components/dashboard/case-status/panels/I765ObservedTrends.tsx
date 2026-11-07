'use client';

import { useEffect, useState } from 'react';
import type { I765ObservedTrends as Trends } from '@/lib/case-status/i765-observed-trends';
import { DecisionTimeBreakdown } from './DecisionTimeBreakdown';

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
      className="mt-6 overflow-hidden rounded-xl border border-border bg-card shadow-card"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted px-4 py-3.5 sm:px-5">
        <h3 className="text-sm font-semibold text-foreground">
          Broader I-765 data
        </h3>
        <span className="text-xs text-muted-foreground">
          All I-765 categories · 6 months
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
              <dd className="mt-1 text-3xl font-semibold tabular-nums text-foreground">
                {trends.medianDays}
                <span className="ml-1 text-sm font-medium">days</span>
              </dd>
            </div>
            <div className="rounded-xl bg-muted p-4">
              <dt className="text-xs font-medium text-muted-foreground">
                Middle 50%
              </dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                {trends.p25Days}–{trends.p75Days}
                <span className="ml-1 text-sm font-medium">days</span>
              </dd>
            </div>
            <div className="rounded-xl bg-muted p-4">
              <dt className="text-xs font-medium text-muted-foreground">
                Decided cases
              </dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
                {trends.decidedCases.toLocaleString()}
              </dd>
            </div>
          </dl>

          <DecisionTimeBreakdown
            distribution={trends.distribution}
            total={trends.decidedCases}
          />
          <details className="mt-5 text-xs text-muted-foreground">
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
