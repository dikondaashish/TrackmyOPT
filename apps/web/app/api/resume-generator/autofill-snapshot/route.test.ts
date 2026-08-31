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
});
