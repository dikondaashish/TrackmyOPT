import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';
import { normalizeAutofillPreferences, AUTOFILL_PREFERENCES_KEY } from '../src/autofill-preferences';
const requireLocal = createRequire(resolve('package.json'));
const source = readFileSync('src/easy-apply-fill.ts', 'utf8');
const code = requireLocal('esbuild').transformSync(source.slice(source.indexOf('const isTopFrame')), { loader: 'ts' }).code;
for (const [name, stored, sourceType, expected] of [
  ['enabled with this job resume', { autofillSkills: true }, 'generated_resume', true],
  ['default off', {}, 'generated_resume', false],
  ['malformed preference', { autofillSkills: 'yes' }, 'generated_resume', false],
  ['no matching resume', { autofillSkills: true }, 'profile_only', false],
] as const) test(`popup skills: ${name}`, async () => {
  const fills: any[] = []; const relays: any[] = [];
  const frame = {}; const context = {
    withPrefillUndo:(run:()=>Promise<unknown>)=>run(),isPrefillUndoAllowed:()=>true,
    currentPrefillUndoRunId:()=> 'fixture-run',markPrefillUndoDelegated:()=>{},getPrefillUndoState:()=>({}),
    mountPrefillUndoFallback:()=>{},requestPrefillUndo:()=>{},
    window: { top: frame, self: frame, location: { href: 'https://jobs.example.test/job/1' } },
    AUTOFILL_PREFERENCES_KEY, normalizeAutofillPreferences,
    AUTOFILL_FEATURE_FLAGS:{aiScreeningDrafts:true},runSmartAnswers:async()=>{},
    document: { querySelector: () => null },
    loadPrivateAnswersForPrefill: async () => ({status:'empty',answers:{confirmed:false}}),
    prefillSavedPortalLogin: async () => ({status:'skipped',totalFilled:0}),
    findApplicationForm: () => null,
    fillConfirmedSensitiveAnswers: async () => ({filled:0,unresolved:[]}),
    withPrefillModeGuard: async (_mode: boolean, run: any) => run(() => true),
    runPrefill: async (options: any) => { fills.push(options); },
    chrome: { storage: { sync: { get: async () => ({ [AUTOFILL_PREFERENCES_KEY]: stored }) } }, runtime: {
      sendMessage: async (m: any) => { if(m.type === 'PREFILL_CHILD_FRAMES') { relays.push(m); return {}; }
        return { ok: true, source: sourceType, snapshot: { skills: ['TypeScript'] }, profileFallback: {} }; },
    } },
  };
  vm.runInNewContext(code, context); await new Promise(resolve => setImmediate(resolve));
  assert.equal(fills[0].autofillSkills === true, expected);
  assert.equal(relays[0].prefill.autofillSkills === true, expected);
});
