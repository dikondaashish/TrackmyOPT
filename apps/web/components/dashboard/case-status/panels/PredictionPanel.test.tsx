import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { PredictionPanel } from './PredictionPanel';
import type { CommunityEstimate } from '@/lib/community-opt/types';
afterEach(cleanup);
it('describes historical approvals without promising an imminent decision or a live queue', () => {
  const prediction: CommunityEstimate = {
    cohortSize: 20,
    medianDays: 60,
    p25Days: 45,
    p75Days: 75,
    fastestDays: 10,
    estimatedDecisionRange: ['2026-09-23', '2026-09-23'],
    distribution: [],
    cohortPosition: { ahead: 18, behind: 2, percentile: 90 },
    approvalsLast24h: 0,
    matchLevel: 'pp',
    caseKind: 'initial_opt',
    serviceCenter: null,
    premiumProcessing: false,
    sourceNote: 'Community reports',
  };
  render(<PredictionPanel prediction={prediction} daysSinceFiled={100} />);
  expect(screen.getByText('Typical completed report').tagName).toBe('DT');
  expect(screen.getByText('60').closest('dd')).toHaveTextContent('60days');
  expect(screen.queryByText('Any time now')).not.toBeInTheDocument();
  expect(screen.queryByText('Still waiting')).not.toBeInTheDocument();
  expect(
    screen.getByText(/Historical approvals taking longer than day 100/)
  ).toBeInTheDocument();
  expect(screen.getByText('Not a decision-date forecast.')).toBeVisible();
  expect(screen.getByText('About these reports')).toBeVisible();
  expect(screen.getByText('Beyond the historical range')).toBeInTheDocument();
});
