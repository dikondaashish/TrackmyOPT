import { afterEach, describe, expect, it, vi } from 'vitest';
import { lookupWorkEmail, resolveGroundingSources, roleFamily, writeOutreach } from './providers';

vi.mock('@/lib/ai/google-ai', () => ({ generateAiContent: vi.fn() }));
import { generateAiContent } from '@/lib/ai/google-ai';

afterEach(() => { vi.restoreAllMocks(); vi.clearAllMocks(); vi.unstubAllGlobals(); });

describe('ApplyBolt normalization', () => {
  it('marks email verified only for provider valid status and matching employer', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({
      found: true, email: 'person@microsoft.com', validation: 'valid', company: 'Microsoft',
    }) }));
    expect(await lookupWorkEmail('https://linkedin.com/in/person-1', 'Microsoft'))
      .toEqual({ email: 'person@microsoft.com', status: 'verified' });
    expect(fetch).toHaveBeenCalledWith('https://api.applybolt.app/public/findEmailByLinkedIn', expect.objectContaining({ method: 'POST' }));
    vi.unstubAllGlobals();
  });

  it.each([
    [{ found: false }, 'not_found'],
    [{ found: true, email: 'person@example.com', validation: 'unknown', company: 'Microsoft' }, 'unverified'],
    [{ found: true, email: 'person@example.com', validation: 'valid', company: 'Other Company' }, 'unverified'],
    [{ found: true, email: 'person@example.com', validation: 'valid' }, 'unverified'],
  ])('does not call %s verified', async (result, status) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => result }));
    expect((await lookupWorkEmail('https://linkedin.com/in/person-1', 'Microsoft')).status).toBe(status);
    vi.unstubAllGlobals();
  });

  it('keeps provider errors distinct from email not found', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    expect(await lookupWorkEmail('https://linkedin.com/in/person-1', 'Microsoft'))
      .toEqual({ email: null, status: 'provider_error' });
    vi.unstubAllGlobals();
  });
});

it('resolves only Google grounding redirects without following their destination', async () => {
  const mock = vi.fn().mockResolvedValue({ status: 302, headers: new Headers({
    location: 'https://www.linkedin.com/in/person-1',
  }) });
  vi.stubGlobal('fetch', mock);
  const sources = await resolveGroundingSources([
    { uri: 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/example', title: 'Profile' },
    { uri: 'https://example.com/page', title: 'Other' },
  ]);
  expect(sources[0].uri).toBe('https://www.linkedin.com/in/person-1');
  expect(sources[1].uri).toBe('https://example.com/page');
  expect(mock).toHaveBeenCalledTimes(1);
  expect(mock.mock.calls[0][1]).toMatchObject({ redirect: 'manual' });
});

describe('bundle writing', () => {
  it('uses one ungrounded Gemini call for all contacts', async () => {
    const first = '00000000-0000-4000-8000-000000000001';
    const second = '00000000-0000-4000-8000-000000000002';
    vi.mocked(generateAiContent).mockResolvedValue({ text: JSON.stringify({ drafts: [
      { contactId: first, subject: 'Hello', emailBody: 'Short email', linkedinNote: 'Short note' },
      { contactId: second, subject: null, emailBody: null, linkedinNote: 'Short note' },
    ] }) } as never);
    const result = await writeOutreach({ userId: 'user', companyName: 'Microsoft', targetRole: 'Engineer', userIntent: '',
      profile: { name: 'Candidate', yearsExperience: null, skills: [], roleTitles: [] },
      contacts: [
        { id: first, name: 'A', title: 'Recruiter', relevanceReason: 'Relevant', linkedinUrl: 'https://linkedin.com/in/a', email: 'a@microsoft.com', emailStatus: 'verified' },
        { id: second, name: 'B', title: 'Manager', relevanceReason: 'Relevant', linkedinUrl: 'https://linkedin.com/in/b', email: null, emailStatus: 'not_found' },
      ],
    });
    expect(result.drafts).toHaveLength(2);
    expect(generateAiContent).toHaveBeenCalledTimes(1);
    expect(vi.mocked(generateAiContent).mock.calls[0][0].config?.tools).toBeUndefined();
  });
  it('normalizes role families for cache reuse', () => {
    expect(roleFamily('Senior Backend Engineer')).toBe('software-engineering');
    expect(roleFamily('Product Manager')).toBe('product');
  });
});
