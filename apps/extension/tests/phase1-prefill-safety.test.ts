import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const matcherSource = readFileSync('src/easy-apply-matchers.ts', 'utf8');
const engineSource = readFileSync('src/easy-apply-engine.ts', 'utf8');
const portalSource = readFileSync('src/content-job-portal.ts', 'utf8');
const backgroundSource = readFileSync('src/background.ts', 'utf8');
const withoutComments = (source: string) => source
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\/\/.*$/gm, '');

for (const invariant of ['SENSITIVE_FIELD_RE', 'ESSAY_RE', 'ORG_TRAP_RE']) {
  assert.match(matcherSource, new RegExp(`(?:const|export const) ${invariant}`));
}
assert.ok(matcherSource.indexOf('SENSITIVE_FIELD_RE.test(t)') < matcherSource.indexOf("return 'skills'"));
assert.ok(matcherSource.indexOf('ESSAY_RE.test(t)') < matcherSource.indexOf("return 'skills'"));
assert.ok(matcherSource.indexOf('ORG_TRAP_RE.test(t)') < matcherSource.indexOf("return 'skills'"));

assert.doesNotMatch(
  withoutComments(engineSource),
  /\.click\s*\(/,
  'the shared prefill engine never clicks controls',
);
const continuousBlock = portalSource.slice(
  portalSource.indexOf('async function runContinuousPrefill'),
  portalSource.indexOf('function scheduleContinuousPrefill'),
);
assert.doesNotMatch(withoutComments(continuousBlock), /\.click\s*\(/);
assert.doesNotMatch(withoutComments(continuousBlock), /GENERATE_|screening|cover.?letter/i);
assert.match(
  backgroundSource,
  /autofillSkills:\s*AUTOFILL_FEATURE_FLAGS\.skills\s*&&\s*requestedPrefill\.autofillSkills === true/,
  'child frames receive only an explicitly enabled skills preference',
);

console.log('phase1-prefill-safety: exclusions and no-click Continuous path passed');
