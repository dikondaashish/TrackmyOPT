import { beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { PATCH } from './route';
const mocks = vi.hoisted(() => ({ auth: vi.fn(), create: vi.fn() }));
vi.mock('@/lib/auth/get-user-id', () => ({ getUserId: mocks.auth }));
vi.mock('@supabase/supabase-js', () => ({ createClient: mocks.create }));
const id = '11111111-1111-4111-8111-111111111111';
const req = (completed_date: unknown) =>
  new NextRequest('https://example.test/api/case-status/biometrics', {
    method: 'PATCH',
    body: JSON.stringify({ case_id: id, completed_date }),
  });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.mockResolvedValue('owner');
});
it.each(['2026-02-30', '9999-01-01', 'bad', '', true, undefined])(
  'rejects invalid dates: %s',
  async (date) => {
    expect((await PATCH(req(date))).status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  }
);
it('requires a signed-in owner', async () => {
  mocks.auth.mockResolvedValue(null);
  expect((await PATCH(req('2026-01-01'))).status).toBe(401);
  expect(mocks.create).not.toHaveBeenCalled();
});
it.each(['saved', 'missing', 'error'])(
  'scopes updates to the owner, outcome %s',
  async (outcome) => {
    const query = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      maybeSingle: vi
        .fn()
        .mockResolvedValue({
          data: outcome === 'saved' ? { id } : null,
          error: outcome === 'error' ? {} : null,
        }),
    };
    mocks.create.mockReturnValue({ from: () => query });
    expect((await PATCH(req('2026-01-01'))).status).toBe(
      outcome === 'saved' ? 200 : outcome === 'missing' ? 404 : 500
    );
    expect(query.eq).toHaveBeenCalledWith('id', id);
    expect(query.eq).toHaveBeenCalledWith('user_id', 'owner');
    expect(query.update).toHaveBeenCalledWith({
      biometrics_attended_date: '2026-01-01',
      biometrics_confirmed_at: expect.any(String),
    });
  }
);
it('undo clears only the self-reported fields', async () => {
  const q = {
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: { id }, error: null }),
  };
  mocks.create.mockReturnValue({ from: () => q });
  expect((await PATCH(req(null))).status).toBe(200);
  expect(q.update).toHaveBeenCalledWith({
    biometrics_attended_date: null,
    biometrics_confirmed_at: null,
  });
});
