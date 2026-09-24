import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createClient } from '@/lib/supabase/server';
import { POST } from './route';

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));

describe('POST /api/documents/passcode/setup', () => {
  beforeEach(() => vi.clearAllMocks());

  it('refuses to replace an existing passcode', async () => {
    const insert = vi.fn();
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: { id: 'user-1' } }, error: null }) },
      from: () => ({
        select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { id: 'passcode-1' }, error: null }) }) }),
        insert,
      }),
    } as never);

    const response = await POST(new NextRequest('https://www.trackmyopt.com/api/documents/passcode/setup', {
      method: 'POST',
      body: JSON.stringify({ passcode: '123456' }),
    }));

    expect(response.status).toBe(409);
    expect(insert).not.toHaveBeenCalled();
  });
});
