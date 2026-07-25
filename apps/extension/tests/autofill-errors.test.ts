import assert from 'node:assert/strict';

import {
  AUTOFILL_ERROR_CODES,
  autofillErrorCopy,
} from '../src/autofill-errors';

assert.deepEqual(AUTOFILL_ERROR_CODES, [
  'extraction_failed',
  'unsupported_control',
  'draft_review_pending',
  'attachment_failed',
]);
for (const code of AUTOFILL_ERROR_CODES) {
  const copy = autofillErrorCopy(code);
  assert.ok(copy.title.length > 0);
  assert.ok(copy.message.length > 0);
  assert.ok(copy.recovery.length > 0);
}

console.log('autofill-errors: stable user-facing support taxonomy passed');
