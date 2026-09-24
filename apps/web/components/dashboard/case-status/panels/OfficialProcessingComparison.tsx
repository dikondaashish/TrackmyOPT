import {
  OFFICIAL_PROCESSING_SNAPSHOTS,
  usableOfficialSnapshot,
} from '@/lib/case-status/official-processing-times';
import { useClientDate } from '@/hooks/useClientDate';
import { ExternalLink, Landmark, UsersRound } from 'lucide-react';

export function OfficialProcessingComparison({
  medianDays,
  premium,
}: {
  medianDays?: number | null;
  premium?: boolean;
}) {
  const now = useClientDate();
  const official = now
    ? usableOfficialSnapshot(OFFICIAL_PROCESSING_SNAPSHOTS.at(-1), now)
    : null;
  return (
    <section
      aria-label="Official and community measures"
      className="mt-5 rounded-xl border border-border bg-card p-4 sm:p-5"
    >
      <h3 className="text-sm font-semibold text-foreground">
        Two ways to read processing time
      </h3>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-[var(--chart-seq-1)] p-4">
          <dt className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <Landmark
              className="h-4 w-4 text-blue-600 dark:text-blue-400"
              aria-hidden="true"
            />
            USCIS published measure
          </dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight tabular-nums text-foreground">
            {official ? `${official.months} months` : 'Not current'}
          </dd>
          <p className="mt-1 text-xs text-muted-foreground">
            {official
              ? '80% of completed cases · F-1 student I-765'
              : 'Check USCIS for the applicable category and office'}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-muted/30 p-4">
          <dt className="flex items-center gap-2 text-xs font-semibold text-foreground">
            <UsersRound
              className="h-4 w-4 text-blue-600 dark:text-blue-400"
              aria-hidden="true"
            />
            Matched community reports
          </dt>
          <dd className="mt-2 text-3xl font-semibold tracking-tight tabular-nums text-foreground">
            {medianDays == null ? 'Not enough data' : `${medianDays} days`}
          </dd>
          <p className="mt-1 text-xs text-muted-foreground">
            Median filing-to-approval · {premium ? 'premium' : 'regular'} cases
          </p>
        </div>
      </dl>
      <p className="mt-3 rounded-lg bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
        Different measures and case groups — neither is your approval date.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        <a
          className="inline-flex min-h-11 items-center gap-1.5 text-xs font-medium text-blue-600 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:text-blue-400"
          href="https://egov.uscis.gov/processing-times"
          target="_blank"
          rel="noopener noreferrer"
        >
          Check USCIS times{' '}
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
        <details className="text-xs text-muted-foreground">
          <summary className="w-fit cursor-pointer rounded text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            How these numbers differ
          </summary>
          <div className="mt-2 max-w-xl space-y-2 leading-relaxed">
            <p>
              {official
                ? `${official.form}, ${official.category}, ${official.office}. ${official.publishedDate ? `Published ${official.publishedDate}.` : 'USCIS does not show a publication date.'} Verified ${official.checkedDate}; hidden after 30 days unless reverified.`
                : 'A current verified official figure is unavailable here. Check the I-765 F-1 category and applicable office on USCIS.'}
            </p>
            <p>
              The community figure is the middle filing-to-approval wait among
              matched completed reports, not USCIS’s 80th-percentile measure.
              Neither is a premium-processing deadline.
            </p>
            <a
              className="inline-flex min-h-11 items-center text-blue-600 underline dark:text-blue-400"
              href="https://egov.uscis.gov/processing-times/more-info"
              target="_blank"
              rel="noopener noreferrer"
            >
              USCIS methodology
            </a>
          </div>
        </details>
      </div>
    </section>
  );
}
