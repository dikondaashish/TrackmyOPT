/**
 * READ-ONLY live portal audit. Opens real, public job-application pages in a
 * local headless Chromium and runs the extension's own field recognition
 * (findApplicationForm, adapter selection, classifyField, history-section
 * classification) as a dry run. It never writes a value, never uploads, never
 * clicks submit/next, and does not load the extension or any user data.
 *
 *   node scripts/audit-live-portals.mjs [--out report.json]
 *
 * Postings come from each ATS's public job-board API so the URLs are current.
 */
import { chromium } from '@playwright/test';
import { build } from 'esbuild';
import { writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

process.chdir(resolve(dirname(fileURLToPath(import.meta.url)), '..'));
const outIndex = process.argv.indexOf('--out');
const outPath = outIndex > 0 ? process.argv[outIndex + 1] : join(tmpdir(), 'tmo-live-portal-audit.json');

const bundle = (await build({
  stdin: {
    resolveDir: resolve('src'),
    contents: `
      import { classifyField, SENSITIVE_FIELD_RE, normalizeFieldSignal } from './easy-apply/easy-apply-matchers';
      import { getLabelText, queryAllDeep, APPLICATION_CONTROL_SELECTOR, isControlVisible } from './easy-apply/easy-apply-dom';
      import { findApplicationForm } from './easy-apply/easy-apply-form';
      import { selectAtsPrefillAdapter } from './job-portal/ats-prefill-adapters';
      import { isCustomDropdownControl } from './prefill/smart-dropdown';
      import { isCareerPage } from './job-portal/career-sites';
      (window as any).__tmoDryRun = () => {
        const root = findApplicationForm();
        const adapter = selectAtsPrefillAdapter(document);
        if (!root) return { careerPage: isCareerPage(), adapter: adapter.id, formFound: false, controls: [] };
        const history = new Map(adapter.classifyRepeatableSections(root).map(c => [c.element, c.section + ':' + c.field]));
        const controls = queryAllDeep<HTMLElement>(root, APPLICATION_CONTROL_SELECTOR)
          .filter(el => isControlVisible(el) && !['hidden', 'submit', 'button', 'image', 'reset'].includes((el as HTMLInputElement).type))
          .map(el => {
            const label = getLabelText(el).replace(/\\s+/g, ' ').trim();
            const type = el.tagName === 'INPUT' ? (el as HTMLInputElement).type : el.tagName.toLowerCase();
            const control = isCustomDropdownControl(el) ? 'custom-dropdown' : type;
            const historyField = history.get(el as never);
            const kind = historyField ? 'history:' + historyField
              : SENSITIVE_FIELD_RE.test(normalizeFieldSignal(label)) ? 'sensitive (left for applicant)'
              : (classifyField(label) ?? (type === 'file' ? 'file' : 'unrecognized'));
            return { label: label.slice(0, 90), control, kind };
          });
        return { careerPage: isCareerPage(), adapter: adapter.id, formFound: true, controls };
      };
    `,
    loader: 'ts',
  },
  bundle: true, write: false, format: 'iife', platform: 'browser', logLevel: 'silent',
  define: { 'process.env.EXT_TARGET': '"production"' },
})).outputFiles[0].text;

async function json(url) {
  const response = await fetch(url, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.json();
}

const targets = [];
async function add(portal, resolveUrl) {
  try { targets.push({ portal, url: await resolveUrl() }); } catch (error) { targets.push({ portal, url: null, error: String(error.message || error) }); }
}
await add('Greenhouse (job-boards, Anthropic)', async () => (await json('https://boards-api.greenhouse.io/v1/boards/anthropic/jobs')).jobs[0].absolute_url);
await add('Greenhouse (job-boards, Stripe)', async () => (await json('https://boards-api.greenhouse.io/v1/boards/stripe/jobs')).jobs[0].absolute_url);
await add('Lever (Palantir)', async () => `${(await json('https://api.lever.co/v0/postings/palantir?mode=json&limit=1'))[0].hostedUrl}/apply`);
await add('Lever (Spotify)', async () => `${(await json('https://api.lever.co/v0/postings/spotify?mode=json&limit=1'))[0].hostedUrl}/apply`);
await add('Ashby (OpenAI)', async () => `${(await json('https://api.ashbyhq.com/posting-api/job-board/openai')).jobs[0].jobUrl}/application`);
await add('Ashby (Ramp)', async () => `${(await json('https://api.ashbyhq.com/posting-api/job-board/ramp')).jobs[0].jobUrl}/application`);
for (const extra of (process.env.LIVE_AUDIT_URLS || '').split(/\s+/).filter(Boolean)) {
  const [portal, url] = extra.split('=>');
  targets.push({ portal, url });
}

const browser = await chromium.launch({ channel: 'chromium', headless: true });
// Extension content scripts are not bound by the page's CSP; the audit script must not be either.
const context = await browser.newContext({ viewport: { width: 1280, height: 1600 }, bypassCSP: true });
const results = [];
for (const target of targets) {
  if (!target.url) { results.push({ ...target, ok: false }); continue; }
  const page = await context.newPage();
  try {
    await page.goto(target.url, { waitUntil: 'networkidle', timeout: 45_000 }).catch(() => page.waitForLoadState('domcontentloaded'));
    await page.waitForTimeout(2_000);
    await page.addScriptTag({ content: bundle });
    const audit = await page.evaluate(() => window.__tmoDryRun());
    const counts = audit.controls.reduce((acc, c) => {
      const bucket = c.kind === 'unrecognized' ? 'unrecognized' : c.kind.startsWith('sensitive') ? 'sensitive' : c.kind === 'file' ? 'file' : 'recognized';
      acc[bucket] = (acc[bucket] ?? 0) + 1; return acc;
    }, {});
    results.push({ ...target, ok: true, title: await page.title(), ...audit, counts });
    console.log(`${target.portal}: form=${audit.formFound} adapter=${audit.adapter} ${JSON.stringify(counts)}`);
  } catch (error) {
    results.push({ ...target, ok: false, error: String(error.message || error).split('\n')[0] });
    console.log(`${target.portal}: ERROR ${String(error.message || error).split('\n')[0]}`);
  } finally { await page.close(); }
}
await browser.close();
writeFileSync(outPath, JSON.stringify({ ranAt: new Date().toISOString(), results }, null, 2));
console.log(`Report: ${outPath}`);
