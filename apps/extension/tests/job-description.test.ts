import assert from 'node:assert/strict';
import {
  buildWorkdayCxsJobUrl,
  chooseJobDescriptionCandidate,
  deriveJobListingUrl,
  extractWorkdayJobDescriptionFromCxs,
  htmlToPlainText,
  looksLikeApplicationFormText,
  looksLikeRealJobPostingText,
  shouldFetchListingJobDescription,
} from '../src/job-description';

const outerPage = `
  Skip Branding Footer Accessibility Statement TrackMyOPT
  Generate custom resume Choose the resume and template
`.repeat(8);
const actualPosting = `
  Product Analyst I
  Overview
  Position Summary: Analyze product performance and identify opportunities.
  Responsibilities
  Build reports and dashboards using SQL and PowerBI.
  Qualifications
  Required 1+ years of analytical experience.
`.repeat(8);

assert.equal(
  chooseJobDescriptionCandidate([
    { source: 'outer', text: outerPage },
    { source: 'frame', text: actualPosting },
  ]),
  actualPosting.trim(),
  'job iframe content must beat outer page and extension UI text',
);

console.log('job-description: iframe source priority passed');

assert.equal(
  chooseJobDescriptionCandidate([{ source: 'frame', text: 'J'.repeat(20_000) }])
    .length,
  15_000,
  'preview must match the generator API payload limit',
);

assert.equal(
  chooseJobDescriptionCandidate([
    { source: 'outer', text: outerPage },
    { source: 'listing', text: actualPosting },
  ]),
  actualPosting.trim(),
  'fetched listing JD must beat apply-page form chrome',
);

assert.equal(
  deriveJobListingUrl(
    'https://jobs.jobvite.com/amerisavecareers/job/ooUuAfw6/apply',
  ),
  'https://jobs.jobvite.com/amerisavecareers/job/ooUuAfw6',
);

assert.equal(
  deriveJobListingUrl(
    'https://jobs.jobvite.com/amerisavecareers/job/ooUuAfw6/',
  ),
  null,
);

assert.equal(
  deriveJobListingUrl(
    'https://careers-cfins.icims.com/jobs/4991/role/job?mode=apply&apply=yes',
  ),
  'https://careers-cfins.icims.com/jobs/4991/role/job',
);

const REAL_WORKDAY_APPLY =
  'https://interpublic.wd5.myworkdayjobs.com/en-US/OMC/job/New-York%2C-New-York%2C-United-States-of-America/Analyst--Business-Analytics_12235-SL/apply/autofillWithResume?jr_id=6a58623b68d16a30e2412e0f';

assert.equal(
  deriveJobListingUrl(REAL_WORKDAY_APPLY),
  'https://interpublic.wd5.myworkdayjobs.com/en-US/OMC/job/New-York%2C-New-York%2C-United-States-of-America/Analyst--Business-Analytics_12235-SL?jr_id=6a58623b68d16a30e2412e0f',
);

assert.equal(
  buildWorkdayCxsJobUrl(REAL_WORKDAY_APPLY),
  'https://interpublic.wd5.myworkdayjobs.com/wday/cxs/interpublic/OMC/job/New-York%2C-New-York%2C-United-States-of-America/Analyst--Business-Analytics_12235-SL',
);

assert.equal(
  deriveJobListingUrl('https://jobs.lever.co/acme/abc123/apply'),
  'https://jobs.lever.co/acme/abc123',
);

assert.equal(
  deriveJobListingUrl(
    'https://jobs.ashbyhq.com/acme/11111111-1111-1111-1111-111111111111/application',
  ),
  'https://jobs.ashbyhq.com/acme/11111111-1111-1111-1111-111111111111',
);

const applyFormJunk = `
Senior Quantitative Analyst – Contact Center
Thank you for considering a career at AmeriSave Mortgage Corp.
Add Resume*
Select
Personal Information
First Name*
Last Name*
Email*
Cell Phone*
Select an option...
Sms Consent
Send Application
View Full Application Form
Please fill the required fields
`.repeat(2);

assert.equal(looksLikeApplicationFormText(applyFormJunk), true);
assert.equal(looksLikeApplicationFormText(actualPosting), false);
assert.equal(looksLikeRealJobPostingText(actualPosting), true);
assert.equal(looksLikeRealJobPostingText(applyFormJunk), false);

assert.equal(
  shouldFetchListingJobDescription(
    'https://jobs.jobvite.com/amerisavecareers/job/ooUuAfw6/apply',
    applyFormJunk,
  ),
  true,
);
assert.equal(
  shouldFetchListingJobDescription(REAL_WORKDAY_APPLY, 'short blur'),
  true,
  'Workday apply routes always attempt listing/CXS recovery',
);
assert.equal(
  shouldFetchListingJobDescription(
    'https://jobs.jobvite.com/amerisavecareers/job/ooUuAfw6/',
    actualPosting,
  ),
  false,
);

assert.equal(
  htmlToPlainText('<p>Hello<br/>World</p><script>x()</script>'),
  'Hello\nWorld',
);

assert.match(
  extractWorkdayJobDescriptionFromCxs({
    jobPostingInfo: {
      title: 'Analyst',
      location: 'NYC',
      jobDescription: '<p>Responsibilities</p><p>Build models</p>',
    },
  }),
  /Analyst[\s\S]*NYC[\s\S]*Responsibilities[\s\S]*Build models/,
);

console.log('job-description: apply-route listing fallback passed');
