'use client';

import { Search } from 'lucide-react';
import { MIN_COHORT_FOR_ESTIMATE } from '@/lib/community-opt/estimate';
import type { CommunityEstimate } from '@/lib/community-opt/types';
import type { CommunityCaseKind } from '@/lib/community-opt/types';
import { getCommunityCaseKindLabel } from '@/lib/case-status/filing-category';

interface PredictionPanelProps {
  daysSinceFiled: number;
  prediction?: CommunityEstimate;
  /** Minimum cohort size to show predictions */
  minCohort?: number;
  caseKind?: CommunityCaseKind;
}

function DataGate({ minCohort }: { minCohort: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
      <Search className="w-7 h-7 text-muted-foreground" />
      <p className="font-semibold text-foreground text-sm">
        Not enough matched community data yet
      </p>
      <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
        We need {minCohort}+ completed community reports for cases like yours.
        Estimates refresh after the next community data sync.
      </p>
    </div>
  );
}

/**
 * Where the reader sits against the community spread.
 *
 * This replaces a six-bar histogram that answered "what does the distribution
 * look like" — a question the Spread tab already answers in far more detail.
 * The question here is only ever "where am I", so the track shows the likely
 * window, the midpoint, and one marker for the reader.
 */
function PositionTrack({
  daysSinceFiled,
  p25,
  median,
  p75,
}: {
  daysSinceFiled: number;
  p25: number;
  median: number;
  p75: number;
}) {
  // Leave headroom past p75 so the band never touches the end of the track,
  // and always keep the reader's own marker on scale even when they are late.
  const scaleMax = Math.max(p75 * 1.25, daysSinceFiled * 1.1, median + 1);
  const pct = (d: number) => Math.min(100, Math.max(0, (d / scaleMax) * 100));

  const youPct = pct(daysSinceFiled);
  const past = daysSinceFiled > p75;

  return (
    <div className="pt-7">
      <div className="relative h-2.5 rounded-full bg-muted">
        {/* Likely window */}
        <div
          className="absolute inset-y-0 rounded-full"
          style={{
            left: `${pct(p25)}%`,
            width: `${Math.max(pct(p75) - pct(p25), 1)}%`,
            background: 'var(--chart-series-soft)',
          }}
        />
        {/* Median */}
        <div
          className="absolute -top-1 -bottom-1 w-0.5 rounded-full"
          style={{ left: `${pct(median)}%`, background: 'var(--chart-series)' }}
        />

        {/* The reader. A 2px surface ring keeps it separated from the band
            it sits on rather than blending into it. */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full ring-2 ring-card"
          style={{ left: `${youPct}%`, background: 'var(--chart-you)' }}
        />
        <div
          className="absolute -top-7 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold uppercase tracking-wide"
          style={{
            left: `${youPct}%`,
            color: 'var(--chart-you)',
            // Keep the label inside the track at both ends.
            transform:
              youPct > 88
                ? 'translateX(-90%)'
                : youPct < 12
                  ? 'translateX(-10%)'
                  : 'translateX(-50%)',
          }}
        >
          You · day {daysSinceFiled}
        </div>

        <div
          className="absolute top-4 -translate-x-1/2 whitespace-nowrap text-[10px] text-muted-foreground"
          style={{ left: `${pct(median)}%` }}
        >
          typical {median}d
        </div>
      </div>

      <p className="mt-8 text-xs text-muted-foreground leading-relaxed">
        {past ? (
          <>
            You are past the window most reported cases were decided in. Cases
            do run longer; the community data simply thins out here.
          </>
        ) : (
          <>
            The shaded band is where the middle 50% of comparable cases landed:{' '}
            <span className="font-semibold text-foreground">
              {p25}–{p75} days
            </span>
            .
          </>
        )}
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2 sm:block sm:py-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-semibold text-foreground mt-0.5 tabular-nums shrink-0">
        {value}
      </dd>
    </div>
  );
}

export function PredictionPanel({
  daysSinceFiled,
  prediction,
  minCohort = MIN_COHORT_FOR_ESTIMATE,
  caseKind = 'initial_opt',
}: PredictionPanelProps) {
  if (!prediction || prediction.cohortSize < minCohort) {
    return <DataGate minCohort={minCohort} />;
  }

  const {
    medianDays,
    p25Days,
    p75Days,
    cohortPosition,
    cohortSize,
    fastestDays,
    caseKind: predictionCaseKind,
  } = prediction;

  const cohortLabel = getCommunityCaseKindLabel(predictionCaseKind ?? caseKind);

  const low = p25Days ?? medianDays;
  const high = p75Days ?? medianDays;
  const pastRange = daysSinceFiled > high;

  return (
    <div className="space-y-4">
      <div
        className="rounded-lg px-4 py-3"
        style={{ background: 'var(--chart-seq-1)' }}
      >
        <p className="text-xs font-medium text-muted-foreground">
          Historical approval range · middle 50%
        </p>
        <p className="mt-1 text-xl font-semibold text-foreground leading-tight tracking-tight tabular-nums">
          {low}–{high} days
        </p>
        {pastRange && (
          <p className="mt-1 text-sm font-medium text-foreground">
            Beyond the historical range
          </p>
        )}
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed max-w-prose">
          Based on {cohortSize.toLocaleString()} reported {cohortLabel}{' '}
          approvals. This is not a USCIS queue position or a prediction of your
          decision date.
        </p>
      </div>

      <PositionTrack
        daysSinceFiled={daysSinceFiled}
        p25={low}
        median={medianDays}
        p75={high}
      />

      <dl className="grid sm:grid-cols-3 sm:gap-5 border-t border-border pt-3">
        <Stat label="Typical wait" value={`${medianDays} days`} />
        <Stat
          label="Historical approvals taking longer"
          value={cohortPosition.behind.toLocaleString()}
        />
        <Stat
          label="Fastest reported"
          value={fastestDays !== undefined ? `${fastestDays} days` : '—'}
        />
      </dl>

      <p className="text-xs text-muted-foreground leading-relaxed">
        <span className="font-semibold text-foreground">
          {cohortPosition.ahead.toLocaleString()}
        </span>{' '}
        of {cohortSize.toLocaleString()} comparable {cohortLabel} cases were
        already decided by day {daysSinceFiled}.
      </p>
    </div>
  );
}
