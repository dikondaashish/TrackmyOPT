import { beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
const mocks = vi.hoisted(() => ({ auth: vi.fn(), create: vi.fn() }));
vi.mock('@/lib/auth/get-user-id', () => ({ getUserId: mocks.auth }));
vi.mock('@supabase/supabase-js', () => ({ createClient: mocks.create }));
const id = '11111111-1111-4111-8111-111111111111';
const req = (caseId = id) =>
  new NextRequest(
    `https://example.test/api/case-status/notification-status?case_id=${caseId}`
  );
const query = (data: unknown, error: unknown = null) => ({
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  contains: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn().mockResolvedValue({ data, error }),
});
beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.mockResolvedValue('owner');
});
it('requires sign-in', async () => {
  mocks.auth.mockResolvedValue(null);
  expect((await GET(req())).status).toBe(401);
  expect(mocks.create).not.toHaveBeenCalled();
});
it('validates case ID', async () => {
  expect((await GET(req('bad'))).status).toBe(400);
});
it('does not disclose another owner’s notification', async () => {
  const q = query(null);
  const from = vi.fn().mockReturnValue(q);
  mocks.create.mockReturnValue({ from });
  expect((await GET(req())).status).toBe(404);
  expect(q.eq).toHaveBeenCalledWith('user_id', 'owner');
  expect(from).toHaveBeenCalledTimes(1);
});
it('scopes email history to this owner and receipt, without exposing contents', async () => {
  const c = query({ receipt_number: 'IOE0000000000' });
  const n = query({
    status: 'sent',
    sent_at: '2026-09-23T16:00:00Z',
    created_at: '2026-09-23T16:00:00Z',
  });
  mocks.create.mockReturnValue({
    from: vi.fn().mockReturnValueOnce(c).mockReturnValueOnce(n),
  });
  const response = await GET(req());
  expect(response.headers.get('Cache-Control')).toBe('no-store');
  expect(n.eq).toHaveBeenCalledWith('user_id', 'owner');
  expect(n.contains).toHaveBeenCalledWith('email_data', {
    receipt_number: 'IOE0000000000',
  });
  expect(n.select).toHaveBeenCalledWith('status,sent_at,created_at');
  expect(await response.json()).toMatchObject({
    notification: { status: 'sent' },
  });
});
it('does not report empty success on a query failure', async () => {
  mocks.create.mockReturnValue({
    from: vi
      .fn()
      .mockReturnValueOnce(query({ receipt_number: 'IOE0000000000' }))
      .mockReturnValueOnce(query(null, {})),
  });
  expect((await GET(req())).status).toBe(503);
});
