import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const m = vi.hoisted(() => ({
  capture: vi.fn(),
  fingerprint: vi.fn(),
  loadPageConnection: vi.fn(),
  loadDailyPost: vi.fn(),
  buildDailyDraft: vi.fn(),
  publishDailyPost: vi.fn(),
}));
vi.mock('@/lib/api/verify-cron-auth', () => ({ verifyCronAuth: () => null }));
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));
vi.mock('@sentry/nextjs', () => ({
  captureMessage: m.capture,
  withScope: (fn: (scope: unknown) => void) =>
    fn({ setFingerprint: m.fingerprint, setTag: vi.fn(), setContext: vi.fn() }),
}));
vi.mock('@/lib/linkedin/daily-post-service', async () => {
  class LinkedInPostError extends Error {
    constructor(readonly code: string) {
      super(code);
    }
  }
  return {
    LinkedInPostError,
    loadPageConnection: m.loadPageConnection,
    loadDailyPost: m.loadDailyPost,
    buildDailyDraft: m.buildDailyDraft,
    publishDailyPost: m.publishDailyPost,
  };
});

import { GET } from './route';
import { LinkedInPostError } from '@/lib/linkedin/daily-post-service';

const request = () => new NextRequest('https://example.test/api/cron/linkedin-daily-post');

// Monday 2026-10-19 18:30 UTC = 14:30 EDT.
const IN_SLOT = '2026-10-19T18:30:00Z';
const CONNECTION = {
  organizationUrn: 'urn:li:organization:42',
  accessTokenExpiresAt: '2026-12-01T00:00:00Z',
  hasRefreshToken: true,
  autoPublish: true,
  enabled: true,
};
const DRAFT = { postDate: '2026-10-19', status: 'draft', shownCount: 20 };

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ now: new Date(IN_SLOT), toFake: ['Date'] });
  vi.stubEnv('LINKEDIN_CLIENT_ID', 'client');
  vi.stubEnv('LINKEDIN_CLIENT_SECRET', 'secret');
  m.loadPageConnection.mockResolvedValue(CONNECTION);
  m.loadDailyPost.mockResolvedValue(null);
  m.buildDailyDraft.mockResolvedValue(DRAFT);
  m.publishDailyPost.mockResolvedValue({ ...DRAFT, status: 'published' });
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

it('skips the firing that is not 2 PM in New York', async () => {
  vi.setSystemTime(new Date('2026-10-19T19:30:00Z'));
  const body = await (await GET(request())).json();
  expect(body).toEqual({ ok: true, skipped: 'outside-slot' });
  expect(m.loadPageConnection).not.toHaveBeenCalled();
});

it('also posts at 2:30 PM in winter (EST)', async () => {
  vi.setSystemTime(new Date('2026-12-07T19:30:00Z'));
  const body = await (await GET(request())).json();
  expect(body.status).toBe('published');
});

it('skips quietly until the page is connected', async () => {
  m.loadPageConnection.mockResolvedValue(null);
  const body = await (await GET(request())).json();
  expect(body).toEqual({ ok: true, skipped: 'not-connected' });
  expect(m.capture).not.toHaveBeenCalled();
});

it('builds and publishes when auto-publish is on', async () => {
  const body = await (await GET(request())).json();
  expect(m.buildDailyDraft).toHaveBeenCalledWith('2026-10-19', expect.any(Date));
  expect(m.publishDailyPost).toHaveBeenCalledWith(expect.objectContaining({ clientId: 'client' }), '2026-10-19', 'cron', expect.any(Date));
  expect(body).toMatchObject({ ok: true, status: 'published' });
});

it('only prepares the draft when auto-publish is off, keeping a reviewed one', async () => {
  m.loadPageConnection.mockResolvedValue({ ...CONNECTION, autoPublish: false });
  m.loadDailyPost.mockResolvedValue(DRAFT);
  const body = await (await GET(request())).json();
  expect(m.buildDailyDraft).not.toHaveBeenCalled();
  expect(m.publishDailyPost).not.toHaveBeenCalled();
  expect(body).toMatchObject({ ok: true, autoPublish: false });
});

it('reports a failed publish to Sentry with a stable fingerprint', async () => {
  m.publishDailyPost.mockRejectedValue(new LinkedInPostError('reconnect_required'));
  const body = await (await GET(request())).json();
  expect(body).toEqual({ ok: false, error: 'reconnect_required' });
  expect(m.fingerprint).toHaveBeenCalledWith(['linkedin-daily-post', 'cron', 'reconnect_required']);
  expect(m.capture).toHaveBeenCalledWith('LinkedIn daily jobs post: reconnect_required', 'error');
});

it('warns a week before access expires when LinkedIn gave no refresh token', async () => {
  m.loadPageConnection.mockResolvedValue({
    ...CONNECTION,
    hasRefreshToken: false,
    accessTokenExpiresAt: '2026-10-22T00:00:00Z',
  });
  await GET(request());
  expect(m.capture).toHaveBeenCalledWith('LinkedIn daily jobs post: reconnect_soon', 'warning');
});
