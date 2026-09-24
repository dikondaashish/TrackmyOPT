import { expect, it } from 'vitest';
import { calculatorDatePatch } from '../opt-date-patch';
import {
  areOptDatesEqual,
  buildOptDatesStatusSnapshot,
} from '../opt-dates-page-utils';
import { computeEmploymentStats } from '@/components/dashboard/opt/employment-history-helpers';

it('persists and clears the actual STEM EAD end without replacing unrelated dates', () => {
  expect(calculatorDatePatch({ stem_ead_end_date: '05/31/2028' })).toEqual({
    stem_ead_end_date: '2028-05-31',
    last_updated_field: 'stem_ead_end_date',
  });
  expect(
    calculatorDatePatch({ stem_ead_end_date: '' }).stem_ead_end_date
  ).toBeNull();
  expect(() =>
    calculatorDatePatch({ stem_ead_end_date: '02/30/2028' })
  ).toThrow();
  expect(areOptDatesEqual({ stem_ead_end_date: '05/31/2028' }, {})).toBe(false);
});

it('uses the saved EAD end consistently for expiry, unemployment and employment totals', () => {
  const dates = {
    opt_start_date: '01/01/2025',
    opt_ead_end_date: '12/31/2025',
    stem_start_date: '01/01/2026',
    stem_ead_end_date: '01/10/2026',
  };
  const spans = [
    {
      id: 'synthetic',
      employer_name: 'Synthetic',
      start_date: '2025-01-01',
      end_date: '2026-01-05',
      is_current: false,
    },
  ];
  const status = buildOptDatesStatusSnapshot(
    dates,
    1,
    null,
    spans,
    '2026-01-20'
  );
  const stats = computeEmploymentStats(
    spans,
    dates.opt_start_date,
    dates.opt_ead_end_date,
    dates.stem_start_date,
    '2026-01-20',
    dates.stem_ead_end_date
  );
  expect(status.optEndHeading).toBe('STEM EAD expires in');
  expect(status.optEndLabel).toBe('Expired');
  expect(status.unemploymentLabel).toBe('5 / 150');
  expect(stats.totalUnemployedDays).toBe(5);
  expect(stats.totalEmployedDays).toBe(370);
});
