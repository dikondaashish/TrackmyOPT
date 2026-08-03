import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createUser: vi.fn(),
  deleteUser: vi.fn(),
  profileUpsert: vi.fn(),
  optStatusUpsert: vi.fn(),
  rpc: vi.fn(),
  checkRateLimitByIP: vi.fn(),
  checkRateLimitByAccount: vi.fn(),
}));

vi.mock('next/server', async (importOriginal) => {
  const original = await importOriginal<typeof import('next/server')>();
  return {
    ...original,
    after: vi.fn(),
  };
});
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      admin: {
        createUser: mocks.createUser,
        deleteUser: mocks.deleteUser,
      },
    },
    from: vi.fn((table: string) => ({
      upsert:
        table === 'profiles' ? mocks.profileUpsert : mocks.optStatusUpsert,
    })),
    rpc: mocks.rpc,
  })),
}));
vi.mock('@/lib/auth/api-rate-limit', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('@/lib/auth/api-rate-limit')>();
  return {
    ...original,
    checkRateLimitByIP: mocks.checkRateLimitByIP,
    checkRateLimitByAccount: mocks.checkRateLimitByAccount,
  };
});
vi.mock('@/lib/notifications/transactional/lifecycle', () => ({
  sendFreeWelcomeEmail: vi.fn(),
}));

import { POST } from './route';

function signupRequest(overrides: Record<string, unknown> = {}) {
  return new NextRequest('https://www.trackmyopt.com/api/manual/signup', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': '203.0.113.10',
    },
    body: JSON.stringify({
      firstName: 'Asha',
      lastName: 'Patel',
      email: 'asha@example.com',
      password: 'StrongPassword123!',
      programEnd: '05/20/2027',
      optEadEnd: '05/20/2028',
      optStart: '05/21/2027',
      isStem: false,
      ...overrides,
    }),
  });
}

describe('manual signup consistency', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const allowed = {
      success: true,
      limit: 5,
      remaining: 4,
      reset: 1_800_000_000,
    };
    mocks.checkRateLimitByIP.mockResolvedValue(allowed);
    mocks.checkRateLimitByAccount.mockResolvedValue(allowed);
    mocks.createUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });
    mocks.deleteUser.mockResolvedValue({ data: {}, error: null });
    mocks.profileUpsert.mockResolvedValue({ error: null });
    mocks.optStatusUpsert.mockResolvedValue({ error: null });
    mocks.rpc.mockResolvedValue({ error: null });
  });

  it('validates real calendar dates before creating an auth user', async () => {
    const response = await POST(signupRequest({ programEnd: '02/31/2027' }));

    expect(response.status).toBe(400);
    expect(mocks.createUser).not.toHaveBeenCalled();
  });

  it('deletes a newly-created auth user when the required profile write fails', async () => {
    mocks.profileUpsert.mockResolvedValue({
      error: { message: 'profile write failed' },
    });

    const response = await POST(signupRequest());

    expect(response.status).toBe(500);
    expect(mocks.deleteUser).toHaveBeenCalledWith('user-1');
    expect(mocks.optStatusUpsert).not.toHaveBeenCalled();
  });

  it('deletes a newly-created auth user when the required OPT write fails', async () => {
    mocks.optStatusUpsert.mockResolvedValue({
      error: { message: 'opt write failed' },
    });

    const response = await POST(signupRequest());

    expect(response.status).toBe(500);
    expect(mocks.deleteUser).toHaveBeenCalledWith('user-1');
  });
});
