import type {
  CommunityEvidence,
  PremiumUpgradeStats,
} from '@/lib/community-opt/evidence';
import { formatDisplayDateNoon } from '@/lib/case-status/safe-dates';
import { Database, ShieldCheck } from 'lucide-react';

export function ComparisonEvidence({
  evidence,
  premiumUpgrade,
}: {
  evidence?: CommunityEvidence | null;
  premiumUpgrade?: PremiumUpgradeStats | null;
}) {
  if (!evidence) return null;
  const includedShare = evidence.totalReports
    ? Math.min(100, (evidence.includedReports / evidence.totalReports) * 100)
    : 0;

  return (
    <section
      aria-label="Comparison sources and coverage"
      className="mt-5 rounded-xl border border-border bg-card p-4 text-xs text-muted-foreground sm:p-5"
    >
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Database
          className="h-4 w-4 text-blue-600 dark:text-blue-400"
          aria-hidden="true"
        />
        What these charts include
      </h3>
      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-[var(--chart-seq-1)] p-3">
          <dt>Included reports</dt>
          <dd className="mt-1 text-xl font-semibold tabular-nums text-foreground">
            {evidence.includedReports.toLocaleString()}
          </dd>
        </div>
        <div className="rounded-lg bg-muted/40 p-3">
          <dt>Stored reports</dt>
          <dd className="mt-1 text-xl font-semibold tabular-nums text-foreground">
            {evidence.totalReports.toLocaleString()}
          </dd>
        </div>
        <div className="col-span-2 rounded-lg bg-muted/40 p-3 sm:col-span-1">
          <dt>Sources</dt>
          <dd className="mt-1 text-xl font-semibold tabular-nums text-foreground">
            {evidence.sources.length}
          </dd>
        </div>
      </dl>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-muted"
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full bg-blue-600 dark:bg-blue-400"
          style={{ width: `${includedShare}%` }}
        />
      </div>
      <p className="mt-2 flex items-start gap-1.5 leading-relaxed">
        <ShieldCheck
          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400"
          aria-hidden="true"
        />
        These are reports, not verified unique applicants. Each chart may use a
        smaller matched sample.
      </p>
      {premiumUpgrade && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
          <div>
            <h4 className="font-semibold text-foreground">
              After a reported premium upgrade
            </h4>
            <p className="mt-0.5">
              {premiumUpgrade.sampleSize} completed reports · separate from
              filing time
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-lg font-semibold tabular-nums text-foreground">
              {premiumUpgrade.medianDays === null
                ? 'Not enough data'
                : `${premiumUpgrade.medianDays} days`}
            </p>
            <p>
              {premiumUpgrade.medianDays === null
                ? 'At least 15 valid reports needed'
                : premiumUpgrade.p25Days !== null &&
                    premiumUpgrade.p75Days !== null
                  ? `Middle half ${premiumUpgrade.p25Days}–${premiumUpgrade.p75Days} days`
                  : 'Median from reported upgrades'}
            </p>
          </div>
        </div>
      )}
      <details className="mt-4 border-t border-border pt-3">
        <summary className="w-fit cursor-pointer rounded font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          Sources and calculation details
        </summary>
        <div className="mt-3 space-y-2 leading-relaxed">
          {evidence.filingRange && (
            <p>
              Included filing dates:{' '}
              {formatDisplayDateNoon(evidence.filingRange[0])} to{' '}
              {formatDisplayDateNoon(evidence.filingRange[1])}.
            </p>
          )}
          <ul className="space-y-1">
            {evidence.sources.map((source) => (
              <li key={source.name}>
                {source.name}: {source.reports.toLocaleString()} stored reports
                · Last observed import:{' '}
                {source.lastRefreshedAt
                  ? formatDisplayDateNoon(source.lastRefreshedAt)
                  : 'Unknown'}
              </li>
            ))}
          </ul>
          <p>
            Excluded: {evidence.excludedStale} not refreshed in{' '}
            {evidence.freshnessDays} days; {evidence.excludedUnknownFreshness}{' '}
            without valid refresh evidence; {evidence.duplicateIdsRemoved}{' '}
            repeated record IDs. Missing approvals are not treated as pending
            cases.
          </p>
          {evidence.possibleCrossSourceDuplicates > 0 && (
            <p>
              Possible cross-source overlap:{' '}
              {evidence.possibleCrossSourceDuplicates} matching full timelines.
              Retained because matching dates do not prove two reports belong to
              the same person.
            </p>
          )}
          {premiumUpgrade && (
            <p>
              Upgrade-to-approval time is not the USCIS premium action clock or
              a deadline. Completed reports can favor faster cases; RFE pauses
              are not captured.
            </p>
          )}
        </div>
      </details>
    </section>
  );
}
