'use client';

import { useEffect, useState } from 'react';
import type { Forecast } from '@/lib/opt-forecast/types';

const displayDate = (value: string | null) =>
  value
    ? new Date(value.slice(0, 10) + 'T12:00:00Z').toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : 'Not enough data';
export function ForecastDetails({ forecast: f }: { forecast: Forecast }) {
  return (
    <section
      aria-label="Verified approval forecast"
      className="mb-5 rounded-xl border border-border bg-muted/20 p-5"
    >
      <h3 className="text-base font-semibold">
        {f.state === 'approved'
          ? 'USCIS approval'
          : 'Estimated OPT Approval Window'}
      </h3>
      {f.state === 'approved' && f.approvalDate ? (
        <p className="mt-2 text-lg font-semibold">
          {displayDate(f.approvalDate)}
        </p>
      ) : f.state === 'estimate' ? (
        <>
          {/* Validation showed the 50% range was too narrow; lead with the median
              and the wider 80% range instead. */}
          <p className="mt-2 text-sm">Most likely approval date</p>
          <p className="text-lg font-semibold">{displayDate(f.medianDate)}</p>
          {f.interval80.every(Boolean) ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Likely range: {displayDate(f.interval80[0])} –{' '}
              {displayDate(f.interval80[1])}
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              Not enough data yet for a reliable range.
            </p>
          )}
        </>
      ) : null}
      <p className="mt-3 text-sm text-muted-foreground">{f.explanation}</p>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        {f.state !== 'approved' && f.state !== 'nonapproval' && (
          <div>
            <dt className="text-muted-foreground">Current Waiting Time</dt>
            <dd>
              {f.waitingDays === null
                ? 'Receipt date needed'
                : `${f.waitingDays} days`}
            </dd>
          </div>
        )}
        <div>
          <dt className="text-muted-foreground">Last Updated</dt>
          <dd>{displayDate(f.asOf)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Last successful USCIS check</dt>
          <dd>{displayDate(f.lastSuccessfulSync)}</dd>
        </div>
        {f.reliability && (
          <div>
            <dt className="text-muted-foreground">Prediction Reliability</dt>
            <dd>{f.reliability}</dd>
          </div>
        )}
      </dl>
    </section>
  );
}

export function VerifiedForecastPanel({
  caseId,
  lastCheckedAt,
}: {
  caseId: string;
  lastCheckedAt: string | null;
}) {
  const [result, setResult] = useState<{
    caseId: string;
    forecast: Forecast | null;
    failed: boolean;
  } | null>(null);
  // Start on today's UTC day so the first clock tick does not refetch (each
  // forecast read is recorded as a shown forecast).
  const [utcDay, setUtcDay] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  useEffect(() => {
    // A clock subscription changes state only at a new UTC day; it makes no network
    // request during the other minute ticks and recovers after a sleeping tab.
    const timer = setInterval(
      () => setUtcDay(new Date().toISOString().slice(0, 10)),
      60_000
    );
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    void fetch(
      `/api/case-status/forecast?case_id=${encodeURIComponent(caseId)}`,
      {
        credentials: 'include',
        signal: controller.signal,
      }
    )
      .then(async (response) => {
        if ([401, 403, 404].includes(response.status)) return null;
        if (!response.ok) throw new Error('Forecast unavailable');
        const body = (await response.json()) as {
          ok?: boolean;
          forecast?: Forecast;
        };
        if (!body.ok || !body.forecast?.asOf)
          throw new Error('Forecast response invalid');
        return body.forecast;
      })
      .then((forecast) => {
        if (!controller.signal.aborted)
          setResult({ caseId, forecast, failed: false });
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          console.error('OPT approval forecast could not be loaded');
          setResult({ caseId, forecast: null, failed: true });
        }
      });
    return () => controller.abort();
  }, [caseId, lastCheckedAt, utcDay]);
  if (result?.caseId !== caseId)
    return (
      <p role="status" className="mb-4 text-sm text-muted-foreground">
        Loading approval forecast…
      </p>
    );
  if (result.failed)
    return (
      <p role="status" className="mb-4 text-sm text-muted-foreground">
        The verified forecast is temporarily unavailable. Your community
        comparison is shown below.
      </p>
    );
  return result.forecast ? (
    <ForecastDetails forecast={result.forecast} />
  ) : null;
}
