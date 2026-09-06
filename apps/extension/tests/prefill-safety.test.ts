import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const matcherSource = readFileSync('src/easy-apply-matchers.ts', 'utf8');
const engineSource = readFileSync('src/easy-apply-engine.ts', 'utf8');
const portalSource = readFileSync('src/content-job-portal.ts', 'utf8');
const backgroundSource = readFileSync('src/background.ts', 'utf8');
const dropdownSource = readFileSync('src/smart-dropdown.ts', 'utf8');
const guidedSource = readFileSync('src/guided-autopilot.ts', 'utf8');
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
assert.match(
  engineSource,
  /await selectSmartDropdown\(/,
  'the shared engine delegates custom dropdown selection to the guarded helper',
);
const dropdownCandidates = dropdownSource.slice(
  dropdownSource.indexOf('function optionElements'),
  dropdownSource.indexOf('async function waitForOptionElements'),
);
assert.match(dropdownCandidates, /\[role="option"\]/);
assert.doesNotMatch(
  dropdownCandidates,
  /submit|next|review|done/i,
  'custom dropdown discovery must never include application action controls',
);
const continuousBlock = portalSource.slice(
  portalSource.indexOf('async function runContinuousPrefill'),
  portalSource.indexOf('function scheduleContinuousPrefill'),
);
assert.doesNotMatch(withoutComments(continuousBlock), /\.click\s*\(/);
assert.doesNotMatch(
  withoutComments(continuousBlock),
  /GENERATE_SCREENING_DRAFT|requestScreeningDraft|GENERATE_COVER_LETTER|generateCoverLetterForCurrentArtifact/i,
  'Continuous may surface review actions but never requests AI output itself',
);
assert.match(
  backgroundSource,
  /autofillSkills:\s*AUTOFILL_FEATURE_FLAGS\.skills\s*&&\s*requestedPrefill\.autofillSkills === true/,
  'child frames receive only an explicitly enabled skills preference',
);
assert.match(
  guidedSource,
  /scanApplicationFields\(root\)\.unansweredRequired/,
  'Guided Autopilot must include accessible custom dropdowns in its required-field gate',
);
assert.match(guidedSource, /FINAL_ACTION_RE/);
assert.match(guidedSource, /stopped_final_step/);

console.log('prefill-safety: exclusions and no-click Continuous path passed');
