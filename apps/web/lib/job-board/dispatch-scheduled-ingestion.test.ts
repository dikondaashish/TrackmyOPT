import { describe, expect, it, vi } from 'vitest';
import {
  dispatchScheduledIngestion,
  DispatchError,
} from './dispatch-scheduled-ingestion';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

function fakeFetch(handler: (url: string, init: RequestInit) => Response | Promise<Response>) {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) =>
    handler(String(input), init ?? {})
  ) as unknown as typeof fetch & ReturnType<typeof vi.fn>;
}

const base = {
  apiUrl: 'https://api.example.test',
  apiKey: 'test-key',
  schedulerRunId: 'job-board-hour-2026-10-15T18',
  wait: async () => {},
};

describe('dispatchScheduledIngestion', () => {
  it('wakes every distinct service, then enqueues with the scheduler headers', async () => {
    const fetchImpl = fakeFetch((url, init) =>
      init.method === 'POST'
        ? json({ status: 'queued', jobId: 'job-board-hour-2026-10-15T18' })
        : new Response('ok')
    );
    const result = await dispatchScheduledIngestion({
      ...base,
      wakeUrls: ['https://worker.example.test', 'https://api.example.test/'],
      fetchImpl,
    });
    expect(result).toEqual({ status: 'queued', jobId: 'job-board-hour-2026-10-15T18' });
    const calls = fetchImpl.mock.calls.map(([url, init]) => [
      String(url),
      (init as RequestInit).method,
    ]);
    expect(calls).toEqual([
      ['https://api.example.test/', 'GET'],
      ['https://worker.example.test/', 'GET'],
      ['https://api.example.test/job-board/ingest-enabled-sources', 'POST'],
    ]);
    const headers = (fetchImpl.mock.calls[2][1] as RequestInit).headers;
    expect(headers).toEqual({
      'x-api-key': 'test-key',
      'x-scheduler-run-id': 'job-board-hour-2026-10-15T18',
      'x-trigger-origin': 'vercel_cron',
    });
  });

  it('treats a suppressed (already dispatched) slot as success', async () => {
    const fetchImpl = fakeFetch((url, init) =>
      init.method === 'POST' ? json({ status: 'suppressed', jobId: 'x' }) : new Response('ok')
    );
    await expect(dispatchScheduledIngestion({ ...base, fetchImpl })).resolves.toEqual({
      status: 'suppressed',
      jobId: 'x',
    });
  });

  it('retries a cold API and fails as unreachable after the last attempt', async () => {
    const wait = vi.fn(async () => {});
    const fetchImpl = fakeFetch(() => {
      throw new TypeError('fetch failed');
    });
    await expect(
      dispatchScheduledIngestion({ ...base, fetchImpl, wait, wakeAttempts: 3 })
    ).rejects.toMatchObject({ reason: 'api-unreachable' });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expect(wait).toHaveBeenCalledTimes(2);
  });

  it('classifies auth, server and malformed responses', async () => {
    for (const [response, reason] of [
      [new Response('', { status: 401 }), 'auth-rejected'],
      [new Response('', { status: 503 }), 'http-error'],
      [json({ status: 'weird' }), 'invalid-response'],
    ] as const) {
      const fetchImpl = fakeFetch((url, init) =>
        init.method === 'POST' ? response.clone() : new Response('ok')
      );
      const error = await dispatchScheduledIngestion({ ...base, fetchImpl }).catch((e) => e);
      expect(error).toBeInstanceOf(DispatchError);
      expect(error.reason).toBe(reason);
    }
  });

  it('refuses non-HTTPS targets', async () => {
    await expect(
      dispatchScheduledIngestion({ ...base, apiUrl: 'http://api.example.test', fetchImpl: fakeFetch(() => new Response('ok')) })
    ).rejects.toThrow(/HTTPS/);
  });
});
