import assert from 'node:assert/strict';
import {
  defaultPortalCredentialForSenderUrl,
  filterPrivateAnswersForSenderUrl,
} from '../src/private-application-delivery';
import {
  normalizeSavedPrivateApplicationAnswers,
  type SavedPrivateApplicationAnswers,
} from '../src/sensitive-autofill';

const saved: SavedPrivateApplicationAnswers = {
  workAuthorization: 'yes',
  defaultJobPortalLogin: {
    email: 'candidate@example.com',
    password: 'Shared-default!9A',
  },
};

for (const portalUrl of [
  'https://acme.wd5.myworkdayjobs.com/en-US/jobs/login',
  'https://jobs.greenhouse.io/account/sign-in',
  'https://careers.example.org/create-account',
]) {
  const delivered = filterPrivateAnswersForSenderUrl(saved, portalUrl);
  assert.equal(delivered?.workAuthorization, 'yes');
  assert.deepEqual(
    delivered?.defaultJobPortalLogin,
    saved.defaultJobPortalLogin,
    `the same reviewed default is available on ${portalUrl}`,
  );
  assert.deepEqual(
    defaultPortalCredentialForSenderUrl(saved, portalUrl),
    saved.defaultJobPortalLogin,
  );
}
assert.equal(
  defaultPortalCredentialForSenderUrl(
    saved,
    'https://www.trackmyopt.com/settings',
  ),
  null,
  'TrackMyOPT pages never receive employer credentials',
);
assert.equal(
  defaultPortalCredentialForSenderUrl(saved, 'chrome://extensions'),
  null,
  'non-http pages never receive employer credentials',
);
assert.equal(
  normalizeSavedPrivateApplicationAnswers({
    jobPortalLogins: [
      {
        hostname: 'legacy.example.com',
        email: 'legacy@example.com',
        password: 'Legacy-only!8B',
      },
    ],
  })?.defaultJobPortalLogin,
  undefined,
  'legacy hostname-bound entries stay inactive until the user migrates one',
);

console.log(
  'private-application-delivery: shared default is delivered only to safe third-party web pages',
);
