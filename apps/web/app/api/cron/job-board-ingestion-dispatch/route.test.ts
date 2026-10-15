import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const m = vi.hoisted(() => ({
  capture: vi.fn(),
  fingerprint: vi.fn(),
  tag: vi.fn(),
  fetch: vi.fn(),
}));
vi.mock('@/lib/api/verify-cron-auth', () => ({ verifyCronAuth: () => null }));
vi.mock('@sentry/nextjs', () => ({
  captureMessage: m.capture,
  withScope: (fn: (scope: unknown) => void) =>
    fn({ setFingerprint: m.fingerprint, setTag: m.tag }),
}));

import { GET } from './route';

const request = () =>
  new NextRequest('https://example.test/api/cron/job-board-ingestion-dispatch');

// Thursday 2026-10-15 18:07 UTC = 14:07 EDT, inside the weekday 14:00 slot.
const IN_SLOT = '2026-10-15T18:07:00Z';

function apiResponds(post: () => Response) {
  m.fetch.mockImplementation(async (_url: unknown, init?: RequestInit) =>
    init?.method === 'POST' ? post() : new Response('ok')
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ now: new Date(IN_SLOT), toFake: ['Date'] });
  vi.stubGlobal('fetch', m.fetch);
  vi.stubEnv('JOB_BOARD_SCHEDULE_ENABLED', 'true');
  vi.stubEnv('JOB_BOARD_SCHEDULE_START', '');
  // Must be ignored: the run is queued on the worker service only.
  vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://website-api.example.test');
  vi.stubEnv('API_SECRET_KEY', 'test-key');
  vi.stubEnv('JOB_BOARD_WORKER_URL', 'https://worker.example.test');
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

it('does nothing unless JOB_BOARD_SCHEDULE_ENABLED is "true"', async () => {
  vi.stubEnv('JOB_BOARD_SCHEDULE_ENABLED', 'false');
  const response = await GET(request());
  expect(await response.json()).toEqual({ ok: true, skipped: 'disabled' });
  expect(m.fetch).not.toHaveBeenCalled();
});

it('is a no-op outside a New York slot', async () => {
  vi.setSystemTime(new Date('2026-10-15T21:07:00Z'));
  const response = await GET(request());
  expect(await response.json()).toEqual({ ok: true, skipped: 'outside-slot' });
  expect(m.fetch).not.toHaveBeenCalled();
});

it('is a no-op for the EST-only UTC hour during daylight saving time', async () => {
  // Tuesday 2026-12-15 18:07 UTC = 13:07 EST: before the 14:00 slot.
  vi.setSystemTime(new Date('2026-12-15T18:07:00Z'));
  const response = await GET(request());
  expect((await response.json()).skipped).toBe('outside-slot');
});

it('skips weekend afternoons but dispatches the weekend 21:00 slot', async () => {
  vi.setSystemTime(new Date('2026-10-17T18:07:00Z')); // Saturday 14:07 EDT
  expect((await (await GET(request())).json()).skipped).toBe('outside-slot');

  apiResponds(() => Response.json({ status: 'queued', jobId: 'j' }));
  vi.setSystemTime(new Date('2026-10-18T01:07:00Z')); // Saturday 21:07 EDT
  const body = await (await GET(request())).json();
  expect(body).toMatchObject({ ok: true, status: 'queued', schedulerRunId: 'job-board-hour-2026-10-18T01' });
});

it('skips slots that start before JOB_BOARD_SCHEDULE_START', async () => {
  vi.stubEnv('JOB_BOARD_SCHEDULE_START', '2026-10-15T20:00:00Z');
  const body = await (await GET(request())).json();
  expect(body).toMatchObject({ ok: true, skipped: 'before-schedule-start' });
  expect(m.fetch).not.toHaveBeenCalled();
});

it('dispatches an EST slot with the slot-hour run ID and vercel_cron origin', async () => {
  vi.setSystemTime(new Date('2026-12-15T19:07:00Z')); // Tuesday 14:07 EST
  apiResponds(() => Response.json({ status: 'queued', jobId: 'job-board-hour-2026-12-15T19' }));
  const body = await (await GET(request())).json();
  expect(body).toEqual({ ok: true, status: 'queued', schedulerRunId: 'job-board-hour-2026-12-15T19' });
  const post = m.fetch.mock.calls.find(([, init]) => init?.method === 'POST');
  expect(String(post?.[0])).toBe('https://worker.example.test/job-board/ingest-enabled-sources');
  expect(post?.[1].headers).toMatchObject({
    'x-scheduler-run-id': 'job-board-hour-2026-12-15T19',
    'x-trigger-origin': 'vercel_cron',
  });
  // Wakes and enqueues on the same worker host; never the website API.
  const woken = m.fetch.mock.calls.filter(([, init]) => init?.method === 'GET').map(([u]) => String(u));
  expect(woken).toEqual(['https://worker.example.test/']);
  expect(m.fetch.mock.calls.some(([u]) => String(u).includes('website-api'))).toBe(false);
  expect(m.capture).not.toHaveBeenCalled();
});

it('treats an already-dispatched (suppressed) slot as success without Sentry', async () => {
  apiResponds(() => Response.json({ status: 'suppressed', jobId: 'job-board-hour-2026-10-15T18' }));
  const response = await GET(request());
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({ ok: true, status: 'suppressed' });
  expect(m.capture).not.toHaveBeenCalled();
});

it('reports API failures to Sentry once with a fixed message and fingerprint', async () => {
  apiResponds(() => new Response('secret detail', { status: 500 }));
  const response = await GET(request());
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({ ok: false, error: 'dispatch_failed', reason: 'http-error' });
  expect(m.capture).toHaveBeenCalledTimes(1);
  expect(m.capture).toHaveBeenCalledWith('Scheduled job-board ingestion dispatch failed', 'error');
  expect(m.fingerprint).toHaveBeenCalledWith(['job-board-ingestion', 'dispatch-failed']);
  expect(m.tag).toHaveBeenCalledWith('job_board_dispatch_status', '500');
});

it('reports a rejected API key as an auth failure', async () => {
  apiResponds(() => new Response('', { status: 401 }));
  const body = await (await GET(request())).json();
  expect(body.reason).toBe('auth-rejected');
  expect(m.tag).toHaveBeenCalledWith('job_board_dispatch_reason', 'auth-rejected');
  expect(m.capture).toHaveBeenCalledTimes(1);
});

it('reports missing API configuration when enabled', async () => {
  vi.stubEnv('API_SECRET_KEY', '');
  const body = await (await GET(request())).json();
  expect(body).toMatchObject({ ok: false, reason: 'misconfigured' });
  expect(m.capture).toHaveBeenCalledTimes(1);
  expect(m.fetch).not.toHaveBeenCalled();
});

it('defaults to the trackmyopt-api worker when JOB_BOARD_WORKER_URL is unset', async () => {
  vi.stubEnv('JOB_BOARD_WORKER_URL', '');
  apiResponds(() => Response.json({ status: 'queued', jobId: 'j' }));
  await GET(request());
  const urls = m.fetch.mock.calls.map(([u]) => String(u));
  expect(urls).toEqual([
    'https://trackmyopt-api.onrender.com/',
    'https://trackmyopt-api.onrender.com/job-board/ingest-enabled-sources',
  ]);
});
