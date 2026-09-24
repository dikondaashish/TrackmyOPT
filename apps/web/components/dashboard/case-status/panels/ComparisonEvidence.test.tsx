import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { ComparisonEvidence } from './ComparisonEvidence';

it('shows chart coverage at a glance and keeps data-quality details available', () => {
  render(
    <ComparisonEvidence
      evidence={{
        totalReports: 100,
        includedReports: 80,
        excludedStale: 10,
        excludedUnknownFreshness: 5,
        duplicateIdsRemoved: 5,
        possibleCrossSourceDuplicates: 2,
        sources: [
          { name: 'OPT Tracker', reports: 60, lastRefreshedAt: '2026-09-23' },
          { name: 'OPT Pulse', reports: 40, lastRefreshedAt: '2026-09-22' },
        ],
        filingRange: ['2026-01-01', '2026-06-01'],
        freshnessDays: 30,
      }}
      premiumUpgrade={{
        sampleSize: 18,
        medianDays: 22,
        p25Days: 15,
        p75Days: 31,
      }}
    />
  );

  expect(screen.getByText('Included reports').closest('div')).toHaveTextContent(
    '80'
  );
  expect(screen.getByText('Stored reports').closest('div')).toHaveTextContent(
    '100'
  );
  expect(screen.getByText('22 days')).toBeVisible();
  expect(screen.getByText(/not verified unique applicants/i)).toBeVisible();
  fireEvent.click(screen.getByText('Sources and calculation details'));
  expect(screen.getByText(/RFE pauses are not captured/i)).toBeVisible();
});
