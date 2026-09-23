import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const { JSDOM } = createRequire(resolve('package.json'))('jsdom');
import { getJobInfo } from '../src/job-posting-scrape';
import { requestJobReview } from '../src/job-tracker-review-request';

test('Greenhouse uses the actual role and visible job location', () => {
  const dom = new JSDOM('<title>Job Application for Client Billing Specialist at Example Corp</title><h1>Client Billing Specialist</h1><div class="job__location">New York, NY, United States</div>', { url: 'https://job-boards.greenhouse.io/embed/job_app?for=example&token=123' });
  const old = { window: globalThis.window, document: globalThis.document, location: globalThis.location };
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, location: dom.window.location });
  try {
    const job = getJobInfo();
    assert.equal(job?.role_title, 'Client Billing Specialist');
    assert.equal(job?.company_name, 'Example Corp');
    assert.equal(job?.location, 'New York, NY, United States');
  } finally { Object.assign(globalThis, old); dom.window.close(); }
});

test('manual review rejects restricted tabs and reports detection errors', async () => {
  const original = globalThis.chrome;
  let injections = 0;
  let url = 'chrome://extensions/';
  Object.assign(globalThis, { chrome: {
    tabs: { query: async () => [{ id: 1, url }], sendMessage: async () => ({ ok: false, error: 'No job posting found on this page.' }) },
    scripting: { executeScript: async () => { injections++; } },
  } });
  try {
    await assert.rejects(requestJobReview(), /Open a job posting/);
    assert.equal(injections, 0);
    url = 'https://example.com/jobs/1';
    await assert.rejects(requestJobReview(), /No job posting/);
    assert.equal(injections, 0);
  } finally { Object.assign(globalThis, { chrome: original }); }
});

test('manual review reuses the receiver, injecting only when absent', async () => {
  const original = globalThis.chrome;
  let injections = 0;
  let requests = 0;
  Object.assign(globalThis, { chrome: {
    tabs: { query: async () => [{ id: 1, url: 'https://example.com/jobs/1' }], sendMessage: async () => {
      requests++;
      if (requests === 1) throw new Error('Receiving end does not exist');
      return { ok: true };
    } },
    scripting: { executeScript: async () => { injections++; } },
  } });
  try {
    await requestJobReview();
    await requestJobReview();
    assert.equal(injections, 1);
    assert.equal(requests, 3);
  } finally { Object.assign(globalThis, { chrome: original }); }
});
