import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const reminderPages = [
  'src/pages/clock-tracker.ts',
  'src/pages/stem-clock-tracker.ts',
  'src/pages/opt-countdown.ts',
  'src/pages/stem-countdown.ts',
];

for (const path of reminderPages) {
  const source = readFileSync(path, 'utf8');
  assert.doesNotMatch(
    source,
    /chrome\.storage\.sync\.(?:set|remove)\([^)]*subscribedEmail/s,
    `${path} must not place a reminder email in synced browser storage`,
  );
  assert.doesNotMatch(
    source,
    /value="\\?\$\{(?:savedEmail|subscribedEmail)/,
    `${path} must not interpolate an email into HTML`,
  );
  assert.match(
    source,
    /reminderEmailInput\.value = (?:savedEmail|subscribedEmail) \|\| ''/,
    `${path} should set the input through the DOM value property`,
  );
}

console.log('reminder-email-privacy: email remains API-backed and is assigned through DOM properties');
