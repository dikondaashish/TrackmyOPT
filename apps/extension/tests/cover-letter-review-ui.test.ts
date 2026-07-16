import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync('src/cover-letter-review-ui.ts', 'utf8');

assert.match(source, /action\('Generate cover letter'\)/);
assert.match(source, /action\('Download'\)/);
assert.match(source, /action\('Edit'\)/);
assert.match(source, /action\('Save and recompile'\)/);
assert.match(source, /attachment = undefined;\s*options\.artifact\.coverLetter = undefined;/);
assert.ok(
  source.indexOf('options.artifact.coverLetter = undefined') < source.indexOf('editor.focus()'),
  'the old attachment is invalidated synchronously when editing starts',
);
assert.match(source, /await options\.recompile\(\s*editor\.value,\s*options\.artifact\.generatedContentHash/);
assert.match(source, /recompiled\.sourceContentHash !== options\.artifact\.generatedContentHash/);
assert.match(source, /You have \$\{limits\.dailyRemaining\} AI generations left today/);

console.log('cover-letter-review-ui: edit invalidation and recompile flow passed');
