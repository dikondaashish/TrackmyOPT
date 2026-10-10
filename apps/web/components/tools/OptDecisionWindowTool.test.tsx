import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { captureClientEvent } from '@/lib/posthog-client';
import { OptDecisionWindowTool } from './OptDecisionWindowTool';

vi.mock('@/lib/posthog-client', () => ({ captureClientEvent: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

function submit() {
  render(<OptDecisionWindowTool />);
  fireEvent.change(screen.getByLabelText('USCIS received / receipt date'), {
    target: { value: '2026-01-15' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Show my decision window' }));
}

describe('decision-window outcome analytics', () => {
  it('records a network failure without sending request details', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    submit();
    await screen.findByText('Network error. Please try again.');
    expect(captureClientEvent).toHaveBeenCalledExactlyOnceWith('opt_decision_window_failed', {
      case_kind: 'initial_opt', failure_kind: 'network_or_response',
    });
    expect(screen.getByRole('button', { name: 'Show my decision window' })).toBeEnabled();
  });

  it('records API errors once and preserves the HTTP status', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false, status: 429, json: async () => ({ ok: false, error: 'Try again later' }),
    }));
    submit();
    await screen.findByText('Try again later');
    expect(captureClientEvent).toHaveBeenCalledExactlyOnceWith('opt_decision_window_failed', {
      case_kind: 'initial_opt', status: 429, failure_kind: 'api',
    });
  });

  it('counts an insufficient cohort as a valid result, not a failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true, json: async () => ({ ok: true, estimate: null, daysSinceFiled: 30 }),
    }));
    submit();
    await waitFor(() => expect(captureClientEvent).toHaveBeenCalledExactlyOnceWith(
      'opt_decision_window_viewed', {
        case_kind: 'initial_opt', has_estimate: false, days_since_filed: 30, cohort_size: 0,
      },
    ));
    expect(screen.getByRole('link', { name: 'Track live status free' })).toHaveAttribute(
      'href', '/login?next=/dashboard/case-status',
    );
  });
});
