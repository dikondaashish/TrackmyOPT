import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const USER_ID = '11111111-1111-4111-8111-111111111111';

const mocks = vi.hoisted(() => ({
  cookieGetUser: vi.fn(),
  cookieFrom: vi.fn(),
  adminGetUserById: vi.fn(),
  adminFrom: vi.fn(),
  verifyToken: vi.fn(),
  after: vi.fn(),
}));

vi.mock('next/server', async (importOriginal) => {
  const original = await importOriginal<typeof import('next/server')>();
  return {
    ...original,
    after: mocks.after,
  };
});

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: vi.fn(),
    set: vi.fn(),
  })),
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mocks.cookieGetUser },
    from: mocks.cookieFrom,
  })),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      admin: {
        getUserById: mocks.adminGetUserById,
      },
    },
    from: mocks.adminFrom,
  })),
}));

vi.mock('@/lib/auth/jwt', () => ({
  verifyToken: mocks.verifyToken,
}));

vi.mock('@/lib/notifications/transactional/lifecycle', () => ({
  sendFreeWelcomeEmail: vi.fn(),
}));

import { GET } from './route';

function tableResult(table: string) {
  if (table === 'profiles') {
    return {
      data: {
        timezone: 'America/New_York',
        is_stem_eligible: false,
        degree_level: 'masters',
        major_name: 'Computer Science',
      },
      error: null,
    };
  }
  if (table === 'opt_status') {
    return { data: null, error: { code: 'PGRST116' } };
  }
  if (table === 'employment_spans') {
    return { data: [], error: null };
  }
  if (table === 'application_profile') {
    return {
      data: {
        first_name: 'Extension',
        last_name: 'Candidate',
        application_email: 'jobs@example.com',
        phone: '5551234567',
        country: 'United States',
        street_address: '1 Main Street',
        city: 'Boston',
        state: 'MA',
        zip_code: '02110',
        county_district: 'Suffolk County',
        years_experience: 2,
        linkedin_url: null,
        github_url: 'https://github.com/extension-candidate',
        portfolio_url: null,
      },
      error: null,
    };
  }
  throw new Error(`Unexpected table: ${table}`);
}

function makeQuery(table: string) {
  const result = tableResult(table);
  const query: Record<string, unknown> = {};
  query.select = vi.fn(() => query);
  query.eq = vi.fn(() => query);
  query.single = vi.fn(async () => result);
  query.maybeSingle = vi.fn(async () => result);
  query.order = vi.fn(async () => result);
  return query;
}

describe('GET /api/me bearer authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cookieGetUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });
    mocks.cookieFrom.mockImplementation(() => {
      throw new Error('Bearer requests must not query through the anonymous cookie client');
    });
    mocks.verifyToken.mockResolvedValue({
      sub: USER_ID,
      userId: USER_ID,
      email: 'extension-user@example.com',
    });
    mocks.adminGetUserById.mockResolvedValue({
      data: {
        user: {
          id: USER_ID,
          email: 'extension-user@example.com',
          user_metadata: { first_name: 'Asha' },
        },
      },
      error: null,
    });
    mocks.adminFrom.mockImplementation((table: string) => makeQuery(table));
  });

  it('uses an authenticated server client for a verified extension bearer token', async () => {
    const response = await GET(
      new NextRequest('https://www.trackmyopt.com/api/me', {
        headers: {
          authorization: 'Bearer signed-extension-token',
          origin: 'chrome-extension://abcdefghijklmnop',
        },
      })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.user).toMatchObject({
      id: USER_ID,
      email: 'extension-user@example.com',
    });
    expect(body.profile).toMatchObject({
      timezone: 'America/New_York',
      degree_level: 'masters',
    });
    expect(body.applicationProfile).toMatchObject({
      first_name: 'Extension',
      application_email: 'jobs@example.com',
      country: 'United States',
      city: 'Boston',
      state: 'MA',
      zip_code: '02110',
      github_url: 'https://github.com/extension-candidate',
    });
    expect(mocks.adminGetUserById).toHaveBeenCalledWith(USER_ID);
    expect(mocks.adminFrom).toHaveBeenCalledWith('profiles');
    expect(mocks.adminFrom).toHaveBeenCalledWith('opt_status');
    expect(mocks.cookieFrom).not.toHaveBeenCalled();
  });
});
