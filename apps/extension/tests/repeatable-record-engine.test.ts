import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fillRepeatableRecords, remainingRecordsMessage } from '../src/repeatable-record-engine';
import type { ClassifiedControl } from '../src/ats-prefill-adapters';
import type { ResumeAutofillSnapshotV1 } from '../src/resume-autofill-contract';

const source = readFileSync('src/repeatable-record-engine.ts', 'utf8');

assert.match(source, /\.sort\(domOrder\)/, 'record containers use visible DOM order');
assert.match(source, /date\.precision !== 'month'/, 'month fill requires month precision');
assert.match(source, /date\.precision === 'text'/, 'text-only dates are not converted');
assert.match(source, /getAttribute\('role'\) === 'combobox'/, 'custom comboboxes are skipped');
assert.match(source, /hasAttribute\('aria-autocomplete'\)/, 'typeaheads are skipped');
assert.match(source, /!isEmpty\(control\.element\)/, 'non-empty fields are never overwritten');
assert.match(source, /remainingRecords: Math\.max\(0, sourceRecords\.length - visibleIndices\.length\)/);
assert.doesNotMatch(source, /\.click\s*\(/, 'engine cannot click host-page actions');
assert.doesNotMatch(source, /console\.|analytics|chrome\.storage\.sync/, 'resume content is not logged or persisted');

class FakeInput {
  value = '';
  checked = false;
  disabled = false;
  hidden = false;
  type = 'text';
  style = { display: '', visibility: '' };
  parentElement = null;
  attributes = new Map<string, string>();
  events: string[] = [];
  getAttribute(name: string) { return this.attributes.get(name) ?? null; }
  hasAttribute(name: string) { return this.attributes.has(name); }
  closest() { return null; }
  dispatchEvent(event: Event) { this.events.push(event.type); return true; }
}
class FakeTextArea extends FakeInput {}
class FakeSelect extends FakeInput { options: Array<{ value: string; text: string }> = []; }

Object.assign(globalThis, {
  HTMLInputElement: FakeInput,
  HTMLTextAreaElement: FakeTextArea,
  HTMLSelectElement: FakeSelect,
});

function control(
  recordIndex: number,
  field: ClassifiedControl['field'],
  element: FakeInput = new FakeInput(),
): ClassifiedControl {
  return { element: element as unknown as HTMLInputElement, section: 'experience', recordIndex, field };
}

const company0 = new FakeInput();
const title0 = new FakeInput();
const month0 = new FakeInput();
const year0 = new FakeInput();
const company1 = new FakeInput();
const title1 = new FakeInput();
const month1 = new FakeInput();
const protectedTitle = new FakeInput();
protectedTitle.value = 'Applicant-entered title';
const customCombobox = new FakeInput();
customCombobox.attributes.set('role', 'combobox');

const snapshot: ResumeAutofillSnapshotV1 = {
  contact: {}, skills: [], education: [], certifications: [],
  experience: [
    {
      company: 'First Employer', title: 'Current Engineer', isCurrent: true,
      startDate: { originalText: 'March 2022', year: 2022, month: 3, precision: 'month' },
      bullets: [], descriptionText: '',
    },
    {
      company: 'Second Employer', title: 'Earlier Engineer', isCurrent: false,
      startDate: { originalText: '2019', year: 2019, precision: 'year' },
      bullets: [], descriptionText: '',
    },
    {
      company: 'Third Employer', title: 'Oldest Engineer', isCurrent: false,
      startDate: { originalText: 'Earlier', precision: 'text' },
      bullets: [], descriptionText: '',
    },
  ],
};

const outcome = fillRepeatableRecords('experience', [
  control(0, 'company', company0), control(0, 'title', title0),
  control(0, 'startMonth', month0), control(0, 'startYear', year0),
  control(1, 'company', company1), control(1, 'title', title1),
  control(1, 'startMonth', month1), control(1, 'title', protectedTitle),
  control(1, 'location', customCombobox),
], snapshot);

assert.equal(company0.value, 'First Employer');
assert.equal(title0.value, 'Current Engineer');
assert.equal(company1.value, 'Second Employer');
assert.equal(title1.value, 'Earlier Engineer');
assert.equal(month0.value, '03');
assert.equal(year0.value, '2022');
assert.equal(month1.value, '', 'a year-precision date never receives an invented month');
assert.equal(protectedTitle.value, 'Applicant-entered title', 'non-empty applicant data is preserved');
assert.equal(customCombobox.value, '', 'custom comboboxes are left untouched');
assert.equal(outcome.visibleRecordContainers, 2);
assert.equal(outcome.remainingRecords, 1);
assert.equal(
  remainingRecordsMessage(outcome),
  '1 more experience entries are ready. Add another record manually, then run Prefill again.',
);

console.log('repeatable-record-engine: two-record ordering, precision, native-control and safety guards passed');
