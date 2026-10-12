import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
  filterApplications,
  getFollowupBadgeInfo,
  getRelativeDate,
} from './filtering';
import type { JobApplication } from './types';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-01T12:00:00Z'));
});
afterEach(() => vi.useRealTimers());

const application: JobApplication = {
  id: 'synthetic-application',
  user_id: 'synthetic-account',
  company_name: 'Synthetic Labs',
  role_title: 'Engineer',
  status: 'Applied',
  created_at: '2026-09-30T12:00:00Z',
  updated_at: '2026-09-30T12:00:00Z',
  next_follow_up_at: '2026-10-01',
};

it('keeps a date-only follow-up on the selected local calendar day', () => {
  expect(getRelativeDate('2026-10-01')).toBe('Today');
  expect(getFollowupBadgeInfo('2026-10-01')).toEqual({
    text: 'Today',
    variant: 'today',
  });
  expect(
    filterApplications([application], { followupFilter: 'today' })
  ).toEqual([application]);
  expect(
    filterApplications([application], { followupFilter: 'overdue' })
  ).toEqual([]);
});

it('shows past and upcoming follow-ups consistently with the filters', () => {
  expect(getRelativeDate('2026-09-30')).toBe('Yesterday');
  expect(getFollowupBadgeInfo('2026-09-30').variant).toBe('overdue');
  expect(getRelativeDate('2026-10-02')).toBe('Tomorrow');
  expect(getFollowupBadgeInfo('2026-10-02').variant).toBe('soon');
  const overdue = { ...application, next_follow_up_at: '2026-09-30' };
  const upcoming = {
    ...application,
    id: 'synthetic-upcoming',
    next_follow_up_at: '2026-10-02',
  };
  expect(
    filterApplications([overdue, upcoming], { followupFilter: 'overdue' })
  ).toEqual([overdue]);
  expect(
    filterApplications([overdue, upcoming], { followupFilter: 'week' })
  ).toEqual([upcoming]);
});
