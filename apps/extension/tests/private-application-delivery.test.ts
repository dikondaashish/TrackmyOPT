import assert from 'node:assert/strict';
import {
  filterPrivateAnswersForSenderUrl,
  portalCredentialForSenderUrl,
} from '../src/private-application-delivery';
import type { SavedPrivateApplicationAnswers } from '../src/sensitive-autofill';

const saved: SavedPrivateApplicationAnswers = {
  workAuthorization: 'yes',
  jobPortalLogins: [
    {
      hostname: 'acme.wd5.myworkdayjobs.com',
      email: 'candidate@acme.example',
      password: 'Acme-only!9A',
    },
    {
      hostname: 'jobs.greenhouse.io',
      email: 'candidate@greenhouse.example',
      password: 'Greenhouse-only!8B',
    },
  ],
};

const acme = filterPrivateAnswersForSenderUrl(
  saved,
  'https://acme.wd5.myworkdayjobs.com/en-US/jobs/login',
);
assert.equal(acme?.workAuthorization, 'yes');
assert.deepEqual(acme?.jobPortalLogins, [saved.jobPortalLogins?.[0]]);
assert.equal(
  JSON.stringify(acme).includes('Greenhouse-only!8B'),
  false,
  'one employer tab must never receive another site password',
);

assert.deepEqual(
  portalCredentialForSenderUrl(
    saved,
    'https://jobs.greenhouse.io/account/sign-in',
  ),
  saved.jobPortalLogins?.[1],
);
assert.equal(
  portalCredentialForSenderUrl(saved, 'https://www.trackmyopt.com/settings'),
  null,
  'TrackMyOPT pages never receive employer credentials',
);
assert.equal(
  portalCredentialForSenderUrl(saved, 'chrome://extensions'),
  null,
  'non-http pages never receive employer credentials',
);

console.log(
  'private-application-delivery: exact sender-host credential minimization passed',
);
