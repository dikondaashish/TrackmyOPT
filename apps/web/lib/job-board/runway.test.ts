import { describe, expect, it } from 'vitest';
import { getRunwayContext, isHighPriorityThisWeek, isRecentlyPosted } from './runway';

describe('getRunwayContext', () => {
  it('uses stored OPT dates and employment spans for an initial-OPT user', () => {
    const runway = getRunwayContext(
      {
        opt_start_date: '2026-08-01',
        opt_ead_end_date: '2027-07-31',
        stem_start_date: null,
      },
      [],
      new Date('2026-08-29T12:00:00Z'),
    );

    expect(runway).toMatchObject({ used: 28, remaining: 62, max: 90, phase: 'initial', stemActive: false });
  });

  it('uses the STEM cumulative cap from a stored STEM start date', () => {
    const runway = getRunwayContext(
      {
        opt_start_date: '2026-06-01',
        opt_ead_end_date: '2027-05-31',
        stem_start_date: '2026-08-15',
      },
      [{
        id: 'employment-1',
        employer_name: 'Example employer',
        start_date: '2026-06-01',
        end_date: '2026-08-20',
        is_current: false,
      }],
      new Date('2026-08-29T12:00:00Z'),
    );

    expect(runway).toMatchObject({ used: 9, remaining: 141, max: 150, phase: 'stem', stemActive: true });
  });

  it('does not create a clock until the user has stored active OPT dates', () => {
    expect(getRunwayContext(null, [], new Date('2026-08-29T12:00:00Z'))).toBeNull();
    expect(getRunwayContext({
      opt_start_date: '2026-09-01',
      opt_ead_end_date: '2027-08-31',
      stem_start_date: null,
    }, [], new Date('2026-08-29T12:00:00Z'))).toBeNull();
  });
});

describe('job urgency rules', () => {
  const now = new Date('2026-08-29T12:00:00Z');

  it('marks only jobs from the last seven days as recently posted', () => {
    expect(isRecentlyPosted('2026-08-23T12:00:00Z', now)).toBe(true);
    expect(isRecentlyPosted('2026-08-22T11:59:59Z', now)).toBe(false);
  });

  it('derives high priority from the stored runway, never a job-board action', () => {
    expect(isHighPriorityThisWeek({ remaining: 24, used: 66, max: 90, phase: 'initial', stemActive: false })).toBe(true);
    expect(isHighPriorityThisWeek({ remaining: 31, used: 59, max: 90, phase: 'initial', stemActive: false })).toBe(false);
  });
});
