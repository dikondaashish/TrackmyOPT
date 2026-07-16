import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { savedAnswerAnalyticsProperties } from '../src/saved-screening-answers';

const migration = readFileSync('../../supabase/migrations/20260716120000_create_screening_answers.sql', 'utf8');
assert.match(migration, /ENABLE ROW LEVEL SECURITY/i);
assert.match(migration, /FOR SELECT\s+USING \(auth\.uid\(\) = user_id\)/i);
assert.match(migration, /FOR INSERT\s+WITH CHECK \(auth\.uid\(\) = user_id\)/i);
assert.match(migration, /FOR DELETE\s+USING \(auth\.uid\(\) = user_id\)/i);
assert.match(migration, /char_length\(normalized_question_text\) BETWEEN 1 AND 2000/i);
assert.match(migration, /char_length\(edited_answer\) BETWEEN 1 AND 8000/i);

const analytics = JSON.stringify(savedAnswerAnalyticsProperties('saved'));
assert.doesNotMatch(analytics, /questionText|answerText|editedAnswer|normalizedQuestion/i);
assert.deepEqual(savedAnswerAnalyticsProperties('reused'), {
  action: 'reused',
  matchType: 'exact_text',
});

console.log('saved-screening-answers: RLS ownership and privacy-safe analytics passed');
