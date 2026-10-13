import { act, cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ActivationCompletedTracker } from './ActivationCompletedTracker';
import {
  captureActivationCompleted,
  isBrowserPostHogReady,
} from '@/lib/posthog-client';
import { hasAnalyticsConsent } from '@/lib/cookie-consent';
import { supabase } from '@/lib/supabase/client';

vi.mock('@/lib/supabase/client', () => ({
  supabase: { auth: { getUser: vi.fn() } },
}));
vi.mock('@/lib/cookie-consent', () => ({
  hasAnalyticsConsent: vi.fn(() => true),
}));
vi.mock('@/lib/posthog-client', () => ({
  ANALYTICS_CONSENT_CHANGE_EVENT: 'trackmyopt:analytics-consent',
  captureActivationCompleted: vi.fn(),
  isBrowserPostHogReady: vi.fn(() => true),
}));
const user = { id: 'synthetic-user', created_at: '2026-10-11T00:00:00Z' };
beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'error').mockImplementation(() => {});
  localStorage.clear();
  vi.mocked(hasAnalyticsConsent).mockReturnValue(true);
  vi.mocked(isBrowserPostHogReady).mockReturnValue(true);
  vi.mocked(supabase.auth.getUser).mockResolvedValue({
    data: { user },
    error: null,
  } as Awaited<ReturnType<typeof supabase.auth.getUser>>);
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          ok: true,
          data: {
            receipt_number: 'IOE1234567890',
            current_status: 'Case Was Received',
            last_checked_at: '2026-10-11T00:00:00Z',
          },
        })
      )
    )
  );
});
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('activation consent and account scope', () => {
  it('does not leak a rejected background request', async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'));
    render(<ActivationCompletedTracker />);
    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    await act(async () => Promise.resolve());
    expect(captureActivationCompleted).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      '[ActivationCompletedTracker] activation check failed'
    );
  });

  it.each([
    { ok: false, error: 'private response' },
    { ok: true, cases: 'private response' },
    null,
  ])(
    'reports malformed success responses without payloads: %j',
    async (body) => {
      vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(body)));
      render(<ActivationCompletedTracker />);
      await waitFor(() =>
        expect(console.error).toHaveBeenCalledWith(
          '[ActivationCompletedTracker] activation check failed'
        )
      );
      expect(captureActivationCompleted).not.toHaveBeenCalled();
      expect(localStorage.length).toBe(0);
      expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain(
        'private response'
      );
    }
  );

  it('keeps an expected offline failure separate', async () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    vi.mocked(fetch).mockRejectedValue(new TypeError('Failed to fetch'));
    render(<ActivationCompletedTracker />);
    await act(async () => Promise.resolve());
    expect(console.error).not.toHaveBeenCalled();
    expect(captureActivationCompleted).not.toHaveBeenCalled();
  });

  it('retries after a failed check without consuming the account marker', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(
      new TypeError('private network details')
    );
    render(<ActivationCompletedTracker />);
    await waitFor(() => expect(console.error).toHaveBeenCalledOnce());
    expect(localStorage.length).toBe(0);
    act(() => window.dispatchEvent(new Event('focus')));
    await waitFor(() =>
      expect(captureActivationCompleted).toHaveBeenCalledOnce()
    );
    expect(console.error).toHaveBeenCalledWith(
      '[ActivationCompletedTracker] activation check failed'
    );
  });

  it.each([401, 503])(
    'classifies returned authentication failures without reporting account data: %s',
    async (status) => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: { status, message: 'private account details' },
      } as Awaited<ReturnType<typeof supabase.auth.getUser>>);
      render(<ActivationCompletedTracker />);
      await act(async () => Promise.resolve());
      expect(fetch).not.toHaveBeenCalled();
      if (status === 401) expect(console.error).not.toHaveBeenCalled();
      else
        expect(console.error).toHaveBeenCalledWith(
          '[ActivationCompletedTracker] activation check failed'
        );
    }
  );

  it('consumes an unmount abort without reporting a failure or activation', async () => {
    vi.mocked(fetch).mockImplementation(
      (_url, options) =>
        new Promise((_resolve, reject) => {
          options?.signal?.addEventListener('abort', () =>
            reject(new DOMException('aborted', 'AbortError'))
          );
        })
    );
    const view = render(<ActivationCompletedTracker />);
    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    view.unmount();
    await act(async () => Promise.resolve());
    expect(console.error).not.toHaveBeenCalled();
    expect(captureActivationCompleted).not.toHaveBeenCalled();
  });

  it('does not capture or store a marker if consent is revoked during a request', async () => {
    let finish!: (value: Response) => void;
    vi.mocked(fetch).mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        })
    );
    render(<ActivationCompletedTracker />);
    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    vi.mocked(hasAnalyticsConsent).mockReturnValue(false);
    await act(async () =>
      finish(
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
    expect(captureActivationCompleted).not.toHaveBeenCalled();
    expect(localStorage.length).toBe(0);
  });

  it('keeps expected unauthenticated responses separate', async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response('Unauthorized', { status: 401 })
    );
    render(<ActivationCompletedTracker />);
    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    await act(async () => Promise.resolve());
    expect(console.error).not.toHaveBeenCalled();
    expect(captureActivationCompleted).not.toHaveBeenCalled();
  });

  it('coalesces overlapping focus checks into one request', async () => {
    let resolveFetch!: (value: Response) => void;
    vi.mocked(fetch).mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        })
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
      resolveFetch(
        new Response(
          JSON.stringify({
            ok: true,
            cases: [
              {
                receipt_number: 'IOE1234567890',
                current_status: 'Case Was Approved',
                last_checked_at: '2026-10-11T00:00:00Z',
              },
            ],
          })
        )
      );
    });
    expect(captureActivationCompleted).toHaveBeenCalledOnce();
  });

  it('captures once after a successful case check, using the account marker', async () => {
    render(<ActivationCompletedTracker />);
    await waitFor(() =>
      expect(captureActivationCompleted).toHaveBeenCalledOnce()
    );
    expect(
      localStorage.getItem('tmo:activation_completed_captured:synthetic-user')
    ).toBe('1');
  });

  it('waits for consent before fetching or marking activation captured', async () => {
    vi.mocked(hasAnalyticsConsent).mockReturnValue(false);
    render(<ActivationCompletedTracker />);
    expect(fetch).not.toHaveBeenCalled();
    expect(localStorage.length).toBe(0);
    vi.mocked(hasAnalyticsConsent).mockReturnValue(true);
    act(() =>
      window.dispatchEvent(
        new CustomEvent('trackmyopt:analytics-consent', {
          detail: { accepted: true },
        })
      )
    );
    await waitFor(() =>
      expect(captureActivationCompleted).toHaveBeenCalledOnce()
    );
    expect(
      localStorage.getItem('tmo:activation_completed_captured:synthetic-user')
    ).toBe('1');
    act(() => window.dispatchEvent(new Event('focus')));
    expect(captureActivationCompleted).toHaveBeenCalledOnce();
  });
  it('does not let another account or the old global marker suppress activation', async () => {
    localStorage.setItem('tmo:activation_completed_captured:other-user', '1');
    localStorage.setItem('tmo:activation_completed_captured', '1');
    render(<ActivationCompletedTracker />);
    await waitFor(() =>
      expect(captureActivationCompleted).toHaveBeenCalledOnce()
    );
  });
  it('does not consume the marker while the analytics SDK is unavailable', () => {
    vi.mocked(isBrowserPostHogReady).mockReturnValue(false);
    render(<ActivationCompletedTracker />);
    expect(fetch).not.toHaveBeenCalled();
    expect(localStorage.length).toBe(0);
  });
});
