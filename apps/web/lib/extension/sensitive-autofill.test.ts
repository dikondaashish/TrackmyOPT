// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';

import {
  fillConfirmedSensitiveAnswers,
  normalizeSensitiveAnswerSession,
  type SensitiveAnswerSession,
} from '../../../extension/src/sensitive-autofill';

describe('session-only sensitive answer filling', () => {
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
        <label>Desired salary <input type="text" value="Already entered"></label>
        <label>Date of birth <input type="date"></label>
        <label>Equal opportunity
          <select>
            <option value=""></option>
            <option value="decline">Prefer not to answer</option>
            <option value="other">Other</option>
          </select>
        </label>
      </form>`;
  });

  const answers: SensitiveAnswerSession = {
    confirmed: true,
    workAuthorization: 'yes',
    requiresSponsorship: 'no',
    citizenship: 'India',
    salaryExpectation: '$100,000',
    dateOfBirth: '1998-04-12',
    eeoPreference: 'prefer_not_to_answer',
  };

  it('does nothing until the user confirms the session answers', () => {
    expect(
      fillConfirmedSensitiveAnswers(document, { ...answers, confirmed: false })
        .filled
    ).toBe(0);
    expect(document.querySelector('select')!.value).toBe('');
  });

  it('uses exact confirmed facts, chooses EEO decline, and never overwrites', () => {
    const result = fillConfirmedSensitiveAnswers(document, answers);
    const selects = document.querySelectorAll('select');
    const textInputs = document.querySelectorAll<HTMLInputElement>(
      'input[type="text"]'
    );

    expect(result.filled).toBe(5);
    expect(selects[0].value).toBe('Y');
    expect(
      document.querySelector<HTMLInputElement>(
        'input[name="sponsor"][value="no"]'
      )!.checked
    ).toBe(true);
    expect(textInputs[0].value).toBe('India');
    expect(textInputs[1].value).toBe('Already entered');
    expect(document.querySelector<HTMLInputElement>('input[type="date"]')!.value)
      .toBe('1998-04-12');
    expect(selects[1].value).toBe('decline');
  });

  it('strictly bounds the ephemeral child-frame payload', () => {
    expect(
      normalizeSensitiveAnswerSession({
        confirmed: true,
        workAuthorization: 'yes',
        requiresSponsorship: 'sometimes',
        visaStatus: ` F-1 OPT ${'x'.repeat(200)}`,
        citizenship: ' India ',
        dateOfBirth: 'not-a-date',
        eeoPreference: 'female',
        unknown: 'private',
      })
    ).toEqual({
      confirmed: true,
      workAuthorization: 'yes',
      visaStatus: `F-1 OPT ${'x'.repeat(112)}`,
      citizenship: 'India',
    });
  });
});
