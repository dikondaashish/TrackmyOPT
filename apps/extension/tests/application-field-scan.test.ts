import assert from 'node:assert/strict';
import {
  summarizeApplicationFields,
  type ScannedApplicationField,
} from '../src/application-field-scan';

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

console.log('application-field-scan: required progress and optional grouping passed');
