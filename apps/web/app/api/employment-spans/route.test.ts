import { NextRequest } from 'next/server';
import { beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ auth: vi.fn(), from: vi.fn() }));
vi.mock('@supabase/ssr', () => ({ createServerClient: () => ({ auth: { getUser: mocks.auth }, from: mocks.from }) }));
vi.mock('next/headers', () => ({ cookies: async () => ({ get: vi.fn(), set: vi.fn() }) }));
import { POST } from './route';

const valid = { employer_name: 'Example', start_date: '09/01/2026', end_date: '09/22/2026' };
function request(spans: unknown) {
  return new NextRequest('https://www.trackmyopt.com/api/employment-spans', { method: 'POST', body: JSON.stringify({ spans }) });
}
function query(error: unknown = null) {
  const q = { insert: vi.fn(), update: vi.fn(), eq: vi.fn(), select: vi.fn(), single: vi.fn(async () => ({ data: error ? null : { id: 'saved' }, error })) };
  for (const key of ['insert', 'update', 'eq', 'select'] as const) q[key].mockReturnValue(q);
  return q;
}
beforeEach(() => { vi.clearAllMocks(); mocks.auth.mockResolvedValue({ data: { user: { id: 'owner' } } }); });

it.each([
  { ...valid, start_date: '02/30/2026' },
  { ...valid, end_date: '02/29/2025' },
  { ...valid, end_date: '08/31/2026' },
  { ...valid, employer_name: ' ' },
  { ...valid, start_date: '' },
  { ...valid, start_date: 123 },
  { ...valid, end_date: {} },
  { ...valid, id: 123 },
  null,
])('rejects invalid history before any write: %j', async (span) => {
  const q = query(); mocks.from.mockReturnValue(q);
  const response = await POST(request([valid, span]));
  expect(response.status).toBe(400);
  expect(q.insert).not.toHaveBeenCalled();
  expect(q.update).not.toHaveBeenCalled();
});

it.each([undefined, null, [], {}].map(value => [value]))('rejects missing/empty spans: %j', async (spans) => {
  expect((await POST(request(spans))).status).toBe(400);
});

it.each([undefined, 'existing-job'])('reports database failure for insert/update: %s', async (id) => {
  mocks.from.mockReturnValue(query({ message: 'unavailable' }));
  const response = await POST(request([{ ...valid, id }]));
  expect(response.status).toBe(500);
  expect((await response.json()).ok).toBe(false);
});

it('saves same-day employment and leap days without shifting dates', async () => {
  const q = query(); mocks.from.mockReturnValue(q);
  expect((await POST(request([{ ...valid, start_date: '02/29/2024', end_date: '02/29/2024' }]))).status).toBe(200);
  expect(q.insert).toHaveBeenCalledWith({ user_id: 'owner', employer_name: 'Example', start_date: '2024-02-29', end_date: '2024-02-29' });
});

it('scopes updates to the signed-in user and allows current jobs', async () => {
  const q = query(); mocks.from.mockReturnValue(q);
  expect((await POST(request([{ ...valid, id: 'existing-job', end_date: null }]))).status).toBe(200);
  expect(q.eq).toHaveBeenCalledWith('user_id', 'owner');
  expect(q.update).toHaveBeenCalledWith({ employer_name: 'Example', start_date: '2026-09-01', end_date: null });
});

it('requires authentication before database access', async () => {
  mocks.auth.mockResolvedValue({ data: { user: null } });
  expect((await POST(request([valid]))).status).toBe(401);
  expect(mocks.from).not.toHaveBeenCalled();
});
