import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { NetworkingWorkspace } from './NetworkingWorkspace';

vi.mock('@/lib/posthog-client', () => ({ captureClientEvent: vi.fn() }));
const bundleId = '00000000-0000-4000-8000-000000000010';
const contact = (id: number, status: string) => ({
  id: `00000000-0000-4000-8000-00000000000${id}`,
  name: id === 1 ? 'Taylor One' : 'Morgan Two', title: 'Technical Recruiter', company: 'Microsoft',
  linkedinUrl: `https://www.linkedin.com/in/person-${id}`, relevanceReason: 'Recruiting for engineering',
  evidence: [{ url: `https://www.linkedin.com/in/person-${id}`, title: 'LinkedIn profile', description: '' }],
  email: status === 'verified' ? 'taylor@microsoft.com' : null,
  emailStatus: status, emailSubject: status === 'verified' ? 'A quick introduction' : null,
  emailBody: status === 'verified' ? 'Hi Taylor, I would love to connect.' : null,
  linkedinNote: 'Hi, I would love to connect about engineering at Microsoft.',
});
const ready = { id: bundleId, companyName: 'Microsoft', companyDomain: 'microsoft.com',
  targetRole: 'Software Engineer', userIntent: '', status: 'completed', discoveryStatus: 'completed',
  emailLookupStatus: 'completed', draftStatus: 'completed', errorCode: null, stale: false };
const ok = (data: unknown) => new Response(JSON.stringify({ ok: true, data }));

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe('saved outreach bundle workspace', () => {
  it('reopens saved contacts without POST and composes email only for verified work email', async () => {
    const fetchMock = vi.fn(async (url: string, _options?: RequestInit) => url.endsWith(`/${bundleId}`)
      ? ok({ bundle: ready, contacts: [contact(1, 'verified'), contact(2, 'not_found')] })
      : ok({ remaining: 14, history: [] }));
    vi.stubGlobal('fetch', fetchMock);
    render(<NetworkingWorkspace applications={[]} initialApplicationId="" initialBundleId={bundleId} applicationsUnavailable={false} />);
    expect(await screen.findByText('Taylor One')).toBeInTheDocument();
    expect(screen.getByText('Morgan Two')).toBeInTheDocument();
    expect(screen.getByText(/2 relevant contacts found/)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Open Gmail/ })).toHaveLength(1);
    expect(screen.getAllByRole('link', { name: /Open Outlook/ })).toHaveLength(1);
    expect(screen.getByText(/No verified work email found/)).toBeInTheDocument();
    expect(fetchMock.mock.calls.every((call) => call[1]?.method !== 'POST')).toBe(true);
  });

  it('starts only on Build and sends one idempotency key', async () => {
    const fetchMock = vi.fn(async (url: string, options?: RequestInit) => {
      if (url.startsWith('/api/career/networking/companies')) return ok({ companies: [] });
      if (url === '/api/career/networking/bundles') return options?.method === 'POST'
        ? ok({ bundleId }) : ok({ remaining: 15, history: [] });
      return ok({ bundle: ready, contacts: [contact(1, 'verified')] });
    });
    vi.stubGlobal('fetch', fetchMock);
    render(<NetworkingWorkspace applications={[]} initialApplicationId="" initialBundleId="" applicationsUnavailable={false} />);
    fireEvent.change(screen.getByLabelText('Search company'), { target: { value: 'Microsoft' } });
    fireEvent.change(screen.getByLabelText('Target role'), { target: { value: 'Software Engineer' } });
    expect(fetchMock.mock.calls.every((call) => call[1]?.method !== 'POST')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Build outreach bundle' }));
    await waitFor(() => expect(fetchMock.mock.calls.filter((call) => call[1]?.method === 'POST')).toHaveLength(1));
    const post = fetchMock.mock.calls.find((call) => call[1]?.method === 'POST')!;
    const body = JSON.parse(post[1]?.body as string);
    expect(body).toMatchObject({ companyName: 'Microsoft', targetRole: 'Software Engineer' });
    expect(body.idempotencyKey).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('shows zero reliable contacts without suggesting a guessed profile', async () => {
    const fetchMock = vi.fn(async (url: string) => url.endsWith(`/${bundleId}`)
      ? ok({ bundle: { ...ready, status: 'failed', discoveryStatus: 'zero_contacts',
        draftStatus: 'pending', errorCode: 'zero_contacts' }, contacts: [] })
      : ok({ remaining: 15, history: [] }));
    vi.stubGlobal('fetch', fetchMock);
    render(<NetworkingWorkspace applications={[]} initialApplicationId="" initialBundleId={bundleId} applicationsUnavailable={false} />);
    expect(await screen.findByText(/couldn't find a reliable current contact/)).toBeInTheDocument();
    expect(screen.queryByText('Relevant contact 1')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry from saved stage' })).toBeDisabled();
  });

  it('retries writing on the saved bundle without rebuilding', async () => {
    const fetchMock = vi.fn(async (url: string, options?: RequestInit) => {
      if (options?.method === 'POST') return ok({ bundleId, state: 'started' });
      return url.endsWith(`/${bundleId}`)
        ? ok({ bundle: { ...ready, status: 'failed', draftStatus: 'failed',
          errorCode: 'outreach_unavailable' }, contacts: [contact(1, 'verified')] })
        : ok({ remaining: 15, history: [] });
    });
    vi.stubGlobal('fetch', fetchMock);
    render(<NetworkingWorkspace applications={[]} initialApplicationId="" initialBundleId={bundleId} applicationsUnavailable={false} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Retry from saved stage' }));
    await waitFor(() => expect(fetchMock.mock.calls.some((call) =>
      call[0] === `/api/career/networking/bundles/${bundleId}` && call[1]?.method === 'POST')).toBe(true));
    expect(fetchMock.mock.calls.some((call) =>
      call[0] === '/api/career/networking/bundles' && call[1]?.method === 'POST')).toBe(false);
  });
});
