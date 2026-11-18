import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { CasePassOffer } from './CasePassOffer';

const m = vi.hoisted(() => ({ capture: vi.fn(), sentry: vi.fn() }));
vi.mock('@/lib/posthog-client', () => ({ captureClientEvent: m.capture }));
vi.mock('@sentry/nextjs', () => ({ captureException: m.sentry }));

const fetchMock = vi.fn();
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const button = () =>
  screen.getByRole('button', { name: 'Get the Case Pass for $9.99' });

it('states the price, the term, and that it does not renew or refund', () => {
  render(<CasePassOffer source="case_status" />);
  expect(
    screen.getByRole('heading', { name: /Prefer to pay once/ })
  ).toBeInTheDocument();
  expect(screen.getByText(/once · Pro for 6 months/)).toBeInTheDocument();
  expect(screen.getByRole('checkbox')).toHaveAccessibleName(
    /pay \$9\.99 today.*Pro access for 180 days.*does not renew.*non-refundable/
  );
  expect(m.capture).toHaveBeenCalledWith('case_pass_offer_viewed', {
    source: 'case_status',
  });
});

it('asks for the consent box before any checkout request', () => {
  render(<CasePassOffer source="case_status" />);
  fireEvent.click(button());
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Tick the box above to continue.'
  );
  expect(screen.getByRole('checkbox')).toHaveFocus();
  expect(fetchMock).not.toHaveBeenCalled();
  expect(m.capture).toHaveBeenCalledWith('case_pass_consent_prompted', {
    source: 'case_status',
  });
});

it('starts checkout with the accepted terms', async () => {
  fetchMock.mockResolvedValue(
    new Response(JSON.stringify({ error: 'You already have Pro access.' }), {
      status: 409,
    })
  );
  render(<CasePassOffer source="pricing_modal" />);
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(button());
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'You already have Pro access.'
  );
  expect(fetchMock).toHaveBeenCalledWith(
    '/api/premium/case-pass/checkout',
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        nonRefundableAccepted: true,
        source: 'pricing_modal',
      }),
    })
  );
  expect(m.capture).toHaveBeenCalledWith('case_pass_offer_clicked', {
    source: 'pricing_modal',
  });
  // An expected refusal is not reported as a failure.
  expect(m.sentry).not.toHaveBeenCalled();
  await waitFor(() => expect(button()).toBeEnabled());
});

it('reports a server failure without showing its details', async () => {
  fetchMock.mockResolvedValue(new Response('{}', { status: 500 }));
  render(<CasePassOffer source="case_status" />);
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(button());
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Could not start checkout. Please try again.'
  );
  expect(m.sentry).toHaveBeenCalledOnce();
});
