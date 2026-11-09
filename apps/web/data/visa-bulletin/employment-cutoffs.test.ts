import { describe, expect, it } from 'vitest';
import {
  ALERT_CATEGORIES,
  ALERT_COUNTRIES,
  CATEGORY_LABELS,
  EMPLOYMENT_BULLETINS,
  describeMonths,
  describeMovement,
  formatCutoff,
  isPriorityDateCurrent,
  monthsBetween,
} from './employment-cutoffs';
import { novemberDatesForFiling, novemberFinalAction } from '@/data/blog-series/visa-bulletin-december-2026';
import type { ArticleTable } from '@/data/blog-series/types';

const COLUMN = { row: 'All other countries', china: 'China', india: 'India' } as const;

function articleCell(table: ArticleTable, category: string, column: string) {
  const row = table.rows.find((r) => r[0] === category);
  const index = table.columns.indexOf(column);
  return row?.[index];
}

describe('employment bulletin data', () => {
  it('has strictly increasing months and valid cutoffs', () => {
    const months = EMPLOYMENT_BULLETINS.map((b) => b.month);
    expect([...months].sort()).toEqual(months);
    expect(new Set(months).size).toBe(months.length);
    for (const bulletin of EMPLOYMENT_BULLETINS) {
      for (const chart of [bulletin.finalAction, bulletin.datesForFiling]) {
        for (const category of ALERT_CATEGORIES) {
          for (const country of ALERT_COUNTRIES) {
            const cutoff = chart[category][country];
            expect(cutoff === 'C' || cutoff === 'U' || /^\d{4}-\d{2}-\d{2}$/.test(cutoff)).toBe(true);
          }
        }
      }
    }
  });

  it('matches the official November 2026 tables published in the December article', () => {
    const november = EMPLOYMENT_BULLETINS.find((b) => b.month === '2026-11')!;
    for (const category of ALERT_CATEGORIES) {
      for (const country of ALERT_COUNTRIES) {
        expect(formatCutoff(november.finalAction[category][country]).replace('Current', 'C')).toBe(
          articleCell(novemberFinalAction, CATEGORY_LABELS[category], COLUMN[country])
        );
        expect(formatCutoff(november.datesForFiling[category][country]).replace('Current', 'C')).toBe(
          articleCell(novemberDatesForFiling, CATEGORY_LABELS[category], COLUMN[country])
        );
      }
    }
  });
});

describe('cutoff helpers', () => {
  it('formats and compares dates', () => {
    expect(formatCutoff('2013-11-01')).toBe('Nov 1, 2013');
    expect(formatCutoff('C')).toBe('Current');
    expect(isPriorityDateCurrent('2013-10-31', '2013-11-01')).toBe(true);
    expect(isPriorityDateCurrent('2013-11-01', '2013-11-01')).toBe(false);
    expect(isPriorityDateCurrent('2030-01-01', 'C')).toBe(true);
    expect(isPriorityDateCurrent('2000-01-01', 'U')).toBe(false);
  });

  it('counts months and describes movement', () => {
    expect(monthsBetween('2013-11-01', '2016-03-05')).toBe(28);
    expect(monthsBetween('2016-03-05', '2013-11-01')).toBe(-28);
    expect(describeMonths(28)).toBe('2 years 4 months');
    expect(describeMonths(12)).toBe('1 year');
    expect(describeMonths(0)).toBe('0 months');
    expect(describeMovement('2025-01-01', '2025-04-01')).toBe('moved forward 3 months');
    expect(describeMovement('2014-01-01', '2014-01-22')).toBe('moved forward 21 days');
    expect(describeMovement('2025-04-01', '2024-04-01')).toBe('moved back 1 year');
    expect(describeMovement('C', '2024-04-01')).toBe('retrogressed from current to Apr 1, 2024');
    expect(describeMovement('2013-11-01', '2013-11-01')).toBe('no change');
  });
});
