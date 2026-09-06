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
const jobPortalLogin = readFileSync('src/job-portal-login.ts', 'utf8');
const standaloneLogin = readFileSync(
  'src/standalone-job-portal-prefill.ts',
  'utf8',
);
const privateDelivery = readFileSync(
  'src/private-application-delivery.ts',
  'utf8',
);
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
assert.doesNotMatch(
  jobPortalLogin,
  /chrome\.storage|trackWidgetAnalytics|fetch\(|console\.(?:log|info|debug)|\.click\s*\(/,
  'job-portal credentials stay ephemeral, content-free, and never trigger actions',
);
for (const source of [standaloneLogin, privateDelivery]) {
  assert.doesNotMatch(
    source,
    /chrome\.storage|trackWidgetAnalytics|console\.(?:log|info|debug)/,
    'standalone credential review and delivery never persist, analyze, or log secrets',
  );
}
assert.match(
  portal,
  /sensitiveAnswerSession\.confirmed[\s\S]+sensitiveAnswers: sensitiveAnswerSession/,
  'only explicitly confirmed session answers enter the ephemeral frame relay',
);
const confirmedAnswerRelay = portal.slice(
  portal.indexOf("type: 'PREFILL_CHILD_FRAMES'"),
  portal.indexOf(
    '}).catch(() => {});',
    portal.indexOf("type: 'PREFILL_CHILD_FRAMES'")
  )
);
assert.doesNotMatch(
  confirmedAnswerRelay,
  /guidedAutopilot|jobPortalLogin|approvedJobPortalLogin/,
  'confirmed answers work with ordinary Prefill while portal passwords never enter the frame relay',
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
assert.match(
  privatePanel,
  /Password: ••••••••/,
  'the extension review panel may acknowledge a saved password only as fixed masking',
);
assert.doesNotMatch(
  privatePanel,
  /loadedJobPortalLogin\.password/,
  'the decrypted portal password must never be written into shared host-page widget DOM',
);

for (const file of [
  'src/screening-question-review-ui.ts',
  'src/saved-screening-answers.ts',
  'src/cover-letter-review.ts',
]) {
  assert.doesNotMatch(readFileSync(file, 'utf8'), /console\.(?:log|info|debug)\s*\(/);
}

console.log('analytics-privacy: no question, answer, resume, or PDF content is logged or tracked');
