/** US federal holidays (observed) for business-day math. Years 2024–2028. */
const FEDERAL_HOLIDAYS = new Set([
  "2024-01-01",
  "2024-01-15",
  "2024-02-19",
  "2024-05-27",
  "2024-06-19",
  "2024-07-04",
  "2024-09-02",
  "2024-10-14",
  "2024-11-11",
  "2024-11-28",
  "2024-12-25",
  "2025-01-01",
  "2025-01-20",
  "2025-02-17",
  "2025-05-26",
  "2025-06-19",
  "2025-07-04",
  "2025-09-01",
  "2025-10-13",
  "2025-11-11",
  "2025-11-27",
  "2025-12-25",
  "2026-01-01",
  "2026-01-19",
  "2026-02-16",
  "2026-05-25",
  "2026-06-19",
  "2026-07-03",
  "2026-09-07",
  "2026-10-12",
  "2026-11-11",
  "2026-11-26",
  "2026-12-25",
  "2027-01-01",
  "2027-01-18",
  "2027-02-15",
  "2027-05-31",
  "2027-06-18",
  "2027-07-05",
  "2027-09-06",
  "2027-10-11",
  "2027-11-11",
  "2027-11-25",
  "2027-12-24",
  "2028-01-01",
  "2028-01-17",
  "2028-02-21",
  "2028-05-29",
  "2028-06-19",
  "2028-07-04",
  "2028-09-04",
  "2028-10-09",
  "2028-11-10",
  "2028-11-23",
  "2028-12-25",
]);

function toIsoDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseIsoDate(iso: string): Date {
  return new Date(`${iso}T12:00:00.000Z`);
}

export function isWeekend(d: Date): boolean {
  const day = d.getUTCDay();
  return day === 0 || day === 6;
}

export function isBusinessDay(d: Date): boolean {
  return !isWeekend(d) && !FEDERAL_HOLIDAYS.has(toIsoDate(d));
}

/** Add `days` business days after `start` (start day is not counted). */
export function addBusinessDays(start: Date, days: number): Date {
  const result = new Date(start.getTime());
  let added = 0;
  while (added < days) {
    result.setUTCDate(result.getUTCDate() + 1);
    if (isBusinessDay(result)) added += 1;
  }
  return result;
}

/** Business days from `from` (exclusive) to `to` (inclusive) when to >= from. */
export function businessDaysBetween(from: Date, to: Date): number {
  if (to < from) return 0;
  let count = 0;
  const cursor = new Date(from.getTime());
  while (cursor < to) {
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    if (isBusinessDay(cursor)) count += 1;
  }
  return count;
}

export function formatIsoDate(d: Date): string {
  return toIsoDate(d);
}

export function parseBusinessDate(iso: string): Date {
  return parseIsoDate(iso);
}
