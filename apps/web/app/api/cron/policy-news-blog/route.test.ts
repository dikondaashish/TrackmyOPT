import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const m = vi.hoisted(() => ({ run: vi.fn(), report: vi.fn() }));

vi.mock('@/lib/api/verify-cron-auth', () => ({ verifyCronAuth: () => null }));
vi.mock('@/lib/policy-news/monitoring', () => ({ reportPolicyNews: m.report }));
vi.mock('@/lib/policy-news/pipeline', () => ({ runPolicyNewsBlog: m.run }));
vi.mock('@/lib/policy-news/store', () => {
  class PolicyNewsStoreError extends Error {
    constructor(readonly code: string) {
      super(code);
    }
  }
  return { PolicyNewsStoreError };
});

import { GET } from './route';
import { PolicyNewsStoreError } from '@/lib/policy-news/store';

const request = () => new NextRequest('https://example.test/api/cron/policy-news-blog');

beforeEach(() => {
  vi.clearAllMocks();
  m.run.mockResolvedValue({ candidates: 3, sourceFailures: [], published: ['a'], skipped: 1, failed: [] });
});
afterEach(() => vi.unstubAllEnvs());

it('runs the pipeline and returns its summary', async () => {
  const body = await (await GET(request())).json();
  expect(body).toEqual({ ok: true, candidates: 3, sourceFailures: [], published: ['a'], skipped: 1, failed: [] });
});

it('does nothing when switched off', async () => {
  vi.stubEnv('POLICY_NEWS_BLOG_DISABLED', 'true');
  const body = await (await GET(request())).json();
  expect(body).toEqual({ ok: true, skipped: 'disabled' });
  expect(m.run).not.toHaveBeenCalled();
});

it('reports a store failure once and answers 200', async () => {
  m.run.mockRejectedValue(new PolicyNewsStoreError('claim_read_failed'));
  const response = await GET(request());
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ ok: false, error: 'claim_read_failed' });
  expect(m.report).toHaveBeenCalledWith('cron', 'claim_read_failed', 'error', expect.anything());
});

it('reports unexpected failures', async () => {
  m.run.mockRejectedValue(new TypeError('boom'));
  const body = await (await GET(request())).json();
  expect(body.error).toBe('unexpected_error');
  expect(m.report).toHaveBeenCalledWith('cron', 'unexpected_error', 'error', expect.anything());
});
