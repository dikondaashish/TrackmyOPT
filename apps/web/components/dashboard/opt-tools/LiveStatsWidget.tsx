'use client';

import { useEffect, useState } from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import type {
  CommunityStatsBlock,
  ToolType,
} from '@/lib/opt/community-stats-builder';
import { panelClass, toolThemes } from './tool-config';

export function LiveStatsWidget({
  toolType = 'opt-apply',
}: {
  toolType?: ToolType;
}) {
  const theme = toolThemes[toolType];
  const [result, setResult] = useState<{
    tool: ToolType;
    stats: CommunityStatsBlock;
  } | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch('/api/opt/community-stats', {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (!data[toolType]?.mainStat) throw new Error();
        if (!controller.signal.aborted) {
          setResult({ tool: toolType, stats: data[toolType] });
          setError(false);
        }
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [toolType, attempt]);
  const stats = result?.tool === toolType ? result.stats : null;
  // Suppress old cached "baseline" payloads too.
  const available =
    stats?.dataSource === 'trackmyopt' &&
    stats.sampleSize >= 5 &&
    Number.isFinite(stats.mainStat.value) &&
    stats.mainStat.value !== null;
  return (
    <section
      className={panelClass}
      aria-label="Community approval statistics"
      aria-busy={loading}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 aria-hidden="true" className={`h-5 w-5 ${theme.text}`} />
          <h3 className="font-semibold">
            {toolType.startsWith('stem') ? 'STEM' : 'OPT'} approval insights
          </h3>
        </div>
        <button
          type="button"
          aria-label="Refresh community report statistics"
          disabled={loading}
          onClick={() => {
            setLoading(true);
            setAttempt((value) => value + 1);
          }}
          className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-lg hover:bg-muted focus-visible:ring-2 disabled:opacity-50"
        >
          <RefreshCw
            aria-hidden="true"
            className={
              'h-4 w-4 ' +
              (loading ? 'animate-spin motion-reduce:animate-none' : '')
            }
          />
        </button>
      </div>
      {error ? (
        <p role="status" className="mt-3 text-sm text-muted-foreground">
          Statistics are temporarily unavailable. Refresh to try again.
        </p>
      ) : loading ? (
        <p role="status" className="mt-3 text-sm text-muted-foreground">
          Loading community data…
        </p>
      ) : available && stats ? (
        <div className="mt-3 space-y-4">
          <div className={`rounded-xl p-4 ${theme.surface}`}>
            <span className="text-sm text-muted-foreground">
              Median recorded approval time
            </span>
            <div
              className={`mt-1 text-3xl font-semibold tabular-nums ${theme.text}`}
            >
              {stats.mainStat.value}{' '}
              <span className="text-base font-normal">days</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {stats.sampleSize} qualifying cases with recorded approvals in the
            last 90 days. {stats.secondaryStat.value} in the last 7 days.
          </p>
        </div>
      ) : (
        <div className="mt-3 rounded-xl bg-muted/50 p-4">
          <h4 className="font-medium">Not enough data yet</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            Approval insights appear when at least five qualifying cases from
            different users are available.
          </p>
        </div>
      )}
      <details className="mt-4 border-t border-border pt-3">
        <summary className="min-h-11 cursor-pointer text-sm font-medium focus-visible:ring-2">
          About these numbers
        </summary>
        <p className="text-sm text-muted-foreground">
          An anonymized sample of up to 1,000 recently received TrackMyOPT
          cases, with a confirmed filing category and recorded receipt and
          approval dates. Known premium-processing cases are excluded;
          unreported premium processing may remain. A median is the middle
          recorded duration, not an average or an approval forecast. This is not
          an official USCIS processing-time estimate.
        </p>
      </details>
      <a
        href="https://egov.uscis.gov/processing-times/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center text-sm font-medium text-blue-700 underline underline-offset-4 focus-visible:ring-2 dark:text-blue-300"
      >
        Check USCIS processing times
      </a>
    </section>
  );
}
