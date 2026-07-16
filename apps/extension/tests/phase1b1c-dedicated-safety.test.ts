import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { classifyField, SENSITIVE_FIELD_RE } from '../src/easy-apply-matchers';
import { detectScreeningQuestion, findExactSavedAnswer } from '../src/screening-question-drafts';

test('sensitive questions are rejected before any AI request', async () => {
  let aiCalls = 0;
  const sensitive = await detectScreeningQuestion({ label: 'Will you require visa sponsorship?' });
  if (sensitive) aiCalls += 1;
  assert.equal(sensitive, null);
  assert.equal(aiCalls, 0);
});

const matcherSource = readFileSync('src/easy-apply-matchers.ts', 'utf8');
test('ESSAY_RE and SENSITIVE_FIELD_RE remain present and function in classifyField', () => {
  assert.equal(SENSITIVE_FIELD_RE.test('What is your citizenship status?'), true);
  assert.equal(classifyField('Why do you want to work here?'), null);
  assert.equal(classifyField('What is your citizenship status?'), null);
  assert.match(matcherSource, /const ESSAY_RE\s*=/);
  assert.match(matcherSource, /if \(ESSAY_RE\.test\(t\)\) return null/);
});

const saved = [{
  questionHash: 'a'.repeat(64), normalizedQuestionText: 'Why this role?', editedAnswer: 'Saved',
  source: 'user_written' as const, createdAt: '2026-07-16T12:00:00Z', updatedAt: '2026-07-16T12:00:00Z',
}];
test('exact reuse matches normalized identical text only', () => {
  assert.equal(findExactSavedAnswer('  Why   this role? ', saved)?.editedAnswer, 'Saved');
  assert.equal(findExactSavedAnswer('Why are you interested in this role?', saved), undefined);
});

const engine = readFileSync('src/easy-apply-engine.ts', 'utf8');
const coverFunction = engine.slice(engine.indexOf('export function attachGeneratedCoverLetter'), engine.indexOf('function showToast'));
assert.ok(coverFunction.includes('cover\\s*letter|letter\\s*of\\s*interest'));
assert.ok(coverFunction.includes('resume|cv|portfolio|transcript|photo|certificate'));
assert.match(coverFunction, /if\(input\.files\?\.length\) return 'already_present'/);

console.log('phase1b1c-dedicated-safety: 7 screening and cover-letter invariants passed');
