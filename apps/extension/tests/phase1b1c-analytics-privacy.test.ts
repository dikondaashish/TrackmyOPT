import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { savedAnswerAnalyticsProperties } from '../src/saved-screening-answers';

const properties = savedAnswerAnalyticsProperties('saved') as Record<string, unknown>;
assert.deepEqual(Object.keys(properties).sort(), ['action', 'matchType']);
assert.equal('questionText' in properties, false);
assert.equal('answerText' in properties, false);
assert.equal('resumeContent' in properties, false);

const portal = readFileSync('src/content-job-portal.ts', 'utf8');
const analyticsCalls = Array.from(portal.matchAll(/trackWidgetAnalytics\([\s\S]{0,500}?\);/g))
  .map((match) => match[0])
  .join('\n');
assert.doesNotMatch(analyticsCalls, /questionText|editedAnswer|normalizedQuestionText|pdfBase64|snapshot:/);

for (const file of [
  'src/screening-question-review-ui.ts',
  'src/saved-screening-answers.ts',
  'src/cover-letter-review.ts',
]) {
  assert.doesNotMatch(readFileSync(file, 'utf8'), /console\.(?:log|info|debug)\s*\(/);
}

console.log('phase1b1c-analytics-privacy: no question, answer, resume, or PDF content is logged or tracked');
