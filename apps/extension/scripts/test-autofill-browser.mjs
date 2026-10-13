/**
 * Browser-level end-to-end prefill test with the REAL built extension loaded.
 *
 * Chromium loads dist/ unpacked. Portal-shaped fixture pages (tests/fixtures/
 * portals) are served at real ATS hostnames so the manifest's content-script
 * patterns, career-page detection, and adapter selection all run for real.
 * Only the network is mocked: a fake signed-in session, a fictitious profile,
 * and a generated-resume artifact built with the extension's own builder. The
 * test clicks the widget's actual "Prefill" button and asserts what landed.
 *
 *   pnpm build && node scripts/test-autofill-browser.mjs
 *
 * Writes a JSON report to $AUTOFILL_BROWSER_REPORT (default: os.tmpdir()).
 */
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { mkdtemp, cp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

process.chdir(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const FIXTURES = resolve('tests/fixtures/portals');
const reportPath = process.env.AUTOFILL_BROWSER_REPORT || join(tmpdir(), 'tmo-autofill-browser-report.json');

// Build the artifact with the extension's own code so it passes its own validator.
const builderOut = join(await mkdtemp(join(tmpdir(), 'tmo-artifact-builder-')), 'builder.mjs');
await build({ entryPoints: ['src/resume/resume-artifact-lifecycle.ts'], bundle: true, format: 'esm', platform: 'node', outfile: builderOut, logLevel: 'silent' });
const { buildGeneratedResumeArtifactV1 } = await import(pathToFileURL(builderOut).href);

const PDF = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[]/Count 0>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n').toString('base64');
const month = (m, y) => ({ originalText: `${m}/${y}`, month: m, year: y, precision: 'month' });
const SNAPSHOT = {
  contact: {}, skills: [], certifications: [],
  summary: 'Data engineer who builds reliable pipelines and analytics products.',
  experience: [
    { company: 'Acme Analytics', title: 'Senior Data Engineer', isCurrent: true, startDate: month(3, 2022), bullets: [], descriptionText: 'Built streaming pipelines.' },
    { company: 'Globex', title: 'Data Engineer', isCurrent: false, startDate: month(1, 2019), endDate: month(2, 2022), bullets: [], descriptionText: 'Maintained the warehouse.' },
    { company: 'Initech', title: 'Data Analyst', isCurrent: false, startDate: month(6, 2017), endDate: month(12, 2018), bullets: [], descriptionText: 'Reporting.' },
    { company: 'Hooli', title: 'Analytics Intern', isCurrent: false, startDate: month(5, 2016), endDate: month(8, 2016), bullets: [], descriptionText: 'Dashboards.' },
  ],
  education: [
    { school: 'Northeastern University', degree: 'Master of Science', fieldOfStudy: 'Data Science' },
    { school: 'Example State University', degree: 'Bachelor of Science', fieldOfStudy: 'Mathematics' },
  ],
};
async function artifactFor(jobUrl) {
  const finalLatex = `\\documentclass{article}% fixture ${jobUrl}`;
  const { artifact } = await buildGeneratedResumeArtifactV1({
    sourceResumeId: '__latest__', sourceResumeFilename: 'resume.pdf', templateId: 'classic',
    jobKey: `Acme Fixture|Data Engineer|${jobUrl}`,
    jobContext: { jobUrl, companyName: 'Acme Fixture', roleTitle: 'Data Engineer' },
    finalLatex, extractedContentHash: createHash('sha256').update(finalLatex).digest('hex'),
    extractedSnapshot: SNAPSHOT, pdfBase64: PDF, pdfFilename: 'Test_Applicant_Resume.pdf',
  });
  return artifact;
}

const PROFILE = {
  first_name: 'Test', last_name: 'Applicant', application_email: 'test.applicant@example.test',
  phone: '+1 (555) 123-4567', country: 'United States', city: 'Dallas', state: 'TX',
  linkedin_url: 'https://www.linkedin.com/in/test-applicant', github_url: 'https://github.com/test-applicant',
};
const FAKE_JWT = ['e30', Buffer.from(JSON.stringify({ sub: 'user-e2e', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url'), 'sig'].join('.');

const PORTALS = [
  { name: 'Generic company career site', url: 'https://careers.acmefixture.com/careers/1001/apply', file: 'generic-career-site.html' },
  { name: 'Greenhouse (classic board)', url: 'https://boards.greenhouse.io/acmefixture/jobs/4000001', file: 'greenhouse.html' },
  { name: 'Lever', url: 'https://jobs.lever.co/acmefixture/0f6b1c1e-1111-4a4a-9b9b-123456789abc/apply', file: 'lever.html' },
  { name: 'Workday (My Experience step)', url: 'https://acmefixture.wd5.myworkdayjobs.com/en-US/External/job/Dallas-TX/Data-Engineer_R1001/apply', file: 'workday.html' },
  { name: 'Ashby', url: 'https://jobs.ashbyhq.com/acmefixture/0f6b1c1e-2222-4a4a-9b9b-123456789abc/application', file: 'ashby.html' },
];

const extension = await mkdtemp(join(tmpdir(), 'tmo-autofill-ext-'));
await cp(resolve('dist'), extension, { recursive: true });
const profileDir = await mkdtemp(join(tmpdir(), 'tmo-autofill-profile-'));
const context = await chromium.launchPersistentContext(profileDir, {
  channel: 'chromium', headless: true,
  args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
});
const deadline = setTimeout(() => { console.error('autofill browser test exceeded 4 minutes'); void context.close(); process.exit(2); }, 240_000);
deadline.unref();

const apiHits = new Map();
await context.route('https://**/*', async route => {
  const url = new URL(route.request().url());
  const json = (body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  if (url.hostname === 'www.trackmyopt.com') {
    apiHits.set(url.pathname, (apiHits.get(url.pathname) ?? 0) + 1);
    if (url.pathname === '/api/extension/token') return json({ token: FAKE_JWT, userId: 'user-e2e' });
    if (url.pathname === '/api/me') return json({ user: { email: PROFILE.application_email }, profile: {}, applicationProfile: PROFILE });
    if (url.pathname === '/api/premium/status') return json({ isPremium: true, planName: 'pro' });
    if (url.pathname === '/api/private-application-answers') return json({ data: null });
    if (url.pathname === '/api/extension/resume-artifact' && route.request().method() === 'GET') {
      const artifact = await artifactFor(url.searchParams.get('jobUrl'));
      return json({ ok: true, artifact, generatedAt: artifact.generatedAt, expiresAt: artifact.expiresAt });
    }
    return json({ error: 'not_signed_in' }, 401);
  }
  if (url.pathname === '/_fixture/_shared.js') {
    return route.fulfill({ contentType: 'text/javascript', body: readFileSync(join(FIXTURES, '_shared.js')) });
  }
  const portal = PORTALS.find(entry => new URL(entry.url).hostname === url.hostname && new URL(entry.url).pathname === url.pathname);
  if (portal) return route.fulfill({ contentType: 'text/html', body: readFileSync(join(FIXTURES, portal.file)) });
  return route.fulfill({ status: 404, body: '' });
});

async function openAndPrefill(portal, timings) {
  const t0 = Date.now();
  const mark = name => { timings[name] = Date.now() - t0; };
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  await page.goto(portal.url);
  const button = page.locator('.tmo-prefill-button');
  // The widget may start collapsed; its launcher opens the tools panel.
  for (let attempt = 0; attempt < 40 && !(await button.isVisible().catch(() => false)); attempt += 1) {
    const launcher = page.locator('#tmo-job-tracker-widget [aria-expanded="false"]').first();
    if (await launcher.isVisible().catch(() => false)) await launcher.click().catch(() => {});
    await page.waitForTimeout(250);
  }
  assert.ok(await button.isVisible(), `${portal.name}: Prefill button never became visible`);
  mark('buttonVisible');
  // Wait until the widget knows a resume exists for this job (label flips to "+ resume").
  await page.waitForFunction(() => {
    const host = document.getElementById('tmo-job-tracker-widget');
    const label = host?.shadowRoot?.querySelector('.tmo-prefill-button .tmo-action-label')?.textContent || '';
    return /resume/i.test(label);
  }, null, { timeout: 15_000 }).catch(() => {});
  mark('resumeReady');
  // The click handler marks the button busy for the whole run. The widget can
  // re-render while it settles, so a click that started no run is retried
  // (and counted in the report rather than hidden).
  let started = false;
  for (let attempt = 0; attempt < 4 && !started; attempt += 1) {
    if (attempt > 0) timings.clickRetries = attempt;
    await button.click();
    started = await page.waitForFunction(() => {
      const host = document.getElementById('tmo-job-tracker-widget');
      const b = host?.shadowRoot?.querySelector('.tmo-prefill-button');
      return b?.getAttribute('aria-busy') === 'true' || b?.getAttribute('aria-busy') === 'false';
    }, null, { timeout: 3_000 }).then(() => true, () => false);
  }
  assert.ok(started, `${portal.name}: Prefill click never started a run`);
  mark('busy');
  await page.waitForFunction(() => {
    const host = document.getElementById('tmo-job-tracker-widget');
    return host?.shadowRoot?.querySelector('.tmo-prefill-button')?.getAttribute('aria-busy') === 'false';
  }, null, { timeout: 60_000 });
  mark('done');
  const summary = await page.evaluate(() => {
    const root = document.getElementById('tmo-job-tracker-widget')?.shadowRoot;
    return root?.querySelector('.tmo-prefill-run-summary')?.textContent?.trim() || root?.querySelector('.tmo-prefill-result-line')?.textContent?.trim() || '';
  });
  return { page, summary, errors };
}

const values = (page, selectors) => page.evaluate(list => Object.fromEntries(list.map(selector => {
  const el = document.querySelector(selector);
  if (!el) return [selector, null];
  if (el.type === 'file') return [selector, el.files?.length ? el.files[0].name : ''];
  if (el.type === 'checkbox') return [selector, el.checked];
  if (el.tagName === 'BUTTON') return [selector, el.textContent.trim()];
  if (el.hasAttribute('aria-valuetext')) return [selector, el.getAttribute('aria-valuetext')];
  return [selector, el.value];
})), selectors);

const report = [];
const ONLY = process.env.AUTOFILL_ONLY ? new RegExp(process.env.AUTOFILL_ONLY, 'i') : null;
async function check(portal, verify) {
  if (ONLY && !ONLY.test(portal.name)) return;
  const entry = { portal: portal.name, url: portal.url, passed: false, summary: '', failures: [] };
  report.push(entry);
  const started = Date.now();
  try {
    entry.timings = {};
    const { page, summary, errors } = await openAndPrefill(portal, entry.timings);
    entry.summary = summary;
    await verify(page, entry);
    assert.equal(await page.evaluate(() => document.body.dataset.submitted || ''), '', 'the form must never be submitted');
    if (errors.length) entry.pageErrors = errors;
    entry.passed = entry.failures.length === 0;
    await page.close();
  } catch (error) {
    entry.failures.push(String(error?.message || error).split('\n')[0]);
    // Diagnostic snapshot of what the page holds when a run stalls.
    const page = context.pages().find(candidate => candidate.url() === portal.url);
    if (page) entry.stalledState = await page.evaluate(() => Array.from(document.querySelectorAll('input:not([type=file]),textarea,button[aria-haspopup]'))
      .map(el => `${el.getAttribute('aria-label') || el.id || el.getAttribute('data-automation-id')}=${el.tagName === 'BUTTON' ? el.textContent.trim() : el.type === 'checkbox' ? el.checked : el.value}`)).catch(() => undefined);
  }
  entry.durationMs = Date.now() - started;
  console.log(`${entry.passed ? 'PASS' : 'FAIL'} ${portal.name} — ${entry.summary || 'no summary'}${entry.failures.length ? `\n   ${entry.failures.join('\n   ')}` : ''}`);
}
const expect = (entry, label, actual, expected) => {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) entry.failures.push(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
};

try {
  await check(PORTALS[0], async (page, entry) => {
    const v = await values(page, ['#first', '#middle', '#last', '#email', '#cc', '#ph', '#country', '#state', '#city', '#linkedin', '#cur-co', '#summary', '#auth', '#sponsor', '#salary', '#resume']);
    expect(entry, 'first name', v['#first'], 'Test');
    expect(entry, 'middle name stays blank (unknown)', v['#middle'], '');
    expect(entry, 'email', v['#email'], 'test.applicant@example.test');
    expect(entry, 'country code', v['#cc'], 'US');
    expect(entry, 'phone without duplicate code', v['#ph'], '(555) 123-4567');
    expect(entry, 'country', v['#country'], 'United States of America');
    expect(entry, 'state', v['#state'], 'Texas');
    expect(entry, 'city', v['#city'], 'Dallas');
    expect(entry, 'linkedin', v['#linkedin'], PROFILE.linkedin_url);
    expect(entry, 'current company', v['#cur-co'], 'Acme Analytics');
    expect(entry, 'summary', v['#summary'], SNAPSHOT.summary);
    expect(entry, 'work authorization left for the applicant', v['#auth'], '');
    expect(entry, 'sponsorship left for the applicant', v['#sponsor'], '');
    expect(entry, 'salary never guessed', v['#salary'], '');
    expect(entry, 'resume attached', v['#resume'], 'Test_Applicant_Resume.pdf');
    const rows = await page.evaluate(() => ['#exp', '#edu'].map(id => Array.from(document.querySelectorAll(`${id} [data-record-index]`))
      .map(row => Array.from(row.querySelectorAll('input,select')).map(el => el.value))));
    expect(entry, 'work experience rows', rows[0], [
      ['Acme Analytics', 'Senior Data Engineer', '03/2022', ''],
      ['Globex', 'Data Engineer', '01/2019', '02/2022'],
      ['Initech', 'Data Analyst', '06/2017', '12/2018'],
      ['Hooli', 'Analytics Intern', '05/2016', '08/2016'],
    ]);
    expect(entry, 'education rows', rows[1], [
      ['Northeastern University', "Master's Degree", 'Data Science'],
      ['Example State University', "Bachelor's Degree", 'Mathematics'],
    ]);
    if (!/4 experience records/.test(entry.summary) || !/2 education records/.test(entry.summary)) entry.failures.push(`summary lacks record counts: ${entry.summary}`);
  });

  await check(PORTALS[1], async (page, entry) => {
    const v = await values(page, ['#first_name', '#last_name', '#email', '#phone', '#candidate-location', '#q1', '#q2', '#q3', '#gender', '#resume']);
    expect(entry, 'first name', v['#first_name'], 'Test');
    expect(entry, 'last name', v['#last_name'], 'Applicant');
    expect(entry, 'email', v['#email'], 'test.applicant@example.test');
    expect(entry, 'phone (as stored)', v['#phone'], '+1 (555) 123-4567');
    expect(entry, 'location typeahead picks Dallas, Texas', v['#candidate-location'], 'Dallas, Texas, United States');
    expect(entry, 'linkedin', v['#q1'], PROFILE.linkedin_url);
    expect(entry, 'current company', v['#q2'], 'Acme Analytics');
    expect(entry, 'sponsorship left for the applicant', v['#q3'], '');
    expect(entry, 'demographics left for the applicant', v['#gender'], '');
    expect(entry, 'resume attached', v['#resume'], 'Test_Applicant_Resume.pdf');
  });

  await check(PORTALS[2], async (page, entry) => {
    const v = await values(page, ['[name="name"]', '[name="email"]', '[name="phone"]', '[name="org"]', '[name="urls[LinkedIn]"]', '[name="urls[GitHub]"]', '[name="resume"]']);
    expect(entry, 'full name', v['[name="name"]'], 'Test Applicant');
    expect(entry, 'email', v['[name="email"]'], 'test.applicant@example.test');
    expect(entry, 'phone', v['[name="phone"]'], '+1 (555) 123-4567');
    expect(entry, 'current company', v['[name="org"]'], 'Acme Analytics');
    expect(entry, 'linkedin', v['[name="urls[LinkedIn]"]'], PROFILE.linkedin_url);
    expect(entry, 'github', v['[name="urls[GitHub]"]'], PROFILE.github_url);
    expect(entry, 'resume attached', v['[name="resume"]'], 'Test_Applicant_Resume.pdf');
  });

  await check(PORTALS[3], async (page, entry) => {
    const rows = await page.evaluate(() => Array.from(document.querySelectorAll('[data-automation-id="workExperienceCard"]')).map(card => ({
      title: card.querySelector('[data-automation-id="jobTitle"]').value,
      company: card.querySelector('[data-automation-id="company"]').value,
      current: card.querySelector('[data-automation-id="currentlyWorkHere"]').checked,
      from: Array.from(card.querySelectorAll('[data-automation-id="formField-startDate"] input')).map(i => i.value).join('/'),
      to: Array.from(card.querySelectorAll('[data-automation-id="formField-endDate"] input')).map(i => i.value).join('/'),
    })));
    expect(entry, 'work experience cards', rows, [
      { title: 'Senior Data Engineer', company: 'Acme Analytics', current: true, from: '03/2022', to: '/' },
      { title: 'Data Engineer', company: 'Globex', current: false, from: '01/2019', to: '02/2022' },
      { title: 'Data Analyst', company: 'Initech', current: false, from: '06/2017', to: '12/2018' },
      { title: 'Analytics Intern', company: 'Hooli', current: false, from: '05/2016', to: '08/2016' },
    ]);
    const edu = await page.evaluate(() => Array.from(document.querySelectorAll('[data-automation-id="educationCard"]')).map(card => ({
      school: card.querySelector('[data-automation-id="school"]').value,
      degree: card.querySelector('button[aria-haspopup="listbox"]').textContent.trim(),
    })));
    expect(entry, 'education cards', edu, [
      { school: 'Northeastern University', degree: "Master's Degree" },
      { school: 'Example State University', degree: "Bachelor's Degree" },
    ]);
    const v = await values(page, ['#li', '#resumeAttachments--attachments']);
    expect(entry, 'linkedin', v['#li'], PROFILE.linkedin_url);
    expect(entry, 'resume attached', v['#resumeAttachments--attachments'], 'Test_Applicant_Resume.pdf');
    if (!/4 experience records/.test(entry.summary)) entry.failures.push(`summary lacks record counts: ${entry.summary}`);
    const nextClicked = await page.evaluate(() => document.querySelector('[data-automation-id="bottom-navigation-next-button"]').dataset.clicked || '');
    expect(entry, 'Save and Continue never clicked', nextClicked, '');
  });

  await check(PORTALS[4], async (page, entry) => {
    const v = await values(page, ['#nm', '#em', '#ph', '#li', '#yrs', '#cv']);
    expect(entry, 'name', v['#nm'], 'Test Applicant');
    expect(entry, 'email', v['#em'], 'test.applicant@example.test');
    expect(entry, 'phone in requested international form', v['#ph'], '+15551234567');
    expect(entry, 'linkedin', v['#li'], PROFILE.linkedin_url);
    expect(entry, 'skill-specific years never guessed', v['#yrs'], '');
    expect(entry, 'resume attached', v['#cv'], 'Test_Applicant_Resume.pdf');
  });
} finally {
  writeFileSync(reportPath, JSON.stringify({ ranAt: new Date().toISOString(), apiHits: Object.fromEntries(apiHits), report }, null, 2));
  await context.close();
}
console.log(`Report: ${reportPath}`);
const failed = report.filter(entry => !entry.passed);
if (failed.length) { console.error(`${failed.length} portal fixture(s) failed`); process.exit(1); }
console.log(`All ${report.length} portal fixtures passed`);
