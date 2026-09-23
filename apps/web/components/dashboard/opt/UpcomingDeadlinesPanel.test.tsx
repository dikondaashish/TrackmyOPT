import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { UpcomingDeadlinesPanel } from './UpcomingDeadlinesPanel';

const dates = { program_end_date: '2025-05-01', opt_start_date: '2025-06-01', opt_ead_end_date: '2026-12-31', stem_dso_recommendation_date: '2026-09-01' };
afterEach(() => { cleanup(); vi.useRealTimers(); });
it('shows the actual STEM deadline and not only the window opening', () => {
  vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-01T12:00:00Z'));
  render(<UpcomingDeadlinesPanel optStatus={dates} isStemEligible />);
  expect(screen.getByText('STEM OPT Filing Deadline')).toBeInTheDocument();
  expect(screen.getByText('Oct 31, 2026')).toBeInTheDocument();
});
it('keeps an expired recommendation visible as requiring DSO review', () => {
  vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-01T12:00:00Z'));
  render(<UpcomingDeadlinesPanel optStatus={dates} isStemEligible />);
  expect(screen.getByText('STEM Recommendation Deadline Passed')).toBeInTheDocument();
  expect(screen.getByText('Review with DSO')).toBeInTheDocument();
});
it('does not show a filing reminder after STEM has started', () => {
  vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-01T12:00:00Z'));
  render(<UpcomingDeadlinesPanel optStatus={{ ...dates, stem_start_date: '2026-09-01' }} isStemEligible />);
  expect(screen.queryByText('STEM OPT Filing Deadline')).not.toBeInTheDocument();
});
