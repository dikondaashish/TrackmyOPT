import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as Sentry from '@sentry/nextjs';
import { PricingModal } from './PricingModal';

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
vi.mock('@/lib/posthog-client', () => ({
  captureClientEvent: vi.fn(),
  capturePricingCtaViewed: vi.fn(),
}));
const fetchMock = vi.fn();
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('Pro checkout failure reporting', () => {
  it('fails closed and reports unexpected eligibility failures safely', async () => {
    fetchMock.mockRejectedValue(
      new Error('applicant@example.com private body')
    );
    render(<PricingModal open onClose={vi.fn()} caseMonitoring />);
    await waitFor(() => expect(Sentry.captureException).toHaveBeenCalledOnce());
    expect(vi.mocked(Sentry.captureException).mock.calls[0][0]).toEqual(
      new Error('Pro offer eligibility request failed')
    );
    expect(
      screen.getByText(/we could not verify your offer/i)
    ).toBeInTheDocument();
  });
  it('reports HTTP 200 checkout failures without forwarding response bodies', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ proPaidIntroEligible: true }))
    );
    fetchMock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ error: 'applicant@example.com private body' })
      )
    );
    render(<PricingModal open onClose={vi.fn()} caseMonitoring />);
    await screen.findByText('$0.99');
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /start.*7.*day/i }));
    await waitFor(() => expect(Sentry.captureException).toHaveBeenCalledOnce());
    expect(vi.mocked(Sentry.captureException).mock.calls[0][0]).toEqual(
      new Error('Pro checkout returned an unexpected response')
    );
    expect(
      screen.getByText(/unexpected checkout response/i)
    ).toBeInTheDocument();
  });
  it('labels a checkout request without any response as a network-stage failure', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ proPaidIntroEligible: true }))
    );
    fetchMock.mockRejectedValueOnce(
      new TypeError('applicant@example.com private network details')
    );
    render(<PricingModal open onClose={vi.fn()} caseMonitoring />);
    await screen.findByText('$0.99');
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /start.*7.*day/i }));
    await waitFor(() => expect(Sentry.captureException).toHaveBeenCalledOnce());
    expect(vi.mocked(Sentry.captureException).mock.calls[0][0]).toEqual(
      new Error('Pro checkout request failed (stage=network, status=none)')
    );
    expect(screen.getByText(/could not start checkout/i)).toBeInTheDocument();
  });
});
