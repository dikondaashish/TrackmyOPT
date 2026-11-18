// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const m = vi.hoisted(() => ({ stop: vi.fn(), capture: vi.fn() }));
vi.mock('@sentry/nextjs', () => ({ captureException: m.capture }));
vi.mock('@/lib/sentry/api-errors', () => ({
  withSentryApiErrors: (handler: unknown) => handler,
}));
vi.mock('@/lib/supabase/admin', () => ({ getSupabaseAdminClient: () => ({}) }));
vi.mock('@/lib/notifications/transactional/case-updates', () => ({
  stopCaseEmails: m.stop,
}));

import { GET, POST } from './route';
import { createCaseEmailOptOutToken } from '@/lib/notifications/case-email-optout';

const USER = '11111111-1111-4111-8111-111111111111';
const url = (token?: string) =>
  new NextRequest(
    'https://example.test/api/email/case-updates/unsubscribe' +
      (token ? `?token=${encodeURIComponent(token)}` : '')
  );
const post = (token?: string) =>
  new NextRequest(url(token).url, { method: 'POST' });

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('EMAIL_LINK_SIGNING_SECRET', 'test-signing-secret');
  m.stop.mockResolvedValue('ok');
});

it('GET shows a confirmation and changes nothing', async () => {
  const token = createCaseEmailOptOutToken(USER, 'test-signing-secret');
  const response = await GET(url(token));
  expect(response.status).toBe(200);
  expect(await response.text()).toContain('Stop case emails?');
  expect(m.stop).not.toHaveBeenCalled();
});

it('POST turns case emails off for the signed account only', async () => {
  const token = createCaseEmailOptOutToken(USER, 'test-signing-secret');
  const response = await POST(post(token));
  expect(response.status).toBe(200);
  expect(await response.text()).toContain('Case emails are off');
  expect(m.stop).toHaveBeenCalledWith(expect.anything(), USER);
});

it('rejects a missing or forged token', async () => {
  const forged = createCaseEmailOptOutToken(USER, 'another-secret');
  for (const token of [undefined, 'garbage', forged]) {
    expect((await GET(url(token))).status).toBe(400);
    expect((await POST(post(token))).status).toBe(400);
  }
  expect(m.stop).not.toHaveBeenCalled();
});

it('reports a failed save instead of confirming', async () => {
  m.stop.mockResolvedValue('unavailable');
  const token = createCaseEmailOptOutToken(USER, 'test-signing-secret');
  const response = await POST(post(token));
  expect(response.status).toBe(503);
  expect(m.capture).toHaveBeenCalledOnce();
});
