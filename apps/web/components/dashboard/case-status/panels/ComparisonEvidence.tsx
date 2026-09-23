import type {
  CommunityEvidence,
  PremiumUpgradeStats,
} from '@/lib/community-opt/evidence';
import { formatDisplayDateNoon } from '@/lib/case-status/safe-dates';

export function ComparisonEvidence({
  evidence,
  premiumUpgrade,
}: {
  evidence?: CommunityEvidence | null;
  premiumUpgrade?: PremiumUpgradeStats | null;
}) {
  if (!evidence) return null;
  return (
    <section
      aria-label="Comparison sources and coverage"
      className="mt-5 space-y-3 border-t border-border pt-4 text-xs text-muted-foreground"
    >
      <h3 className="text-sm font-semibold text-foreground">
        What these comparisons include
      </h3>
      <p>
        {evidence.includedReports.toLocaleString()} recently refreshed reports
        out of {evidence.totalReports.toLocaleString()} stored reports for this
        filing category. Charts use smaller samples with the dates each chart
        needs. Reports are not verified unique applicants.
      </p>
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
            {source.name}: {source.reports.toLocaleString()} stored reports ·
            Last observed import:{' '}
            {source.lastRefreshedAt
              ? formatDisplayDateNoon(source.lastRefreshedAt)
              : 'Unknown'}
          </li>
        ))}
      </ul>
      <p>
        Excluded: {evidence.excludedStale} not refreshed in{' '}
        {evidence.freshnessDays} days; {evidence.excludedUnknownFreshness}{' '}
        without valid refresh evidence; {evidence.duplicateIdsRemoved} repeated
        record IDs. Missing approvals are not treated as pending cases.
      </p>
      {evidence.possibleCrossSourceDuplicates > 0 && (
        <p>
          Possible cross-source overlap:{' '}
          {evidence.possibleCrossSourceDuplicates} matching full timelines.
          Retained because matching dates do not prove two reports belong to the
          same person.
        </p>
      )}
      {premiumUpgrade && (
        <div className="rounded-lg bg-muted/40 p-3">
          <h4 className="font-semibold text-foreground">
            After a reported premium upgrade
          </h4>
          <p className="mt-1">
            {premiumUpgrade.medianDays === null
              ? `Not enough valid reports yet (${premiumUpgrade.sampleSize}; at least 15 needed).`
              : `Median ${premiumUpgrade.medianDays} calendar days from upgrade to approval, across ${premiumUpgrade.sampleSize} completed reports.`}
          </p>
          {premiumUpgrade.p25Days !== null &&
            premiumUpgrade.p75Days !== null && (
              <p>
                Middle half: {premiumUpgrade.p25Days}–{premiumUpgrade.p75Days}{' '}
                calendar days.
              </p>
            )}
          <p className="mt-1">
            Separate from total filing time and the USCIS premium action clock.
            Completed reports can favor faster cases; RFE pauses are not
            captured. This is not an approval deadline.
          </p>
        </div>
      )}
    </section>
  );
}
