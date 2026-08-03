import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  CAREER_PATH_RE,
  hasJobPostingEvidence,
  jobPostingEvidence,
} from '../src/career-sites';

/**
 * CAREER_PATH_RE has to stay broad — employer career pages really do live at
 * /apply, /join-us and /talent. The cost is that it also matches university
 * admissions and consumer credit applications. Combined with the weakest
 * parser (any <h1> plus the domain), the assistant used to mount on those
 * pages and offer to prefill the applicant's personal details.
 */

const JOB_PAGES: Array<[string, string]> = [
  [
    'company career page',
    `Senior Software Engineer. About the role: you will build our platform.
     Responsibilities include designing services. Qualifications: 5+ years.
     Full-time. Apply Now. Acme is an equal opportunity employer.`,
  ],
  [
    'terse ATS posting',
    `Product Designer — Full-time, Remote. What you'll do: own design end to
     end. Requirements: a portfolio.`,
  ],
  [
    'posting with pay band only',
    `Data Analyst. Employment type: Full-time. Salary range $90,000 - $120,000.
     Apply for this job.`,
  ],
];

const NOT_JOB_PAGES: Array<[string, string]> = [
  [
    'university admissions',
    `Apply to Stanford. Requirements for first-year applicants. Application
     deadlines. Submit your application by January 5. Financial aid.`,
  ],
  [
    'credit card application',
    `Apply for the Sapphire card. Requirements: good credit history. Annual fee
     $95. Application form. Rewards and travel protections.`,
  ],
  [
    'loan application',
    `Apply for a personal loan. Requirements: proof of income. Start your
     application. Terms and conditions apply. Fixed APR.`,
  ],
  [
    'volunteer sign-up',
    `Join us as a volunteer. Requirements: must be 18 or older. Apply now to
     help your community. Training provided.`,
  ],
  [
    'careers index with no single job',
    `Careers at Acme. Join our team. Search open roles. We are hiring across
     engineering and sales.`,
  ],
  [
    'news article about hiring',
    `The jobs report showed hiring slowed. Analysts said requirements for new
     applicants have tightened.`,
  ],
];

for (const [name, text] of JOB_PAGES) {
  test(`${name} is recognised as a job posting`, () => {
    assert.equal(hasJobPostingEvidence(text), true);
  });
}

for (const [name, text] of NOT_JOB_PAGES) {
  test(`${name} is not treated as a job posting`, () => {
    assert.equal(hasJobPostingEvidence(text), false);
  });
}

test('these non-job URLs still match the broad career path pattern', () => {
  // Proving the URL alone cannot be the deciding signal: every one of these
  // reaches the assistant through CAREER_PATH_RE.
  for (const url of [
    'https://www.stanford.edu/apply/undergraduate',
    'https://www.chase.com/personal/credit-cards/apply',
    'https://www.wellsfargo.com/apply/loan',
    'https://www.redcross.org/volunteer/join-us',
  ]) {
    const { pathname, search } = new URL(url);
    assert.equal(
      CAREER_PATH_RE.test(pathname + search),
      true,
      `${url} should still reach the evidence check`,
    );
  }
});

test('an employment-specific signal alone is not enough', () => {
  // One category can appear incidentally; a second independent one is required.
  const evidence = jobPostingEvidence('This position is full-time.');
  assert.equal(evidence.strong, true);
  assert.deepEqual(evidence.categories, ['employment']);
  assert.equal(hasJobPostingEvidence('This position is full-time.'), false);
});

test('supporting signals alone are never enough', () => {
  const text = 'Requirements and application form.';
  assert.equal(jobPostingEvidence(text).strong, false);
  assert.equal(hasJobPostingEvidence(text), false);
});

test('empty and huge inputs are handled without throwing', () => {
  assert.equal(hasJobPostingEvidence(''), false);
  assert.equal(hasJobPostingEvidence('x'.repeat(500_000)), false);
});

test('structured data and known boards bypass the evidence check', () => {
  const source = readFileSync('src/job-posting-scrape.ts', 'utf8');
  assert.match(
    source,
    /isKnownJobBoardOrAts\(\)\s*\|\|\s*hasJobPostingEvidence/,
    'a known board or ATS must not need its copy to corroborate it',
  );
  assert.match(
    source,
    /structuredJob\s*\|\|\s*\(weakParsersAllowed/,
    'JobPosting structured data must still win outright',
  );
});
