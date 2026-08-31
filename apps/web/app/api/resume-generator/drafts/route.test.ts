import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ createClient: vi.fn(), getUser: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({ createClient: mocks.createClient }));

const { POST, DELETE } = await import('./route');
const request = (method: 'POST' | 'DELETE', body?: unknown, query = '') => new NextRequest(
  `https://www.trackmyopt.com/api/resume-generator/drafts${query}`,
  { method, headers: body === undefined ? undefined : { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) },
);

describe('resume draft persistence API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    mocks.createClient.mockResolvedValue({ auth: { getUser: mocks.getUser } });
  });

  it('rejects a draft write without a payload before persistence', async () => {
    const response = await POST(request('POST', { draftKey: 'draft-1' }));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ code: 'invalid_input' });
  });

  it('rejects draft deletion without an explicit key', async () => {
    const response = await DELETE(request('DELETE'));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ code: 'invalid_input' });
  });
});
