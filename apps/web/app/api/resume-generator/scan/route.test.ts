import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getUserId: vi.fn(),
  checkAtsScanLimit: vi.fn(),
  trackAtsScan: vi.fn(),
  generateAiContent: vi.fn(),
}));

vi.mock('@/lib/auth/get-user-id', () => ({ getUserId: mocks.getUserId }));
vi.mock('@/lib/usage-limit', () => ({
  checkAtsScanLimit: mocks.checkAtsScanLimit,
  trackAtsScan: mocks.trackAtsScan,
}));
vi.mock('@/lib/ai/google-ai', () => ({
  generateAiContent: mocks.generateAiContent,
}));
vi.mock('@/lib/api/cors-policy', () => ({
  corsHeadersWebAndExtension: () => ({ 'Access-Control-Allow-Origin': 'https://www.trackmyopt.com' }),
}));
vi.mock('@/lib/validators/ats-checker', () => ({
  checkAtsCompliance: () => ({ passed: true, issues: [] }),
}));
vi.mock('@/lib/resume/latex-to-plain-text', () => ({
  latexToPlainText: (value: string) => value,
}));
vi.mock('@/lib/resume/bullet-metrics', () => ({
  analyzeLatexBulletMetrics: () => ({ ratio: 0.5, total: 2, withMetrics: 1 }),
}));
vi.mock('@/lib/resume/keyword-placement', () => ({
  computeKeywordPlacement: () => [],
}));

const { POST } = await import('./route');

const validAiAnalysis = {
  overallScore: 82,
  keywordMatch: {
    found: ['Linux'],
    missing: ['Python'],
    partial: [],
    score: 80,
    totalJdKeywords: 2,
    matchedCount: 1,
    placementScore: 80,
  },
  sectionScores: {
    summary: 80,
    experience: 80,
    skills: 90,
    education: 75,
    overall: 82,
  },
  bulletAnalysis: {
    total: 2,
    strong: 1,
    moderate: 1,
    weak: 0,
    score: 80,
  },
  improvements: ['Add Python experience with a concrete example.'],
  missingKeywordsByCategory: {
    required: ['Python'],
    preferred: [],
    methodologies: [],
  },
};

function request(overrides: Record<string, unknown> = {}) {
  return new NextRequest('https://www.trackmyopt.com/api/resume-generator/scan', {
    method: 'POST',
    body: JSON.stringify({
      generatedText: 'Built Linux systems and automated deployments.',
      jobDescription: 'Data Center Technician with Linux and Python.',
      latexCode: '\\begin{itemize}\\item Built Linux systems\\end{itemize}',
      ...overrides,
    }),
  });
}

describe('POST /api/resume-generator/scan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUserId.mockResolvedValue('11111111-1111-4111-8111-111111111111');
    mocks.checkAtsScanLimit.mockResolvedValue({
      allowed: true,
      limit: 3,
      usage: 0,
      tier: 'free',
    });
    mocks.trackAtsScan.mockResolvedValue({ ok: true, allowed: true, limit: 3, usage: 1 });
  });

  it('does not consume an ATS scan when the model returns malformed JSON', async () => {
    mocks.generateAiContent.mockResolvedValue({ text: 'This is not JSON.' });

    const response = await POST(request());

    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({
      code: 'ats_analysis_unavailable',
      scanConsumed: false,
    });
    expect(mocks.trackAtsScan).not.toHaveBeenCalled();
  });

  it('rejects malformed request fields before contacting the model or quota service', async () => {
    const response = await POST(request({ jobDescription: { unexpected: true } }));

    expect(response.status).toBe(400);
    expect(mocks.checkAtsScanLimit).not.toHaveBeenCalled();
    expect(mocks.generateAiContent).not.toHaveBeenCalled();
    expect(mocks.trackAtsScan).not.toHaveBeenCalled();
  });

  it('does not consume an ATS scan when JSON does not meet the analysis contract', async () => {
    mocks.generateAiContent.mockResolvedValue({
      text: JSON.stringify({ ...validAiAnalysis, overallScore: 'eighty two' }),
    });

    const response = await POST(request());

    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({
      code: 'ats_analysis_unavailable',
      scanConsumed: false,
    });
    expect(mocks.trackAtsScan).not.toHaveBeenCalled();
  });

  it('does not consume an ATS scan when the model request fails', async () => {
    mocks.generateAiContent.mockRejectedValue(new Error('provider timeout'));

    const response = await POST(request());

    expect(response.status).toBe(502);
    expect(await response.json()).toMatchObject({
      code: 'ats_analysis_unavailable',
      scanConsumed: false,
    });
    expect(mocks.trackAtsScan).not.toHaveBeenCalled();
  });

  it('consumes quota only after a validated ATS analysis is ready', async () => {
    mocks.generateAiContent.mockResolvedValue({ text: JSON.stringify(validAiAnalysis) });

    const response = await POST(request());

    expect(response.status).toBe(200);
    expect((await response.json()).score).toBe(82);
    expect(mocks.trackAtsScan).toHaveBeenCalledWith(
      '11111111-1111-4111-8111-111111111111',
      3
    );
    expect(mocks.generateAiContent.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.trackAtsScan.mock.invocationCallOrder[0]
    );
  });

  it('does not return a successful analysis when quota recording cannot be completed', async () => {
    mocks.generateAiContent.mockResolvedValue({ text: JSON.stringify(validAiAnalysis) });
    mocks.trackAtsScan.mockResolvedValue({ ok: false, error: 'database unavailable' });

    const response = await POST(request());

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({
      code: 'ats_quota_unavailable',
      scanConsumed: false,
    });
  });
});
