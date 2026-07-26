import assert from 'node:assert/strict';
import {
  chooseSmartDropdownOption,
  type SmartDropdownOption,
} from '../src/smart-dropdown';

const options = (
  values: Array<[string, string]>,
): SmartDropdownOption[] =>
  values.map(([value, text]) => ({ value, text, disabled: false }));

assert.deepEqual(
  chooseSmartDropdownOption(
    options([
      ['', 'Select a state'],
      ['NY', 'New York'],
      ['MA', 'Massachusetts'],
    ]),
    'MA',
    'state',
  ),
  { value: 'MA', text: 'Massachusetts', disabled: false },
  'state abbreviations match the official state name',
);

assert.deepEqual(
  chooseSmartDropdownOption(
    options([
      ['CA', 'Canada'],
      ['US', 'United States of America'],
      ['GB', 'United Kingdom'],
    ]),
    'United States',
    'country',
  ),
  { value: 'US', text: 'United States of America', disabled: false },
  'common United States variants match without guessing another country',
);

assert.equal(
  chooseSmartDropdownOption(
    options([
      ['US', 'United States'],
      ['US-REMOTE', 'United States — Remote'],
    ]),
    'United States',
    'country',
  )?.value,
  'US',
  'an exact option wins over a longer partial option',
);

assert.equal(
  chooseSmartDropdownOption(
    options([
      ['', 'Please select'],
      ['A', 'Option A'],
      ['B', 'Option B'],
    ]),
    'Option',
    'generic',
  ),
  null,
  'partial or ambiguous labels are never guessed',
);

assert.equal(
  chooseSmartDropdownOption(
    [{ value: 'MA', text: 'Massachusetts', disabled: true }],
    'MA',
    'state',
  ),
  null,
  'disabled options are never selected',
);

console.log('smart-dropdown: exact aliases, ambiguity, and disabled-option safety passed');
