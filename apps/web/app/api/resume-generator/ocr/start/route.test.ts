import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ getUserId: vi.fn(), isAvailable: vi.fn() }));

vi.mock('@/lib/auth/get-user-id', () => ({ getUserId: mocks.getUserId }));
vi.mock('@/lib/aws/textract', () => ({
  textractService: { isAvailable: mocks.isAvailable, startDocumentTextDetection: vi.fn() },
}));
vi.mock('@aws-sdk/client-s3', () => ({ S3Client: vi.fn(), PutObjectCommand: vi.fn() }));
vi.mock('@supabase/supabase-js', () => ({ createClient: vi.fn() }));

const { POST } = await import('./route');

function request(body: unknown) {
  return new NextRequest('https://www.trackmyopt.com/api/resume-generator/ocr/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/resume-generator/ocr/start', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUserId.mockResolvedValue('user-1');
  });

  it('requires an authenticated user', async () => {
    mocks.getUserId.mockResolvedValue(null);

    expect((await POST(request({}))).status).toBe(401);
  });

  it('rejects malformed, non-PDF, and oversized-looking base64 before calling OCR', async () => {
    for (const fileBuffer of ['not base64', Buffer.from('not pdf').toString('base64'), 'a'.repeat(13_981_020)]) {
      const response = await POST(request({ fileBuffer, filename: '../../resume.pdf' }));
      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toMatchObject({ error: 'A valid PDF file buffer is required' });
    }
    expect(mocks.isAvailable).not.toHaveBeenCalled();
  });
});
