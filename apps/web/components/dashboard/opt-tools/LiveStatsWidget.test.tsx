import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useClientDate } from '@/hooks/useClientDate';
import { OFFICIAL_PROCESSING_SNAPSHOTS } from '@/lib/case-status/official-processing-times';
import { LiveStatsWidget } from './LiveStatsWidget';

vi.mock('@/hooks/useClientDate', () => ({ useClientDate: vi.fn() }));
const snapshot = OFFICIAL_PROCESSING_SNAPSHOTS.at(-1)!;
const fetchMock = vi.fn();
function reports(sampleSize: number, dataSource = 'trackmyopt') {
  const stats = {
    mainStat: { value: 42 },
    secondaryStat: { value: 2 },
    sampleSize,
    dataSource,
  };
  return {
    ok: true,
    json: async () =>
      Object.fromEntries(
        ['opt-apply', 'opt-clock', 'stem-apply', 'stem-clock'].map((tool) => [
          tool,
          stats,
        ])
      ),
  };
}
beforeEach(() => {
  vi.mocked(useClientDate).mockReturnValue(
    new Date(`${snapshot.checkedDate}T12:00:00Z`)
  );
  fetchMock.mockReset().mockResolvedValue(reports(0));
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it.each(['opt-apply', 'opt-clock', 'stem-apply', 'stem-clock'] as const)(
  'shows the sourced official measure for %s without enough community reports',
  async (toolType) => {
    render(<LiveStatsWidget toolType={toolType} />);
    expect(
      await screen.findByText('USCIS processing time')
    ).toBeInTheDocument();
    expect(screen.getByText('months').parentElement).toHaveTextContent(
      `${snapshot.months} months`
    );
    expect(
      screen.getByText('80% of cases completed within this time')
    ).toBeInTheDocument();
    expect(screen.getByText(/Not a minimum wait/)).toHaveTextContent(
      snapshot.checkedDate
    );
    expect(
      screen.getByText(/not a separate OPT or STEM estimate/)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Check USCIS processing times' })
    ).toHaveAttribute('href', 'https://egov.uscis.gov/processing-times/');
    expect(screen.queryByText('Not enough data yet')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Median recorded approval time')
    ).not.toBeInTheDocument();
  }
);

it.each([0, 4])(
  'uses the official fallback with %s qualifying reports',
  async (count) => {
    fetchMock.mockResolvedValue(reports(count));
    render(<LiveStatsWidget />);
    expect(
      await screen.findByText('USCIS processing time')
    ).toBeInTheDocument();
  }
);

it('keeps the community median separate when five qualifying reports exist', async () => {
  fetchMock.mockResolvedValue(reports(5));
  render(<LiveStatsWidget />);
  expect(
    await screen.findByText('Median recorded approval time')
  ).toBeInTheDocument();
  expect(screen.queryByText('USCIS processing time')).not.toBeInTheDocument();
  expect(screen.getByText(/This is not an official USCIS/)).toBeInTheDocument();
});

it.each(['stale', 'future', 'hydrating'])(
  'does not show an unsafe official number: %s',
  async (state) => {
    const date = new Date(`${snapshot.checkedDate}T12:00:00Z`);
    date.setUTCDate(date.getUTCDate() + (state === 'stale' ? 31 : -1));
    vi.mocked(useClientDate).mockReturnValue(
      state === 'hydrating' ? null : date
    );
    render(<LiveStatsWidget />);
    expect(
      await screen.findByText(/Check the latest time on USCIS/)
    ).toBeInTheDocument();
    expect(screen.queryByText('months')).not.toBeInTheDocument();
  }
);

it('retains the official fallback on API failure and recovers community results on retry', async () => {
  fetchMock.mockResolvedValueOnce({ ok: false });
  render(<LiveStatsWidget />);
  expect(await screen.findByText('USCIS processing time')).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent(
    'Community statistics are temporarily unavailable'
  );
  fetchMock.mockResolvedValue(reports(8));
  fireEvent.click(
    screen.getByRole('button', { name: 'Refresh community report statistics' })
  );
  expect(
    await screen.findByText('Median recorded approval time')
  ).toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

it('never presents a legacy baseline as an observed median', async () => {
  fetchMock.mockResolvedValue(reports(100, 'baseline'));
  render(<LiveStatsWidget />);
  expect(await screen.findByText('USCIS processing time')).toBeInTheDocument();
  expect(
    screen.queryByText('Median recorded approval time')
  ).not.toBeInTheDocument();
});
