'use client';

import { useEffect, useState } from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import type {
  CommunityStatsBlock,
  ToolType,
} from '@/lib/opt/community-stats-builder';
import { panelClass, toolThemes } from './tool-config';
import { useClientDate } from '@/hooks/useClientDate';
import {
  OFFICIAL_PROCESSING_SNAPSHOTS,
  usableOfficialSnapshot,
} from '@/lib/case-status/official-processing-times';

function useCommunityStats(toolType: ToolType) {
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
  return {
    stats,
    error,
    loading,
    refresh: () => {
      setLoading(true);
      setAttempt((value) => value + 1);
    },
  };
}

export function LiveStatsWidget({
  toolType = 'opt-apply',
}: {
  toolType?: ToolType;
}) {
  const theme = toolThemes[toolType];
  const { stats, error, loading, refresh } = useCommunityStats(toolType);
  // Suppress old cached "baseline" payloads too.
  const available =
    stats?.dataSource === 'trackmyopt' &&
    stats.sampleSize >= 5 &&
    Number.isFinite(stats.mainStat.value) &&
    stats.mainStat.value !== null;
  return (
    <section
      className={panelClass}
      aria-label="Approval processing insights"
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
          onClick={refresh}
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
      {error && !loading && (
        <p role="status" className="mt-3 text-sm text-muted-foreground">
          Community statistics are temporarily unavailable. Refresh to try
          again.
        </p>
      )}
      {loading ? (
        <p role="status" className="mt-3 text-sm text-muted-foreground">
          Loading community data…
        </p>
      ) : !error && available && stats ? (
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
        <OfficialProcessingFallback toolType={toolType} />
      )}
      <details className="mt-4 border-t border-border pt-3">
        <summary className="min-h-11 cursor-pointer text-sm font-medium focus-visible:ring-2">
          About these numbers
        </summary>
        {!loading && !error && available ? (
          <p className="text-sm text-muted-foreground">
            An anonymized sample of up to 1,000 recently received TrackMyOPT
            cases, with a confirmed filing category and recorded receipt and
            approval dates. Known premium-processing cases are excluded;
            unreported premium processing may remain. A median is the middle
            recorded duration, not an average or an approval forecast. This is
            not an official USCIS processing-time estimate.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            USCIS measures completed cases over the past six months, not just
            approvals. This combined student category is not a separate OPT or
            STEM estimate and is not a premium-processing deadline. We show the
            verified official figure when community reports are limited or
            unavailable; it is not a TrackMyOPT median or a live USCIS feed.
            Figures older than 30 days are hidden until reverified.
          </p>
        )}
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

function OfficialProcessingFallback({ toolType }: { toolType: ToolType }) {
  const theme = toolThemes[toolType];
  const now = useClientDate();
  const official = now
    ? usableOfficialSnapshot(OFFICIAL_PROCESSING_SNAPSHOTS.at(-1), now)
    : null;
  return (
    <div className={`mt-3 rounded-xl p-4 ${theme.surface}`}>
      <h4 className="text-sm font-medium">USCIS processing time</h4>
      {official ? (
        <>
          <p
            className={`mt-1 text-3xl font-semibold tabular-nums ${theme.text}`}
          >
            {official.months}{' '}
            <span className="text-base font-normal">months</span>
          </p>
          <p className="mt-1 text-sm">
            80% of cases completed within this time
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            I-765 · F-1 student category · {official.office}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Verified {official.checkedDate}. Not a minimum wait or guaranteed
            approval date.
          </p>
        </>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">
          Check the latest time on USCIS: select I-765, the F-1 student category
          and the applicable office. A current verified figure is not available
          here.
        </p>
      )}
    </div>
  );
}
