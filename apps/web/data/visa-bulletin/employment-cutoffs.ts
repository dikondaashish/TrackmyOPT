/**
 * Employment-based Visa Bulletin cutoff dates, one entry per monthly bulletin.
 *
 * The priority-date alert cron (/api/cron/visa-bulletin-alerts) emails every
 * confirmed subscriber once when a new month is appended here, so adding a
 * month is the publishing step: copy the official State Department tables,
 * set which chart USCIS accepts for employment-based I-485 filings that
 * month, and deploy. Values must be the official ones; never estimates.
 */

export const ALERT_CATEGORIES = ['eb1', 'eb2', 'eb3', 'eb3_other', 'eb5'] as const;
export const ALERT_COUNTRIES = ['india', 'china', 'row'] as const;

export type AlertCategory = (typeof ALERT_CATEGORIES)[number];
export type AlertCountry = (typeof ALERT_COUNTRIES)[number];

/** 'C' = current, 'U' = unavailable, otherwise an ISO date (YYYY-MM-DD). */
export type Cutoff = string;
type Chart = Record<AlertCategory, Record<AlertCountry, Cutoff>>;

export interface EmploymentBulletin {
  /** Bulletin month, YYYY-MM. */
  month: string;
  label: string;
  officialUrl: string;
  /** Our write-up for this bulletin, if any. */
  blogPath?: string;
  /** The chart USCIS accepts for employment-based adjustment filings this month. */
  uscisChart: 'final_action' | 'dates_for_filing';
  finalAction: Chart;
  datesForFiling: Chart;
}

export const CATEGORY_LABELS: Record<AlertCategory, string> = {
  eb1: 'EB-1',
  eb2: 'EB-2',
  eb3: 'EB-3',
  eb3_other: 'EB-3 Other Workers',
  eb5: 'EB-5 Unreserved',
};

export const COUNTRY_LABELS: Record<AlertCountry, string> = {
  india: 'India',
  china: 'China (mainland born)',
  row: 'All other countries',
};

/** Short country name for subject lines. */
export const COUNTRY_SHORT: Record<AlertCountry, string> = {
  india: 'India',
  china: 'China',
  row: 'all other countries',
};

export const EMPLOYMENT_BULLETINS: EmploymentBulletin[] = [
  {
    month: '2026-11',
    label: 'November 2026',
    officialUrl:
      'https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2027/visa-bulletin-for-november-2026.html',
    blogPath: '/blog/november-2026-visa-bulletin-predictions-opt-workers',
    uscisChart: 'dates_for_filing',
    finalAction: {
      eb1: { row: 'C', china: '2023-08-01', india: '2023-02-01' },
      eb2: { row: '2025-04-01', china: '2021-10-01', india: '2013-11-01' },
      eb3: { row: '2024-06-15', china: '2022-01-22', india: '2014-01-22' },
      eb3_other: { row: '2022-06-01', china: '2019-10-01', india: '2014-01-22' },
      eb5: { row: 'C', china: '2016-12-01', india: '2023-12-01' },
    },
    datesForFiling: {
      eb1: { row: 'C', china: '2024-07-01', india: '2024-07-01' },
      eb2: { row: '2026-03-15', china: '2023-01-01', india: '2015-01-15' },
      eb3: { row: '2024-08-01', china: '2024-04-01', india: '2015-01-15' },
      eb3_other: { row: '2022-07-01', china: '2020-10-01', india: '2015-01-15' },
      eb5: { row: 'C', china: '2021-03-01', india: '2024-05-01' },
    },
  },
];

export function latestBulletin(): EmploymentBulletin {
  return EMPLOYMENT_BULLETINS[EMPLOYMENT_BULLETINS.length - 1]!;
}

export function previousBulletin(month: string): EmploymentBulletin | undefined {
  const index = EMPLOYMENT_BULLETINS.findIndex((b) => b.month === month);
  return index > 0 ? EMPLOYMENT_BULLETINS[index - 1] : undefined;
}

export function isAlertCategory(value: unknown): value is AlertCategory {
  return typeof value === 'string' && (ALERT_CATEGORIES as readonly string[]).includes(value);
}

export function isAlertCountry(value: unknown): value is AlertCountry {
  return typeof value === 'string' && (ALERT_COUNTRIES as readonly string[]).includes(value);
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2013-11-01" -> "Nov 1, 2013"; "C" -> "Current"; "U" -> "Unavailable". */
export function formatCutoff(cutoff: Cutoff): string {
  if (cutoff === 'C') return 'Current';
  if (cutoff === 'U') return 'Unavailable';
  const [y, m, d] = cutoff.split('-').map(Number);
  return `${MONTHS[m! - 1]} ${d}, ${y}`;
}

/** A priority date is current when the cutoff is "C" or the date is earlier than the cutoff. */
export function isPriorityDateCurrent(priorityDate: string, cutoff: Cutoff): boolean {
  if (cutoff === 'C') return true;
  if (cutoff === 'U') return false;
  return priorityDate < cutoff;
}

/** Whole months from `from` to `to` (ISO dates), rounded down; negative when `to` is earlier. */
export function monthsBetween(from: string, to: string): number {
  const [fy, fm, fd] = from.split('-').map(Number);
  const [ty, tm, td] = to.split('-').map(Number);
  let months = (ty! - fy!) * 12 + (tm! - fm!);
  if (months > 0 && td! < fd!) months -= 1;
  if (months < 0 && td! > fd!) months += 1;
  return months;
}

export function describeMonths(months: number): string {
  const abs = Math.abs(months);
  const years = Math.floor(abs / 12);
  const rest = abs % 12;
  const parts = [];
  if (years) parts.push(`${years} year${years === 1 ? '' : 's'}`);
  if (rest || !years) parts.push(`${rest} month${rest === 1 ? '' : 's'}`);
  return parts.join(' ');
}

/** Movement of one cutoff between two bulletins, in plain words. */
export function describeMovement(previous: Cutoff, current: Cutoff): string {
  if (previous === current) return 'no change';
  if (current === 'C') return 'became current';
  if (current === 'U') return 'became unavailable';
  if (previous === 'C') return `retrogressed from current to ${formatCutoff(current)}`;
  if (previous === 'U') return `reopened at ${formatCutoff(current)}`;
  const diffDays = Math.round((Date.parse(current) - Date.parse(previous)) / 86_400_000);
  const months = monthsBetween(previous, current);
  const size = Math.abs(months) >= 1 ? describeMonths(months) : `${Math.abs(diffDays)} days`;
  return diffDays > 0 ? `moved forward ${size}` : `moved back ${size}`;
}
