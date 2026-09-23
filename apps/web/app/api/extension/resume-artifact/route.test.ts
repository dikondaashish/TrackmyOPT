import { NextRequest } from 'next/server';
import { beforeEach, expect, it, vi } from 'vitest';
import {
  buildGeneratedResumeArtifactV1,
  RESUME_ARTIFACT_TTL_MS,
} from '../../../../../extension/src/resume-artifact-lifecycle';

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  auth: vi.fn(),
  limit: vi.fn(),
}));
vi.mock('@/lib/supabase/admin', () => ({
  getSupabaseAdminClient: () => ({ from: mocks.from }),
}));
vi.mock('@/lib/auth/get-user-id', () => ({ getUserId: mocks.auth }));
vi.mock('@/lib/auth/rate-limit', () => ({
  default: () => ({ check: mocks.limit }),
}));
import { GET, POST } from './route';
const listing =
  'https://jobs.ashbyhq.com/acme/93609e15-0561-4fe5-b5d4-865cf5ff6083';
function query(result: unknown) {
  const q: any = {};
  for (const key of [
    'select',
    'eq',
    'order',
    'limit',
    'insert',
    'delete',
    'in',
  ])
    q[key] = vi.fn(() => q);
  q.maybeSingle = vi.fn(async () => result);
  q.then = (resolve: any) => Promise.resolve(result).then(resolve);
  return q;
}
async function fixture() {
  return (
    await buildGeneratedResumeArtifactV1({
      sourceResumeId: 'resume-1',
      sourceResumeFilename: 'base.pdf',
      templateId: 'classic',
      jobKey: listing,
      jobContext: {
        jobUrl: listing,
        companyName: 'Acme',
        roleTitle: 'Engineer',
      },
      finalLatex: 'Example resume',
      pdfBase64: btoa('%PDF-fixture'),
      pdfFilename: 'Applicant_Resume_Engineer.pdf',
      generatedAt: new Date(Date.now() - 86400000).toISOString(),
    })
  ).artifact;
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.mockResolvedValue('user-1');
  mocks.limit.mockResolvedValue({ isRateLimited: false });
});
it('returns original creation date and account-scoped PDF with a fresh short lease', async () => {
  const artifact = await fixture();
  const candidate = {
    id: 'row-1',
    source_url: listing,
    requisition_id: null,
    created_at: artifact.generatedAt,
    expires_at: new Date(Date.now() + 86400000).toISOString(),
  };
  const candidates = query({ data: [candidate], error: null });
  const read = query({ data: { artifact }, error: null });
  mocks.from.mockReturnValueOnce(candidates).mockReturnValueOnce(read);
  const response = await GET(
    new NextRequest(
      `https://example.test/api/extension/resume-artifact?jobUrl=${encodeURIComponent(listing + '/application?utm_source=email')}`
    )
  );
  const data = await response.json();
  expect(data.generatedAt).toBe(artifact.generatedAt);
  expect(data.artifact.pdf).toEqual(artifact.pdf);
  expect(
    Date.parse(data.artifact.expiresAt) - Date.parse(data.artifact.generatedAt)
  ).toBe(RESUME_ARTIFACT_TTL_MS);
  expect(response.headers.get('Cache-Control')).toBe('private, no-store');
  expect(candidates.eq).toHaveBeenCalledWith('user_id', 'user-1');
  expect(read.eq).toHaveBeenCalledWith('user_id', 'user-1');
});
it('never deletes the previous saved resume when replacement insert fails', async () => {
  const artifact = await fixture();
  const old = query({
    data: [
      {
        id: 'old',
        source_url: listing,
        requisition_id: null,
        created_at: artifact.generatedAt,
        expires_at: new Date(Date.now() + 86400000).toISOString(),
      },
    ],
    error: null,
  });
  const insert = query({ error: { message: 'Unavailable' } });
  mocks.from.mockReturnValueOnce(old).mockReturnValueOnce(insert);
  const response = await POST(
    new NextRequest('https://example.test/api/extension/resume-artifact', {
      method: 'POST',
      body: JSON.stringify({ artifact }),
    })
  );
  expect(response.status).toBe(500);
  expect(mocks.from).toHaveBeenCalledTimes(2);
  expect(insert.delete).not.toHaveBeenCalled();
});
it('rejects unsigned requests before accessing resume storage', async () => {
  mocks.auth.mockResolvedValue(null);
  expect(
    (
      await GET(
        new NextRequest(
          'https://example.test/api/extension/resume-artifact?jobUrl=' + listing
        )
      )
    ).status
  ).toBe(401);
  expect(mocks.from).not.toHaveBeenCalled();
});
