import assert from 'node:assert/strict';
import {
  credentialForHostname,
  normalizeSavedJobPortalLogins,
  type JobPortalLoginCredential,
} from '../src/job-portal-login';

const saved: JobPortalLoginCredential[] = [
  {
    hostname: 'acme.wd5.myworkdayjobs.com',
    email: 'Candidate@example.com',
    password: 'Application-only!9A',
  },
  {
    hostname: 'jobs.greenhouse.io',
    email: 'candidate+greenhouse@example.com',
    password: 'Different-portal!8B',
  },
];

assert.deepEqual(normalizeSavedJobPortalLogins(saved), saved);
assert.deepEqual(
  credentialForHostname(saved, 'ACME.wd5.myworkdayjobs.com'),
  saved[0],
  'credentials match only their exact normalized portal hostname',
);
assert.equal(
  credentialForHostname(saved, 'evil.acme.wd5.myworkdayjobs.com'),
  null,
  'a deceptive subdomain must not receive another portal credential',
);
assert.equal(
  credentialForHostname(saved, 'www.trackmyopt.com'),
  null,
  'TrackMyOPT pages must never receive a saved employer-portal password',
);
assert.deepEqual(
  normalizeSavedJobPortalLogins([
    ...saved,
    {
      hostname: 'www.trackmyopt.com',
      email: 'owner@example.com',
      password: 'Never-return-this!7C',
    },
    {
      hostname: 'acme.wd5.myworkdayjobs.com',
      email: 'duplicate@example.com',
      password: 'Duplicate-portal!6D',
    },
  ]),
  saved,
  'unsafe and duplicate decrypted entries are dropped at the extension boundary',
);

console.log(
  'job-portal-login: exact-host credential isolation and normalization passed',
);
