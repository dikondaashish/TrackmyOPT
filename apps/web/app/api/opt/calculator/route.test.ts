import { NextRequest } from 'next/server';
import { beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ auth: vi.fn(), from: vi.fn() }));
vi.mock('@/lib/auth/get-user-id', () => ({ getUserId: mocks.auth }));
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({ from: mocks.from }) }));
import { GET, POST } from './route';
import { getStemFilingWindow } from '@/lib/immigration/opt-calculations';
import { getStemFilingEmailDetails } from '@/lib/notifications/stem-filing-email';

const userId = '11111111-1111-4111-8111-111111111111';
function query(result: unknown) {
  const q: any = {};
  for (const key of ['select', 'eq', 'upsert', 'update', 'order']) q[key] = vi.fn(() => q);
  q.single = vi.fn(async () => result);
  q.then = (resolve: (r: unknown) => unknown) => Promise.resolve(result).then(resolve);
  return q;
}
function request(body: unknown) {
  return new NextRequest('https://www.trackmyopt.com/api/opt/calculator', {
    method: 'POST', body: JSON.stringify(body),
  });
}
beforeEach(() => { vi.clearAllMocks(); mocks.auth.mockResolvedValue(userId); });

it('saves the separate STEM date without reading/replaying other tool dates', async () => {
  const q = query({ data: [], error: null }); mocks.from.mockReturnValue(q);
  expect((await POST(request({ stem_dso_recommendation_date: '09/01/2026', user_id: 'other' }))).status).toBe(200);
  expect(q.upsert).toHaveBeenCalledWith({
    user_id: userId, stem_dso_recommendation_date: '2026-09-01',
    last_updated_field: 'stem_dso_recommendation_date', updated_at: expect.any(String),
  }, { onConflict: 'user_id' });
  expect(q.single).not.toHaveBeenCalled();
});

it.each([null, ''])('allows explicitly clearing the STEM date with %s', async (value) => {
  const q = query({ data: [], error: null }); mocks.from.mockReturnValue(q);
  expect((await POST(request({ stem_dso_recommendation_date: value }))).status).toBe(200);
  expect(q.upsert.mock.calls[0][0].stem_dso_recommendation_date).toBeNull();
});

it.each(['02/30/2026', '02/29/2025', '13/01/2026', '2026-09-01', 'bad', 123, {}, []])('rejects malformed dates without writing: %j', async (value) => {
  const q = query({ data: [], error: null }); mocks.from.mockReturnValue(q);
  const res = await POST(request({ stem_dso_recommendation_date: value }));
  expect(res.status).toBe(400);
  expect(q.upsert).not.toHaveBeenCalled();
});

it('accepts leap days and saves initial and STEM recommendations independently', async () => {
  const q = query({ data: [], error: null }); mocks.from.mockReturnValue(q);
  expect((await POST(request({ dso_recommendation_date: '02/29/2024', stem_dso_recommendation_date: '03/01/2025' }))).status).toBe(200);
  expect(q.upsert.mock.calls[0][0]).toMatchObject({ dso_recommendation_date: '2024-02-29', stem_dso_recommendation_date: '2025-03-01' });
});

it('does not clear STEM when an older client saves only an EAD date', async () => {
  const q = query({ data: [], error: null }); mocks.from.mockReturnValue(q);
  expect((await POST(request({ opt_ead_end_date: '12/31/2026' }))).status).toBe(200);
  expect(q.upsert.mock.calls[0][0]).not.toHaveProperty('stem_dso_recommendation_date');
  expect(q.upsert.mock.calls[0][0]).not.toHaveProperty('dso_recommendation_date');
});

it('returns both recommendation dates as calendar strings without timezone shifts', async () => {
  const q = query({ data: { dso_recommendation_date: '2025-09-01', stem_dso_recommendation_date: '2026-09-01' }, error: null });
  mocks.from.mockReturnValue(q);
  const res = await GET(new NextRequest('https://www.trackmyopt.com/api/opt/calculator'));
  expect((await res.json()).data).toMatchObject({ dso_recommendation_date: '09/01/2025', stem_dso_recommendation_date: '09/01/2026' });
  expect(q.eq).toHaveBeenCalledWith('user_id', userId);
});

it('reports storage errors, never false success', async () => {
  mocks.from.mockReturnValue(query({ data: null, error: { message: 'unavailable' } }));
  const res = await POST(request({ stem_dso_recommendation_date: '09/01/2026' }));
  expect(res.status).toBe(500); expect((await res.json()).ok).toBe(false);
});

it.each([{}, null, [], { _lastModifiedField: 'stem_dso_recommendation_date' }])('rejects a request with no date fields: %j', async (body) => {
  expect((await POST(request(body))).status).toBe(400);
});

it('rejects unauthenticated writes before database access', async () => {
  mocks.auth.mockResolvedValue(null);
  expect((await POST(request({ stem_dso_recommendation_date: '09/01/2026' }))).status).toBe(401);
  expect(mocks.from).not.toHaveBeenCalled();
});

it('round-trips save, edit, and clear from extension-format requests to portal and email calculations', async () => {
  const row: Record<string, string | null> = { opt_ead_end_date: '2026-12-31', dso_recommendation_date: '2025-01-01' };
  mocks.from.mockImplementation(() => {
    const q = query({ data: row, error: null });
    q.upsert.mockImplementation((patch: Record<string, string | null>) => { Object.assign(row, patch); return q; });
    return q;
  });
  for (const [input, expected] of [['10/01/2026', '2026-11-30'], ['11/15/2026', '2026-12-31'], [null, '2026-12-31']] as const) {
    expect((await POST(request({ stem_dso_recommendation_date: input }))).status).toBe(200);
    const loaded = await (await GET(new NextRequest('https://www.trackmyopt.com/api/opt/calculator'))).json();
    expect(loaded.data.stem_dso_recommendation_date).toBe(input);
    expect(loaded.data.dso_recommendation_date).toBe('01/01/2025');
    const portal = getStemFilingWindow(row.opt_ead_end_date!, row.stem_dso_recommendation_date);
    expect(portal.hardDeadline).toBe(expected);
    const email = getStemFilingEmailDetails(row.opt_ead_end_date!, row.stem_dso_recommendation_date);
    expect(email.hardDeadline).toBe(expected);
  }
});
