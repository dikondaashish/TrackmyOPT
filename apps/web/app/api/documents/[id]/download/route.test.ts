// @vitest-environment node
import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createClient } from '@/lib/supabase/server';
import { generateSignedUrl } from '@/lib/aws/s3';
import { GET } from './route';

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));
vi.mock('@/lib/aws/s3', () => ({ generateSignedUrl: vi.fn() }));

const context = { params: Promise.resolve({ id: 'doc-1' }) };
const request = () => new NextRequest('https://example.com/api/documents/doc-1/download');
const row = { s3_key: 'documents/user-1/sample.pdf', filename: 'Sample letter.pdf', file_name: null, file_type: 'application/pdf' };

function database(user: { id: string } | null = { id: 'user-1' }, document: typeof row | null = row) {
  const eq = vi.fn().mockReturnThis();
  const builder = { select: vi.fn().mockReturnThis(), eq, single: vi.fn().mockResolvedValue({ data: document, error: null }) };
  const from = vi.fn().mockReturnValue(builder);
  vi.mocked(createClient).mockResolvedValue({ auth: { getUser: async () => ({ data: { user }, error: null }) }, from } as never);
  return { eq, from };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(generateSignedUrl).mockResolvedValue('https://storage.example.com/signed');
});
afterEach(() => vi.unstubAllGlobals());

describe('document downloads', () => {
  it('requires an account before looking up a document', async () => {
    const { from } = database(null);
    expect((await GET(request(), context)).status).toBe(401);
    expect(from).not.toHaveBeenCalled();
    expect(generateSignedUrl).not.toHaveBeenCalled();
  });

  it('returns 404 without accessing storage when the owned document is absent', async () => {
    const { eq } = database({ id: 'user-1' }, null);
    expect((await GET(request(), context)).status).toBe(404);
    expect(eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(eq).toHaveBeenCalledWith('id', 'doc-1');
    expect(generateSignedUrl).not.toHaveBeenCalled();
  });

  it('returns the original bytes with attachment headers', async () => {
    const { eq } = database();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('%PDF-1.4\nsynthetic')));
    const response = await GET(request(), context);
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('application/pdf');
    expect(response.headers.get('content-disposition')).toContain('attachment;');
    expect(await response.text()).toBe('%PDF-1.4\nsynthetic');
    expect(eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(generateSignedUrl).toHaveBeenCalledWith(row.s3_key);
  });

  it('returns an error instead of downloading a storage error page', async () => {
    database();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Access denied', { status: 403 })));
    const response = await GET(request(), context);
    expect(response.status).toBe(500);
    expect(response.headers.get('content-disposition')).toBeNull();
    expect(await response.json()).toEqual({ error: 'Failed to download document' });
  });
});
