import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { savedAnswerAnalyticsProperties } from '../src/saved-screening-answers';

const properties = savedAnswerAnalyticsProperties('saved') as Record<string, unknown>;
assert.deepEqual(Object.keys(properties).sort(), ['action', 'matchType']);
assert.equal('questionText' in properties, false);
assert.equal('answerText' in properties, false);
assert.equal('resumeContent' in properties, false);

const portal = readFileSync('src/content-job-portal.ts', 'utf8');
const popup = readFileSync('src/popup.ts', 'utf8');
const sensitiveAutofill = readFileSync('src/sensitive-autofill.ts', 'utf8');
const analyticsCalls = Array.from(portal.matchAll(/trackWidgetAnalytics\([\s\S]{0,500}?\);/g))
  .map((match) => match[0])
  .join('\n');
assert.doesNotMatch(analyticsCalls, /questionText|editedAnswer|normalizedQuestionText|pdfBase64|snapshot:/);
assert.doesNotMatch(
  popup,
  /chrome\.storage\.sync\.set\(\s*\{\s*idToken/,
  'short-lived bearer tokens must never be written to browser sync storage',
);
assert.doesNotMatch(
  sensitiveAutofill,
  /chrome\.storage|trackWidgetAnalytics|console\.(?:log|info|debug)/,
  'private answers cannot be written to browser storage, analyzed, or logged',
);
assert.match(
  portal,
  /sensitiveAnswerSession\.confirmed[\s\S]+sensitiveAnswers: sensitiveAnswerSession/,
  'only explicitly confirmed session answers enter the ephemeral frame relay',
);
const savedPrivateAnswerLoad = portal.slice(
  portal.indexOf("type: 'GET_PRIVATE_APPLICATION_ANSWERS'"),
  portal.indexOf(
    "toggle.addEventListener('click'",
    portal.indexOf("type: 'GET_PRIVATE_APPLICATION_ANSWERS'")
  ),
);
assert.doesNotMatch(
  savedPrivateAnswerLoad,
  /sensitiveAnswerSession\s*=/,
  'loading saved private answers must never approve them automatically',
);
assert.match(
  savedPrivateAnswerLoad,
  /Review them, then approve for this application/,
  'saved private answers must visibly require per-application review',
);
const privatePanel = portal.slice(
  portal.indexOf('function createSensitiveAnswerPanel'),
  portal.indexOf('function currentSessionStorage'),
);
assert.match(
  privatePanel,
  /toggle\.addEventListener\('click'[\s\S]+if \(!body\.hidden\) loadSavedAnswersForReview\(\)/,
  'saved private answers are fetched only after the user opens the review panel',
);

for (const file of [
  'src/screening-question-review-ui.ts',
  'src/saved-screening-answers.ts',
  'src/cover-letter-review.ts',
]) {
  assert.doesNotMatch(readFileSync(file, 'utf8'), /console\.(?:log|info|debug)\s*\(/);
}

console.log('phase1b1c-analytics-privacy: no question, answer, resume, or PDF content is logged or tracked');
