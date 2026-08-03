import assert from 'node:assert/strict';
import test from 'node:test';

import {
  atsJobIdentitiesMatch,
  extractAtsJobIdentity,
  sameHostApplyRouteMatch,
} from '../src/ats-job-identity';
import { jobUrlsReferToSameJob } from '../src/resume-autofill-contract';

/**
 * Each pair is a real-shaped posting URL and the URL the user lands on after
 * clicking Apply. Before per-ATS identity these all reported "different job",
 * so the tailored resume was never attached to the application form.
 */
const POSTING_APPLY_PAIRS: Array<[string, string, string]> = [
  [
    'lever',
    'https://jobs.lever.co/acme/9f2b1c3d-1111-2222-3333-444455556666',
    'https://jobs.lever.co/acme/9f2b1c3d-1111-2222-3333-444455556666/apply',
  ],
  [
    'ashby',
    'https://jobs.ashbyhq.com/acme/8a7b6c5d-aaaa-bbbb-cccc-ddddeeeeffff',
    'https://jobs.ashbyhq.com/acme/8a7b6c5d-aaaa-bbbb-cccc-ddddeeeeffff/application',
  ],
  [
    'workable',
    'https://apply.workable.com/acme/j/AB12CD34EF/',
    'https://apply.workable.com/acme/j/AB12CD34EF/apply/',
  ],
  [
    'greenhouse host change',
    'https://boards.greenhouse.io/acme/jobs/4012345',
    'https://job-boards.greenhouse.io/acme/jobs/4012345',
  ],
  [
    'greenhouse apply anchor',
    'https://boards.greenhouse.io/acme/jobs/4012345',
    'https://boards.greenhouse.io/acme/jobs/4012345#app',
  ],
  [
    'greenhouse embedded board',
    'https://www.acme.com/careers?gh_jid=4012345',
    'https://boards.greenhouse.io/acme/jobs/4012345',
  ],
  [
    'smartrecruiters',
    'https://jobs.smartrecruiters.com/Acme/744000012345678-software-engineer',
    'https://jobs.smartrecruiters.com/Acme/744000012345678-software-engineer/apply',
  ],
  [
    'recruitee',
    'https://acme.recruitee.com/o/software-engineer',
    'https://acme.recruitee.com/o/software-engineer/c/new',
  ],
  [
    'teamtailor',
    'https://acme.teamtailor.com/jobs/1234567-software-engineer',
    'https://acme.teamtailor.com/jobs/1234567-software-engineer/applications/new',
  ],
  [
    'jobvite',
    'https://jobs.jobvite.com/acme/job/oXyZbfwT',
    'https://jobs.jobvite.com/acme/job/oXyZbfwT/apply',
  ],
  [
    'breezy',
    'https://acme.breezy.hr/p/a1b2c3d4e5f6-software-engineer',
    'https://acme.breezy.hr/p/a1b2c3d4e5f6-software-engineer/apply',
  ],
  [
    'pinpoint',
    'https://acme.pinpointhq.com/postings/11112222-3333-4444-5555-666677778888',
    'https://acme.pinpointhq.com/postings/11112222-3333-4444-5555-666677778888/applications/new',
  ],
  [
    'taleo',
    'https://acme.taleo.net/careersection/ex/jobdetail.ftl?job=1900ABCD&lang=en',
    'https://acme.taleo.net/careersection/ex/apply.ftl?job=1900ABCD&lang=en',
  ],
  [
    'successfactors',
    'https://career4.successfactors.com/career?career_job_req_id=98765&company=acme',
    'https://career4.successfactors.com/career?career_job_req_id=98765&company=acme&career_ns=job_application',
  ],
  [
    'oracle cloud',
    'https://acme.fa.us2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX/job/12345',
    'https://acme.fa.us2.oraclecloud.com/hcmUI/CandidateExperience/en/sites/CX/job/12345/apply/email',
  ],
  [
    'eightfold',
    'https://acme.eightfold.ai/careers/job/123456789',
    'https://acme.eightfold.ai/careers/job/123456789/apply',
  ],
  [
    'unknown ATS, generic apply suffix',
    'https://careers.acme-industries.com/openings/senior-engineer',
    'https://careers.acme-industries.com/openings/senior-engineer/apply',
  ],
];

for (const [name, posting, apply] of POSTING_APPLY_PAIRS) {
  test(`${name}: posting and apply URLs are the same job`, () => {
    assert.equal(jobUrlsReferToSameJob(posting, apply), true);
    // Matching must be symmetric — the widget compares in both directions
    // depending on whether the artifact or the page is the reference.
    assert.equal(jobUrlsReferToSameJob(apply, posting), true);
  });
}

test('a different job id on the same board never matches', () => {
  assert.equal(
    jobUrlsReferToSameJob(
      'https://jobs.lever.co/acme/9f2b1c3d-1111-2222-3333-444455556666',
      'https://jobs.lever.co/acme/00000000-9999-8888-7777-666655554444/apply',
    ),
    false,
  );
  assert.equal(
    jobUrlsReferToSameJob(
      'https://boards.greenhouse.io/acme/jobs/4012345',
      'https://boards.greenhouse.io/acme/jobs/4012346',
    ),
    false,
  );
});

test('the same job id on a different tenant never matches', () => {
  assert.equal(
    jobUrlsReferToSameJob(
      'https://jobs.lever.co/acme/9f2b1c3d-1111-2222-3333-444455556666',
      'https://jobs.lever.co/globex/9f2b1c3d-1111-2222-3333-444455556666/apply',
    ),
    false,
  );
});

test('a recognised posting never matches an unrelated destination', () => {
  // LinkedIn -> Greenhouse is a real handoff, but nothing in either URL proves
  // they are the same posting, so the resume must not be attached silently.
  assert.equal(
    jobUrlsReferToSameJob(
      'https://www.linkedin.com/jobs/view/4012345678/',
      'https://boards.greenhouse.io/acme/jobs/4012345',
    ),
    false,
  );
  assert.equal(
    jobUrlsReferToSameJob(
      'https://jobs.lever.co/acme/9f2b1c3d-1111-2222-3333-444455556666',
      'https://www.google.com/',
    ),
    false,
  );
});

test('different hosts never match through the generic apply-suffix rule', () => {
  assert.equal(
    sameHostApplyRouteMatch(
      'https://careers.acme.com/openings/engineer',
      'https://careers.globex.com/openings/engineer/apply',
    ),
    false,
  );
});

test('a board whose path starts with /apply keeps its identity', () => {
  // JazzHR serves the posting itself at /apply/<code>; stripping that segment
  // would collapse every posting on the board into one identity.
  const identity = extractAtsJobIdentity(
    'https://acme.applytojob.com/apply/xY7zQ1/software-engineer',
  );
  assert.deepEqual(identity, {
    platform: 'jazzhr',
    tenant: 'acme',
    jobId: 'xy7zq1',
  });
  assert.equal(
    jobUrlsReferToSameJob(
      'https://acme.applytojob.com/apply/xY7zQ1/software-engineer',
      'https://acme.applytojob.com/apply/aB3cD9/data-analyst',
    ),
    false,
  );
});

test('tenant is compared only when both URLs carry one', () => {
  const embedded = { platform: 'greenhouse', tenant: '', jobId: '4012345' };
  const board = { platform: 'greenhouse', tenant: 'acme', jobId: '4012345' };
  assert.equal(atsJobIdentitiesMatch(embedded, board), true);
  assert.equal(
    atsJobIdentitiesMatch(board, { ...board, tenant: 'globex' }),
    false,
  );
  assert.equal(
    atsJobIdentitiesMatch(board, { ...board, platform: 'lever' }),
    false,
  );
});

test('tracking parameters and trailing slashes do not change identity', () => {
  assert.equal(
    jobUrlsReferToSameJob(
      'https://jobs.lever.co/acme/9f2b1c3d-1111-2222-3333-444455556666?utm_source=linkedin&ref=x',
      'https://jobs.lever.co/acme/9f2b1c3d-1111-2222-3333-444455556666/apply/',
    ),
    true,
  );
});
