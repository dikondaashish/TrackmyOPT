import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import vm from 'node:vm';
import { AUTOFILL_FEATURE_FLAGS } from '../src/autofill-feature-flags';
import { normalizeAutofillPreferences, DEFAULT_AUTOFILL_PREFERENCES, AUTOFILL_PREFERENCES_KEY } from '../src/autofill-preferences';
import { resolveAutofillPlanEntitlements } from '../src/autofill-plan-entitlements';
const requireLocal = createRequire(resolve('package.json'));
const { JSDOM } = requireLocal('jsdom');
const source = readFileSync('src/home.ts','utf8');
const code = requireLocal('esbuild').transformSync(source.slice(source.indexOf('  const stepModeBtn ='),source.indexOf('  // Theme button')), {loader:'ts'}).code;
const tick = () => new Promise(resolve=>setImmediate(resolve));
for (const tier of ['free','pro'] as const) test(`settings UI: ${tier} guided toggle, mode switching and explanatory text`, async () => {
  const dom = new JSDOM('<main><button id="prefill-mode-step"></button><button id="prefill-mode-continuous"></button><label class="prefill-skills-toggle"><input id="autofill-skills-toggle" type="checkbox"></label><label id="guided-autopilot-label"><input id="guided-autopilot-toggle" type="checkbox"></label><p id="prefill-mode-note"></p></main>');
  const root=dom.window.document.querySelector('main'); const saves:any[]=[]; const upgrades:any[]=[];
  try {
    vm.runInNewContext(code,{root,autofillPreferences:{...DEFAULT_AUTOFILL_PREFERENCES},AUTOFILL_FEATURE_FLAGS,normalizeAutofillPreferences,AUTOFILL_PREFERENCES_KEY,planEntitlements:resolveAutofillPlanEntitlements(tier),API_ENDPOINTS:{PRICING:'pricing'},chrome:{storage:{sync:{set:async(v:any)=>saves.push(v)}},tabs:{create:async(v:any)=>upgrades.push(v)}}});
    const guided=root.querySelector('#guided-autopilot-toggle'); const note=root.querySelector('#prefill-mode-note');
    assert.equal(guided.checked,false); guided.click(); await tick();
    if(tier==='free'){assert.equal(guided.checked,false);assert.equal(saves.length,0);assert.equal(upgrades.length,1);return;}
    assert.equal(saves[0][AUTOFILL_PREFERENCES_KEY].mode,'continuous'); assert.match(note.textContent,/Guided Autopilot/); assert.doesNotMatch(note.textContent,/You click Prefill/);
    guided.click(); await tick(); assert.match(note.textContent,/You control all navigation/);
    guided.click(); await tick(); root.querySelector('#prefill-mode-step').click(); await tick();
    assert.equal(guided.checked,false); assert.match(note.textContent,/You click Prefill/);
    root.querySelector('#autofill-skills-toggle').click(); await tick();
    assert.equal(saves.at(-1)[AUTOFILL_PREFERENCES_KEY].autofillSkills,true);
  } finally {dom.window.close();}
});
