import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getUserId: vi.fn(),
  isKnownTemplateId: vi.fn(),
  loadTemplateSource: vi.fn(),
  normalizeAccentHex: vi.fn(),
  compileLatex: vi.fn(),
}));

vi.mock('next/cache', () => ({
  unstable_cache: (fn: (...args: never[]) => unknown) => fn,
}));
vi.mock('@/lib/auth/get-user-id', () => ({ getUserId: mocks.getUserId }));
vi.mock('@/lib/documents/template-source', () => ({
  isKnownTemplateId: mocks.isKnownTemplateId,
  loadTemplateSource: mocks.loadTemplateSource,
  normalizeAccentHex: mocks.normalizeAccentHex,
}));
vi.mock('@/lib/resume/latex-compiler', () => ({ compileLatex: mocks.compileLatex }));

const { GET } = await import('./route');

describe('GET /api/resume-generator/template-preview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUserId.mockResolvedValue('user-1');
    mocks.normalizeAccentHex.mockReturnValue(null);
  });

  it('requires authentication', async () => {
    mocks.getUserId.mockResolvedValue(null);
    expect((await GET(new NextRequest('https://www.trackmyopt.com/api/resume-generator/template-preview?templateId=modern'))).status).toBe(401);
  });

  it('does not compile an unknown template', async () => {
    mocks.isKnownTemplateId.mockReturnValue(false);
    const response = await GET(new NextRequest('https://www.trackmyopt.com/api/resume-generator/template-preview?templateId=unknown'));
    expect(response.status).toBe(404);
    expect(mocks.compileLatex).not.toHaveBeenCalled();
  });

  it('returns 503 when compile fails', async () => {
    mocks.isKnownTemplateId.mockReturnValue(true);
    mocks.loadTemplateSource.mockReturnValue({ tex: '\\documentclass{article}\\begin{document}x\\end{document}' });
    mocks.compileLatex.mockResolvedValue({ ok: false, error: 'boom' });
    const response = await GET(new NextRequest('https://www.trackmyopt.com/api/resume-generator/template-preview?templateId=tech'));
    expect(response.status).toBe(503);
    expect(mocks.compileLatex).toHaveBeenCalledWith(
      '\\documentclass{article}\\begin{document}x\\end{document}',
      { publicFallback: true },
    );
  });

  it('compiles a known template only once', async () => {
    mocks.isKnownTemplateId.mockReturnValue(true);
    mocks.loadTemplateSource.mockReturnValue({ tex: '\\documentclass{article}\\begin{document}Hi\\end{document}' });
    mocks.compileLatex.mockResolvedValue({ ok: true, pdf: new Uint8Array([1, 2, 3, 4]).buffer, compiler: 'test' });

    const req = () => new NextRequest('https://www.trackmyopt.com/api/resume-generator/template-preview?templateId=academic');
    const first = await GET(req());
    const second = await GET(req());

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(first.headers.get('Content-Type')).toBe('application/pdf');
    expect(mocks.compileLatex).toHaveBeenCalledTimes(1);
  });
});
