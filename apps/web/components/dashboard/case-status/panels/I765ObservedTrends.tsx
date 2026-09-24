'use client';

import { useEffect, useState } from 'react';
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

  const largest = Math.max(
    ...(trends?.distribution.map((group) => group.count) ?? []),
    1
  );

  return (
    <section
      aria-label="Broader I-765 data"
      className="mt-6 rounded-xl border border-border bg-card p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">
          Broader I-765 data
        </h3>
        <span className="text-xs text-muted-foreground">
          All I-765 categories · 6-month dataset
        </span>
      </div>
      {loading ? (
        <p role="status" className="mt-3 text-sm text-muted-foreground">
          Loading broader case data…
        </p>
      ) : !trends ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Broader case data is temporarily unavailable. Your OPT/STEM
          comparisons above are unaffected.
        </p>
      ) : (
        <>
          <dl className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-muted-foreground">
                Median decision time
              </dt>
              <dd className="mt-1 text-xl font-semibold text-foreground">
                {trends.medianDays} days
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Middle half</dt>
              <dd className="mt-1 text-xl font-semibold text-foreground">
                {trends.p25Days}–{trends.p75Days} days
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Decided cases</dt>
              <dd className="mt-1 text-xl font-semibold text-foreground">
                {trends.decidedCases.toLocaleString()}
              </dd>
            </div>
          </dl>
          <div
            className="mt-4 grid gap-2 sm:grid-cols-5"
            role="group"
            aria-label="Decision time distribution"
          >
            {trends.distribution.map((group) => (
              <div key={group.label}>
                <div
                  className="h-2 overflow-hidden rounded-full bg-muted"
                  aria-hidden="true"
                >
                  <div
                    className="h-full rounded-full bg-blue-600 dark:bg-blue-400"
                    style={{ width: `${(group.count / largest) * 100}%` }}
                  />
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {group.label} · {group.count.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Reported aggregate decisions across all I-765 categories, not an
            OPT- or STEM-only sample. Not an official USCIS processing time or a
            forecast for your case. The dataset does not provide a precise date
            range or last-updated time.
          </p>
        </>
      )}
    </section>
  );
}
