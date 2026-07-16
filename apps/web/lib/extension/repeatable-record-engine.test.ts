import { beforeEach, describe, expect, it } from 'vitest';
import { fillRepeatableRecords } from '../../../extension/src/repeatable-record-engine';
import type { ClassifiedControl } from '../../../extension/src/section-aware-classifier';
import type { ResumeAutofillSnapshotV1 } from '../../../extension/src/resume-autofill-contract';

const snapshot: ResumeAutofillSnapshotV1 = {
  contact: {}, skills: [], certifications: [], education: [],
  experience: [
    {
      company: 'Acme', title: 'Senior Engineer', location: 'Austin, TX',
      startDate: { originalText: '2022', year: 2022, precision: 'year' },
      isCurrent: true, bullets: [], descriptionText: 'Built platform systems.',
    },
    {
      company: 'Beta Labs', title: 'Engineer', location: 'Boston, MA',
      startDate: { originalText: 'March 2020', year: 2020, month: 3, precision: 'month' },
      endDate: { originalText: 'December 2021', year: 2021, month: 12, precision: 'month' },
      isCurrent: false, bullets: [], descriptionText: 'Delivered APIs.',
    },
  ],
};

function control(id: string, recordIndex: number, field: ClassifiedControl['field']): ClassifiedControl {
  return { element: document.querySelector(`#${id}`) as HTMLInputElement, section: 'experience', recordIndex, field };
}

describe('repeatable work-history records', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <section id="work">
        <fieldset><input id="company-0"><input id="title-0"><input id="month-0"><input id="year-0"></fieldset>
        <fieldset><input id="company-1"><input id="title-1"><input id="month-1"><input id="year-1"></fieldset>
      </section>`;
  });

  it('maps two employers to two visible containers without crossing record boundaries', () => {
    const controls = [
      control('company-0', 0, 'company'), control('title-0', 0, 'title'),
      control('company-1', 1, 'company'), control('title-1', 1, 'title'),
    ];
    const outcome = fillRepeatableRecords('experience', controls, snapshot);
    expect((document.querySelector('#company-0') as HTMLInputElement).value).toBe('Acme');
    expect((document.querySelector('#title-0') as HTMLInputElement).value).toBe('Senior Engineer');
    expect((document.querySelector('#company-1') as HTMLInputElement).value).toBe('Beta Labs');
    expect((document.querySelector('#title-1') as HTMLInputElement).value).toBe('Engineer');
    expect(outcome).toMatchObject({ visibleRecordContainers: 2, remainingRecords: 0, filledFields: 4 });
  });

  it('preserves date precision and never invents a missing month', () => {
    fillRepeatableRecords('experience', [
      control('month-0', 0, 'startMonth'), control('year-0', 0, 'startYear'),
      control('month-1', 1, 'startMonth'), control('year-1', 1, 'startYear'),
    ], snapshot);
    expect((document.querySelector('#month-0') as HTMLInputElement).value).toBe('');
    expect((document.querySelector('#year-0') as HTMLInputElement).value).toBe('2022');
    expect((document.querySelector('#month-1') as HTMLInputElement).value).toBe('03');
    expect((document.querySelector('#year-1') as HTMLInputElement).value).toBe('2020');
  });

  it('never overwrites non-empty controls or touches custom comboboxes', () => {
    const company = document.querySelector('#company-0') as HTMLInputElement;
    company.value = 'Applicant value';
    const title = document.querySelector('#title-0') as HTMLInputElement;
    title.setAttribute('role', 'combobox');
    fillRepeatableRecords('experience', [
      control('company-0', 0, 'company'), control('title-0', 0, 'title'),
    ], snapshot);
    expect(company.value).toBe('Applicant value');
    expect(title.value).toBe('');
  });
});
