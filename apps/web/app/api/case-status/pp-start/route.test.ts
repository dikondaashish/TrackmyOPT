import { beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { PATCH } from './route';

const mocks = vi.hoisted(() => ({ auth: vi.fn(), createClient: vi.fn() }));
vi.mock('@/lib/auth/get-user-id', () => ({ getUserId: mocks.auth }));
vi.mock('@supabase/supabase-js', () => ({ createClient: mocks.createClient }));
const request = (date: string) => new NextRequest('https://example.test/api/case-status/pp-start', { method: 'PATCH', body: JSON.stringify({ case_id: 'test-case', pp_start_date: date }), headers: { 'Content-Type': 'application/json' } });

beforeEach(() => { vi.clearAllMocks(); mocks.auth.mockResolvedValue('test-user'); });

it.each(['2026-02-30', '9999-01-01', 'May 12', 'not-a-date'])('rejects an invalid or future date before database access: %s', async date => {
  expect((await PATCH(request(date))).status).toBe(400);
  expect(mocks.createClient).not.toHaveBeenCalled();
});

it('requires authentication', async () => {
  mocks.auth.mockResolvedValue(null);
  expect((await PATCH(request('2026-05-12'))).status).toBe(401);
  expect(mocks.createClient).not.toHaveBeenCalled();
});

it.each([true, false])('scopes case lookup and date updates to the signed-in user (owned=%s)', async owned => {
  const query = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), update: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: owned ? { id: 'test-case' } : null }), single: vi.fn().mockResolvedValue({ data: { id: 'test-case', pp_start_date: '2026-05-12' }, error: null }) };
  mocks.createClient.mockReturnValue({ from: () => query });
  expect((await PATCH(request('2026-05-12'))).status).toBe(owned ? 200 : 404);
  expect(query.eq).toHaveBeenCalledWith('user_id', 'test-user');
  expect(query.eq).toHaveBeenCalledWith('id', 'test-case');
  expect(query.update).toHaveBeenCalledTimes(owned ? 1 : 0);
});
