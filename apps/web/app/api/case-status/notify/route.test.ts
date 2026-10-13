import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const m = vi.hoisted(() => ({
  premium: true,
  deliveryPremium: true,
  send: vi.fn(),
  deleteAtAuth: true,
  removed: false,
  superseded: false,
  readError: false,
  captures: vi.fn(),
  writes: [] as string[],
}));
vi.mock('nodemailer', () => ({
  default: { createTransport: () => ({ sendMail: m.send }) },
}));
vi.mock('@sentry/nextjs', () => ({ captureMessage: m.captures }));
vi.mock('@/lib/notifications/web-push', () => ({
  isWebPushConfigured: () => false,
}));
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      admin: {
        getUserById: async () => {
          m.removed = m.deleteAtAuth;
          return {
            data: { user: { email: 'owner@example.test' } },
            error: null,
          };
        },
      },
    },
    from(table: string) {
      const q = {
        select: () => q,
        eq: () => q,
        insert: () => {
          m.writes.push(table);
          return Promise.resolve({ error: null });
        },
        single: async () => ({
          data: { premium_status: m.premium, first_name: 'Test' },
          error: null,
        }),
        maybeSingle: async () => ({
          data:
            table === 'profiles'
              ? { premium_status: m.deliveryPremium }
              : m.removed && !m.superseded
                ? null
                : {
                    notifications_enabled: true,
                    current_status: m.superseded
                      ? 'Case Was Received'
                      : 'Case Was Approved',
                  },
          error: m.readError ? { message: 'private' } : null,
        }),
      };
      return q;
    },
  }),
}));
import { POST } from './route';
const request = () =>
  new NextRequest('http://localhost/api/case-status/notify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Internal-Secret': 'synthetic-secret',
    },
    body: JSON.stringify({
      user_id: 'owner',
      receipt_number: 'IOE0000000001',
      old_status: 'Case Was Received',
      new_status: 'Case Was Approved',
    }),
  });
beforeEach(() => {
  vi.clearAllMocks();
  m.premium = true;
  m.deliveryPremium = true;
  m.deleteAtAuth = true;
  m.removed = false;
  m.superseded = false;
  m.readError = false;
  m.writes = [];
  vi.stubEnv('CRON_SECRET', 'synthetic-secret');
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
it('does not send or log a delayed notification after tracking is removed', async () => {
  expect((await POST(request())).status).toBe(200);
  expect(m.send).not.toHaveBeenCalled();
  expect(m.writes).toEqual([]);
});
it('does not send a superseded status update', async () => {
  m.superseded = true;
  expect((await POST(request())).status).toBe(200);
  expect(m.send).not.toHaveBeenCalled();
});
it('reports lookup failures instead of silently treating an outage as disabled notifications', async () => {
  m.readError = true;
  expect((await POST(request())).status).toBe(500);
  expect(m.send).not.toHaveBeenCalled();
  expect(m.captures).toHaveBeenCalledWith(
    'POST /api/case-status/notify returned HTTP 500',
    'error'
  );
  expect(JSON.stringify(m.captures.mock.calls)).not.toContain('IOE');
});

afterEach(() => vi.unstubAllEnvs());
it('sends and records a current notification for an enrolled premium user', async () => {
  m.deleteAtAuth = false;
  m.send.mockResolvedValue({
    accepted: ['owner@example.test'],
    messageId: 'synthetic-mail',
  });
  expect((await POST(request())).status).toBe(200);
  expect(m.send).toHaveBeenCalledTimes(1);
  expect(m.writes).toEqual(['email_queue']);
});

it('does not send case mail to a free account', async () => {
  m.premium = false;
  m.deleteAtAuth = false;
  expect((await POST(request())).status).toBe(200);
  expect(m.send).not.toHaveBeenCalled();
  expect(m.writes).toEqual([]);
});
it('rechecks premium before delivery when the subscription was downgraded', async () => {
  m.deliveryPremium = false;
  m.deleteAtAuth = false;
  expect((await POST(request())).status).toBe(200);
  expect(m.send).not.toHaveBeenCalled();
  expect(m.writes).toEqual([]);
});
