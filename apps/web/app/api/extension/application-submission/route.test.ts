import { NextRequest } from 'next/server';
import { beforeEach, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ auth: vi.fn(), limit: vi.fn(), record: vi.fn() }));
vi.mock('@/lib/auth/get-user-id', () => ({ getUserId: mocks.auth }));
vi.mock('@/lib/auth/rate-limit', () => ({ default: () => ({ check: mocks.limit }) }));
vi.mock('@/lib/extension/application-submission', async (original) => ({
  ...(await original<typeof import('@/lib/extension/application-submission')>()),
  createSupabaseSubmissionStore: () => ({}),
  recordApplicationSubmission: mocks.record,
}));
import { POST } from './route';

const body = {
  attempt_id: 'attempt_0000000000000001',
  confirmation: 'automatic',
  confirmed_at: new Date().toISOString(),
  evidence: { kind: 'page', platform: 'workday', detector: 'page_confirmation', ruleVersion: 'baseline-1' },
  job: { company_name: 'Acme', role_title: 'Analyst', job_url: 'https://acme.wd5.myworkdayjobs.com/job/1' },
};
const post = (value: unknown) => POST(new NextRequest('https://www.trackmyopt.com/api/extension/application-submission', {
  method: 'POST', body: typeof value === 'string' ? value : JSON.stringify(value),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.auth.mockResolvedValue('11111111-1111-4111-8111-111111111111');
  mocks.limit.mockResolvedValue({ isRateLimited: false });
  mocks.record.mockResolvedValue({ ok: true, applicationId: 'app-1', status: 'Applied', alreadyRecorded: false, evidenceRecorded: true, created: true });
});

it('requires a verified user and records with that user only', async () => {
  mocks.auth.mockResolvedValueOnce(null);
  expect((await post(body)).status).toBe(401);
  const res = await post({ ...body });
  expect(res.status).toBe(200);
  expect(await res.json()).toMatchObject({ ok: true, application_id: 'app-1', status: 'Applied' });
  expect(mocks.record.mock.calls[0][1]).toBe('11111111-1111-4111-8111-111111111111');
});

it('rejects invalid updates before touching the tracker', async () => {
  expect((await post('{')).status).toBe(400);
  expect((await post({ ...body, evidence: { ...body.evidence, kind: 'network' } })).status).toBe(400);
  expect((await post({ ...body, extra: true })).status).toBe(400);
  expect((await post('x'.repeat(9000))).status).toBe(413);
  expect(mocks.record).not.toHaveBeenCalled();
});

it('maps ownership failures to 404 and unexpected failures to 500', async () => {
  mocks.record.mockResolvedValueOnce({ ok: false, error: 'application_not_found' });
  expect((await post(body)).status).toBe(404);
  mocks.record.mockRejectedValueOnce(new Error('db down'));
  const failed = await post(body);
  expect(failed.status).toBe(500);
  expect(JSON.stringify(await failed.json())).not.toContain('db down');
});

it('rate limits per user and asks for a retry when the limiter is unavailable', async () => {
  mocks.limit.mockResolvedValueOnce({ isRateLimited: true });
  expect((await post(body)).status).toBe(429);
  mocks.limit.mockResolvedValueOnce({ isRateLimited: false, unavailable: true });
  expect((await post(body)).status).toBe(503);
});
