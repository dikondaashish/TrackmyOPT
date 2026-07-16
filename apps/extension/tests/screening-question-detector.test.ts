import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { classifyField } from '../src/easy-apply-matchers';
import {
  evaluateScreeningQuestion,
  normalizeScreeningQuestionText,
} from '../src/screening-question-drafts';

const available = {
  value: '',
  visible: true,
  disabled: false,
  readOnly: false,
};

for (const questionText of [
  'Why do you want to work here?',
  'Describe a relevant project',
  'How does your experience prepare you for this role?',
  'What interests you about this team?',
]) {
  const result = evaluateScreeningQuestion({ ...available, questionText });
  assert.equal(result.eligible, true, questionText);
}

for (const questionText of [
  'Why will you require visa sponsorship?',
  'Are you authorized to work in the United States?',
  'What is your citizenship status?',
  'Describe your gender or demographic information',
  'What salary do you expect?',
  'What is your date of birth?',
  'Enter your Social Security number',
  'Do you have a disability?',
  'What is your veteran status?',
  'Describe your security clearance',
]) {
  const result = evaluateScreeningQuestion({ ...available, questionText });
  assert.deepEqual(result, { eligible: false, reason: 'sensitive' }, questionText);
}

for (const questionText of [
  'Email address',
  'Phone number',
  'First name',
  'LinkedIn URL',
  'Technical Skills',
]) {
  assert.notEqual(classifyField(questionText), null);
  assert.deepEqual(
    evaluateScreeningQuestion({ ...available, questionText }),
    { eligible: false, reason: 'deterministic' },
    questionText,
  );
}

for (const questionText of [
  'Company',
  'Employer name',
  'Job title',
  'Start date',
  'School',
  'Degree',
  'Field of study',
  'Graduation date',
]) {
  assert.deepEqual(
    evaluateScreeningQuestion({ ...available, questionText }),
    { eligible: false, reason: 'deterministic' },
    questionText,
  );
}

assert.deepEqual(
  evaluateScreeningQuestion({ ...available, questionText: 'Why this role?', value: 'Already answered' }),
  { eligible: false, reason: 'already_filled' },
);
assert.deepEqual(
  evaluateScreeningQuestion({ ...available, questionText: 'Why this role?', visible: false }),
  { eligible: false, reason: 'unavailable' },
);
assert.deepEqual(
  evaluateScreeningQuestion({ ...available, questionText: 'Why this role?', disabled: true }),
  { eligible: false, reason: 'unavailable' },
);
assert.deepEqual(
  evaluateScreeningQuestion({ ...available, questionText: '' }),
  { eligible: false, reason: 'not_screening_question' },
);

assert.equal(
  normalizeScreeningQuestionText('  Why   do you\nwant to work here?  '),
  'Why do you want to work here?',
);

const matcherSource = readFileSync('src/easy-apply-matchers.ts', 'utf8');
assert.match(
  matcherSource,
  /const ESSAY_RE =\s*\/\\b\(describe\|tell us\|why do\|why are\|explain\|cover letter\|message\|summary\|additional information\|anything else\)\\b\/i;/,
  'the existing ESSAY_RE remains unchanged',
);
assert.doesNotMatch(matcherSource, /screening-question-drafts/);

console.log('screening-question-detector: sensitive-first standalone detection passed');
