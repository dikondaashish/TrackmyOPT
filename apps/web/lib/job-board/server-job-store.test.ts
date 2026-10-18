// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerJob, listServerJobs } from './server-job-store';

const fetchMock = vi.fn();

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('fetch', fetchMock);
  vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.example.test/');
  vi.stubEnv('API_SECRET_KEY', 'test-key');
  fetchMock.mockReset();
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

const page = () => new Response(JSON.stringify({ rows: [], total: 7, visaSignals: [] }), { status: 200 });

describe('job data API reads', () => {
  it('retries once after a 5xx such as an Oracle pool timeout', async () => {
    fetchMock.mockResolvedValueOnce(new Response('{}', { status: 500 })).mockResolvedValueOnce(page());
    const result = listServerJobs({ page: 1, country: 'us' });
    await vi.advanceTimersByTimeAsync(1_000);
    await expect(result).resolves.toMatchObject({ total: 7 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.example.test/job-board/jobs?page=1&country=us');
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ headers: { 'x-api-key': 'test-key' }, cache: 'no-store' });
  });

  it('retries once after a network failure, then reports a second failure', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('fetch failed')).mockResolvedValueOnce(new Response('{}', { status: 503 }));
    const result = listServerJobs({ page: 1 });
    const assertion = expect(result).rejects.toThrow('Unable to load jobs from the job data service');
    await vi.advanceTimersByTimeAsync(1_000);
    await assertion;
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not retry client errors', async () => {
    fetchMock.mockResolvedValueOnce(new Response('{}', { status: 404 }));
    await expect(getServerJob('missing')).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
