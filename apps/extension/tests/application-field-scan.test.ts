import assert from 'node:assert/strict';
import {
  scanApplicationFields,
  summarizeApplicationFields,
  type ScannedApplicationField,
} from '../src/application-field-scan';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

const requireLocal = createRequire(resolve('package.json'));
const { JSDOM } = requireLocal('jsdom');

const fields: ScannedApplicationField[] = [
  { key: 'login', label: 'Login', required: true, filled: true },
  { key: 'phone-type', label: 'Phone Type', required: true, filled: true },
  { key: 'phone', label: 'Phone Number', required: true, filled: true },
  { key: 'first', label: 'Legal First Name', required: true, filled: true },
  { key: 'last', label: 'Legal Last Name', required: true, filled: true },
  { key: 'email', label: 'Email', required: true, filled: true },
  { key: 'sms', label: 'SMS Text Consent', required: true, filled: true },
  { key: 'address', label: 'Address', required: true, filled: true },
  { key: 'city', label: 'City', required: true, filled: true },
  { key: 'zip', label: 'Zip/Postal Code', required: true, filled: true },
  { key: 'country', label: 'Country', required: true, filled: true },
  { key: 'state', label: 'State/Province', required: true, filled: true },
  { key: 'source', label: 'How did you hear about us?', required: true, filled: true },
  { key: 'source-detail', label: 'Please specify', required: true, filled: true },
  { key: 'resume', label: 'Resume/CV', required: true, filled: true },
  { key: 'preferred', label: 'Preferred Name', required: false, filled: false },
  { key: 'middle', label: 'Middle Name', required: false, filled: false },
  { key: 'salary', label: 'What are your salary expectations?', required: false, filled: true },
];

assert.deepEqual(summarizeApplicationFields(fields), {
  requiredFilled: 15,
  requiredTotal: 15,
  requiredPercent: 100,
  unansweredRequired: 0,
  optionalTotal: 3,
  required: fields.slice(0, 15),
  optional: fields.slice(15),
});

const incomplete = summarizeApplicationFields([
  { key: 'country', label: 'Country', required: true, filled: true },
  { key: 'state', label: 'State/Province', required: true, filled: false },
]);
assert.equal(incomplete.requiredPercent, 50);
assert.equal(incomplete.unansweredRequired, 1);

const linkedin = new JSDOM(
  '<dialog open><h2>Apply to Example</h2><div><p>Are you legally authorized to work in the United States?*</p><fieldset role="radiogroup"><div><input type="radio" name="auth" aria-label="Are you legally authorized to work in the United States?"><p>Yes</p></div><div><input type="radio" name="auth" aria-label="Are you legally authorized to work in the United States?"><p>No</p></div></fieldset></div><div><p>Will you require sponsorship?*</p><fieldset role="radiogroup"><div><input type="radio" name="sponsor" aria-label="Will you require sponsorship?"><p>Yes</p></div><div><input type="radio" name="sponsor" aria-label="Will you require sponsorship?"><p>No</p></div></fieldset></div></dialog>',
  { url: 'https://www.linkedin.com/jobs/view/123' },
);
const dialog = linkedin.window.document.querySelector('dialog')!;
assert.equal(scanApplicationFields(dialog).requiredTotal, 2);
assert.equal(scanApplicationFields(dialog).unansweredRequired, 2);
dialog.querySelector<HTMLInputElement>('input[name="auth"]')!.click();
assert.equal(scanApplicationFields(dialog).requiredFilled, 1);
linkedin.window.close();

console.log('application-field-scan: required progress and optional grouping passed');
