import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { NetworkingUsageStats } from './NetworkingUsageStats';

afterEach(() => vi.unstubAllGlobals());
const response = (data: object) => ({
  ok: true,
  json: async () => ({ ok: true, data }),
});
it('shows draft usage and refreshes after an action', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(response({ used: 4, limit: 15, remaining: 11 }));
  vi.stubGlobal('fetch', fetchMock);
  render(<NetworkingUsageStats mode="manual" />);
  expect(await screen.findByText('11 left')).toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledWith(
    '/api/career/networking/draft',
    expect.objectContaining({ cache: 'no-store' })
  );
  expect(
    screen.getByLabelText(
      '4 of 15 daily requests used or in progress; 11 left today'
    )
  ).toBeInTheDocument();
  fetchMock.mockResolvedValue(response({ used: 5, limit: 15, remaining: 10 }));
  act(() => {
    window.dispatchEvent(new Event('networking-usage-updated'));
  });
  expect(await screen.findByText('10 left')).toBeInTheDocument();
});
it('includes reservations and displays exhausted bundle usage', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(response({ used: 13, reserved: 2, remaining: 0 }))
  );
  render(<NetworkingUsageStats mode="bundles" />);
  expect(await screen.findByText('0 left')).toBeInTheDocument();
  expect(
    screen.getByLabelText(
      '15 of 15 daily requests used or in progress; 0 left today'
    )
  ).toBeInTheDocument();
  expect(
    screen.queryByText(/resets|outreach bundles|in progress/i)
  ).not.toBeInTheDocument();
});
it('shows a retry instead of a false zero when usage fails', async () => {
  const fetchMock = vi
    .fn()
    .mockRejectedValueOnce(new Error('offline'))
    .mockResolvedValue(response({ used: 0, limit: 15, remaining: 15 }));
  vi.stubGlobal('fetch', fetchMock);
  render(<NetworkingUsageStats mode="manual" />);
  fireEvent.click(await screen.findByRole('button', { name: 'Retry' }));
  await waitFor(() => expect(screen.getByText('15 left')).toBeInTheDocument());
});
