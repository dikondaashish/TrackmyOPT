import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
  act,
} from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import EmailCampaignDashboard from './dashboard';
const navigation = vi.hoisted(() => ({ replace: vi.fn(), refresh: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => navigation }));
const campaigns = [
  { id: 'campaign', subject: 'Product update', created_at: '2026-09-29' },
];
const report = {
  campaignId: 'campaign',
  subject: 'Product update',
  sent: 50,
  failed: 0,
  needsReview: 1,
  observedOpens: 20,
  recordedClickers: 10,
  knownAutomatedRequests: 2,
  rapidMultiLinkClickers: 5,
  clickersAfterRapidLinkFilter: 5,
  links: [
    {
      key: 'pro_intro',
      url: 'https://www.trackmyopt.com/pricing',
      clickers: 7,
      clickersAfterRapidLinkFilter: 5,
      knownAutomatedClickers: 1,
    },
    {
      key: 'free_dashboard',
      url: 'https://www.trackmyopt.com/dashboard',
      clickers: 4,
      clickersAfterRapidLinkFilter: 3,
      knownAutomatedClickers: 0,
    },
  ],
};
const response = (data: object, status = 200) => ({
  ok: status === 200,
  status,
  json: async () => data,
});
function show(initialReport = report) {
  render(
    <EmailCampaignDashboard
      email="admin@example.invalid"
      initialCampaigns={campaigns}
      initialReport={initialReport}
    />
  );
}
beforeEach(() => vi.clearAllMocks());
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it('shows filtered and raw CTA counts without a shared secret form', () => {
  show();
  expect(
    screen.getByText('Pro options clickers').parentElement
  ).toHaveTextContent('5');
  expect(
    screen.getByText('Free link clickers').parentElement
  ).toHaveTextContent('3');
  expect(
    screen.getByText('Filtered link clickers').parentElement
  ).toHaveTextContent('5');
  expect(screen.getByText(/Raw unique link clickers:/)).toHaveTextContent('10');
  expect(screen.getByText('Approximate')).toBeInTheDocument();
  expect(screen.queryByLabelText('Admin secret')).not.toBeInTheDocument();
});
it('refreshes using cookies and clears old results when a request fails', async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(response({ campaigns }))
    .mockResolvedValueOnce(response({ error: 'Report unavailable' }, 503));
  vi.stubGlobal('fetch', fetch);
  show();
  fireEvent.click(screen.getByRole('button', { name: 'Refresh results' }));
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Report unavailable'
  );
  expect(
    screen.queryByRole('region', { name: 'Campaign results' })
  ).not.toBeInTheDocument();
  expect(fetch).toHaveBeenLastCalledWith(
    '/api/admin/email-campaigns?id=campaign',
    expect.objectContaining({ credentials: 'same-origin', cache: 'no-store' })
  );
});
it('returns expired admin sessions to login without retaining sensitive counts', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({}, 401)));
  show();
  fireEvent.click(screen.getByRole('button', { name: 'Refresh results' }));
  await waitFor(() =>
    expect(navigation.replace).toHaveBeenCalledWith('/admin/login')
  );
  expect(
    screen.queryByRole('region', { name: 'Campaign results' })
  ).not.toBeInTheDocument();
});
it('ignores a report arriving after sign-out', async () => {
  let finish!: (value: object) => void;
  const delayed = new Promise((resolve) => {
    finish = resolve;
  });
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(response({ campaigns }))
    .mockReturnValueOnce(delayed)
    .mockResolvedValueOnce(response({ success: true }));
  vi.stubGlobal('fetch', fetch);
  show();
  fireEvent.click(screen.getByRole('button', { name: 'Refresh results' }));
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
  fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
  await waitFor(() =>
    expect(navigation.replace).toHaveBeenCalledWith('/admin/login')
  );
  await act(async () => {
    finish(response(report));
    await delayed;
  });
  expect(
    screen.queryByRole('region', { name: 'Campaign results' })
  ).not.toBeInTheDocument();
});
it('shows an honest empty state before the first tracked campaign', () => {
  render(
    <EmailCampaignDashboard
      email="admin@example.invalid"
      initialCampaigns={[]}
      initialReport={null}
    />
  );
  expect(
    screen.getByRole('heading', { name: 'No tracked campaigns yet' })
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('region', { name: 'Campaign results' })
  ).not.toBeInTheDocument();
});
