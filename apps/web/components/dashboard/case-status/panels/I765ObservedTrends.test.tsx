import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { I765ObservedTrends } from './I765ObservedTrends';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('shows concise I-765 scope and reported counts without presenting individual odds', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        trends: {
          medianDays: 165,
          p25Days: 75,
          p75Days: 315,
          decidedCases: 289428,
          distribution: [
            { label: 'Under 60d', count: 40000 },
            { label: '60–119d', count: 70000 },
            { label: '120–179d', count: 80000 },
            { label: '180–359d', count: 90000 },
            { label: '360d+', count: 9428 },
          ],
        },
      }),
    })
  );
  render(<I765ObservedTrends />);
  expect((await screen.findByText('165')).closest('dd')).toHaveTextContent(
    '165days'
  );
  expect(screen.getByText('289,428', { selector: 'dd' })).toBeVisible();
  expect(
    screen.getByText('All I-765 categories · 6 months')
  ).toBeVisible();
  expect(screen.getByText('40,000')).toBeVisible();
  expect(screen.getByText('13.8%')).toBeVisible();
  expect(screen.getByText('About this dataset')).toBeVisible();
  expect(screen.queryByText(/mycaseshub/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/approval chance/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/\bsample\b/i)).not.toBeInTheDocument();
});

it('does not disturb case status when the supplemental feed is down', async () => {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('upstream down')));
  render(<I765ObservedTrends />);
  expect(await screen.findByText(/temporarily unavailable/i)).toBeVisible();
});
