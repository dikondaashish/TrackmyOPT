import { describe, expect, it } from 'vitest';
import {
  calculateEmploymentDuration,
  computeEmploymentStats,
  toEmploymentInputDate,
} from './employment-history-helpers';

describe('employment-history-helpers', () => {
  it('formats duration bands', () => {
    expect(calculateEmploymentDuration('2025-01-01', '2025-01-10')).toBe(
      '9 days'
    );
    expect(calculateEmploymentDuration('2025-01-01', '2025-03-01')).toMatch(
      /month/
    );
  });

  it('converts dates to MM/DD/YYYY inputs', () => {
    // Local noon avoids UTC-midnight shifting the calendar day.
    expect(toEmploymentInputDate('2025-08-01T12:00:00')).toBe('08/01/2025');
    expect(toEmploymentInputDate('08/01/2025')).toBe('08/01/2025');
    expect(toEmploymentInputDate(null)).toBe('');
  });

  it('counts unemployed days when no spans exist', () => {
    const stats = computeEmploymentStats([], '01/01/2025', '12/31/2025');
    expect(stats.totalEmployedDays).toBe(0);
    expect(stats.totalUnemployedDays).toBeGreaterThan(0);
    expect(stats.longestGap).toBeGreaterThan(0);
  });

  it('counts employed days for a current span covering OPT start', () => {
    const stats = computeEmploymentStats(
      [
        {
          id: '1',
          employer_name: 'Acme',
          start_date: '2025-01-01',
          end_date: null,
          is_current: true,
        },
      ],
      '01/01/2025',
      '12/31/2025'
    );
    expect(stats.totalEmployedDays).toBeGreaterThan(0);
    expect(stats.totalUnemployedDays).toBe(0);
    expect(stats.currentStreak).toBeGreaterThan(0);
  });
});
