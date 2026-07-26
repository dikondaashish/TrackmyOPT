// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';

import {
  fillConfirmedSensitiveAnswers,
  normalizeSensitiveAnswerSession,
  type SensitiveAnswerSession,
} from '../../../extension/src/sensitive-autofill';

describe('review-confirmed private answer filling', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form>
        <label>Are you authorized to work?
          <select required>
            <option value=""></option>
            <option value="Y">Yes</option>
            <option value="N">No</option>
          </select>
        </label>
        <fieldset>
          <legend>Will you require sponsorship?</legend>
          <label><input type="radio" name="sponsor" value="yes" required>Yes</label>
          <label><input type="radio" name="sponsor" value="no" required>No</label>
        </fieldset>
        <label>Citizenship <input type="text"></label>
        <label>Current visa type
          <select>
            <option value=""></option>
            <option value="citizen">U.S. Citizen</option>
            <option value="green-card">Permanent Resident / Green Card</option>
            <option value="h1b">H-1B</option>
            <option value="f1">F-1 Student</option>
            <option value="opt">OPT</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label>Desired salary <input type="text" value="Already entered"></label>
        <label>Expected annual salary <input type="text"></label>
        <label>Expected hourly rate <input type="text"></label>
        <label>Can you work in-person?
          <select>
            <option value=""></option><option value="yes">Yes</option><option value="no">No</option>
          </select>
        </label>
        <label>Are you willing to relocate?
          <select>
            <option value=""></option><option value="yes">Yes</option><option value="no">No</option>
          </select>
        </label>
        <label>Can you start immediately?
          <select>
            <option value=""></option><option value="yes">Yes</option><option value="no">No</option>
          </select>
        </label>
        <label>Do you have reliable transportation?
          <select>
            <option value=""></option><option value="yes">Yes</option><option value="no">No</option>
          </select>
        </label>
        <label>Do you need accommodations?
          <select>
            <option value=""></option><option value="yes">Yes</option><option value="no">No</option>
          </select>
        </label>
        <label>Date of birth <input type="date"></label>
        <label>Equal opportunity
          <select>
            <option value=""></option>
            <option value="decline">Prefer not to answer</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label>Sex / gender
          <select>
            <option value=""></option>
            <option value="F">Female</option>
            <option value="M">Male</option>
            <option value="decline">Prefer not to answer</option>
          </select>
        </label>
        <fieldset>
          <legend>Race / ethnicity</legend>
          <label><input type="radio" name="race" value="asian">Asian</label>
          <label><input type="radio" name="race" value="white">White</label>
        </fieldset>
        <label>Are you Hispanic or Latino?
          <select>
            <option value=""></option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="decline">Prefer not to answer</option>
          </select>
        </label>
        <label>Veteran status
          <select>
            <option value=""></option>
            <option value="not-veteran">I am not a protected veteran</option>
            <option value="protected">I identify as a protected veteran</option>
          </select>
        </label>
        <label>Disability status
          <select>
            <option value=""></option>
            <option value="yes">Yes, I have a disability</option>
            <option value="no">No, I do not have a disability</option>
            <option value="decline">I do not wish to answer</option>
          </select>
        </label>
      </form>`;
  });

  const answers: SensitiveAnswerSession = {
    confirmed: true,
    workAuthorization: 'yes',
    requiresSponsorship: 'no',
    citizenship: 'India',
    visaType: 'h1b',
    salaryExpectation: '$100,000',
    expectedAnnualSalary: '$120,000',
    expectedHourlyRate: '$58',
    canWorkInPerson: 'yes',
    willingToRelocate: 'no',
    canStartImmediately: 'yes',
    reliableTransportation: 'yes',
    needsAccommodations: 'no',
    dateOfBirth: '1998-04-12',
    eeoPreference: 'prefer_not_to_answer',
    sexGender: 'female',
    hispanicLatino: 'no',
    raceEthnicity: 'asian',
    veteranStatus: 'not_protected_veteran',
    disabilityStatus: 'prefer_not_to_answer',
  };

  it('does nothing until the user confirms the session answers', async () => {
    expect(
      (
        await fillConfirmedSensitiveAnswers(document, {
          ...answers,
          confirmed: false,
        })
      ).filled
    ).toBe(0);
    expect(document.querySelector('select')!.value).toBe('');
  });

  it('uses exact confirmed facts, chooses EEO decline, and never overwrites', async () => {
    const result = await fillConfirmedSensitiveAnswers(document, answers);
    const selects = document.querySelectorAll('select');
    const textInputs = document.querySelectorAll<HTMLInputElement>(
      'input[type="text"]'
    );

    expect(selects[0].value).toBe('Y');
    expect(
      document.querySelector<HTMLInputElement>(
        'input[name="sponsor"][value="no"]'
      )!.checked
    ).toBe(true);
    expect(textInputs[0].value).toBe('India');
    expect(selects[1].value).toBe('h1b');
    expect(textInputs[1].value).toBe('Already entered');
    expect(textInputs[2].value).toBe('$120,000');
    expect(textInputs[3].value).toBe('$58');
    expect(selects[2].value).toBe('yes');
    expect(selects[3].value).toBe('no');
    expect(selects[4].value).toBe('yes');
    expect(selects[5].value).toBe('yes');
    expect(selects[6].value).toBe('no');
    expect(document.querySelector<HTMLInputElement>('input[type="date"]')!.value)
      .toBe('1998-04-12');
    expect(selects[7].value).toBe('decline');
    expect(selects[8].value).toBe('F');
    expect(
      document.querySelector<HTMLInputElement>(
        'input[name="race"][value="asian"]'
      )!.checked
    ).toBe(true);
    expect(selects[9].value).toBe('no');
    expect(selects[10].value).toBe('not-veteran');
    expect(selects[11].value).toBe('decline');
    expect(result.filled).toBe(18);
  });

  it('strictly bounds the ephemeral child-frame payload', () => {
    expect(
      normalizeSensitiveAnswerSession({
        confirmed: true,
        workAuthorization: 'yes',
        requiresSponsorship: 'sometimes',
        visaStatus: ` F-1 OPT ${'x'.repeat(200)}`,
        visaType: 'opt',
        visaOther: ' ignored for OPT ',
        citizenship: ' India ',
        expectedAnnualSalary: ' $120,000 ',
        expectedHourlyRate: ' $58 ',
        canWorkInPerson: 'yes',
        willingToRelocate: 'no',
        canStartImmediately: 'sometimes',
        reliableTransportation: 'yes',
        needsAccommodations: 'no',
        dateOfBirth: 'not-a-date',
        eeoPreference: 'female',
        sexGender: 'female',
        hispanicLatino: 'no',
        raceEthnicity: 'asian',
        veteranStatus: 'not_protected_veteran',
        disabilityStatus: 'prefer_not_to_answer',
        unknown: 'private',
      })
    ).toEqual({
      confirmed: true,
      workAuthorization: 'yes',
      visaStatus: `F-1 OPT ${'x'.repeat(112)}`,
      visaType: 'opt',
      visaOther: 'ignored for OPT',
      citizenship: 'India',
      expectedAnnualSalary: '$120,000',
      expectedHourlyRate: '$58',
      canWorkInPerson: 'yes',
      willingToRelocate: 'no',
      reliableTransportation: 'yes',
      needsAccommodations: 'no',
      sexGender: 'female',
      hispanicLatino: 'no',
      raceEthnicity: 'asian',
      veteranStatus: 'not_protected_veteran',
      disabilityStatus: 'prefer_not_to_answer',
    });
  });
});
