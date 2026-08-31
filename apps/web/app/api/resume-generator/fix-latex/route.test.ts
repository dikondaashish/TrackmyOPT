import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getUserId: vi.fn(),
  rateLimitCheck: vi.fn(),
  buildFixSyntaxPrompt: vi.fn(),
  generateAiContent: vi.fn(),
}));

vi.mock('@/lib/auth/get-user-id', () => ({ getUserId: mocks.getUserId }));
vi.mock('@/lib/auth/rate-limit', () => ({ default: () => ({ check: mocks.rateLimitCheck }) }));
vi.mock('@/lib/ai/prompts/fix-syntax', () => ({ buildFixSyntaxPrompt: mocks.buildFixSyntaxPrompt }));
vi.mock('@/lib/ai/google-ai', () => ({ generateAiContent: mocks.generateAiContent }));
vi.mock('@/lib/api/cors-policy', () => ({
  corsHeadersWebAndExtension: (req: NextRequest) => ({
    'Access-Control-Allow-Origin': req.headers.get('origin') || 'https://www.trackmyopt.com',
  }),
}));

const { POST } = await import('./route');

function request(body: unknown, origin?: string) {
  return new NextRequest('https://www.trackmyopt.com/api/resume-generator/fix-latex', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(origin ? { origin } : {}) },
    body: JSON.stringify(body),
  });
}

describe('POST /api/resume-generator/fix-latex', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUserId.mockResolvedValue('user-1');
    mocks.rateLimitCheck.mockResolvedValue({ isRateLimited: false, unavailable: false });
    mocks.buildFixSyntaxPrompt.mockReturnValue('repair prompt');
    mocks.generateAiContent.mockResolvedValue({ text: '```latex\n\\documentclass{article}\n```' });
  });

  it('rejects anonymous extension calls with matching CORS headers', async () => {
    mocks.getUserId.mockResolvedValue(null);

    const response = await POST(
      request({ latexCode: 'x', errorMessage: 'error' }, 'chrome-extension://hfljbefkccdmlnhclfojlafipjnjbajm'),
    );

    expect(response.status).toBe(401);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
      'chrome-extension://hfljbefkccdmlnhclfojlafipjnjbajm',
    );
  });

  it('validates required fields before calling the model', async () => {
    const response = await POST(request({ latexCode: '' }));

    expect(response.status).toBe(400);
    expect(mocks.generateAiContent).not.toHaveBeenCalled();
  });

  it('strips code fences from a repaired document', async () => {
    const response = await POST(request({ latexCode: '\\bad', errorMessage: 'Undefined control sequence' }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ latex: '\\documentclass{article}' });
    expect(mocks.generateAiContent).toHaveBeenCalledWith(
      expect.objectContaining({ task: 'latex_fix', userId: 'user-1' }),
    );
  });
});
