import { NextRequest } from 'next/server';
import { beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ getUser: vi.fn(), mintToken: vi.fn() }));
vi.mock('next/headers', () => ({ cookies: async () => ({ get: () => undefined, set: () => undefined }) }));
vi.mock('@supabase/ssr', () => ({ createServerClient: () => ({ auth: { getUser: mocks.getUser } }) }));
vi.mock('@/lib/auth/jwt', () => ({ mintToken: mocks.mintToken }));

import { GET } from './route';

const request = () => new NextRequest('https://www.trackmyopt.com/api/extension/token');

beforeEach(() => {
  mocks.getUser.mockReset();
  mocks.mintToken.mockReset().mockResolvedValue('signed.jwt.token');
});

it('returns the user id with the token so the extension can keep the tailored resume for Prefill', async () => {
  mocks.getUser.mockResolvedValue({ data: { user: { id: 'user-1', email: 'a@example.test' } }, error: null });
  const response = await GET(request());
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ token: 'signed.jwt.token', userId: 'user-1' });
  expect(mocks.mintToken).toHaveBeenCalledWith({ userId: 'user-1', email: 'a@example.test' });
});

it('rejects a request without a web session', async () => {
  mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
  const response = await GET(request());
  expect(response.status).toBe(401);
  expect(mocks.mintToken).not.toHaveBeenCalled();
});
