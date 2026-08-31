import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ getUserId: vi.fn(), createClient: vi.fn() }));
vi.mock('@/lib/auth/get-user-id', () => ({ getUserId: mocks.getUserId }));
vi.mock('@supabase/supabase-js', () => ({ createClient: mocks.createClient }));
vi.mock('@/lib/api/cors-policy', () => ({ corsHeadersWebAndExtension: () => ({}) }));

const { GET } = await import('./route');

describe('GET /api/resume-generator/base-resume', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUserId.mockResolvedValue('user-1');
  });

  it('requires authentication before reading saved resumes', async () => {
    mocks.getUserId.mockResolvedValue(null);
    const response = await GET(new NextRequest('https://www.trackmyopt.com/api/resume-generator/base-resume'));
    expect(response.status).toBe(401);
    expect(mocks.createClient).not.toHaveBeenCalled();
  });

  it('rejects a non-UUID selected resume before querying Supabase', async () => {
    const response = await GET(new NextRequest('https://www.trackmyopt.com/api/resume-generator/base-resume?resumeId=not-a-uuid'));
    expect(response.status).toBe(400);
    expect(mocks.createClient).not.toHaveBeenCalled();
  });
});
