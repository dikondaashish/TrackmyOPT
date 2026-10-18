import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  applyVerifiedAuthorizationChange,
  classifyAuthorizationQuestion,
  normalizeQuestionWording,
  normalizeVerifiedAuthorization,
  parseVerifiedAuthorizationChange,
  resolveAuthorizationQuestion,
  type VerifiedAuthorizationAnswers,
} from '../src/prefill/verified-authorization';

const NOW = Date.parse('2026-10-17T12:00:00.000Z');
const answers = (overrides: Partial<VerifiedAuthorizationAnswers> = {}): VerifiedAuthorizationAnswers => ({
  meaningVersion: 1,
  currentWorkAuthorization: { answer: 'yes', confirmedAt: '2026-09-01T00:00:00.000Z', scope: 'united_states', confirmedWordings: [] },
  currentSponsorship: { answer: 'no', confirmedAt: '2026-09-01T00:00:00.000Z', scope: 'united_states', confirmedWordings: [] },
  futureSponsorship: { answer: 'yes', confirmedAt: '2026-09-01T00:00:00.000Z', scope: 'united_states', confirmedWordings: [] },
  ...overrides,
});

test('current authorization, current sponsorship, and future sponsorship are separate meanings', () => {
  assert.deepEqual(classifyAuthorizationQuestion('Are you legally authorized to work in the United States?'), { meaning: 'currentWorkAuthorization' });
  assert.deepEqual(classifyAuthorizationQuestion('Do you currently require visa sponsorship?'), { meaning: 'currentSponsorship' });
  assert.deepEqual(classifyAuthorizationQuestion('Will you require visa sponsorship in the future?'), { meaning: 'futureSponsorship' });
  assert.deepEqual(classifyAuthorizationQuestion('Will you now or in the future require sponsorship for employment visa status (e.g., H-1B visa status)?'), { meaning: 'nowOrFutureSponsorship' });
});

test('compound, foreign, and declaration questions are never answered automatically', () => {
  assert.deepEqual(classifyAuthorizationQuestion('Are you legally authorized to work in the US without sponsorship?'), { meaning: null, reason: 'compound' });
  assert.deepEqual(classifyAuthorizationQuestion('Are you authorized to work in Canada?'), { meaning: null, reason: 'not_us' });
  assert.deepEqual(classifyAuthorizationQuestion('I certify that I am authorized to work in the United States'), { meaning: null, reason: 'attestation' });
  assert.deepEqual(classifyAuthorizationQuestion('Will you be authorized to work in the future?'), { meaning: null, reason: 'compound' });
  assert.deepEqual(classifyAuthorizationQuestion('What is your favorite color?'), { meaning: null, reason: 'unrelated' });
  assert.equal(resolveAuthorizationQuestion(answers(), 'Are you legally authorized to work in the US without sponsorship?', NOW).kind, 'ask');
  assert.equal(resolveAuthorizationQuestion(answers(), 'Are you authorized to work in Canada?', NOW).kind, 'none');
});

test('equivalent wording fills; changed wording shows the question for confirmation', () => {
  assert.deepEqual(resolveAuthorizationQuestion(answers(), 'Are you legally authorized to work in the United States? *', NOW),
    { kind: 'fill', meaning: 'currentWorkAuthorization', answer: 'yes' });
  assert.deepEqual(resolveAuthorizationQuestion(answers(), 'Are you eligible to work for any employer in the US right now?', NOW),
    { kind: 'confirm', meaning: 'currentWorkAuthorization', proposed: 'yes', reason: 'meaning_changed' });
  const confirmed = answers({ currentWorkAuthorization: { answer: 'yes', confirmedAt: '2026-09-01T00:00:00.000Z', scope: 'united_states',
    confirmedWordings: [normalizeQuestionWording('Are you eligible to work for any employer in the US right now?')] } });
  assert.equal(resolveAuthorizationQuestion(confirmed, 'Are you eligible to work for any employer in the US right now?', NOW).kind, 'fill');
});

test('"now or in the future" is answered only from both confirmed sponsorship answers', () => {
  const question = 'Will you now or in the future require sponsorship for employment visa status?';
  assert.deepEqual(resolveAuthorizationQuestion(answers(), question, NOW), { kind: 'fill', meaning: 'nowOrFutureSponsorship', answer: 'yes' });
  const bothNo = answers({ futureSponsorship: { answer: 'no', confirmedAt: '2026-09-01T00:00:00.000Z', scope: 'united_states', confirmedWordings: [] } });
  assert.equal((resolveAuthorizationQuestion(bothNo, question, NOW) as { answer: string }).answer, 'no');
  const missingFuture = answers({ futureSponsorship: undefined });
  assert.deepEqual(resolveAuthorizationQuestion(missingFuture, question, NOW), { kind: 'ask', meaning: 'nowOrFutureSponsorship', reason: 'no_saved_answer' });
});

test('answers are never inferred: no saved answer means ask; legacy answers are only proposals', () => {
  assert.deepEqual(resolveAuthorizationQuestion(null, 'Are you legally authorized to work in the United States?', NOW),
    { kind: 'ask', meaning: 'currentWorkAuthorization', reason: 'no_saved_answer' });
  assert.deepEqual(resolveAuthorizationQuestion(null, 'Do you currently require visa sponsorship?', NOW, { requiresSponsorship: 'yes' }),
    { kind: 'confirm', meaning: 'currentSponsorship', proposed: 'yes', reason: 'meaning_changed' });
});

test('time-sensitive answers need review after their review-by date or a year', () => {
  const dated = answers({ currentWorkAuthorization: { answer: 'yes', confirmedAt: '2026-09-01T00:00:00.000Z', scope: 'united_states', reviewBy: '2026-10-01', confirmedWordings: [] } });
  assert.deepEqual(resolveAuthorizationQuestion(dated, 'Are you legally authorized to work in the United States?', NOW),
    { kind: 'confirm', meaning: 'currentWorkAuthorization', proposed: 'yes', reason: 'answer_due_for_review' });
  const old = answers({ currentSponsorship: { answer: 'no', confirmedAt: '2025-09-01T00:00:00.000Z', scope: 'united_states', confirmedWordings: [] } });
  assert.equal((resolveAuthorizationQuestion(old, 'Do you currently require visa sponsorship?', NOW) as { reason: string }).reason, 'answer_due_for_review');
});

test('stored answers are strictly normalized', () => {
  assert.ok(normalizeVerifiedAuthorization(answers()));
  assert.equal(normalizeVerifiedAuthorization({ ...answers(), nationality: 'X' }), null);
  assert.equal(normalizeVerifiedAuthorization({ meaningVersion: 1, currentSponsorship: { answer: 'maybe', confirmedAt: '2026-01-01T00:00:00Z', scope: 'united_states', confirmedWordings: [] } }), null);
  assert.equal(normalizeVerifiedAuthorization({ meaningVersion: 1, currentSponsorship: { answer: 'no', confirmedAt: '2026-01-01T00:00:00Z', scope: 'canada', confirmedWordings: [] } }), null);
  assert.equal(normalizeVerifiedAuthorization({ meaningVersion: 1, currentSponsorship: { answer: 'no', confirmedAt: '2026-01-01T00:00:00Z', scope: 'united_states', confirmedWordings: ['Not Normalized?'] } }), null);
});

test('confirm, reconfirm wording, change, and clear', () => {
  const nowIso = '2026-10-17T12:00:00.000Z';
  const confirmed = applyVerifiedAuthorizationChange(null, { action: 'confirm', meaning: 'currentSponsorship', answer: 'no',
    question: 'Do you currently need sponsorship to work here in the US?' }, nowIso) as VerifiedAuthorizationAnswers;
  assert.equal(confirmed.currentSponsorship?.confirmedAt, nowIso);
  assert.deepEqual(confirmed.currentSponsorship?.confirmedWordings, ['do you currently need sponsorship to work here in the us']);
  const changed = applyVerifiedAuthorizationChange(confirmed, { action: 'confirm', meaning: 'currentSponsorship', answer: 'yes' }, nowIso) as VerifiedAuthorizationAnswers;
  assert.deepEqual(changed.currentSponsorship?.confirmedWordings, [], 'a changed answer must be reconfirmed per wording');
  const mismatched = applyVerifiedAuthorizationChange(confirmed, { action: 'confirm', meaning: 'currentSponsorship', answer: 'no',
    question: 'Are you legally authorized to work in the United States?' }, nowIso);
  assert.deepEqual(mismatched, { error: 'unrelated_question' });
  const cleared = applyVerifiedAuthorizationChange(changed, { action: 'clear', meaning: 'currentSponsorship' }, nowIso) as VerifiedAuthorizationAnswers;
  assert.equal(cleared.currentSponsorship, undefined);
  assert.deepEqual(applyVerifiedAuthorizationChange(cleared, { action: 'confirm_wording', meaning: 'nowOrFutureSponsorship', question: 'Will you now or later need sponsorship?' }, nowIso),
    { error: 'missing_answer' });
});

test('change requests are strictly parsed', () => {
  assert.ok(parseVerifiedAuthorizationChange({ action: 'confirm', meaning: 'futureSponsorship', answer: 'yes', reviewBy: '2027-06-30' }));
  assert.equal(parseVerifiedAuthorizationChange({ action: 'confirm', meaning: 'citizenship', answer: 'yes' }), null);
  assert.equal(parseVerifiedAuthorizationChange({ action: 'confirm', meaning: 'futureSponsorship', answer: 'probably' }), null);
  assert.equal(parseVerifiedAuthorizationChange({ action: 'confirm', meaning: 'futureSponsorship', answer: 'yes', reviewBy: 'soon' }), null);
  assert.ok(parseVerifiedAuthorizationChange({ action: 'clear', meaning: 'currentWorkAuthorization' }));
});
