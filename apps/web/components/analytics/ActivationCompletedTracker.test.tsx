import { act, cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ActivationCompletedTracker } from './ActivationCompletedTracker';

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  captureActivationCompleted: vi.fn(),
}));

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: mocks.getUser,
    },
  },
}));

vi.mock('@/lib/posthog-client', () => ({
  captureActivationCompleted: mocks.captureActivationCompleted,
}));

const activeCaseResponse = {
  ok: true,
  json: vi.fn().mockResolvedValue({
    cases: [
      {
        receipt_number: 'IOE1234567890',
        current_status: 'Case Was Approved',
        last_checked_at: '2026-08-01T00:00:00.000Z',
      },
    ],
  }),
};

describe('ActivationCompletedTracker', () => {
  beforeEach(() => {
    localStorage.clear();
    mocks.getUser.mockReset();
    mocks.captureActivationCompleted.mockReset();
    mocks.getUser.mockResolvedValue({
      data: {
        user: {
          created_at: '2026-08-01T00:00:00.000Z',
        },
      },
    });
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('does not leak a rejected background request', async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'));

    render(<ActivationCompletedTracker />);

    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    await act(async () => Promise.resolve());

    expect(mocks.captureActivationCompleted).not.toHaveBeenCalled();
  });

  it('coalesces overlapping focus checks into one request', async () => {
    let resolveFetch!: (value: typeof activeCaseResponse) => void;
    vi.mocked(fetch).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }) as Promise<Response>
    );

    render(<ActivationCompletedTracker />);
    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());

    act(() => {
      window.dispatchEvent(new Event('focus'));
      window.dispatchEvent(new Event('focus'));
    });
    await act(async () => Promise.resolve());

    expect(fetch).toHaveBeenCalledOnce();

    await act(async () => {
      resolveFetch(activeCaseResponse);
    });
  });

  it('captures activation once after a successful case check', async () => {
    vi.mocked(fetch).mockResolvedValue(
      activeCaseResponse as unknown as Response
    );

    render(<ActivationCompletedTracker />);

    await waitFor(() =>
      expect(mocks.captureActivationCompleted).toHaveBeenCalledOnce()
    );
    expect(localStorage.getItem('tmo:activation_completed_captured')).toBe('1');
  });
});
