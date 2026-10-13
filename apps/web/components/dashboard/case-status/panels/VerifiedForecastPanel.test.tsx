import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import {
  ForecastDetails,
  VerifiedForecastPanel,
} from './VerifiedForecastPanel';
import { emptyForecast } from '@/lib/opt-forecast/survival';
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it('shows dates, distinct freshness and uncertainty without invented high confidence', () => {
  const f = {
    ...emptyForecast(
      null,
      '2026-10-13T12:00:00Z',
      'Estimate, not a USCIS promise.'
    ),
    state: 'estimate' as const,
    medianDate: '2026-11-02',
    interval50: ['2026-10-21', '2026-11-20'] as [string, string],
    lastSuccessfulSync: '2026-10-12T15:00:00Z',
    waitingDays: 104,
  };
  render(<ForecastDetails forecast={f} />);
  expect(screen.getByText('November 2, 2026')).toBeInTheDocument();
  expect(screen.getByText('104 days')).toBeInTheDocument();
  expect(screen.getByText('October 12, 2026')).toBeInTheDocument();
  expect(screen.queryByText('High')).toBeNull();
});
it('replaces a pending estimate with an explicit verified approval', () => {
  render(
    <ForecastDetails
      forecast={{
        ...emptyForecast(
          null,
          '2026-10-13T12:00:00Z',
          'USCIS reports this approval date.'
        ),
        state: 'approved',
        approvalDate: '2026-10-12',
        reliability: null,
      }}
    />
  );
  expect(screen.getByText('USCIS approval')).toBeInTheDocument();
  expect(screen.queryByText(/Most Likely/)).toBeNull();
});
it('shows limited evidence honestly and logs failed loads without response contents', async () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response('private', { status: 500 }))
  );
  render(<VerifiedForecastPanel caseId="case" lastCheckedAt={null} />);
  await waitFor(() =>
    expect(screen.getByText(/temporarily unavailable/)).toBeInTheDocument()
  );
  expect(error).toHaveBeenCalledWith(
    'OPT approval forecast could not be loaded'
  );
  error.mockRestore();
});
it('requests once per visit and again only at a new UTC day', async () => {
  vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] });
  vi.setSystemTime(new Date('2026-10-13T23:58:30Z'));
  const fetch = vi
    .fn()
    .mockImplementation(() =>
      Promise.resolve(new Response(null, { status: 403 }))
    );
  vi.stubGlobal('fetch', fetch);
  render(<VerifiedForecastPanel caseId="case" lastCheckedAt={null} />);
  await act(() => vi.advanceTimersByTimeAsync(60_000));
  expect(fetch).toHaveBeenCalledTimes(1);
  await act(() => vi.advanceTimersByTimeAsync(60_000));
  expect(fetch).toHaveBeenCalledTimes(2);
  vi.useRealTimers();
});
