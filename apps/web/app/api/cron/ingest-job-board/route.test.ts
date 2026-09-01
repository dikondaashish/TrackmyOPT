import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { afterMock, supabaseInsert, supabaseUpdate, createClientMock } = vi.hoisted(() => ({
  afterMock: vi.fn(),
  supabaseInsert: vi.fn(),
  supabaseUpdate: vi.fn(),
  createClientMock: vi.fn(),
}));

vi.mock('next/server', async () => {
  const actual = await vi.importActual<typeof import('next/server')>('next/server');
  return { ...actual, after: afterMock };
});

vi.mock('@supabase/supabase-js', () => ({
  createClient: createClientMock,
}));

import { GET, jobBoardHourlyRunId } from './route';

describe('job board ingestion cron', () => {
  const pendingCallbacks: Array<() => Promise<void>> = [];

  beforeEach(() => {
    process.env.CRON_SECRET = 'cron-secret';
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
    process.env.API_SECRET_KEY = 'api-secret';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://supabase.example.com';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key';
    pendingCallbacks.length = 0;
    afterMock.mockClear();
    supabaseInsert.mockClear();
    supabaseUpdate.mockClear();
    createClientMock.mockClear();
    afterMock.mockImplementation((callback: () => Promise<void>) => {
      pendingCallbacks.push(callback);
    });
    supabaseInsert.mockResolvedValue({ error: null });
    supabaseUpdate.mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });
    createClientMock.mockReturnValue({
      from: () => ({ insert: supabaseInsert, update: supabaseUpdate }),
    });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ status: 'queued', jobId: '1' }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      )
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('rejects an unauthenticated request', async () => {
    const response = await GET(
      new NextRequest('https://app.example.com/api/cron/ingest-job-board')
    );
    expect(response.status).toBe(401);
    expect(fetch).not.toHaveBeenCalled();
    expect(afterMock).not.toHaveBeenCalled();
  });

  it('returns 202 before the enqueue request resolves', async () => {
    let resolveEnqueue: ((response: Response) => void) | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string | URL) => {
        if (String(url) === 'https://api.example.com') {
          return Promise.resolve(new Response('ok', { status: 200 }));
        }
        return new Promise<Response>((resolve) => {
          resolveEnqueue = resolve;
        });
      }),
    );
    const request = new NextRequest(
      'https://app.example.com/api/cron/ingest-job-board',
      {
        headers: { authorization: 'Bearer cron-secret' },
      }
    );
    const response = await GET(request);

    expect(response.status).toBe(202);
    expect(afterMock).toHaveBeenCalledTimes(1);
    expect(fetch).not.toHaveBeenCalled();

    const background = pendingCallbacks[0]();
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/job-board/ingest-enabled-sources',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'x-api-key': 'api-secret',
          'x-scheduler-run-id': expect.stringMatching(
            /^job-board-hour-\d{4}-\d{2}-\d{2}T\d{2}$/
          ),
          'x-trigger-origin': 'cron_jobs_org',
        },
      })
    );
    resolveEnqueue?.(
      new Response(JSON.stringify({ status: 'queued', jobId: '1' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    await background;
  });

  it('records a failed ledger row when enqueue fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string | URL) =>
        String(url) === 'https://api.example.com'
          ? Promise.resolve(new Response('ok', { status: 200 }))
          : Promise.reject(new Error('Render unavailable')),
      ),
    );
    const request = new NextRequest(
      'https://app.example.com/api/cron/ingest-job-board',
      { headers: { authorization: 'Bearer cron-secret' } },
    );

    const response = await GET(request);
    expect(response.status).toBe(202);
    await pendingCallbacks[0]();

    expect(supabaseInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        scheduler_run_id: expect.stringMatching(
          /^job-board-hour-\d{4}-\d{2}-\d{2}T\d{2}$/,
        ),
        trigger_origin: 'cron_jobs_org',
        bull_job_id: expect.any(String),
        dispatch_status: 'failed',
        error_message: 'Render unavailable',
      }),
    );
    expect(supabaseUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        dispatch_status: 'failed',
        error_message: 'Render unavailable',
      }),
    );
  });

  it('keeps duplicate-hour suppression in the backend contract', async () => {
    const request = new NextRequest(
      'https://app.example.com/api/cron/ingest-job-board',
      { headers: { authorization: 'Bearer cron-secret' } },
    );
    const response = await GET(request);
    expect(response.status).toBe(202);
    await pendingCallbacks[0]();
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/job-board/ingest-enabled-sources',
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-scheduler-run-id': expect.stringMatching(
            /^job-board-hour-\d{4}-\d{2}-\d{2}T\d{2}$/,
          ),
          'x-trigger-origin': 'cron_jobs_org',
        }),
      }),
    );
    expect(supabaseInsert).toHaveBeenCalledWith(
      expect.objectContaining({ dispatch_status: 'dispatched' }),
    );
  });

  it('derives the exact UTC hourly ID used by the backend scheduler contract', () => {
    expect(jobBoardHourlyRunId(new Date('2026-09-01T03:52:59.000Z'))).toBe(
      'job-board-hour-2026-09-01T03'
    );
  });
});
