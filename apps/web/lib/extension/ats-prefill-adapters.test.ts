import { beforeEach, describe, expect, it } from 'vitest';
import {
  genericPrefillAdapter,
  greenhousePrefillAdapter,
  workdayPrefillAdapter,
} from '../../../extension/src/ats-prefill-adapters';

describe('generic adapter record boundaries', () => {
  beforeEach(() => { document.body.textContent = ''; });

  it('assigns stable indices across separate visible experience fieldsets', () => {
    document.body.innerHTML = `
      <form id="application-form">
        <fieldset><legend>Work Experience</legend><input aria-label="Company"><input aria-label="Job title"></fieldset>
        <fieldset><legend>Work Experience</legend><input aria-label="Employer"><input aria-label="Position title"></fieldset>
      </form>`;
    const controls = genericPrefillAdapter.classifyRepeatableSections(
      document.querySelector('#application-form') as HTMLElement,
    );
    expect(controls.map(({ recordIndex, field }) => [recordIndex, field])).toEqual([
      [0, 'company'], [0, 'title'], [1, 'company'], [1, 'title'],
    ]);
  });
});

describe('sanitized ATS repeatable-section fixtures', () => {
  beforeEach(() => { document.body.textContent = ''; });

  it('classifies Workday experience and education cards with stable record indices', () => {
    document.body.innerHTML = `
      <main data-automation-id="jobApplicationPage">
        <section data-automation-id="workExperienceCard">
          <h3>Work Experience</h3>
          <input data-automation-id="company">
          <input data-automation-id="jobTitle">
          <input data-automation-id="startYear">
          <input aria-label="Manager company website">
        </section>
        <section data-automation-id="educationCard">
          <h3>Education</h3>
          <input data-automation-id="school">
          <input data-automation-id="degree">
          <input data-automation-id="endYear">
        </section>
      </main>`;
    const root = document.querySelector(
      '[data-automation-id="jobApplicationPage"]',
    ) as HTMLElement;

    expect(
      workdayPrefillAdapter
        .classifyRepeatableSections(root)
        .map(({ section, recordIndex, field }) => [
          section,
          recordIndex,
          field,
        ]),
    ).toEqual([
      ['experience', 0, 'company'],
      ['experience', 0, 'title'],
      ['experience', 0, 'startYear'],
      ['education', 0, 'school'],
      ['education', 0, 'degree'],
      ['education', 0, 'endYear'],
    ]);
  });

  it('classifies Greenhouse fieldsets and keeps separate history records separate', () => {
    document.body.innerHTML = `
      <form id="application-form">
        <fieldset class="field">
          <legend>Employment</legend>
          <label>Employer <input name="company"></label>
          <label>Position title <input name="job_title"></label>
        </fieldset>
        <fieldset class="field">
          <legend>Employment</legend>
          <label>Employer <input name="company_2"></label>
          <label>Position title <input name="job_title_2"></label>
        </fieldset>
        <fieldset class="field">
          <legend>Education</legend>
          <label>University <input name="school"></label>
          <label>Field of study <input name="major"></label>
        </fieldset>
      </form>`;
    const root = document.querySelector('#application-form') as HTMLElement;

    expect(
      greenhousePrefillAdapter
        .classifyRepeatableSections(root)
        .map(({ section, recordIndex, field }) => [
          section,
          recordIndex,
          field,
        ]),
    ).toEqual([
      ['experience', 0, 'company'],
      ['experience', 0, 'title'],
      ['experience', 1, 'company'],
      ['experience', 1, 'title'],
      ['education', 0, 'school'],
      ['education', 0, 'fieldOfStudy'],
    ]);
  });
});
