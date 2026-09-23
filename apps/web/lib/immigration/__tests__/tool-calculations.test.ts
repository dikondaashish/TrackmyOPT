import { describe, expect, it } from 'vitest';
import { filingPreview, clockPreview } from '../tool-calculations';
import type { EmploymentSpan } from '../opt-calculations';
const job = (start: string, end: string | null = null): EmploymentSpan => ({
  id: start,
  employer_name: 'Synthetic',
  start_date: start,
  end_date: end,
  is_current: !end,
});

describe('filing previews', () => {
  it('uses the shorter DSO deadline without changing requested start dates', () => {
    expect(
      filingPreview('opt', '05/15/2025', '04/01/2025', '2025-04-10')
    ).toMatchObject({
      hardDeadline: '2025-05-01',
      requestedStartEarliest: '2025-05-16',
      requestedStartLatest: '2025-07-14',
    });
  });
  it('never invents a DSO date', () => {
    expect(filingPreview('opt', '05/15/2025', '', '2025-04-10')).toMatchObject({
      recommendation: null,
      status: 'DSO recommendation needed',
    });
  });
  it('does not say ready with a future recommendation', () => {
    expect(
      filingPreview('stem', '05/31/2025', '05/01/2025', '2025-04-10')?.status
    ).toBe('DSO recommendation needed');
  });
  it('marks the actual last day today, and the next day passed', () => {
    expect(
      filingPreview('stem', '05/31/2025', '05/01/2025', '2025-05-31')?.status
    ).toBe('Deadline is today');
    expect(
      filingPreview('stem', '05/31/2025', '05/01/2025', '2025-06-01')?.status
    ).toBe('Deadline passed');
  });
  it('requires review for the 2026 transition', () => {
    expect(
      filingPreview('opt', '10/01/2026', '09/15/2026', '2026-09-23')
    ).toMatchObject({ transitionReview: true, status: 'DSO review needed' });
  });
  it('detects a recommendation expiring before the window opens', () => {
    expect(
      filingPreview('stem', '12/31/2025', '01/01/2025', '2025-01-02')?.noWindow
    ).toBe(true);
  });
  it.each(['02/30/2025', '03/', 'invalid', ''])(
    'clears results for invalid primary date %s',
    (value) => {
      expect(filingPreview('opt', value, '', '2025-01-01')).toBeNull();
    }
  );
  it('rejects invalid optional dates and accepts leap day', () => {
    expect(filingPreview('opt', '05/01/2025', '02/29/2025')).toBeNull();
    expect(filingPreview('opt', '02/29/2024', '', '2024-01-01')?.end).toBe(
      '2024-02-29'
    );
  });
});

describe('clock previews use the shared inclusive calendar rules', () => {
  it('counts the first authorized day, not a zero-day difference', () => {
    expect(
      clockPreview('opt', '01/01/2025', '12/31/2025', '', [], '2025-01-01')
        ?.used
    ).toBe(1);
  });
  it('merges overlap and counts employment end dates as employed', () => {
    expect(
      clockPreview(
        'opt',
        '01/01/2025',
        '12/31/2025',
        '',
        [job('2025-01-01', '2025-01-05'), job('2025-01-03', '2025-01-08')],
        '2025-01-10'
      )?.used
    ).toBe(2);
  });
  it('counts calendar days across DST and clips to EAD expiry', () => {
    expect(
      clockPreview('opt', '03/08/2025', '03/10/2025', '', [], '2025-03-20')
        ?.used
    ).toBe(3);
  });
  it('does not count future authorization or employment', () => {
    expect(
      clockPreview(
        'opt',
        '01/01/2027',
        '12/31/2027',
        '',
        [job('2027-02-01')],
        '2026-12-31'
      )?.used
    ).toBe(0);
  });
  it('includes unused initial allowance in STEM and preserves earlier excess', () => {
    const result = clockPreview(
      'stem',
      '01/01/2025',
      '12/31/2025',
      '01/01/2026',
      [job('2025-01-21', '2025-12-31')],
      '2026-01-10'
    );
    expect(result).toMatchObject({
      used: 30,
      remaining: 120,
      max: 150,
      initialOptUnemploymentDays: 20,
      stemUnemploymentDays: 10,
    });
    expect(
      clockPreview(
        'stem',
        '01/01/2025',
        '12/31/2025',
        '01/01/2026',
        [job('2025-04-02')],
        '2026-01-10'
      )?.exceededInitialOptCap
    ).toBe(true);
  });
  it('keeps the cap at 90 before STEM begins', () => {
    expect(
      clockPreview(
        'stem',
        '01/01/2025',
        '12/31/2025',
        '01/01/2026',
        [],
        '2025-02-01'
      )?.max
    ).toBe(90);
  });
  it('rejects reversed, missing and incompatible authorization dates', () => {
    expect(clockPreview('opt', '01/02/2025', '01/01/2025', '', [])).toBeNull();
    expect(clockPreview('stem', '', '', '01/01/2026', [])).toBeNull();
    expect(
      clockPreview('stem', '01/01/2025', '12/31/2025', '01/03/2026', [])
    ).toBeNull();
    expect(
      clockPreview('opt', '01/01/2025', '12/31/2025', '', [job('bad')])
    ).toBeNull();
  });
});
