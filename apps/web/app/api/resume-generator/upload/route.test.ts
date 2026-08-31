import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ getUserId: vi.fn() }));

vi.mock('@/lib/auth/get-user-id', () => ({ getUserId: mocks.getUserId }));
vi.mock('@/lib/api/cors-policy', () => ({
  corsHeadersWebAndExtension: (req: NextRequest) => ({
    'Access-Control-Allow-Origin': req.headers.get('origin') || 'https://www.trackmyopt.com',
  }),
}));

const { POST } = await import('./route');

function request(file?: Blob, filename = 'resume.txt', origin?: string) {
  const formData = new FormData();
  if (file) formData.append('file', file, filename);
  const request = new NextRequest('https://www.trackmyopt.com/api/resume-generator/upload', {
    method: 'POST',
    headers: origin ? { origin } : undefined,
  });
  vi.spyOn(request, 'formData').mockResolvedValue(formData);
  return request;
}

describe('POST /api/resume-generator/upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUserId.mockResolvedValue('user-1');
  });

  it('requires authentication before parsing an uploaded file', async () => {
    mocks.getUserId.mockResolvedValue(null);

    const response = await POST(request(new Blob(['x']), 'resume.txt'));

    expect(response.status).toBe(401);
  });

  it('accepts a valid text resume from the extension origin', async () => {
    const text = 'Linux administrator with five years of production infrastructure experience and incident response.';
    const response = await POST(
      request(new Blob([text], { type: 'text/plain' }), 'resume.txt', 'chrome-extension://hfljbefkccdmlnhclfojlafipjnjbajm'),
    );

    await expect(response.json()).resolves.toMatchObject({ success: true, text, filename: 'resume.txt' });
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
      'chrome-extension://hfljbefkccdmlnhclfojlafipjnjbajm',
    );
  });

  it('rejects unsupported file types without attempting an external parser', async () => {
    const response = await POST(request(new Blob(['not an image'], { type: 'image/png' }), 'resume.png'));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: 'Unsupported file type.' });
  });
});
