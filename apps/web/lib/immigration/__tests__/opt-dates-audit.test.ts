import { afterEach, describe, expect, it, vi } from 'vitest';
import { calculateUnemploymentDays, formatDate, getFilingWindow, getUnemploymentStatus, type EmploymentSpan } from '../opt-calculations';
import { buildOptDatesStatusSnapshot, parseOptDateInput } from '../opt-dates-page-utils';
import { computeEmploymentStats, toEmploymentInputDate } from '@/components/dashboard/opt/employment-history-helpers';

const job = (start_date: string, end_date: string | null = null): EmploymentSpan => ({
  id: start_date, employer_name: 'Synthetic employer', start_date, end_date, is_current: !end_date,
});
afterEach(() => vi.useRealTimers());
const today = (iso: string) => { vi.useFakeTimers(); vi.setSystemTime(new Date(`${iso}T12:00:00`)); };

describe('OPT Dates audit: exact calendar days', () => {
  it('matches an independent day-by-day oracle across 250 overlapping/future/gap scenarios', () => {
    let seed = 147;
    const random = (limit: number) => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed % limit; };
    const iso = (offset: number) => new Date(Date.UTC(2024, 0, 1 + offset)).toISOString().slice(0, 10);
    for (let scenario = 0; scenario < 250; scenario++) {
      const cutoff = random(500);
      const spans = Array.from({ length: random(8) }, () => {
        const start = random(530) - 20;
        return job(iso(start), random(4) ? iso(start + random(120)) : null);
      });
      const hasStem = scenario % 2 === 0;
      let initial = 0;
      let stem = 0;
      for (let day = 0; day <= cutoff; day++) {
        if (day > 365 && !hasStem) continue;
        const date = iso(day);
        if (!spans.some(s => s.start_date <= date && (!s.end_date || s.end_date >= date))) {
          if (day <= 365) initial++; else stem++;
        }
      }
      const calc = calculateUnemploymentDays(iso(0), iso(365), spans, hasStem ? iso(366) : null, null, iso(cutoff));
      expect([calc.initialOptUnemploymentDays, calc.stemUnemploymentDays, calc.used], 'scenario ' + scenario).toEqual([initial, stem, initial + stem]);
      const stats = computeEmploymentStats(spans, iso(0), iso(365), hasStem ? iso(366) : undefined, iso(cutoff));
      expect(stats.totalUnemployedDays).toBe(calc.used);
      expect(stats.totalEmployedDays + stats.totalUnemployedDays).toBe(Math.min(cutoff, hasStem ? cutoff : 365) + 1);
    }
  });
  it('keeps 90 reached distinct from 91 exceeded across the STEM boundary', () => {
    const calc = calculateUnemploymentDays('2025-01-01', '2025-12-31', [job('2025-04-01')], '2026-01-01', null, '2026-01-10');
    expect(calc.initialOptUnemploymentDays).toBe(90);
    expect(calc.used).toBe(90);
    expect(calc.exceededInitialOptCap).toBe(false);
    expect(calc.remaining).toBe(60);
  });
  it('counts the first authorized day and includes the last EAD day, but no grace-period days', () => {
    expect(calculateUnemploymentDays('2025-01-01', '2025-01-03', [], null, null, '2025-01-01').used).toBe(1);
    expect(calculateUnemploymentDays('2025-01-01', '2025-01-03', [], null, null, '2025-01-05').used).toBe(3);
  });
  it('counts employment start and end dates as employed, including a one-day job', () => {
    const spans = [job('2025-01-01', '2025-01-02'), job('2025-01-04', '2025-01-05')];
    expect(calculateUnemploymentDays('2025-01-01', '2025-12-31', spans, null, null, '2025-01-05').used).toBe(1);
    expect(calculateUnemploymentDays('2025-01-01', '2025-01-01', [job('2025-01-01', '2025-01-01')], null, null, '2025-01-02').used).toBe(0);
  });
  it('counts a weekend gap and merges overlapping jobs without double-counting', () => {
    today('2025-01-12');
    const spans = [job('2025-01-01', '2025-01-10'), job('2025-01-03', '2025-01-09')];
    const stats = computeEmploymentStats(spans, '01/01/2025', '12/31/2025');
    expect(stats).toEqual({ totalEmployedDays: 10, totalUnemployedDays: 2, longestGap: 2, currentStreak: 2 });
    expect(stats.totalUnemployedDays).toBe(calculateUnemploymentDays('2025-01-01', '2025-12-31', spans).used);
  });
  it('assigns the final initial-OPT day to initial OPT, not STEM', () => {
    const calc = calculateUnemploymentDays('2024-01-01', '2024-12-31', [job('2024-01-01', '2024-12-30')], '2025-01-01', '2026-12-31', '2025-01-01');
    expect(calc.initialOptUnemploymentDays).toBe(1);
    expect(calc.stemUnemploymentDays).toBe(1);
    expect(calc.used).toBe(2);
  });
  it('does not extend initial OPT to a later, invalid STEM start', () => {
    const calc = calculateUnemploymentDays('2025-01-01', '2025-01-03', [], '2025-01-10', '2027-01-09', '2025-01-10');
    expect(calc.initialOptUnemploymentDays).toBe(3);
    expect(calc.stemUnemploymentDays).toBe(1);
    expect(calc.used).toBe(4);
  });
  it('uses a 24-calendar-month inclusive STEM end, not an extra day', () => {
    const calc = calculateUnemploymentDays('2024-07-15', '2025-07-14', [job('2024-07-15', '2027-07-14')], '2025-07-15', null, '2027-07-15');
    expect(calc.phase).toBe('post');
    expect(calc.used).toBe(0);
  });
  it('does not describe exactly 90 or 150 days as exceeded', () => {
    expect(getUnemploymentStatus(90, 90).label).not.toMatch(/exceeded/i);
    expect(getUnemploymentStatus(150, 150).label).not.toMatch(/exceeded/i);
    expect(getUnemploymentStatus(91, 90).label).toMatch(/exceeded/i);
  });
  it('preserves the calendar date when formatting and opening an edit form', () => {
    expect(toEmploymentInputDate('2025-09-01')).toBe('09/01/2025');
    expect(formatDate('2025-09-01')).toBe('Sep 1, 2025');
  });
  it.each(['02/30/2025', '2025-02-29', '13/01/2025', 'not-a-date'])('rejects invalid date %s instead of rolling into another month', value => {
    expect(parseOptDateInput(value)).toBeNull();
  });
  it('does not count future jobs or future OPT days in stats or gaps', () => {
    today('2025-01-01');
    expect(computeEmploymentStats([job('2025-03-01')], '02/01/2025', '01/31/2026')).toEqual({ totalEmployedDays: 0, totalUnemployedDays: 0, longestGap: 0, currentStreak: 0 });
  });
});

describe('OPT Dates audit: summary and filing', () => {
  it('keeps initial OPT at 90 when a saved STEM start is in the future', () => {
    today('2025-06-01');
    const status = buildOptDatesStatusSnapshot({ opt_start_date: '01/01/2025', opt_ead_end_date: '12/31/2025', stem_start_date: '01/01/2026' }, 1, null, [job('2025-01-01')]);
    expect(status.unemploymentMax).toBe(90);
  });
  it('tracks employment through STEM and agrees with the header', () => {
    today('2026-09-22');
    const spans = [job('2025-09-01', '2026-05-10'), job('2026-05-12')];
    const stats = computeEmploymentStats(spans, '07/15/2025', '07/14/2026', '07/15/2026', '2026-09-22');
    const status = buildOptDatesStatusSnapshot({ opt_start_date: '07/15/2025', opt_ead_end_date: '07/14/2026', stem_start_date: '07/15/2026' }, spans.length, null, spans);
    expect(stats.totalUnemployedDays).toBe(49);
    expect(stats.totalEmployedDays).toBe(386);
    expect(stats.currentStreak).toBe(134);
    expect(stats.longestGap).toBe(48);
    expect(status.unemploymentLabel).toBe('49 / 150');
    expect(status.optEndLabel).not.toBe('Expired');
    expect(status.optEndDetail).toMatch(/STEM.*estimate/i);
  });
  it('applies both historical initial-OPT receipt limits, taking the earlier deadline', () => {
    expect(getFilingWindow('2025-05-15', '2025-04-01').hardDeadline).toBe('2025-05-01');
    expect(getFilingWindow('2025-05-15', '2025-07-01').hardDeadline).toBe('2025-07-14');
    today('2025-05-02');
    expect(buildOptDatesStatusSnapshot({ program_end_date: '05/15/2025', dso_recommendation_date: '04/01/2025' }, 0, null).filingLabel).toBe('Closed');
  });
  it('does not say ready to file when the DSO recommendation is missing', () => {
    today('2025-04-15');
    expect(buildOptDatesStatusSnapshot({ program_end_date: '05/15/2025' }, 0, null).filingLabel).toBe('DSO date needed');
  });
  it('requires review for filing windows affected by the September 2026 transition', () => {
    today('2026-09-22');
    const status = buildOptDatesStatusSnapshot({ program_end_date: '10/01/2026', dso_recommendation_date: '09/15/2026' }, 0, null);
    expect(status.filingLabel).toBe('DSO review needed');
  });
});
