import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync('src/screening-question-review-ui.ts', 'utf8');

assert.match(source, /button\('Generate draft'\)/);
assert.match(source, /button\('Insert draft'\)/);
assert.ok(
  source.indexOf("insert.addEventListener('click'") < source.indexOf('insertScreeningDraft('),
  'draft insertion is reachable only from the explicit Insert draft action',
);
assert.match(source, /if \(!event\.isTrusted \|\| status\.dataset\.reviewState !== 'needs-review'\) return/);
assert.match(source, /status\.dataset\.reviewState = 'needs-review'/);
assert.match(source, /Use your previously edited answer/);
assert.match(source, /Regenerate fresh \(\$\{limits\.itemRegenerationsRemaining\} remaining\)/);
assert.match(source, /You have \$\{limits\.dailyRemaining\} AI generations left today/);
assert.doesNotMatch(source, /\.click\s*\(/);

console.log('screening-question-review-ui: explicit insertion and trusted review state passed');
