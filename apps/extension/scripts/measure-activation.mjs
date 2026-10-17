import { chromium } from '@playwright/test';
import { mkdtemp, readFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

// Repeatable activation diagnostics on synthetic pages served at matched
// hosts. Figures are page-target CPU samples from one machine, not real-site
// latency claims. Usage: node scripts/measure-activation.mjs [runs]
const runs = Math.max(1, Number(process.argv[2]) || 5);
const extension = resolve('dist');
const workdayHtml = await readFile(resolve('tests/fixtures/portals/workday.html'), 'utf8');
const sharedJs = await readFile(resolve('tests/fixtures/portals/_shared.js'), 'utf8');

const scenarios = [
  {
    name: 'irrelevant_page',
    url: 'https://www.indeed.com/privacy',
    html: '<!doctype html><html><head><title>Privacy information</title></head><body><main><h1>Privacy information</h1><p>Learn about privacy settings.</p></main></body></html>',
  },
  { name: 'workday_application', url: 'https://acme.wd5.myworkdayjobs.com/en-US/External/job/Analyst_R-1/apply', html: workdayHtml },
  {
    name: 'workday_confirmation',
    url: 'https://acme.wd5.myworkdayjobs.com/en-US/External/job/Analyst_R-1/apply/confirmation',
    html: '<!doctype html><html><head><title>Application submitted</title></head><body><main><div data-automation-id="applicationConfirmationPage"><h2>Application submitted</h2><p>Thank you for applying.</p></div></main></body></html>',
  },
];

async function sample(scenario, enabled) {
  const profile = await mkdtemp(join(tmpdir(), `tmo-activation-${enabled ? 'on' : 'off'}-`));
  const args = enabled ? [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`] : [];
  const context = await chromium.launchPersistentContext(profile, { channel: 'chromium', headless: true, args });
  try {
    await context.route('https://**/*', route => {
      const requestUrl = route.request().url();
      if (requestUrl === scenario.url) return route.fulfill({ contentType: 'text/html', body: scenario.html });
      if (requestUrl.endsWith('/_fixture/_shared.js')) return route.fulfill({ contentType: 'text/javascript', body: sharedJs });
      return route.abort();
    });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    const scripts = [];
    cdp.on('Debugger.scriptParsed', event => scripts.push(event.url));
    await cdp.send('Debugger.enable');
    await cdp.send('Performance.enable');
    const metrics = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(item => [item.name, item.value]));
    const before = await metrics();
    const started = Date.now();
    await page.goto(scenario.url);
    let widgetMs = null;
    const deadline = started + 9000;
    while (Date.now() < deadline) {
      if (widgetMs === null && await page.locator('#tmo-job-tracker-widget').count()) widgetMs = Date.now() - started;
      await page.waitForTimeout(100);
    }
    const after = await metrics();
    return {
      taskSeconds: after.TaskDuration - before.TaskDuration,
      scriptSeconds: after.ScriptDuration - before.ScriptDuration,
      runtimeLoaded: scripts.some(script => script.endsWith('/content-job-portal-runtime.js')),
      widgetMs,
    };
  } finally { await context.close(); }
}

const median = values => {
  const sorted = values.filter(value => value !== null).sort((a, b) => a - b);
  return sorted.length ? +sorted[Math.floor(sorted.length / 2)].toFixed(4) : null;
};
const sizes = {};
for (const file of ['content-job-portal.js', 'content-job-portal-runtime.js', 'background.js', 'submission-monitor-workday.js']) {
  sizes[file] = await stat(join(extension, file)).then(info => info.size).catch(() => null);
}
const report = { runs, bundleBytes: sizes, scenarios: {} };
for (const scenario of scenarios) {
  const off = []; const on = [];
  for (let index = 0; index < runs; index += 1) {
    off.push(await sample(scenario, false));
    on.push(await sample(scenario, true));
  }
  report.scenarios[scenario.name] = {
    withoutExtension: { taskSeconds: median(off.map(item => item.taskSeconds)), scriptSeconds: median(off.map(item => item.scriptSeconds)) },
    withExtension: {
      taskSeconds: median(on.map(item => item.taskSeconds)),
      scriptSeconds: median(on.map(item => item.scriptSeconds)),
      runtimeLoadedRuns: on.filter(item => item.runtimeLoaded).length,
      widgetMountedRuns: on.filter(item => item.widgetMs !== null).length,
      widgetMs: median(on.map(item => item.widgetMs)),
    },
  };
}
console.log(JSON.stringify({ ...report,
  note: 'Median of synthetic-page samples on one machine; CPU figures are diagnostics, not real-site latency claims.' }, null, 2));
