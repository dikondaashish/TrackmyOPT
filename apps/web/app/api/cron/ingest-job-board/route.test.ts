import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

describe('job board ingestion cron', () => {
  beforeEach(() => {
    process.env.CRON_SECRET = 'cron-secret';
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
    process.env.API_SECRET_KEY = 'api-secret';
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
  });

  it('queues the enabled-source worker without accepting source input', async () => {
    const request = new NextRequest(
      'https://app.example.com/api/cron/ingest-job-board',
      {
        headers: { authorization: 'Bearer cron-secret' },
      }
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(fetch).toHaveBeenCalledWith(
      'https://api.example.com/job-board/ingest-enabled-sources',
      expect.objectContaining({
        method: 'POST',
        headers: { 'x-api-key': 'api-secret' },
      })
    );
  });
});
