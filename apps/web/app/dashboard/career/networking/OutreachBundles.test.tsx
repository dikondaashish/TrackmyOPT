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

  it('recovers a failed email lookup in the browser and drafts without rebuilding or persisting verification claims', async () => {
    let draftAttempts = 0;
    const fetchMock = vi.fn(async (url: string, options?: RequestInit) => {
      if (url === '/api/career/email-finder') return ok({ linkedinUrl: 'https://www.linkedin.com/in/person-1' });
      if (url === 'https://api.applybolt.app/public/findEmailByLinkedIn') return new Response(JSON.stringify({
        found: true, email: 'taylor@microsoft.com', company: 'Microsoft', validation: 'valid',
      }));
      if (url === '/api/career/networking/draft') {
        draftAttempts += 1;
        if (draftAttempts === 1) return new Response(JSON.stringify({ ok: false, error: 'Drafting temporarily unavailable' }), { status: 503 });
        return ok({ subject: 'Software internship', emailBody: 'Hi Taylor, I am interested in a software internship.', linkedinNote: 'Hello' });
      }
      return url.endsWith(`/${bundleId}`)
        ? ok({ bundle: { ...ready, status: 'partial', emailLookupStatus: 'partial',
          userIntent: 'I am interested in a software internship', errorCode: 'email_provider_partial' },
        contacts: [contact(1, 'provider_error')] }) : ok({ remaining: 14, history: [] });
    });
    vi.stubGlobal('fetch', fetchMock);
    render(<NetworkingWorkspace applications={[]} initialApplicationId="" initialBundleId={bundleId} applicationsUnavailable={false} />);
    expect(await screen.findByText('Checking available work emails — incomplete')).toBeInTheDocument();
    expect(fetchMock.mock.calls.every((call) => call[1]?.method !== 'POST')).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Retry email lookup' }));
    expect(await screen.findByText('taylor@microsoft.com')).toBeInTheDocument();
    expect(screen.getByText(/not saved to the bundle/)).toBeInTheDocument();
    const lookupCall = fetchMock.mock.calls.find((call) => call[0].startsWith('https://api.applybolt'))!;
    expect(lookupCall[1]).toMatchObject({ credentials: 'omit', referrerPolicy: 'no-referrer', redirect: 'error' });
    expect(JSON.parse(lookupCall[1]?.body as string)).toEqual({ linkedinUrl: 'https://www.linkedin.com/in/person-1' });
    fireEvent.click(screen.getByRole('button', { name: 'Draft email with AI' }));
    expect(await screen.findByText('Drafting temporarily unavailable')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Draft email with AI' }));
    const gmail = await screen.findByRole('link', { name: 'Open Gmail' });
    expect(new URL(gmail.getAttribute('href')!).searchParams.get('to')).toBe('taylor@microsoft.com');
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Updated message' } });
    expect(new URL(gmail.getAttribute('href')!).searchParams.get('body')).toBe('Updated message');
    const draftCall = fetchMock.mock.calls.find((call) => call[0] === '/api/career/networking/draft')!;
    expect(JSON.parse(draftCall[1]?.body as string)).toMatchObject({ includeEmail: true, messageIntent: 'I am interested in a software internship' });
    expect(fetchMock.mock.calls.filter((call) => call[0].startsWith('https://api.applybolt'))).toHaveLength(1);
    expect(fetchMock.mock.calls.filter((call) => call[1]?.method === 'POST').every((call) =>
      ['/api/career/email-finder', 'https://api.applybolt.app/public/findEmailByLinkedIn', '/api/career/networking/draft'].includes(call[0]))).toBe(true);
    expect(fetchMock.mock.calls.some((call) => call[1]?.method === 'PATCH')).toBe(false);
  });

  it.each([
    { found: false },
    { found: true, email: 'person@example.com', validation: 'unknown', company: 'Microsoft' },
    { found: true, email: 'person@example.com', validation: 'valid', company: 'Other Company' },
    { found: true, email: 'person@example.com', validation: 'valid' },
    { found: true, email: 'not-an-email', validation: 'valid', company: 'Microsoft' },
  ])('does not enable email outreach for an unsupported browser result: %s', async (providerResult) => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url === '/api/career/email-finder') return ok({ linkedinUrl: 'https://www.linkedin.com/in/person-1' });
      if (url.startsWith('https://api.applybolt')) return new Response(JSON.stringify(providerResult));
      return url.endsWith(`/${bundleId}`) ? ok({ bundle: { ...ready, status: 'partial', emailLookupStatus: 'partial' }, contacts: [contact(1, 'provider_error')] })
        : ok({ remaining: 14, history: [] });
    });
    vi.stubGlobal('fetch', fetchMock);
    render(<NetworkingWorkspace applications={[]} initialApplicationId="" initialBundleId={bundleId} applicationsUnavailable={false} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Retry email lookup' }));
    await waitFor(() => expect(fetchMock.mock.calls.some((call) => call[0].startsWith('https://api.applybolt'))).toBe(true));
    await screen.findByRole('button', { name: 'Retry email lookup' });
    expect(screen.queryByRole('button', { name: 'Draft email with AI' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Open Gmail' })).not.toBeInTheDocument();
    expect(screen.queryByText('person@example.com')).not.toBeInTheDocument();
  });
});
