import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  approvalMatchesJob,
  approvalMatchesUrl,
  createPrivateApprovalBinding,
} from '../src/private-approval-session';

const jobA = {
  jobUrl:
    'https://acme.wd5.myworkdayjobs.com/en-US/jobs/job/Engineer_JR-100',
  companyName: 'Acme',
  roleTitle: 'Software Engineer',
};
const binding = createPrivateApprovalBinding(jobA);

assert.equal(
  approvalMatchesUrl(
    binding,
    'https://acme.wd5.myworkdayjobs.com/en-US/jobs/job/Engineer_JR-100/apply',
  ),
  true,
  'moving between Workday steps for one requisition keeps the same approval',
);
assert.equal(
  approvalMatchesUrl(
    binding,
    'https://acme.wd5.myworkdayjobs.com/en-US/jobs/job/Designer_JR-200/apply',
  ),
  false,
  'SPA navigation to another requisition invalidates approval',
);
assert.equal(
  approvalMatchesJob(binding, {
    ...jobA,
    roleTitle: 'Senior Software Engineer',
  }),
  false,
  'a same-URL application identity change invalidates approval',
);
assert.equal(
  approvalMatchesJob(binding, jobA),
  true,
  'the exact reviewed application retains approval',
);

const contentScript = readFileSync(resolve('src/content-job-portal.ts'), 'utf8');
assert.match(
  contentScript,
  /function invalidateArtifactForUrlChange\(nextUrl: string\): void \{\s*invalidatePrivateApprovalForUrl\(nextUrl\);/,
  'the live SPA URL observer invalidates private approval before artifact logic',
);
assert.match(
  contentScript,
  /invalidatePrivateApprovalForJob\(currentJobAtStart\);/,
  'same-URL job identity changes are checked during live widget reconciliation',
);
assert.match(
  contentScript,
  /if \(explicitPrefillClick\)[\s\S]*loadPrivateAnswersForPrefill\(shouldContinue\)[\s\S]*privateApprovalBinding = privateLoad.answers.confirmed \? binding : null/,
  'the manual Prefill click loads answers and binds them to this application',
);
const sensitivePanel = readFileSync(
  resolve('src/job-portal-sensitive-answer-panel.ts'),
  'utf8',
);
assert.doesNotMatch(
  sensitivePanel,
  /commitSensitiveApproval|GET_PRIVATE_APPLICATION_ANSWERS|Review and use/,
  'the panel has no separate approval gate and never loads decrypted answers',
);

console.log(
  'private-approval-session: application-bound approval invalidation passed',
);
