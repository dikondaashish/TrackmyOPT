import assert from 'node:assert/strict';
import test from 'node:test';

import {
  chooseSmartDropdownOption,
  type SmartDropdownContext,
  type SmartDropdownMatchKind,
} from '../src/smart-dropdown';
import { classifyField } from '../src/easy-apply-matchers';
import {
  dialCodeForCountry,
  dialCodeFromPhoneNumber,
  resolveDialCode,
} from '../src/phone-country-codes';

/**
 * Real ATS dropdowns render the same answer many ways. Matching only the whole
 * option string left country, state, dial-code, and city lists on their
 * placeholder, so the applicant had to redo by hand exactly the fields they had
 * already saved to TrackMyOPT.
 */
const US_CONTEXT: SmartDropdownContext = { countryName: 'United States' };

function pick(
  options: string[],
  desired: string,
  kind: SmartDropdownMatchKind,
  context: SmartDropdownContext = US_CONTEXT,
): string | null {
  const chosen = chooseSmartDropdownOption(
    options.map((text) => ({ value: '', text })),
    desired,
    kind,
    context,
  );
  return chosen ? chosen.text : null;
}

test('country lists match across their common renderings', () => {
  assert.equal(
    pick(['Select One', 'United States of America', 'India'], 'United States', 'country'),
    'United States of America',
  );
  assert.equal(
    pick(['Select...', 'United States (US)', 'United Kingdom (GB)'], 'United States', 'country'),
    'United States (US)',
  );
  assert.equal(
    pick(['🇺🇸 United States', '🇬🇧 United Kingdom'], 'United States', 'country'),
    '🇺🇸 United States',
  );
});

test('state lists match by name, by code, and by ISO-prefixed label', () => {
  assert.equal(pick(['Select', 'California', 'Colorado'], 'CA', 'state'), 'California');
  assert.equal(pick(['Select', 'CA', 'CO'], 'California', 'state'), 'CA');
  assert.equal(
    pick(['Select', 'US-CA — California', 'US-CO — Colorado'], 'CA', 'state'),
    'US-CA — California',
  );
});

test('phone country-code lists select the applicant dial code', () => {
  const usCode = resolveDialCode({ country: 'United States' })!;
  assert.equal(pick(['Select', '+1', '+44', '+91'], usCode, 'phoneCountryCode'), '+1');
  assert.equal(pick(['Select', 'US +1', 'GB +44'], usCode, 'phoneCountryCode'), 'US +1');

  // "+1" is shared, so the applicant's country decides.
  assert.equal(
    pick(['Select', 'United States (+1)', 'Canada (+1)'], usCode, 'phoneCountryCode'),
    'United States (+1)',
  );
});

test('the phone number outranks the stored country for the dial code', () => {
  // Someone living in the US who kept an Indian number must still get +91.
  const code = resolveDialCode({ phone: '+91 98765 43210', country: 'United States' })!;
  assert.equal(code, '91');
  assert.equal(
    pick(['Select', 'India (+91)', 'United States (+1)'], code, 'phoneCountryCode'),
    'India (+91)',
  );
});

test('a longer dial code is never mistaken for its prefix', () => {
  assert.equal(dialCodeFromPhoneNumber('+972 50 123 4567'), '972');
  assert.equal(dialCodeFromPhoneNumber('+44 20 7946 0958'), '44');
  assert.equal(dialCodeFromPhoneNumber('+1 415 555 0100'), '1');
  assert.equal(dialCodeFromPhoneNumber('415 555 0100'), null);
  assert.equal(
    pick(['Select', 'Dominican Republic (+1809)', 'United States (+1)'], '1', 'phoneCountryCode'),
    'United States (+1)',
  );
});

test('a dial-code list without the applicant code selects nothing', () => {
  assert.equal(
    pick(['Select', 'United Kingdom (+44)', 'India (+91)'], '1', 'phoneCountryCode'),
    null,
  );
});

test('city and location lists match a complete leading run of segments', () => {
  assert.equal(
    pick(['Select', 'New York, NY, United States', 'Newark, NJ, United States'], 'New York, NY', 'location'),
    'New York, NY, United States',
  );
  assert.equal(
    pick(['Select', 'Austin, TX, United States', 'Boston, MA, United States'], 'Austin', 'location'),
    'Austin, TX, United States',
  );
});

test('ambiguous or partial place matches select nothing', () => {
  // Two Portlands: the profile city cannot decide between them.
  assert.equal(
    pick(['Select', 'Portland, OR, United States', 'Portland, ME, United States'], 'Portland', 'location'),
    null,
  );
  // A mid-string substring must never win.
  assert.equal(pick(['Select', 'New York, NY, United States'], 'York', 'location'), null);
  // Nor a trailing segment.
  assert.equal(pick(['Select', 'New York, NY, United States'], 'United States', 'location'), null);
});

test('phone sub-controls classify apart from the phone number itself', () => {
  assert.equal(classifyField('Phone Country Code'), 'phoneCountryCode');
  assert.equal(classifyField('Phone Device Type'), 'phoneDeviceType');
  assert.equal(classifyField('Phone Type'), 'phoneDeviceType');
  assert.equal(classifyField('Mobile phone number'), 'phone');
  assert.equal(classifyField('Phone'), 'phone');
  // A bare "country code" stays an address field — usually an ISO list.
  assert.equal(classifyField('Country Code'), 'country');
  assert.equal(classifyField('Country'), 'country');
});

test('sensitive dropdowns stay unclassified no matter their options', () => {
  // These are answered only through the reviewed private-answer flow.
  for (const label of [
    'Veteran Status',
    'Protected Veteran',
    'Gender',
    'Race / Ethnicity',
    'Disability Status',
    'Are you legally authorized to work in the US?',
    'Do you require visa sponsorship?',
    'Desired salary',
  ]) {
    assert.equal(classifyField(label), null, `${label} must never autofill`);
  }
});

test('dial-code lookup covers name, alpha-2, and unknown input', () => {
  assert.equal(dialCodeForCountry('United States'), '1');
  assert.equal(dialCodeForCountry('USA'), '1');
  assert.equal(dialCodeForCountry('IN'), '91');
  assert.equal(dialCodeForCountry('United Kingdom'), '44');
  assert.equal(dialCodeForCountry('Atlantis'), null);
  assert.equal(resolveDialCode({}), null);
});

test('placeholder and disabled options are never selected', () => {
  assert.equal(pick(['Select One', 'Choose an option', 'Please select'], 'Select', 'generic'), null);
  const withDisabled = chooseSmartDropdownOption(
    [
      { value: '', text: 'United States', disabled: true },
      { value: '', text: 'India' },
    ],
    'United States',
    'country',
  );
  assert.equal(withDisabled, null);
});
