/** Dates on immigration documents are calendar dates, not UTC instants. */
export function calendarDateISO(value: string): string | null {
  const text = value.trim();
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/);
  const us = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!iso && !us) return null;
  const year = Number(iso ? iso[1] : us![3]);
  const month = Number(iso ? iso[2] : us![1]);
  const day = Number(iso ? iso[3] : us![2]);
  const result = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const date = new Date(`${result}T00:00:00Z`);
  return year >= 1 && Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === result ? result : null;
}

export function localTodayISO(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/** Calendar anniversary minus one day; estimate only, the EAD is authoritative. */
export function estimatedStemEndISO(start: string): string {
  const iso = calendarDateISO(start);
  if (!iso) throw new Error('Invalid STEM start date');
  const date = new Date(`${iso}T00:00:00Z`);
  const anniversary = new Date(Date.UTC(date.getUTCFullYear() + 2, date.getUTCMonth(), date.getUTCDate()));
  anniversary.setUTCDate(anniversary.getUTCDate() - 1);
  return anniversary.toISOString().slice(0, 10);
}

export interface CalendarEmploymentSpan { start_date: string; end_date: string | null }

/** Inclusive authorized/employed days, including today. Merge overlapping jobs. */
export function employmentWindowStats(startISO: string, endISO: string, spans: CalendarEmploymentSpan[], todayISO: string) {
  const day = (value: string) => new Date(`${calendarDateISO(value)}T00:00:00Z`).getTime() / 86400000;
  const start = day(startISO);
  const end = Math.min(day(endISO), day(todayISO));
  const empty = { totalEmployedDays: 0, totalUnemployedDays: 0, longestGap: 0, currentStreak: 0 };
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return empty;
  const intervals = spans.map(span => [Math.max(start, day(span.start_date)), Math.min(end, day(span.end_date || todayISO))])
    .filter(([s, e]) => Number.isFinite(s) && Number.isFinite(e) && s <= e)
    .sort(([a], [b]) => a - b);
  const merged: number[][] = [];
  for (const [s, e] of intervals) {
    const last = merged.at(-1);
    if (last && s <= last[1] + 1) last[1] = Math.max(last[1], e);
    else merged.push([s, e]);
  }
  let cursor = start;
  let totalEmployedDays = 0;
  let longestGap = 0;
  for (const [s, e] of merged) {
    longestGap = Math.max(longestGap, s - cursor);
    totalEmployedDays += e - s + 1;
    cursor = e + 1;
  }
  longestGap = Math.max(longestGap, end - cursor + 1);
  const last = merged.at(-1);
  const currentStreak = end < day(todayISO) ? 0 : last?.[1] === end ? end - last[0] + 1 : end - cursor + 1;
  return { totalEmployedDays, totalUnemployedDays: end - start + 1 - totalEmployedDays, longestGap, currentStreak };
}
