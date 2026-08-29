import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { JobRunwaySummary, JobUrgencyLabels } from './JobRunwayPersonalization';

describe('JobRunwayPersonalization', () => {
  const stemRunway = { remaining: 24, used: 126, max: 150 as const, phase: 'stem' as const, stemActive: true };

  it('shows the stored unemployment-day count without claiming that jobs change it', () => {
    render(<JobRunwaySummary runway={stemRunway} />);

    expect(screen.getByText('You have 24 unemployment days remaining.')).toBeInTheDocument();
    expect(screen.getByText(/Viewing or saving a job does not change this clock/)).toBeInTheDocument();
    expect(screen.getByText(/updates only after you record qualifying employment and dates/)).toBeInTheDocument();
    expect(screen.getByText(/For STEM OPT, confirm role eligibility and employer requirements with your DSO and employer/)).toBeInTheDocument();
  });

  it('marks only recent, evidence-backed roles as sponsor-evidenced and flags low runway', () => {
    render(<JobUrgencyLabels recentlyPosted sponsorEvidenced runway={stemRunway} />);

    expect(screen.getByText('Recently posted, sponsor-evidenced role')).toBeInTheDocument();
    expect(screen.getByText('High-priority this week')).toBeInTheDocument();
  });

  it('does not label a role as sponsor-evidenced without both requirements', () => {
    render(<JobUrgencyLabels recentlyPosted sponsorEvidenced={false} runway={null} />);

    expect(screen.queryByText('Recently posted, sponsor-evidenced role')).not.toBeInTheDocument();
    expect(screen.queryByText('High-priority this week')).not.toBeInTheDocument();
  });
});
