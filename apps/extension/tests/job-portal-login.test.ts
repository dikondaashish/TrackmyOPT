import assert from 'node:assert/strict';
import {
  normalizeDefaultJobPortalLogin,
  type JobPortalLoginCredential,
} from '../src/job-portal-login';

const saved: JobPortalLoginCredential = {
  email: 'Candidate@example.com',
  password: 'Application-only!9A',
};

assert.deepEqual(
  normalizeDefaultJobPortalLogin(saved),
  saved,
  'the shared default login is normalized without a hostname',
);
assert.equal(
  normalizeDefaultJobPortalLogin({
    hostname: 'legacy.example.com',
    email: 'legacy@example.com',
    password: 'Legacy-only!8B',
  }),
  null,
  'legacy hostname-bound entries must not become globally active implicitly',
);
assert.equal(
  normalizeDefaultJobPortalLogin({
    email: 'candidate@example.com',
    password: 'short',
  }),
  null,
  'invalid shared credentials are dropped at the extension boundary',
);

console.log(
  'job-portal-login: shared default credential normalization passed',
);
