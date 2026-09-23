import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';
import { shouldRunContinuousPrefill } from '../src/continuous-prefill';
const requireLocal = createRequire(resolve('package.json'));
const { JSDOM } = requireLocal('jsdom');
const portal = readFileSync('src/content-job-portal.ts', 'utf8');
// Execute the actual scheduler with controlled async work, DOM mutations and time.
const scheduler = portal.slice(portal.indexOf('let _spaObserver:'), portal.indexOf('async function initializeAutofillPreferences'));
const code = requireLocal('esbuild').transformSync(scheduler + `
  globalThis.api = { startContinuousPrefill, stopContinuousPrefill, runContinuousPrefill, scheduleContinuousPrefill, scheduleGuidedNavigation,
    setMode(mode) { currentAutofillPreferences.mode = mode; mode === 'continuous' ? startContinuousPrefill() : stopContinuousPrefill(); },
    setGuidedTimer(id) { guidedNavigationTimer = id; }
  };`, { loader: 'ts' }).code;
function harness() {
  const dom = new JSDOM('<body><form><input aria-label="Email"></form></body>', { url: 'https://jobs.example.test/job/1' });
  const timers = new Map<number, () => void>(); let id = 0;
  dom.window.setTimeout = (fn: () => void) => { timers.set(++id, fn); return id; };
  dom.window.clearTimeout = (key: number) => timers.delete(key);
  let signature = 'job:1|1:email';
  const passes: Array<{ finish: (result?: any) => void; allowed: () => boolean }> = [];
  const tracked: string[] = [];
  const context: any = {
    window: dom.window, document: dom.window.document, Element: dom.window.Element, MutationObserver: dom.window.MutationObserver,
    AUTOFILL_FEATURE_FLAGS: { continuousMode: true, guidedAutopilot: false },
    currentPlanEntitlements: { continuousMode: true }, currentAutofillPreferences: { mode: 'continuous', guidedAutopilot: false },
    WIDGET_ROOT_ID: 'widget', shouldRunContinuousPrefill,
    getPrefillCandidateSignature: () => signature, getJobInfo: () => ({ job_url: dom.window.location.href }),
    executeResolvedPrefill: (_job: any, _mode: any, allowed = () => true) => new Promise(resolve => passes.push({ allowed, finish: (result = { result: { total: 0 } }) => resolve(result) })),
    trackPrefillExecution: () => tracked.push('success'), trackPrefillRuntimeFailure: () => tracked.push('error'),
    paintContinuousStopGuidance: () => {},
    findApplicationForm: () => dom.window.document.querySelector('form'),
    guidedClickedControls: new WeakSet(), guidedStatus: () => {},
    runGuidedNavigation: () => { tracked.push('navigation'); return {outcome:'advanced'}; },
    trackWidgetAnalytics: () => {},
  };
  vm.runInNewContext(code, context);
  return { dom, timers, passes, tracked, context, api: context.api, signature: (next: string) => { signature = next; }, tick: () => { const batch = [...timers.values()]; timers.clear(); batch.forEach(fn => fn()); } };
}
const flush = () => new Promise(resolve => setImmediate(resolve));
function enableGuided(h: ReturnType<typeof harness>) {
  h.context.AUTOFILL_FEATURE_FLAGS.guidedAutopilot = true;
  h.context.currentPlanEntitlements.guidedAutopilot = true;
  h.context.currentAutofillPreferences.guidedAutopilot = true;
}
test('guided stays paused after the artifact resolver refuses the current job', async () => {
  const h = harness(); try {
    enableGuided(h); const run = h.api.runContinuousPrefill(); h.passes[0].finish({ stoppedReason:'job_changed' }); await run;
    h.tick(); await h.api.runContinuousPrefill(); h.tick();
    assert.equal(h.tracked.includes('navigation'), false);
  } finally { h.dom.window.close(); }
});
test('guided resumes after manual answers even when no prefillable candidates remain', async () => {
  const h = harness(); try {
    enableGuided(h); h.signature(''); await h.api.runContinuousPrefill(); h.tick();
    assert.ok(h.tracked.includes('navigation'));
  } finally { h.dom.window.close(); }
});
test('guided timer never clicks a new page after SPA navigation', () => {
  const h = harness(); try {
    enableGuided(h); h.api.scheduleGuidedNavigation(); h.dom.window.history.pushState({}, '', '/job/2'); h.tick();
    assert.equal(h.tracked.includes('navigation'), false);
  } finally { h.dom.window.close(); }
});
test('guided timer never clicks a replaced step', () => {
  const h = harness(); try {
    enableGuided(h); h.api.scheduleGuidedNavigation(); h.dom.window.document.querySelector('form').outerHTML = '<form><input></form>'; h.tick();
    assert.equal(h.tracked.includes('navigation'), false);
  } finally { h.dom.window.close(); }
});
test('guided timer never clicks when an ATS reuses the form for a new step', () => {
  const h = harness(); try {
    enableGuided(h); h.api.scheduleGuidedNavigation(); h.dom.window.document.querySelector('form').innerHTML = '<input aria-label="Phone"><button>Next</button>'; h.tick();
    assert.equal(h.tracked.includes('navigation'), false);
  } finally { h.dom.window.close(); }
});
test('guided never falls back to clicking arbitrary document buttons without an application', () => {
  const h = harness(); try {
    enableGuided(h); h.dom.window.document.querySelector('form').remove(); h.api.scheduleGuidedNavigation(); h.tick();
    assert.equal(h.tracked.includes('navigation'), false);
  } finally { h.dom.window.close(); }
});
test('manual input schedules re-evaluation of a paused guided step', async () => {
  const h = harness(); try {
    enableGuided(h); h.api.startContinuousPrefill(); h.tick(); h.passes[0].finish(); await flush(); h.tick();
    h.dom.window.document.querySelector('input').dispatchEvent(new h.dom.window.Event('input', { bubbles:true }));
    assert.equal(h.timers.size, 1);
  } finally { h.api.stopContinuousPrefill(); h.dom.window.close(); }
});
test('switching to Step-by-step invalidates an in-flight Continuous pass', async () => {
  const h = harness(); try {
    const run = h.api.runContinuousPrefill(); h.api.setMode('step_by_step');
    assert.equal(h.passes[0].allowed(), false);
    h.passes[0].finish(); await run;
    assert.deepEqual(h.tracked, []);
  } finally { h.dom.window.close(); }
});
test('rapid mode changes never overlap two engine passes', async () => {
  const h = harness(); try {
    const run = h.api.runContinuousPrefill(); h.api.setMode('step_by_step'); h.api.setMode('continuous'); h.tick();
    assert.equal(h.passes.length, 1);
    h.passes[0].finish(); await run; h.tick();
    assert.equal(h.passes.length, 2); h.passes[1].finish(); await flush();
  } finally { h.dom.window.close(); }
});
test('self-induced mutations do not endlessly retry unfillable controls', async () => {
  const h = harness(); try {
    const run = h.api.runContinuousPrefill(); h.api.scheduleContinuousPrefill();
    h.passes[0].finish(); await run; h.tick();
    assert.equal(h.passes.length, 1);
  } finally { h.dom.window.close(); }
});
test('new fields arriving during a pass receive one follow-up pass', async () => {
  const h = harness(); try {
    const run = h.api.runContinuousPrefill(); h.signature('job:1|2:phone'); h.api.scheduleContinuousPrefill();
    h.passes[0].finish(); await run; h.tick();
    assert.equal(h.passes.length, 2); h.passes[1].finish(); await flush();
  } finally { h.dom.window.close(); }
});
test('navigation invalidates a payload before it can fill another page', async () => {
  const h = harness(); try {
    const run = h.api.runContinuousPrefill(); h.dom.window.history.pushState({}, '', '/job/2');
    assert.equal(h.passes[0].allowed(), false); h.passes[0].finish(); await run;
    assert.deepEqual(h.tracked, []);
  } finally { h.dom.window.close(); }
});
test('stopping clears any queued guided navigation', () => {
  const h = harness(); try {
    const id = h.dom.window.setTimeout(() => {}, 1200); h.api.setGuidedTimer(id); h.api.stopContinuousPrefill();
    assert.equal(h.timers.has(id), false);
  } finally { h.dom.window.close(); }
});
test('attribute-only step reveals trigger Continuous without starving the timer', async () => {
  const h = harness(); try {
    h.api.startContinuousPrefill(); const firstTimer = [...h.timers.keys()][0];
    h.api.scheduleContinuousPrefill(); assert.equal([...h.timers.keys()][0], firstTimer);
    h.tick(); h.passes[0].finish(); await flush();
    h.dom.window.document.querySelector('form').setAttribute('hidden', ''); await flush();
    assert.equal(h.timers.size, 1);
  } finally { h.api.stopContinuousPrefill(); h.dom.window.close(); }
});

const engine = readFileSync('src/easy-apply-engine.ts', 'utf8');
const engineCode = requireLocal('esbuild').transformSync(engine.slice(engine.indexOf('export async function runPrefill')).replace('export ', '') + '\nglobalThis.run = runPrefill;', { loader: 'ts' }).code;
function engineHarness() {
  const writes: string[] = []; let allowed = true; let resolveProfile: (v: any) => void = () => {};
  const context: any = {
    document: {}, resolveAutofillFeatureFlags: () => ({}), emptyPrefillCoverage: () => ({ filled: 0, total: 0 }),
    findApplicationForm: () => ({ ownerDocument: {} }), selectAtsPrefillAdapter: () => ({ id: 'test' }),
    createAutofillVisualFeedback: () => ({ markFieldFilled() {}, finish() {}, fail() {} }), attachGeneratedResume: () => 'not_requested',
    chrome: { runtime: { sendMessage: () => new Promise(resolve => { resolveProfile = resolve; }) } },
    buildContactAutofillProfile: (_snapshot: any, profile: any) => profile,
    queryAllDeep: () => [{ id: 'email', isConnected: true }], APPLICATION_CONTROL_SELECTOR: 'input',
    getLabelText: () => 'Email', classifyField: () => 'email', valueForKind: () => 'test@example.test',
    isFillable: () => true, setNativeValue: () => writes.push('email'), summarizePrefillOutcomes: () => ({ filled: writes.length }),
    scanApplicationFields: () => ({}), remainingRequiredOutcomes: () => [],
  };
  vm.runInNewContext(engineCode, context);
  return { writes, stop: () => { allowed = false; }, run: () => context.run({ shouldContinue: () => allowed, quietResultToast: true }), resolve: () => resolveProfile({ ok: true, profile: {} }) };
}
test('engine checks cancellation again after loading the profile', async () => {
  const h = engineHarness(); const run = h.run(); h.stop(); h.resolve(); await run;
  assert.deepEqual(h.writes, []);
});

const dropdownCode = requireLocal('esbuild').buildSync({ entryPoints: ['src/smart-dropdown.ts'], bundle: true, write: false, format: 'cjs', platform: 'node' }).outputFiles[0].text;
test('a delayed dropdown never selects an option after its mode is stopped', async () => {
  const dom = new JSDOM('<button role="combobox" aria-controls="options">Select</button><div id="options"></div>');
  try {
    const module = { exports: {} as any }; vm.runInNewContext(dropdownCode, { module, exports: module.exports });
    let allowed = true; let clicks = 0;
    const run = module.exports.selectSmartDropdown(dom.window.document.querySelector('button'), 'Canada', 'country', undefined, 50, { shouldContinue: () => allowed });
    allowed = false;
    const option = dom.window.document.createElement('div'); option.setAttribute('role', 'option'); option.textContent = 'Canada'; option.onclick = () => { clicks++; };
    dom.window.document.querySelector('#options').appendChild(option); await run;
    assert.equal(clicks, 0);
  } finally { dom.window.close(); }
});

const home = readFileSync('src/home.ts', 'utf8');
const saveCode = requireLocal('esbuild').transformSync(home.slice(home.indexOf('  const saveAutofillPreferences ='), home.indexOf("  stepModeBtn?.addEventListener('click'")) + '\nglobalThis.save = saveAutofillPreferences;', { loader: 'ts' }).code;
test('failed preference storage restores the prior mode and reports the failure', async () => {
  const context: any = {
    autofillPreferences: { mode: 'step_by_step', autofillSkills: false, guidedAutopilot: false },
    normalizeAutofillPreferences: (v: any) => v, AUTOFILL_FEATURE_FLAGS: {}, planEntitlements: {}, AUTOFILL_PREFERENCES_KEY: 'prefs',
    paintAutofillPreferences() {}, modeNote: { textContent: '', setAttribute() {} },
    stepModeBtn: {}, continuousModeBtn: {}, skillsToggle: {}, guidedToggle: {},
    chrome: { storage: { sync: { set: async () => { throw new Error('quota'); } } } },
  };
  vm.runInNewContext(saveCode, context);
  await assert.doesNotReject(context.save({ mode: 'continuous' }));
  assert.equal(context.autofillPreferences.mode, 'step_by_step');
  assert.match(context.modeNote.textContent, /could not save/i);
});

const resolveCode = requireLocal('esbuild').transformSync(portal.slice(portal.indexOf('async function executeResolvedPrefill'), portal.indexOf('function trackPrefillExecution')) + '\nglobalThis.execute = executeResolvedPrefill;', { loader: 'ts' }).code;
for (const change of ['navigation', 'mode'] as const) {
  test(`artifact-ready prefill also cancels after ${change} changes during resolution`, async () => {
    let finish: (v: any) => void = () => {}; let writes = 0;
    const context: any = {
      window: { location: { href: 'https://example.test/job/1' } }, continuousPrefillGeneration: 0,
      currentAutofillPreferences: { mode: 'continuous' }, currentPlanEntitlements: { continuousMode: true },
      chrome: { runtime: { sendMessage: () => new Promise(resolve => { finish = resolve; }) } },
      jobContextFor: (job: any) => job, runPrefill: async () => { writes++; return {}; }, emptyPrefillCoverage: () => ({}),
      invalidatePrivateApprovalForJob: () => {}, sensitiveAnswerSession: { confirmed: false },
      withPrefillUndo: (run: () => Promise<unknown>) => run(), isPrefillUndoAllowed: () => true,
    };
    vm.runInNewContext(resolveCode, context);
    const run = context.execute({}, change === 'mode' ? 'continuous' : 'step_by_step');
    if (change === 'mode') context.currentAutofillPreferences.mode = 'step_by_step';
    else context.window.location.href += '/next';
    finish({ ok: false });
    await assert.rejects(run, /Prefill stopped/); assert.equal(writes, 0);
  });
}
