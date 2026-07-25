import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { textractService } from '@/lib/aws/textract';
import { getUserId } from '@/lib/auth/getUserId';
import { createClient } from '@supabase/supabase-js';

import { GET } from './route';

vi.mock('@/lib/auth/getUserId', () => ({ getUserId: vi.fn() }));
vi.mock('@/lib/aws/textract', () => ({
  textractService: { getDocumentTextDetection: vi.fn() },
}));
vi.mock('@supabase/supabase-js', () => ({ createClient: vi.fn() }));

function request(): NextRequest {
  return new NextRequest(
    'https://www.trackmyopt.com/api/resume-generator/ocr/status?textractJobId=job-123',
  );
}

function clientWithLookup(result: { data: unknown; error: unknown }) {
  const maybeSingle = vi.fn().mockResolvedValue(result);
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });
  return {
    from: vi.fn().mockReturnValue({ select }),
    lookup: { select, eq, maybeSingle },
  };
}

describe('OCR status ownership boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUserId).mockResolvedValue('user-1');
  });

  it('does not query Textract when the owner-bound job row is missing', async () => {
    const admin = clientWithLookup({ data: null, error: null });
    vi.mocked(createClient).mockReturnValue(admin as never);

    const response = await GET(request());

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      status: 'failed',
      error: 'OCR job not found',
    });
    expect(textractService.getDocumentTextDetection).not.toHaveBeenCalled();
  });

  it('fails closed when the ownership lookup itself fails', async () => {
    const admin = clientWithLookup({
      data: null,
      error: { message: 'database unavailable' },
    });
    vi.mocked(createClient).mockReturnValue(admin as never);

    const response = await GET(request());

    expect(response.status).toBe(503);
    expect(textractService.getDocumentTextDetection).not.toHaveBeenCalled();
  });

  it('rejects a job owned by another user before polling Textract', async () => {
    const admin = clientWithLookup({
      data: {
        user_id: 'user-2',
        status: 'IN_PROGRESS',
        extracted_text: null,
        error_message: null,
        file_name: 'resume.pdf',
      },
      error: null,
    });
    vi.mocked(createClient).mockReturnValue(admin as never);

    const response = await GET(request());

    expect(response.status).toBe(403);
    expect(textractService.getDocumentTextDetection).not.toHaveBeenCalled();
  });
});
