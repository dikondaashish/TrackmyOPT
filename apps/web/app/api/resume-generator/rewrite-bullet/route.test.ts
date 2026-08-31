import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ getUserId: vi.fn(), rewriteBulletPoints: vi.fn() }));
vi.mock('@/lib/auth/get-user-id', () => ({ getUserId: mocks.getUserId }));
vi.mock('@/lib/ai/gemini-ai', () => ({ rewriteBulletPoints: mocks.rewriteBulletPoints }));

const { POST } = await import('./route');
const request = (body: unknown) => new NextRequest('https://www.trackmyopt.com/api/resume-generator/rewrite-bullet', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});

describe('POST /api/resume-generator/rewrite-bullet', () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.getUserId.mockResolvedValue('user-1'); });
  it('requires authentication', async () => {
    mocks.getUserId.mockResolvedValue(null);
    expect((await POST(request({ resumeText: 'r', jobDescription: 'j' }))).status).toBe(401);
  });
  it('validates both texts before calling the model', async () => {
    expect((await POST(request({ resumeText: 'r' }))).status).toBe(400);
    expect(mocks.rewriteBulletPoints).not.toHaveBeenCalled();
  });
});
