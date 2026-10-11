import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { MonitoringEmailOffer } from './MonitoringEmailOffer';
const m = vi.hoisted(() => ({
  token: 'synthetic-token',
  modal: vi.fn(),
  push: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: m.push }),
  useSearchParams: () => new URLSearchParams(m.token ? 'token=' + m.token : ''),
}));
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));
vi.mock('@/components/pricing/PricingModal', () => ({
  PricingModal: (props: unknown) => {
    m.modal(props);
    return null;
  },
}));
beforeEach(() => {
  vi.clearAllMocks();
  m.token = 'synthetic-token';
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200 }));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it('a scanner/page load alone never qualifies a follow-up', () => {
  render(<MonitoringEmailOffer />);
  expect(fetch).not.toHaveBeenCalled();
  expect(m.modal).toHaveBeenLastCalledWith(
    expect.objectContaining({ open: false })
  );
});
it('requires an explicit button press then opens the existing monitoring offer with its source', async () => {
  render(<MonitoringEmailOffer />);
  fireEvent.click(
    screen.getByRole('button', { name: 'See my monitoring options' })
  );
  await waitFor(() =>
    expect(m.modal).toHaveBeenLastCalledWith(
      expect.objectContaining({
        open: true,
        caseMonitoring: true,
        checkoutSource: 'pending_case_email',
      })
    )
  );
  expect(fetch).toHaveBeenCalledWith(
    '/api/premium/monitoring-engagement',
    expect.objectContaining({
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ token: m.token }),
    })
  );
});
it('never opens paid offer on expired, ineligible or failed verification', async () => {
  vi.mocked(fetch).mockResolvedValue({ ok: false, status: 409 } as Response);
  render(<MonitoringEmailOffer />);
  fireEvent.click(
    screen.getByRole('button', { name: 'See my monitoring options' })
  );
  await screen.findByRole('alert');
  expect(m.modal).toHaveBeenLastCalledWith(
    expect.objectContaining({ open: false })
  );
});
it('a missing token leaves the button disabled', () => {
  m.token = '';
  render(<MonitoringEmailOffer />);
  expect(
    screen.getByRole('button', { name: 'See my monitoring options' })
  ).toBeDisabled();
});

it('keeps the signed link on login without qualifying a follow-up', async () => {
  vi.mocked(fetch).mockResolvedValue({ ok: false, status: 401 } as Response);
  render(<MonitoringEmailOffer />);
  fireEvent.click(
    screen.getByRole('button', { name: 'See my monitoring options' })
  );
  await waitFor(() =>
    expect(m.push).toHaveBeenCalledWith(
      expect.stringContaining('/login?returnTo=')
    )
  );
  expect(m.modal).toHaveBeenLastCalledWith(
    expect.objectContaining({ open: false })
  );
});
