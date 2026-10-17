import { describe, expect, it } from 'vitest';
import {
  parseSubmissionUpdate,
  recordApplicationSubmission,
  type ApplicationRow,
  type SubmissionStore,
  type ValidSubmissionUpdate,
} from './application-submission';

const NOW = Date.parse('2026-10-17T12:00:00.000Z');
const USER = '11111111-1111-4111-8111-111111111111';
const OTHER = '22222222-2222-4222-8222-222222222222';
const raw = (overrides: Record<string, unknown> = {}) => ({
  attempt_id: 'attempt_0000000000000001',
  confirmation: 'automatic',
  confirmed_at: '2026-10-17T11:59:00.000Z',
  evidence: { kind: 'page', platform: 'workday', detector: 'page_confirmation', ruleVersion: 'baseline-1' },
  job: { company_name: 'Acme', role_title: 'Data Analyst', job_url: 'https://acme.wd5.myworkdayjobs.com/en-US/External/job/R-1' },
  ...overrides,
});

function memoryStore(initial: Array<ApplicationRow & { user_id: string; job_url: string | null; company_name?: string; role_title?: string }> = []) {
  const applications = [...initial];
  const submissions: Array<{ user_id: string; attempt_id: string; application_id: string; confirmation: string }> = [];
  let ids = 0;
  const calls = { promote: 0, insertApplication: 0 };
  const store: SubmissionStore = {
    async findSubmission(userId, attemptId) {
      const row = submissions.find(item => item.user_id === userId && item.attempt_id === attemptId);
      return row ? { applicationId: row.application_id } : null;
    },
    async findApplicationById(userId, id) {
      const row = applications.find(item => item.id === id && item.user_id === userId);
      return row ? { id: row.id, status: row.status } : null;
    },
    async findApplicationByUrl(userId, jobUrl) {
      const row = applications.find(item => item.user_id === userId && item.job_url === jobUrl);
      return row ? { id: row.id, status: row.status } : null;
    },
    async insertApplication(userId, job) {
      calls.insertApplication += 1;
      if (applications.some(item => item.user_id === userId && item.job_url === job.job_url)) return 'conflict';
      const row = { id: `app-${++ids}`, status: 'Applied', user_id: userId, job_url: job.job_url, company_name: job.company_name, role_title: job.role_title };
      applications.push(row);
      return { id: row.id, status: row.status };
    },
    async promoteWishlist(userId, id) {
      calls.promote += 1;
      const row = applications.find(item => item.id === id && item.user_id === userId && item.status === 'Wishlist');
      if (!row) return null;
      row.status = 'Applied';
      return { id: row.id, status: row.status };
    },
    async insertSubmission(userId, applicationId, update) {
      if (submissions.some(item => item.user_id === userId && item.attempt_id === update.attemptId)) return 'duplicate';
      submissions.push({ user_id: userId, attempt_id: update.attemptId, application_id: applicationId, confirmation: update.confirmation });
      return 'inserted';
    },
  };
  return { store, applications, submissions, calls };
}

const parse = (value: unknown) => parseSubmissionUpdate(value, NOW) as ValidSubmissionUpdate;

describe('parseSubmissionUpdate', () => {
  it('accepts page, network-success, and manual confirmations', () => {
    expect(parse(raw())).toBeTruthy();
    expect(parse(raw({ evidence: { kind: 'network', platform: 'workday', detector: 'workday_network', verdict: 'success', status: 200, ruleVersion: '2026-10-17.1' } }))).toBeTruthy();
    expect(parse(raw({ confirmation: 'manual', evidence: { kind: 'manual', platform: 'generic', detector: 'manual', ruleVersion: 'baseline-1' } }))).toBeTruthy();
  });
  it('rejects non-success network evidence, mismatched sources, and stale or extra data', () => {
    expect(parseSubmissionUpdate(raw({ evidence: { kind: 'network', platform: 'workday', detector: 'workday_network', verdict: 'application_error', status: 200, ruleVersion: 'x' } }), NOW)).toBeNull();
    expect(parseSubmissionUpdate(raw({ confirmation: 'manual' }), NOW)).toBeNull();
    expect(parseSubmissionUpdate(raw({ confirmed_at: '2026-09-01T00:00:00.000Z' }), NOW)).toBeNull();
    expect(parseSubmissionUpdate(raw({ confirmed_at: '2026-10-18T00:00:00.000Z' }), NOW)).toBeNull();
    expect(parseSubmissionUpdate(raw({ response_body: '{"id":1}' }), NOW)).toBeNull();
    expect(parseSubmissionUpdate(raw({ evidence: { kind: 'page', platform: 'workday', detector: 'page_confirmation', ruleVersion: 'x', body: 'secret' } }), NOW)).toBeNull();
    expect(parseSubmissionUpdate(raw({ application_id: 'not-a-uuid' }), NOW)).toBeNull();
    expect(parseSubmissionUpdate(raw({ job: { company_name: 'Acme', role_title: 'X', job_url: 'http://insecure.example' } }), NOW)).toBeNull();
  });
});

describe('recordApplicationSubmission', () => {
  it('creates an Applied record once, then treats retries as already recorded', async () => {
    const memory = memoryStore();
    const first = await recordApplicationSubmission(memory.store, USER, parse(raw()), '2026-10-17');
    expect(first).toMatchObject({ ok: true, status: 'Applied', created: true, alreadyRecorded: false, evidenceRecorded: true });
    const retry = await recordApplicationSubmission(memory.store, USER, parse(raw()), '2026-10-17');
    expect(retry).toMatchObject({ ok: true, alreadyRecorded: true, created: false });
    expect(memory.applications).toHaveLength(1);
    expect(memory.submissions).toHaveLength(1);
    expect(memory.calls.insertApplication).toBe(1);
  });

  it('promotes Wishlist once and never overwrites a later stage', async () => {
    const wishlist = memoryStore([{ id: 'app-w', status: 'Wishlist', user_id: USER, job_url: raw().job.job_url }]);
    expect(await recordApplicationSubmission(wishlist.store, USER, parse(raw()), '2026-10-17')).toMatchObject({ status: 'Applied', applicationId: 'app-w' });
    const interviewing = memoryStore([{ id: 'app-i', status: 'Interviewing', user_id: USER, job_url: raw().job.job_url }]);
    expect(await recordApplicationSubmission(interviewing.store, USER, parse(raw()), '2026-10-17')).toMatchObject({ status: 'Interviewing' });
    expect(interviewing.calls.promote).toBe(0);
  });

  it('never merges different jobs that share a company and title', async () => {
    const memory = memoryStore([{ id: 'app-1', status: 'Applied', user_id: USER, job_url: 'https://acme.wd5.myworkdayjobs.com/en-US/External/job/R-OTHER', company_name: 'Acme', role_title: 'Data Analyst' }]);
    const result = await recordApplicationSubmission(memory.store, USER, parse(raw()), '2026-10-17');
    expect(result).toMatchObject({ created: true });
    expect(memory.applications).toHaveLength(2);
  });

  it('refuses an application id owned by another user', async () => {
    const memory = memoryStore([{ id: 'app-x', status: 'Wishlist', user_id: OTHER, job_url: raw().job.job_url }]);
    const result = await recordApplicationSubmission(memory.store, USER,
      parse(raw({ application_id: '33333333-3333-4333-8333-333333333333' })), '2026-10-17');
    expect(result).toEqual({ ok: false, error: 'application_not_found' });
    const foreign = memoryStore([{ id: '33333333-3333-4333-8333-333333333333', status: 'Wishlist', user_id: OTHER, job_url: null }]);
    expect(await recordApplicationSubmission(foreign.store, USER,
      parse(raw({ application_id: '33333333-3333-4333-8333-333333333333' })), '2026-10-17')).toEqual({ ok: false, error: 'application_not_found' });
    expect(foreign.applications[0].status).toBe('Wishlist');
  });

  it('a different user\'s identical URL is a separate record', async () => {
    const memory = memoryStore([{ id: 'app-o', status: 'Wishlist', user_id: OTHER, job_url: raw().job.job_url }]);
    const result = await recordApplicationSubmission(memory.store, USER, parse(raw()), '2026-10-17');
    expect(result).toMatchObject({ created: true });
    expect(memory.applications.find(row => row.id === 'app-o')?.status).toBe('Wishlist');
  });

  it('recovers from a concurrent insert of the same URL', async () => {
    const memory = memoryStore();
    const store: SubmissionStore = {
      ...memory.store,
      findApplicationByUrl: async (userId, url) => memory.calls.insertApplication ? memory.store.findApplicationByUrl(userId, url) : null,
      insertApplication: async (userId, job, day) => {
        await memory.store.insertApplication(userId, job, day);
        return 'conflict';
      },
    };
    const result = await recordApplicationSubmission(store, USER, parse(raw()), '2026-10-17');
    expect(result).toMatchObject({ ok: true, applicationId: 'app-1' });
  });

  it('still updates the tracker before the evidence migration is applied', async () => {
    const memory = memoryStore();
    const store: SubmissionStore = { ...memory.store, findSubmission: async () => 'unavailable', insertSubmission: async () => 'unavailable' };
    const result = await recordApplicationSubmission(store, USER, parse(raw()), '2026-10-17');
    expect(result).toMatchObject({ ok: true, status: 'Applied', evidenceRecorded: false });
  });
});
