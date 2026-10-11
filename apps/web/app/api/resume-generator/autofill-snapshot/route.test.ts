import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ getUserId: vi.fn(), createClient: vi.fn() }));
vi.mock('@/lib/auth/get-user-id', () => ({ getUserId: mocks.getUserId }));
vi.mock('@supabase/supabase-js', () => ({ createClient: mocks.createClient }));
vi.mock('@/lib/upstash-redis', () => ({ hasUpstashRedisConfig: () => false }));
vi.mock('@/lib/api/cors-policy', () => ({ corsHeadersWebAndExtension: () => ({}) }));
vi.mock('@/lib/resume/extract-autofill-snapshot', () => ({
  FINAL_LATEX_MAX_CHARS: 50_000, hashFinalLatex: () => 'hash', extractAutofillSnapshot: vi.fn(),
}));

const { POST } = await import('./route');
const { extractAutofillSnapshot } = await import('@/lib/resume/extract-autofill-snapshot');
const request = (body: unknown) => new NextRequest('https://www.trackmyopt.com/api/resume-generator/autofill-snapshot', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});

describe('POST /api/resume-generator/autofill-snapshot', () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.getUserId.mockResolvedValue('user-1'); });
  it('requires authentication', async () => {
    mocks.getUserId.mockResolvedValue(null);
    expect((await POST(request({}))).status).toBe(401);
  });
  it('rejects invalid source resume ids before database access', async () => {
    expect((await POST(request({ finalLatex: '\\documentclass{article}', sourceResumeId: 'wrong' }))).status).toBe(400);
    expect(mocks.createClient).not.toHaveBeenCalled();
  });
  it('reconciles a pasted resume against its own text without database access', async () => {
    vi.mocked(extractAutofillSnapshot).mockResolvedValue({
      ok: true,
      generatedContentHash: 'hash',
      snapshot: { contact: {}, skills: [], experience: [], education: [], certifications: [] },
    });
    const response = await POST(request({
      finalLatex: '\\documentclass{article}',
      sourceResumeId: '__pasted__',
      sourceResumeText: 'Acme Analytics\nSenior Data Engineer',
    }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true, structuredFieldsAvailable: true });
    expect(extractAutofillSnapshot).toHaveBeenCalledWith({
      finalLatex: '\\documentclass{article}',
      sourceResumeText: 'Acme Analytics\nSenior Data Engineer',
    });
    expect(mocks.createClient).not.toHaveBeenCalled();
  });
  it('requires pasted text for __pasted__ and rejects it for stored resumes', async () => {
    expect((await POST(request({ finalLatex: 'x', sourceResumeId: '__pasted__' }))).status).toBe(400);
    expect((await POST(request({
      finalLatex: 'x', sourceResumeId: '__latest__', sourceResumeText: 'Injected evidence',
    }))).status).toBe(400);
    expect(mocks.createClient).not.toHaveBeenCalled();
  });
});
