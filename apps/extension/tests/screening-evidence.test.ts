import assert from 'node:assert/strict';
import test from 'node:test';
import {
  hasQuestionEvidence,
  hasUnsupportedTools,
} from '../src/screening-answer-evidence';
test('dbt experience is not inferred from a job description or missing resume facts', () => {
  assert.equal(
    hasQuestionEvidence('What do you use dbt with?', { skills: ['SQL'] }),
    false
  );
  assert.equal(
    hasQuestionEvidence('What do you use dbt with?', {
      skills: ['dbt', 'Snowflake'],
    }),
    true
  );
});
test('definition-only questions do not need a personal experience claim', () =>
  assert.equal(hasQuestionEvidence('What is data modeling?', {}), true));
test('drafts cannot introduce unsupported tool names even if the job requires them', () => {
  assert.equal(
    hasUnsupportedTools('I use dbt with Snowflake.', { skills: ['dbt'] }),
    true
  );
  assert.equal(
    hasUnsupportedTools('I use dbt with Snowflake.', {
      skills: ['dbt', 'Snowflake'],
    }),
    false
  );
});
