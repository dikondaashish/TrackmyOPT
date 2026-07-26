import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const background = readFileSync('src/background.ts', 'utf8');
const home = readFileSync('src/home.ts', 'utf8');
const portal = readFileSync('src/content-job-portal.ts', 'utf8');

assert.match(background, /GET_AUTOFILL_ENTITLEMENTS/);
assert.match(background, /resolveAutofillPlanEntitlements/);
assert.match(home, /planEntitlements\.continuousMode/);
assert.match(home, /planEntitlements\.guidedAutopilot/);
assert.match(home, /Upgrade to Pro/);
assert.match(portal, /currentPlanEntitlements\.continuousMode/);
assert.match(portal, /currentPlanEntitlements\.guidedAutopilot/);

console.log(
  'autofill-plan-enforcement: popup and job portal enforce server-backed plan automation',
);
