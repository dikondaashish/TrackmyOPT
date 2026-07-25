import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  AUTOFILL_FEATURE_FLAGS,
  resolveAutofillFeatureFlags,
} from '../src/autofill-feature-flags';

assert.deepEqual(AUTOFILL_FEATURE_FLAGS, {
  artifactPrefill: true,
  skills: true,
  continuousMode: true,
  aiScreeningDrafts: true,
  coverLetter: true,
  guidedAutopilot: true,
  historyFields: true,
  atsAdapters: true,
});
assert.equal(Object.isFrozen(AUTOFILL_FEATURE_FLAGS), true);
assert.deepEqual(resolveAutofillFeatureFlags({ skills: true }), {
  ...AUTOFILL_FEATURE_FLAGS,
  skills: true,
});

const background = readFileSync('src/background.ts', 'utf8');
const portal = readFileSync('src/content-job-portal.ts', 'utf8');
const engine = readFileSync('src/easy-apply-engine.ts', 'utf8');

for (const flag of [
  'artifactPrefill',
  'skills',
  'aiScreeningDrafts',
  'coverLetter',
] as const) {
  assert.match(background, new RegExp(`AUTOFILL_FEATURE_FLAGS\\.${flag}`));
}
assert.match(portal, /AUTOFILL_FEATURE_FLAGS\.continuousMode/);
assert.match(portal, /AUTOFILL_FEATURE_FLAGS\.aiScreeningDrafts/);
assert.match(portal, /AUTOFILL_FEATURE_FLAGS\.coverLetter/);
assert.match(portal, /AUTOFILL_FEATURE_FLAGS\.guidedAutopilot/);
assert.match(
  portal,
  /mountScreeningQuestionReviews\(\s*widgetCard,\s*job,\s*execution\.hasResume/,
  'a background-resolved artifact must unlock screening review UI after Continuous prefill',
);
assert.match(
  portal,
  /resolvedJobDescription \|\|\s*lastResumeGenerationRequest\?\.jobDescription \|\|\s*scrapeJobDescription\(\)/,
  'screening drafts must prefer the job description bound to the resolved resume artifact',
);
assert.match(
  portal,
  /if \(artifact\) \{\s*setCurrentGeneratedArtifact\(artifact\)/,
  'disabled cover letters must not discard the deterministic resume artifact'
);
assert.match(
  portal,
  /if \(artifact && AUTOFILL_FEATURE_FLAGS\.coverLetter\) \{\s*mountCoverLetterReviewUi/
);
assert.match(engine, /featureFlags\.historyFields/);
assert.match(engine, /featureFlags\.atsAdapters/);
assert.match(
  engine,
  /coverLetterResult === 'attached'[\s\S]+fieldGroup: 'cover_letter'/
);
assert.match(
  background,
  /validateGeneratedCoverLetterAttachment\(\s*requestedPrefill\.coverLetter,\s*generatedContentHash/
);

console.log('autofill-feature-flags: safe independent rollout defaults passed');
