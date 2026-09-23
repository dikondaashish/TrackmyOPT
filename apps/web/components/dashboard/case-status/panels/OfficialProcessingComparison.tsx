import {
  OFFICIAL_PROCESSING_SNAPSHOTS,
  usableOfficialSnapshot,
} from '@/lib/case-status/official-processing-times';
import { useClientDate } from '@/hooks/useClientDate';

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
      className="mt-5 border-t border-border pt-4"
    >
      <h3 className="text-sm font-semibold">Official vs. community measures</h3>
      <dl className="mt-3 grid gap-4 sm:grid-cols-2 text-sm">
        <div>
          <dt className="font-medium">USCIS published processing time</dt>
          <dd className="mt-1 text-muted-foreground">
            {official
              ? `${official.months} months for 80% of completed cases. ${official.form}, ${official.category}, ${official.office}. Published ${official.publishedDate}; checked ${official.checkedDate}.`
              : 'A current, verified official figure is not available here. Select I-765 and the F-1 student category on USCIS’s website; verify the applicable office.'}
          </dd>
        </div>
        <div>
          <dt className="font-medium">Community median</dt>
          <dd className="mt-1 text-muted-foreground">
            {medianDays == null
              ? 'Not enough matched reports.'
              : `${medianDays} calendar days from filing to approval among matched completed reports (${premium ? 'premium' : 'regular'}).`}{' '}
            This is the middle reported value, not USCIS’s 80th-percentile
            measure.
          </dd>
        </div>
      </dl>
      <p className="mt-3 text-xs text-muted-foreground">
        Different populations, periods and measures. Do not subtract these
        figures or treat either as your approval date.
      </p>
      <div className="mt-2 flex flex-wrap gap-4 text-sm text-blue-600 dark:text-blue-400">
        <a
          className="inline-flex min-h-11 items-center underline"
          href="https://egov.uscis.gov/processing-times"
          target="_blank"
          rel="noopener noreferrer"
        >
          Check official processing times
        </a>
        <a
          className="inline-flex min-h-11 items-center underline"
          href="https://egov.uscis.gov/processing-times/more-info"
          target="_blank"
          rel="noopener noreferrer"
        >
          USCIS methodology
        </a>
      </div>
    </section>
  );
}
