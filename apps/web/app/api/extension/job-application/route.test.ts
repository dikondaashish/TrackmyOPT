import { NextRequest } from 'next/server';
import { beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ from: vi.fn(), auth: vi.fn(), limit: vi.fn(), event: vi.fn() }));
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({ from: mocks.from }) }));
vi.mock('@/lib/auth/get-user-id', () => ({ getUserId: mocks.auth }));
vi.mock('@/lib/auth/rate-limit', () => ({ default: () => ({ check: mocks.limit }) }));
vi.mock('@/lib/posthog-server', () => ({ captureServerEvent: mocks.event }));
import { POST } from './route';

function query(result: unknown) {
  const q: any = {};
  for (const key of ['insert', 'select', 'eq', 'order', 'limit', 'update']) q[key] = vi.fn(() => q);
  q.single = vi.fn(async () => result);
  q.maybeSingle = vi.fn(async () => result);
  q.then = (resolve: (r: unknown) => unknown) => Promise.resolve(result).then(resolve);
  return q;
}
function request(status: string) {
  return new NextRequest('https://www.trackmyopt.com/api/extension/job-application', { method: 'POST', body: JSON.stringify({ company_name: 'Example Corp', role_title: 'Engineer', job_url: 'https://example.test/jobs/1', status }) });
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.mockResolvedValue('user-1');
  mocks.limit.mockResolvedValue({ isRateLimited: false });
});

it('promotes an existing Wishlist to Applied with user and current-status guards', async () => {
  const update = query({ data: { id: 'job-1', status: 'Applied' }, error: null });
  mocks.from.mockReturnValueOnce(query({ error: { code: '23505' } }))
    .mockReturnValueOnce(query({ data: { id: 'job-1', status: 'Wishlist' }, error: null }))
    .mockReturnValueOnce(update).mockReturnValue(query({ data: [], error: null }));
  const res = await POST(request('Applied'));
  expect(res.status).toBe(200);
  expect(await res.json()).toMatchObject({ id: 'job-1', status: 'Applied', already_saved: true });
  expect(update.update).toHaveBeenCalledWith(expect.objectContaining({ status: 'Applied', applied_at: expect.any(String) }));
  expect(update.eq).toHaveBeenCalledWith('user_id', 'user-1');
  expect(update.eq).toHaveBeenCalledWith('status', 'Wishlist');
});
it('preserves later application stages and returns their actual status', async () => {
  const existing = query({ data: { id: 'job-1', status: 'Interviewing' }, error: null });
  mocks.from.mockReturnValueOnce(query({ error: { code: '23505' } })).mockReturnValueOnce(existing)
    .mockReturnValue(query({ data: [], error: null }));
  const res = await POST(request('Wishlist'));
  expect(await res.json()).toMatchObject({ status: 'Interviewing' });
  expect(existing.update).not.toHaveBeenCalled();
});
it('does not claim duplicate-save success if the existing row cannot be found', async () => {
  mocks.from.mockReturnValueOnce(query({ error: { code: '23505' } })).mockReturnValue(query({ data: null, error: null }));
  const res = await POST(request('Applied'));
  expect(res.status).toBe(409);
});
it('reports a failed Wishlist promotion instead of returning success', async () => {
  mocks.from.mockReturnValueOnce(query({ error: { code: '23505' } }))
    .mockReturnValueOnce(query({ data: { id: 'job-1', status: 'Wishlist' }, error: null }))
    .mockReturnValueOnce(query({ data: null, error: new Error('Database unavailable') }));
  const res = await POST(request('Applied'));
  expect(res.status).toBe(500);
  expect(await res.json()).not.toHaveProperty('ok', true);
});
it('returns the new current status if another editor advanced it during promotion', async () => {
  mocks.from.mockReturnValueOnce(query({ error: { code: '23505' } }))
    .mockReturnValueOnce(query({ data: { id: 'job-1', status: 'Wishlist' }, error: null }))
    .mockReturnValueOnce(query({ data: null, error: null }))
    .mockReturnValueOnce(query({ data: { id: 'job-1', status: 'Interviewing' }, error: null }))
    .mockReturnValue(query({ data: [], error: null }));
  const res = await POST(request('Applied'));
  expect(res.status).toBe(200);
  expect(await res.json()).toMatchObject({ id: 'job-1', status: 'Interviewing' });
});
