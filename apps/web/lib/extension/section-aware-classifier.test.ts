import { beforeEach, describe, expect, it } from 'vitest';
import {
  classifySectionAwareControls,
  detectFormSection,
} from '../../../extension/src/section-aware-classifier';

describe('section-aware history classification', () => {
  beforeEach(() => { document.body.textContent = ''; });

  it('classifies Company only inside an experience section', () => {
    document.body.innerHTML = `
      <fieldset><legend>Work Experience</legend>
        <label for="employer">Company</label><input id="employer" />
      </fieldset>
      <section><h2>Referral</h2>
        <label for="referral-company">Company</label><input id="referral-company" />
      </section>`;
    const controls = classifySectionAwareControls(document.body);
    expect(controls).toHaveLength(1);
    expect(controls[0]).toMatchObject({ section: 'experience', field: 'company' });
    expect(controls[0].element.id).toBe('employer');
  });

  it.each([
    ['Referral company', 'referral-company'],
    ['Manager company', 'manager-company'],
    ['Company website', 'company-website'],
  ])('never classifies %s outside a history section', (label, id) => {
    document.body.innerHTML = `<label for="${id}">${label}</label><input id="${id}" />`;
    expect(classifySectionAwareControls(document.body)).toEqual([]);
  });

  it('detects sections from fieldset legends and nearby headings', () => {
    document.body.innerHTML = `
      <fieldset><legend>Employment History</legend><input id="job-title" aria-label="Job title" /></fieldset>
      <section><h2>Education</h2><div><input id="school" aria-label="School" /></div></section>`;
    expect(detectFormSection(document.querySelector('#job-title')!, document.body)).toBe('experience');
    expect(detectFormSection(document.querySelector('#school')!, document.body)).toBe('education');
  });

  it('detects sections from ARIA relations and ATS data attributes', () => {
    document.body.innerHTML = `
      <h2 id="work-heading">Professional Experience</h2>
      <div aria-labelledby="work-heading"><input id="company" aria-label="Employer" /></div>
      <div data-automation-id="education-section"><input id="degree" aria-label="Degree" /></div>`;
    expect(detectFormSection(document.querySelector('#company')!, document.body)).toBe('experience');
    expect(detectFormSection(document.querySelector('#degree')!, document.body)).toBe('education');
  });
});
