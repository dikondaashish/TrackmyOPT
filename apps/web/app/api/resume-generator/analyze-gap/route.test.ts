import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getUserId: vi.fn(),
  checkAtsScanLimit: vi.fn(),
  trackAtsScan: vi.fn(),
  analyzeAtsGap: vi.fn(),
}));

vi.mock('@/lib/auth/get-user-id', () => ({ getUserId: mocks.getUserId }));
vi.mock('@/lib/usage-limit', () => ({
  checkAtsScanLimit: mocks.checkAtsScanLimit,
  trackAtsScan: mocks.trackAtsScan,
}));
vi.mock('@/lib/ai/gemini-ai', () => ({ analyzeAtsGap: mocks.analyzeAtsGap }));
vi.mock('@/lib/api/cors-policy', () => ({ corsHeadersWebAndExtension: () => ({}) }));

const { POST } = await import('./route');

function request(body: unknown) {
  return new NextRequest('https://www.trackmyopt.com/api/resume-generator/analyze-gap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/resume-generator/analyze-gap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUserId.mockResolvedValue('user-1');
    mocks.checkAtsScanLimit.mockResolvedValue({ allowed: true, limit: 3, usage: 0 });
    mocks.trackAtsScan.mockResolvedValue({ ok: true });
    mocks.analyzeAtsGap.mockResolvedValue({ matchScore: 75 });
  });

  it('rejects non-string input before quota or AI work', async () => {
    const response = await POST(request({ resumeText: ['resume'], jobDescription: 'job' }));

    expect(response.status).toBe(400);
    expect(mocks.checkAtsScanLimit).not.toHaveBeenCalled();
    expect(mocks.analyzeAtsGap).not.toHaveBeenCalled();
  });

  it('records a scan only after a valid analysis is returned', async () => {
    const response = await POST(request({ resumeText: 'Linux administrator', jobDescription: 'Linux role' }));

    expect(response.status).toBe(200);
    expect(mocks.analyzeAtsGap).toHaveBeenCalledWith('Linux administrator', 'Linux role', 'user-1');
    expect(mocks.trackAtsScan).toHaveBeenCalledWith('user-1', 3);
  });
});
