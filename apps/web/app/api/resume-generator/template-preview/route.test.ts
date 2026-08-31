import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ getUserId: vi.fn(), isKnownTemplateId: vi.fn() }));
vi.mock('@/lib/auth/get-user-id', () => ({ getUserId: mocks.getUserId }));
vi.mock('@/lib/documents/template-source', () => ({
  isKnownTemplateId: mocks.isKnownTemplateId,
  loadTemplateSource: vi.fn(),
  normalizeAccentHex: vi.fn(),
}));
vi.mock('@/lib/resume/latex-compiler', () => ({ compileLatex: vi.fn() }));

const { GET } = await import('./route');

describe('GET /api/resume-generator/template-preview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUserId.mockResolvedValue('user-1');
  });

  it('requires authentication', async () => {
    mocks.getUserId.mockResolvedValue(null);
    expect((await GET(new NextRequest('https://www.trackmyopt.com/api/resume-generator/template-preview?templateId=modern'))).status).toBe(401);
  });

  it('does not compile an unknown template', async () => {
    mocks.isKnownTemplateId.mockReturnValue(false);
    const response = await GET(new NextRequest('https://www.trackmyopt.com/api/resume-generator/template-preview?templateId=unknown'));
    expect(response.status).toBe(404);
  });
});
