/**
 * Controlled browser test for submission confirmation with the REAL built
 * extension: manifest MAIN-world monitor, isolated content runtime, background
 * lifecycle, remote config, and tracker outbox. A Workday-shaped fixture page
 * is served at a Workday host; its own script sends the finalize request when
 * the applicant clicks Submit. Only the network is mocked. Nothing is ever
 * submitted anywhere real.
 *
 *   pnpm build && node scripts/test-submission-browser.mjs
 */
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { cp, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

process.chdir(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const USER_ID = '11111111-1111-4111-8111-111111111111';
const FAKE_JWT = ['e30', Buffer.from(JSON.stringify({ sub: USER_ID, userId: USER_ID, exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url'), 'sig'].join('.');
const PAGE = 'https://acmefixture.wd5.myworkdayjobs.com/en-US/External/job/Dallas-TX/Data-Engineer_R1001/apply/applyManually';
const FINALIZE = '/wday/cxs/acmefixture/jobapplication/0f6b1c1e1111/finalize';

const now = Date.now();
const activeConfig = {
  schemaVersion: 1, version: '2026-10-17.1',
  issuedAt: new Date(now - 60_000).toISOString().replace(/\.\d{3}Z$/, '.000Z'),
  expiresAt: new Date(now + 6 * 24 * 3600_000).toISOString().replace(/\.\d{3}Z$/, '.000Z'),
  killSwitches: {}, detectors: { workday_network: { mode: 'active' } },
};

const fixture = `<!doctype html><html><head><meta charset="utf-8"><title>Data Engineer - Acme Fixture Careers</title>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"JobPosting","title":"Data Engineer","hiringOrganization":{"@type":"Organization","name":"Acme Fixture"},"description":"Build reliable data pipelines with Python and SQL."}</script></head>
<body><div data-automation-id="applyFlowPage"><h2 data-automation-id="jobPostingHeader">Data Engineer</h2><h3>Review</h3>
<div data-automation-id="pageFooter"><button type="button" data-automation-id="pageFooterNextButton">Submit</button></div>
<output id="site-result"></output></div>
<script>
document.querySelector('[data-automation-id="pageFooterNextButton"]').addEventListener('click', async () => {
  // The site's own request, sent in the click turn like a real single-page app.
  const response = await fetch('${FINALIZE}', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  const body = await response.json();
  document.getElementById('site-result').textContent = 'site-read:' + JSON.stringify(body);
  if (body.id && !body.errors) setTimeout(() => {
    document.body.innerHTML = '<div data-automation-id="applicationConfirmationPage"><h2>Application submitted</h2><p>Thank you for applying.</p></div>';
  }, 1500);
});
</script></body></html>`;

async function scenario(name, { config = 'active', finalize, submissionStatus = 200, useKeyboard = false }) {
  const extension = await mkdtemp(join(tmpdir(), 'tmo-submission-ext-'));
  await cp(resolve('dist'), extension, { recursive: true });
  const profile = await mkdtemp(join(tmpdir(), 'tmo-submission-profile-'));
  const context = await chromium.launchPersistentContext(profile, {
    channel: 'chromium', headless: true,
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
  });
  const submissions = [];
  const finalizeHits = [];
  try {
    await context.route('https://**/*', async route => {
      const url = new URL(route.request().url());
      const json = (body, status = 200, headers = {}) => route.fulfill({ status, contentType: 'application/json', headers, body: JSON.stringify(body) });
      if (url.hostname === 'www.trackmyopt.com') {
        if (url.pathname === '/api/extension/token') return json({ token: FAKE_JWT, userId: USER_ID });
        if (url.pathname === '/api/me') return json({ user: { email: 'test@example.test' }, profile: {}, applicationProfile: {} });
        if (url.pathname === '/api/premium/status') return json({ isPremium: false });
        if (url.pathname === '/api/extension/config') {
          return config === 'active' ? json({ config: activeConfig }, 200, { ETag: '"cfg-1"' }) : route.fulfill({ status: 204, body: '' });
        }
        if (url.pathname === '/api/extension/application-submission') {
          submissions.push(JSON.parse(route.request().postData() || '{}'));
          return json(submissionStatus === 200 ? { ok: true, application_id: '33333333-3333-4333-8333-333333333333', status: 'Applied' } : { error: 'down' }, submissionStatus);
        }
        if (url.pathname === '/api/extension/job-application') return json({ saved: false });
        return json({ ok: true });
      }
      if (url.pathname === FINALIZE) { finalizeHits.push(route.request().method()); return json(finalize.body, finalize.status ?? 200); }
      if (url.href.startsWith(PAGE.split('/apply')[0])) return route.fulfill({ contentType: 'text/html', body: fixture });
      return route.fulfill({ status: 404, body: '' });
    });
    // Let the worker start, fetch the token and the remote config.
    const worker = context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker');
    const effectiveMode = async () => worker.evaluate(async () => (await chrome.storage.local.get('tmo_effective_config_v1')).tmo_effective_config_v1?.detectors?.workday_network);
    for (let i = 0; i < 40 && (await effectiveMode()) !== (config === 'active' ? 'active' : 'shadow'); i += 1) await new Promise(r => setTimeout(r, 250));
    const mode = await effectiveMode();
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto(PAGE);
    await page.waitForTimeout(2500); // runtime activation + submission tracking start
    if (useKeyboard) {
      await page.focus('[data-automation-id="pageFooterNextButton"]');
      await page.keyboard.press('Enter');
    } else {
      await page.click('[data-automation-id="pageFooterNextButton"]');
    }
    const statusText = () => page.evaluate(() => {
      const host = document.getElementById('tmo-job-tracker-widget');
      return host?.shadowRoot?.querySelector('.tmo-submission-status-text')?.textContent
        || document.querySelector('#tmo-submission-status-floating .tmo-submission-status-text')?.textContent || '';
    });
    let text = '';
    for (let i = 0; i < 40; i += 1) {
      text = await statusText();
      if (/confirmed|failed|sync pending/i.test(text)) break;
      await page.waitForTimeout(250);
    }
    const siteResult = await page.evaluate(() => document.getElementById('site-result')?.textContent ?? '(replaced by confirmation page)');
    return { name, mode, text, submissions, finalizeHits, siteResult, errors };
  } finally {
    await context.close();
  }
}

const results = [];
const run = async (name, options, check) => {
  const result = await scenario(name, options);
  results.push(result);
  check(result);
  console.log(`ok - ${name}: ${result.text}`);
};

await run('active detector confirms a successful Workday finalize', { finalize: { body: { id: 'wd-app-1' } } }, r => {
  assert.equal(r.mode, 'active');
  assert.match(r.text, /Submission confirmed/);
  assert.equal(r.submissions.length, 1);
  assert.equal(r.submissions[0].evidence.kind, 'network');
  assert.equal(r.submissions[0].evidence.verdict, 'success');
  assert.equal(r.submissions[0].confirmation, 'automatic');
  assert.deepEqual(r.finalizeHits, ['POST'], 'the site request went through exactly once');
  assert.ok(!JSON.stringify(r.submissions[0]).includes('wd-app-1'), 'no response body is stored');
  assert.deepEqual(r.errors, []);
});

await run('HTTP 200 with application errors is a failed submission', { finalize: { body: { errors: [{ message: 'Required' }] } } }, r => {
  assert.match(r.text, /Submission failed/);
  assert.equal(r.submissions.length, 0);
  assert.match(r.siteResult, /site-read:\{"errors"/, 'the site still read its own response');
});

await run('shadow mode waits for the confirmation page', { config: 'none', finalize: { body: { id: 'wd-app-2' } } }, r => {
  assert.equal(r.mode, 'shadow');
  assert.match(r.text, /Submission confirmed/);
  assert.equal(r.submissions.length, 1);
  assert.equal(r.submissions[0].evidence.kind, 'page');
});

await run('tracker sync failure shows sync pending, not a failed application', { finalize: { body: { id: 'wd-app-3' } }, submissionStatus: 503 }, r => {
  assert.match(r.text, /Application submitted; tracker sync pending/);
  assert.equal(r.submissions.length, 1);
});

await run('keyboard Enter on Submit is detected', { finalize: { body: { id: 'wd-app-4' } }, useKeyboard: true }, r => {
  assert.match(r.text, /Submission confirmed/);
  assert.equal(r.submissions.length, 1);
});

console.log(JSON.stringify({ passed: results.length }, null, 0));
