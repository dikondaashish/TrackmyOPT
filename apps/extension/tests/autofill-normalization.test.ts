import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { degreeIdentity, matchDegreeOption } from '../src/prefill/degree-match';
import { countryAlpha2, normalizePhone } from '../src/shared/phone-country-codes';
import { hasSeparateCountryCode, phoneValueAccepted, phoneValueForControl } from '../src/prefill/phone-prefill';
import { newCandidateCount, shouldNudgeNextStep } from '../src/prefill/next-step-nudge';
import { formatPrefillRunSummary } from '../src/prefill/prefill-coverage';

const { JSDOM } = createRequire(resolve('package.json'))('jsdom');

function dom(html: string) {
  const window = new JSDOM(`<form>${html}</form>`, { url: 'https://jobs.example.test/apply' }).window;
  Object.assign(globalThis, {
    window, document: window.document,
    HTMLInputElement: window.HTMLInputElement, HTMLTextAreaElement: window.HTMLTextAreaElement,
    HTMLSelectElement: window.HTMLSelectElement, HTMLButtonElement: window.HTMLButtonElement,
  });
  return window;
}

test('degree level and kind are recognised across spellings', () => {
  assert.deepEqual(degreeIdentity('Master of Science'), { level: 'master', kind: 'science' });
  assert.deepEqual(degreeIdentity('M.S.'), { level: 'master', kind: 'science' });
  assert.deepEqual(degreeIdentity("Master's Degree"), { level: 'master' });
  assert.deepEqual(degreeIdentity('B.Tech'), { level: 'bachelor', kind: 'technology' });
  assert.equal(degreeIdentity('Doctor of Medicine')?.level, 'md');
  assert.equal(degreeIdentity('Ph.D.')?.level, 'doctorate');
  assert.equal(degreeIdentity('Juris Doctor')?.level, 'jd');
  assert.equal(degreeIdentity('Certificate in Design'), undefined);
});

test('degree options match by level, then kind, and stay blank when ambiguous', () => {
  const generic = ["High School", "Associate's Degree", "Bachelor's Degree", "Master's Degree", 'Doctorate'];
  assert.equal(matchDegreeOption(generic, 'Master of Science'), 3);
  assert.equal(matchDegreeOption(generic, 'B.S. Computer Science'), 2);
  assert.equal(matchDegreeOption(generic, 'MBA'), 3, 'an MBA is described by a generic master’s option');
  const specific = ['Bachelor of Arts', 'Bachelor of Science', 'Master of Arts', 'Master of Science', "Master's (other)"];
  assert.equal(matchDegreeOption(specific, 'M.S.'), 3);
  assert.equal(matchDegreeOption(specific, 'Bachelor of Science in Engineering'), -1,
    'engineering kind has no option and two generic-free bachelors exist');
  assert.equal(matchDegreeOption(['Master of Science', 'Master of Science (Research)'], 'Master of Science'), 0, 'exact text wins');
  assert.equal(matchDegreeOption(['Master of Arts', 'Master of Fine Arts'], 'Master of Engineering'), -1);
  assert.equal(matchDegreeOption(['MBA', "Master's Degree"], 'Master of Science'), 1);
  assert.equal(matchDegreeOption(['Bachelor', 'Master'], 'Diploma in Nursing'), -1, 'unknown degree never guessed');
});

test('country identity is the same however a form spells it', () => {
  for (const spelling of ['United States', 'USA', 'US', 'United States of America', 'u.s.a.']) {
    assert.equal(countryAlpha2(spelling), 'US', spelling);
  }
  assert.equal(countryAlpha2('Korea, Republic of'), 'KR');
  assert.equal(countryAlpha2('IND'), 'IN');
  assert.equal(countryAlpha2('Türkiye'.normalize('NFKD').replace(/\p{M}/gu, '')), 'TR');
  assert.equal(countryAlpha2('Dominica'), null, 'unknown names stay unknown, never a near match');
});

test('phone numbers split into dial code and national number without changing digits', () => {
  assert.deepEqual(normalizePhone('+1 (555) 123-4567'), {
    dial: '1', national: '(555) 123-4567', nationalDigits: '5551234567', e164: '+15551234567',
  });
  assert.deepEqual(normalizePhone('15551234567', 'United States'), {
    dial: '1', national: '5551234567', nationalDigits: '5551234567', e164: '+15551234567',
  });
  assert.equal(normalizePhone('+91 98765 43210').national, '98765 43210');
  assert.equal(normalizePhone('+91 98765 43210').e164, '+919876543210');
  assert.equal(normalizePhone('07911 123456', 'United Kingdom').e164, '+447911123456', 'trunk 0 dropped only for E.164');
  assert.equal(normalizePhone('07911 123456', 'United Kingdom').national, '07911 123456');
  assert.equal(normalizePhone('0044 20 7946 0958').dial, '44');
  assert.equal(normalizePhone('5551234567').e164, null, 'no country, no invented code');
});

test('phone value follows the form: national with a separate code, E.164 when asked, else as stored', () => {
  const window = dom(`
    <div class="row"><select id="code"><option>+1</option></select><input id="a" type="tel"></div>
    <input id="b" placeholder="+1 555 123 4567">
    <input id="c" aria-label="Phone (include country code)">
    <input id="d" type="tel">
    <input id="e" type="tel" maxlength="10">
    <input id="f" type="number">`);
  const el = (id: string) => window.document.getElementById(id) as HTMLInputElement;
  const code = el('code') as unknown as HTMLElement;
  assert.equal(hasSeparateCountryCode(el('a'), [code]), true);
  assert.equal(hasSeparateCountryCode(el('d'), [code]), false);
  assert.equal(phoneValueForControl(el('a'), '+1 (555) 123-4567', 'US', true), '(555) 123-4567');
  assert.equal(phoneValueForControl(el('a'), '07911 123456', 'United Kingdom', true), '7911 123456', 'trunk 0 dropped after a separate +44');
  assert.equal(phoneValueForControl(el('a'), '+44 07911 123456', undefined, true), '7911 123456');
  assert.equal(phoneValueForControl(el('b'), '(555) 123-4567', 'United States', false), '+15551234567');
  assert.equal(phoneValueForControl(el('c'), '+91 98765 43210', undefined, false), '+919876543210');
  assert.equal(phoneValueForControl(el('d'), '+91 98765 43210', undefined, false), '+91 98765 43210', 'stored form preserved');
  assert.equal(phoneValueForControl(el('e'), '+1 (555) 123-4567', 'US', false), '5551234567', 'fits by dropping only the code');
  assert.equal(phoneValueForControl(el('f'), '(555) 123-4567', 'US', false), '5551234567');
  const tiny = el('e'); tiny.maxLength = 6;
  assert.equal(phoneValueForControl(tiny, '+1 (555) 123-4567', 'US', false), '', 'never a truncated number');
  window.close();
});

test('intl-tel-input with a separate dial code counts as a separate code control', () => {
  const window = dom('<div class="iti iti--separate-dial-code"><input id="p" type="tel"></div>');
  assert.equal(hasSeparateCountryCode(window.document.getElementById('p')!, []), true);
  window.close();
});

test('a phone mask that reformats the digits is an accepted write', () => {
  assert.equal(phoneValueAccepted('(555) 123-4567', '5551234567'), true);
  assert.equal(phoneValueAccepted('+1 555-123-4567', '5551234567'), true);
  assert.equal(phoneValueAccepted('555-123-456', '5551234567'), false, 'lost digits are a failure');
  assert.equal(phoneValueAccepted('', '5551234567'), false);
  assert.equal(phoneValueAccepted('99 5551234567', '5551234567'), true);
  assert.equal(phoneValueAccepted('123455551234567', '5551234567'), false, 'more than a dial code prepended');
});

test('next-step nudge fires only for new fields after a recent explicit run', () => {
  const base = { mode: 'step_by_step' as const, lastExplicitAt: 1_000, now: 2_000, lastNudgedSignature: '', inFlight: false };
  assert.equal(newCandidateCount('u|a:email|b:phone', 'u2|c:city|a:email'), 1);
  assert.equal(shouldNudgeNextStep({ ...base, lastSignature: 'u|a:email', currentSignature: 'u|a:email|c:city' }), true);
  assert.equal(shouldNudgeNextStep({ ...base, lastSignature: 'u|a:email', currentSignature: 'u|a:email' }), false);
  assert.equal(shouldNudgeNextStep({ ...base, mode: 'continuous', lastSignature: '', currentSignature: 'u|c:city' }), false);
  assert.equal(shouldNudgeNextStep({ ...base, lastExplicitAt: null, lastSignature: '', currentSignature: 'u|c:city' }), false);
  assert.equal(shouldNudgeNextStep({ ...base, now: 1_000 + 31 * 60_000, lastSignature: '', currentSignature: 'u|c:city' }), false);
  assert.equal(shouldNudgeNextStep({ ...base, lastSignature: '', currentSignature: 'u|c:city', lastNudgedSignature: 'u|c:city' }), false, 'once per step');
});

test('run summary reads like the spec', () => {
  assert.equal(formatPrefillRunSummary({ fieldsFilled: 24, experienceRecords: 4, educationRecords: 2, dropdownsSelected: 3, needsAttention: 2 }),
    '24 fields filled · 4 experience records · 2 education records · 3 dropdowns selected · 2 need attention');
  assert.equal(formatPrefillRunSummary({ fieldsFilled: 1, experienceRecords: 0, educationRecords: 1, dropdownsSelected: 0, needsAttention: 1 }),
    '1 field filled · 1 education record · 1 needs attention');
});

test('scan reports filled fields the site marks invalid, with the site’s own message, inside shadow roots too', async () => {
  const window = dom(`
    <label for="e">Email</label><input id="e" required value="not-an-email" aria-invalid="true" aria-errormessage="e-err">
    <span id="e-err">Enter a valid email address</span>
    <label for="z">ZIP</label><input id="z" pattern="\\d{5}" value="ABCDE">
    <label for="m">Middle name</label><input id="m">
    <div id="host"></div>`);
  const shadow = window.document.getElementById('host')!.attachShadow({ mode: 'open' });
  shadow.innerHTML = '<label for="s">Shadow city</label><input id="s" required>';
  const { scanApplicationFields } = await import('../src/prefill/application-field-scan');
  const { attentionControls } = await import('../src/prefill/prefill-coverage');
  const scan = scanApplicationFields(window.document.querySelector('form')!);
  const email = scan.required.find(field => field.label.startsWith('Email'))!;
  assert.equal(email.invalid, true);
  assert.equal(email.errorText, 'Enter a valid email address');
  assert.equal(scan.optional.find(field => field.label.startsWith('ZIP'))?.invalid, true, 'native pattern mismatch');
  assert.equal(scan.optional.find(field => field.label.startsWith('Middle'))?.invalid, undefined, 'empty is missing, not invalid');
  assert.ok(scan.required.some(field => field.control === shadow.getElementById('s')), 'shadow-root control scanned');
  assert.equal(scan.invalidTotal, 2);
  const attention = attentionControls({ filled: 0, skipped: 0, total: 0, groups: {} as never, applicationScan: scan });
  assert.deepEqual(attention.map(control => control.id), ['e', 'z', 's']);
  window.close();
});

test('only a visible verification widget is reported; reCAPTCHA v3’s badge is not', async () => {
  const { detectAccessBarrier } = await import('../src/prefill/access-barriers');
  const visible = dom('<div class="g-recaptcha" data-sitekey="test"></div>');
  assert.equal(detectAccessBarrier(visible.document), 'verification');
  visible.close();
  const invisible = dom('<div class="grecaptcha-badge"><iframe src="https://www.google.com/recaptcha/api2/anchor?size=invisible"></iframe></div>');
  assert.equal(detectAccessBarrier(invisible.document), undefined);
  invisible.close();
});

test('a native degree select matches by degree level when no option has the exact text', async () => {
  const window = dom(`<select id="d"><option value="">Select</option><option value="1">High School</option>
    <option value="2">Bachelor's Degree</option><option value="3">Master's Degree</option></select>`);
  const { fillRepeatableRecords } = await import('../src/prefill/repeatable-record-engine');
  const select = window.document.getElementById('d') as HTMLSelectElement;
  fillRepeatableRecords('education', [{ element: select, section: 'education', recordIndex: 0, field: 'degree' }], {
    contact: {}, skills: [], experience: [], certifications: [],
    education: [{ school: 'Northeastern University', degree: 'Master of Science' }],
  });
  assert.equal(select.value, '3');
  window.close();
});

test('regressions from the live portal audit are classified safely', async () => {
  const { classifyField } = await import('../src/easy-apply/easy-apply-matchers');
  // Lever language checklist: "(TEL)" is Telugu, not a telephone field.
  assert.equal(classifyField('cards[a69a][field0] Telugu (TEL) English (ENG)'), null);
  assert.equal(classifyField('Tel'), 'phone');
  assert.equal(classifyField('Phone'), 'phone');
  // Greenhouse personal preferences: a question about the name.
  assert.equal(classifyField('(Optional) Personal Preferences How do you pronounce your name?'), null);
  assert.equal(classifyField('Preferred name'), null);
  assert.equal(classifyField('Your name'), 'fullName');
  // Lever office choice: about the role, not the applicant's home.
  assert.equal(classifyField('opportunityLocationId opportunity-location-select'), null);
  assert.equal(classifyField('Which office location do you prefer?'), null);
  assert.equal(classifyField('Current location'), 'location');
});

test('a label wrapping a select reads as its caption, not its option list', async () => {
  const window = dom('<label>What is your location?<select id="loc"><option>Vatican City</option><option>Albania</option></select></label>');
  const { getLabelText } = await import('../src/easy-apply/easy-apply-dom');
  assert.equal(getLabelText(window.document.getElementById('loc')!), 'What is your location?');
  window.close();
});

test('essay and consent prompts that mention a profile channel are not profile fields', async () => {
  const { classifyField } = await import('../src/easy-apply/easy-apply-matchers');
  // Workable: an essay about contributions, not a GitHub URL field.
  assert.equal(classifyField('QA_1 Share 2–3 of your open-source contributions with links (GitHub PRs, issues)'), null);
  assert.equal(classifyField('CA_47143 Github profile *Github profile'), 'githubUrl');
  // Ashby: SMS consent radio is agreement, not a phone number.
  assert.equal(classifyField('communicationConsent Yes - I consent to receiving text messages Phone'), null);
});
