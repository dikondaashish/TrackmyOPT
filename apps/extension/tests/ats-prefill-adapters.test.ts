import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  ATS_PREFILL_ADAPTERS,
  genericPrefillAdapter,
  greenhousePrefillAdapter,
  selectAtsPrefillAdapter,
  workdayPrefillAdapter,
} from '../src/ats-prefill-adapters';

function documentFixture(
  host: string,
  selectors: Record<string, object> = {},
): Document {
  return {
    location: { hostname: host },
    querySelector(selector: string) {
      return selectors[selector] || null;
    },
  } as unknown as Document;
}

{
  const ids = ATS_PREFILL_ADAPTERS.map((adapter) => adapter.id);
  assert.deepEqual(ids, ['workday', 'greenhouse', 'generic']);
  assert.equal(new Set(ids).size, 3);

  const source = readFileSync('src/ats-prefill-adapters.ts', 'utf8');
  assert.doesNotMatch(source, /id:\s*['"](?:lever|ashby|icims)['"]/i);
}

{
  assert.equal(workdayPrefillAdapter.matches(documentFixture('acme.wd5.myworkdayjobs.com')), true);
  assert.equal(workdayPrefillAdapter.matches(documentFixture('acme.myworkday.com')), true);
  assert.equal(workdayPrefillAdapter.matches(documentFixture('myworkdayjobs.com.evil.example')), false);
  assert.equal(
    selectAtsPrefillAdapter(documentFixture('acme.wd5.myworkdayjobs.com')).id,
    'workday',
  );
  assert.equal(
    selectAtsPrefillAdapter(
      documentFixture('acme.wd5.myworkdayjobs.com'),
      false
    ).id,
    'generic',
  );
}

{
  assert.equal(greenhousePrefillAdapter.matches(documentFixture('boards.greenhouse.io')), true);
  assert.equal(greenhousePrefillAdapter.matches(documentFixture('greenhouse.io.evil.example')), false);
  assert.equal(selectAtsPrefillAdapter(documentFixture('jobs.example.com')).id, 'generic');
  assert.equal(genericPrefillAdapter.matches(documentFixture('any.example')), true);
}

{
  const applicationRoot = {};
  const selector =
    '[data-automation-id="jobApplicationPage"], [data-automation-id="applicationPage"], [data-automation-id="applyFlowPage"], form';
  const document = documentFixture('acme.myworkdayjobs.com', { [selector]: applicationRoot });
  assert.equal(workdayPrefillAdapter.findApplicationRoot(document), applicationRoot);
}

function control(label: string, record: object): HTMLInputElement {
  return {
    id: '',
    getAttribute(name: string) {
      return name === 'aria-label' ? label : null;
    },
    closest(selector: string) {
      return selector === 'label' ? null : record;
    },
  } as unknown as HTMLInputElement;
}

function section(
  heading: string,
  controls: Array<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
): HTMLElement {
  return {
    id: '',
    className: '',
    getAttribute() {
      return null;
    },
    querySelector(selector: string) {
      return selector.startsWith(':scope') ? { textContent: heading } : null;
    },
    querySelectorAll(selector: string) {
      return selector === 'input, textarea, select' ? controls : [];
    },
  } as unknown as HTMLElement;
}

{
  const firstRecord = {};
  const secondRecord = {};
  const employer1 = control('Company', firstRecord);
  const title1 = control('Job title', firstRecord);
  const employer2 = control('Employer', secondRecord);
  const sensitive = control('Visa sponsorship details', secondRecord);
  const organizationTraps = [
    control('Manager company', secondRecord),
    control('Referral company', secondRecord),
    control('Company website', secondRecord),
  ];
  const experience = section('Work Experience', [
    employer1,
    title1,
    employer2,
    sensitive,
    ...organizationTraps,
  ]);
  const root = {
    querySelectorAll() {
      return [experience];
    },
  } as unknown as HTMLElement;

  const classified = genericPrefillAdapter.classifyRepeatableSections(root);
  assert.deepEqual(
    classified.map(({ section, recordIndex, field }) => ({ section, recordIndex, field })),
    [
      { section: 'experience', recordIndex: 0, field: 'company' },
      { section: 'experience', recordIndex: 0, field: 'title' },
      { section: 'experience', recordIndex: 1, field: 'company' },
    ],
  );
  assert.equal(classified.some(({ element }) => element === sensitive), false);
  assert.equal(
    classified.some(({ element }) => organizationTraps.includes(element)),
    false,
  );
}

console.log('ats-prefill-adapters: generic, Workday, and Greenhouse boundary passed');
