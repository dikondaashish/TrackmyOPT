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
const company2 = new FakeInput();
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
  control(2, 'company', company2),
], snapshot);

assert.equal(company0.value, 'First Employer');
assert.equal(title0.value, 'Current Engineer');
assert.equal(company1.value, '', 'a conflicting applicant-entered row is not mixed with resume data');
assert.equal(title1.value, '', 'other blanks in the conflicting row stay blank');
assert.equal(company2.value, '', 'rows after an identity conflict are not shifted onto another resume record');
assert.equal(month0.value, '03');
assert.equal(year0.value, '2022');
assert.equal(month1.value, '', 'a year-precision date never receives an invented month');
assert.equal(protectedTitle.value, 'Applicant-entered title', 'non-empty applicant data is preserved');
assert.equal(customCombobox.value, '', 'custom comboboxes are left untouched');
assert.equal(outcome.visibleRecordContainers, 3);
assert.equal(outcome.remainingRecords, 0);
assert.equal(
  remainingRecordsMessage(outcome),
  undefined,
);

const matchingCompany = new FakeInput(); matchingCompany.value = 'First Employer';
const matchingTitle = new FakeInput();
fillRepeatableRecords('experience', [
  control(0, 'company', matchingCompany), control(0, 'title', matchingTitle),
], snapshot);
assert.equal(matchingTitle.value, 'Current Engineer', 'a partially filled matching row can receive its missing field');
assert.equal(matchingCompany.value, 'First Employer');

const shifted = new FakeInput();
fillRepeatableRecords('experience', [control(0, 'company', shifted)], snapshot, undefined,
  shifted as unknown as Element, 'Second Employer');
assert.equal(shifted.value, '', 'targeted retry cannot write a different source record after row reordering');

const remaining = fillRepeatableRecords('experience', [control(0, 'company', new FakeInput())], snapshot);
assert.equal(remaining.remainingRecords, 2);
assert.equal(remainingRecordsMessage(remaining), '2 more experience entries are ready. Add another record manually, then run Prefill again.');

console.log('repeatable-record-engine: two-record ordering, precision, native-control and safety guards passed');
