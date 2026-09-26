import assert from 'node:assert/strict';
import test from 'node:test';
import { handleJobContextSession } from '../src/job-context-session';

test('job session relay isolates tabs, minimizes data, and refuses child frames', async () => {
  const values: Record<string, any> = { secret: 'never-return' };
  const previous = (globalThis as any).chrome;
  (globalThis as any).chrome = { storage: { session: {
    get: async (key: string) => ({ [key]: values[key] }),
    set: async (patch: Record<string, unknown>) => Object.assign(values, patch),
  } } };
  const sender = (id: number, frameId = 0) => ({ frameId, tab: { id }, url: 'https://example.test/jobs/1' } as chrome.runtime.MessageSender);
  try {
    const job = { company_name: 'Example', role_title: 'Analyst', job_url: 'https://example.test/jobs/1', job_description: 'x'.repeat(20000), password: 'discard' };
    assert.equal((await handleJobContextSession({ action: 'save', job }, sender(1))).ok, true);
    const one = await handleJobContextSession({ action: 'read' }, sender(1));
    assert.equal(one.context.job.job_description.length, 15000);
    assert.equal(one.context.job.password, undefined);
    assert.equal(one.secret, undefined);
    assert.equal((await handleJobContextSession({ action: 'read' }, sender(2))).context, undefined);
    assert.equal((await handleJobContextSession({ action: 'read' }, sender(1, 1))).ok, false);
    await handleJobContextSession({ action: 'added' }, sender(1));
    const added = await handleJobContextSession({ action: 'read' }, sender(1));
    assert.equal(added.context, undefined);
    assert.equal(added.lastAdded.job_url, job.job_url);
  } finally { (globalThis as any).chrome = previous; }
});
