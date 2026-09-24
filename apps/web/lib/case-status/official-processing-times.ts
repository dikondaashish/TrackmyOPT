import { calendarDateISO } from '@/lib/immigration/calendar-days';

export type OfficialProcessingSnapshot = {
  form: 'I-765';
  category: 'F-1 academic student (c)(3)';
  office: string;
  months: number;
  percentile: 80;
  /** Null when USCIS does not disclose a publication date; never fabricate it. */
  publishedDate: string | null;
  checkedDate: string;
  source: string;
};
/** Only add a snapshot after verifying all fields on the official page.
 * No unofficial estimates or community medians belong in this list. */
export const OFFICIAL_PROCESSING_SNAPSHOTS: OfficialProcessingSnapshot[] = [
  {
    form: 'I-765',
    category: 'F-1 academic student (c)(3)',
    office: 'Service Center Operations (SCOPS)',
    months: 5,
    percentile: 80,
    publishedDate: null,
    checkedDate: '2026-09-24',
    source: 'https://egov.uscis.gov/processing-times',
  },
];

export function usableOfficialSnapshot(
  snapshot: OfficialProcessingSnapshot | undefined,
  now = new Date()
) {
  if (
    !snapshot ||
    snapshot.form !== 'I-765' ||
    snapshot.category !== 'F-1 academic student (c)(3)' ||
    snapshot.percentile !== 80 ||
    !snapshot.office.trim() ||
    !Number.isFinite(snapshot.months) ||
    snapshot.months <= 0
  )
    return null;
  const checked = calendarDateISO(snapshot.checkedDate);
  const published = snapshot.publishedDate
    ? calendarDateISO(snapshot.publishedDate)
    : null;
  const today = now.toISOString().slice(0, 10);
  if (
    !checked ||
    (snapshot.publishedDate !== null && !published) ||
    (published && published > checked) ||
    checked > today
  )
    return null;
  if (now.getTime() - Date.parse(`${checked}T00:00:00Z`) > 30 * 86400000)
    return null;
  try {
    const url = new URL(snapshot.source);
    if (
      url.protocol !== 'https:' ||
      url.hostname !== 'egov.uscis.gov' ||
      !url.pathname.startsWith('/processing-times')
    )
      return null;
  } catch {
    return null;
  }
  return snapshot;
}
