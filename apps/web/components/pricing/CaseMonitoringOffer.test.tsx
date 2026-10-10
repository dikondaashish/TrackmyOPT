import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PricingModal } from './PricingModal';
vi.mock('@/lib/posthog-client', () => ({
  captureClientEvent: vi.fn(),
  capturePricingCtaViewed: vi.fn(),
}));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});
function show(eligible = true) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ proPaidIntroEligible: eligible }),
  });
  vi.stubGlobal('fetch', fetchMock);
  render(
    <PricingModal open onClose={vi.fn()} caseMonitoring initialPlan="pro" />
  );
  return fetchMock;
}
describe('case monitoring purchase path', () => {
  it('defaults to monthly, requires explicit consent and sends the displayed terms', async () => {
    const fetchMock = show();
    const button = await screen.findByRole('button', {
      name: 'Start Pro — $0.99 for 7 days',
    });
    expect(
      screen.getByRole('radio', { name: 'Monthly · $4.99/month' })
    ).toBeChecked();
    expect(button).toBeDisabled();
    expect(screen.getByRole('checkbox')).toHaveAccessibleName(
      /I agree to pay \$0.99 today for 7 days, then \$4.99\/month unless canceled before renewal.*refundable within 7 days; recurring charges are non-refundable except where required by law/
    );
    expect(screen.queryByText('Dedicated')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox'));
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({ error: 'Please retry' }),
    });
    fireEvent.click(button);
    await screen.findByRole('alert');
    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/premium/create-checkout',
      expect.objectContaining({ body: expect.any(String) })
    );
    const body = JSON.parse(fetchMock.mock.calls.at(-1)?.[1].body);
    expect(body).toMatchObject({
      planId: 'pro',
      interval: 'month',
      recurringBillingAccepted: true,
      source: 'case_status',
      expectedProIntro: true,
    });
    expect(button).toBeEnabled();
  });
  it('requires renewed consent after switching to annual', async () => {
    show();
    await screen.findByRole('button', { name: 'Start Pro — $0.99 for 7 days' });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(
      screen.getByRole('radio', { name: 'Annual · $49.99 billed yearly' })
    );
    await waitFor(() => expect(screen.getByRole('checkbox')).not.toBeChecked());
    expect(screen.getByRole('status')).toHaveTextContent(
      '$0.99 for 7 days Then $49.99/year · auto-renews until canceled'
    );
    expect(screen.getByRole('checkbox')).toHaveAccessibleName(
      /then \$49.99\/year unless canceled before renewal/
    );
  });
  it('shows the standard price for an ineligible account', async () => {
    show(false);
    await screen.findByText('Pro for $4.99/month');
    expect(
      screen.queryByRole('button', { name: 'Start Pro — $0.99 for 7 days' })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Continue to Pro checkout' })
    ).toBeDisabled();
  });
  it('blocks checkout when eligibility cannot be verified', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    render(
      <PricingModal open onClose={vi.fn()} caseMonitoring initialPlan="pro" />
    );
    await screen.findByText(
      'We could not verify your offer. Close and reopen to retry.'
    );
    expect(
      screen.getByRole('button', { name: 'Continue to Pro checkout' })
    ).toBeDisabled();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Compare all plans' }));
    expect(
      screen.getByRole('button', { name: 'Checking eligibility…' })
    ).toBeDisabled();
    expect(
      screen.getByText(
        'Pro checkout is unavailable until eligibility can be checked. Close and reopen this offer to retry.'
      )
    ).toBeInTheDocument();
  });
  it('resets renewal choice and consent when the offer is reopened', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ proPaidIntroEligible: true }),
      })
    );
    const { rerender } = render(
      <PricingModal open onClose={vi.fn()} caseMonitoring />
    );
    await screen.findByRole('checkbox');
    fireEvent.click(
      screen.getByRole('radio', { name: 'Annual · $49.99 billed yearly' })
    );
    fireEvent.click(screen.getByRole('checkbox'));
    rerender(<PricingModal open={false} onClose={vi.fn()} caseMonitoring />);
    rerender(<PricingModal open onClose={vi.fn()} caseMonitoring />);
    await screen.findByRole('checkbox');
    expect(
      screen.getByRole('radio', { name: 'Monthly · $4.99/month' })
    ).toBeChecked();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('lets users explicitly compare plans', async () => {
    show();
    await screen.findByRole('button', { name: 'Start Pro — $0.99 for 7 days' });
    fireEvent.click(screen.getByRole('button', { name: 'Compare all plans' }));
    expect(screen.getByRole('heading', { name: 'Free' })).toBeInTheDocument();
  });
});
