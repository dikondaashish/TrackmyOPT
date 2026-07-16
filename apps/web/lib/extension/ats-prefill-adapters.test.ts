import { beforeEach, describe, expect, it } from 'vitest';
import { genericPrefillAdapter } from '../../../extension/src/ats-prefill-adapters';

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
