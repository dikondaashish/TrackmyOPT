import { act, cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as Sentry from '@sentry/nextjs';
import { PostHogIdentify } from './PostHogIdentify';
import { identifyTrackMyOptUser } from '@/lib/posthog-client';
import { supabase } from '@/lib/supabase/client';

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
vi.mock('@/lib/posthog-client', () => ({
  identifyTrackMyOptUser: vi.fn(),
  associateUniversityPartnerGroup: vi.fn(),
}));
vi.mock('@/lib/premium/usePremiumStatus', () => ({
  usePremiumStatus: () => ({
    isLoading: false,
    isPremium: false,
    planName: null,
  }),
}));
vi.mock('@/lib/supabase/client', () => {
  const maybeSingle = vi.fn();
  const query = { select: () => query, eq: () => query, maybeSingle };
  return {
    supabase: { auth: { getUser: vi.fn() }, from: vi.fn(() => query) },
  };
});

const user = { id: 'synthetic-user', created_at: '2026-10-11T00:00:00Z' };
const profile = {
  onboarding_completed: true,
  is_stem_eligible: false,
  referred_by: null,
};
const maybeSingle = () =>
  vi.mocked(supabase.from('profiles').select('').eq('', '').maybeSingle);
const unhandled: unknown[] = [];
const onUnhandled = (reason: unknown) => unhandled.push(reason);

beforeEach(() => {
  vi.clearAllMocks();
  unhandled.length = 0;
  process.on('unhandledRejection', onUnhandled);
  vi.mocked(supabase.auth.getUser).mockResolvedValue({
    data: { user },
    error: null,
  } as Awaited<ReturnType<typeof supabase.auth.getUser>>);
  maybeSingle().mockResolvedValue({ data: profile, error: null } as never);
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          data: {
            receipt_number: 'IOE1234567890',
            current_status: 'Case Was Approved',
            last_checked_at: '2026-10-11T00:00:00Z',
          },
        })
      )
    )
  );
});
afterEach(() => {
  cleanup();
  process.off('unhandledRejection', onUnhandled);
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('PostHogIdentify', () => {
  it('identifies the user with case-derived properties', async () => {
    render(<PostHogIdentify />);
    await waitFor(() => expect(identifyTrackMyOptUser).toHaveBeenCalledOnce());
    expect(identifyTrackMyOptUser).toHaveBeenCalledWith(
      'synthetic-user',
      expect.objectContaining({
        has_receipt: true,
        activation_state: 'activated',
        onboarding_completed: true,
      })
    );
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it.each(['Failed to fetch', 'Load failed'])(
    'handles a "%s" case-status rejection without an unhandled rejection',
    async (message) => {
      const failure = new TypeError(message);
      vi.mocked(fetch).mockRejectedValue(failure);
      render(<PostHogIdentify />);
      await waitFor(() =>
        expect(identifyTrackMyOptUser).toHaveBeenCalledOnce()
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(unhandled).toEqual([]);
      // Identification still happens, without overwriting case properties.
      const [, properties] = vi.mocked(identifyTrackMyOptUser).mock.calls[0];
      expect(properties.has_receipt).toBeUndefined();
      expect(properties.activation_state).toBeUndefined();
      // The original network error reaches Sentry's connectivity filter.
      expect(Sentry.captureException).toHaveBeenCalledWith(failure);
    }
  );

  it('does not overwrite case properties after an unsuccessful response', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response('Service Unavailable', { status: 503 })
    );
    render(<PostHogIdentify />);
    await waitFor(() => expect(identifyTrackMyOptUser).toHaveBeenCalledOnce());
    const [, properties] = vi.mocked(identifyTrackMyOptUser).mock.calls[0];
    expect(properties.has_receipt).toBeUndefined();
    expect(properties.activation_state).toBeUndefined();
  });

  it('keeps an offline failure out of error reports', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'));
    render(<PostHogIdentify />);
    await waitFor(() => expect(identifyTrackMyOptUser).toHaveBeenCalledOnce());
    expect(Sentry.captureException).not.toHaveBeenCalled();
    expect(unhandled).toEqual([]);
  });

  it('reports unexpected failures without their private message', async () => {
    vi.mocked(supabase.auth.getUser).mockRejectedValue(
      new Error('private account details')
    );
    render(<PostHogIdentify />);
    await waitFor(() => expect(Sentry.captureException).toHaveBeenCalledOnce());
    const [reported] = vi.mocked(Sentry.captureException).mock.calls[0];
    expect(String(reported)).not.toContain('private account details');
    expect(identifyTrackMyOptUser).not.toHaveBeenCalled();
    expect(unhandled).toEqual([]);
  });

  it('aborts the case request on unmount without reporting or identifying', async () => {
    vi.mocked(fetch).mockImplementation(
      (_url, options) =>
        new Promise((_resolve, reject) => {
          options?.signal?.addEventListener('abort', () =>
            reject(new DOMException('aborted', 'AbortError'))
          );
        })
    );
    const view = render(<PostHogIdentify />);
    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    view.unmount();
    await act(async () => Promise.resolve());
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(Sentry.captureException).not.toHaveBeenCalled();
    expect(identifyTrackMyOptUser).not.toHaveBeenCalled();
    expect(unhandled).toEqual([]);
  });
});
