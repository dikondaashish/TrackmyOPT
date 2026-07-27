import assert from 'node:assert/strict';
import test from 'node:test';

import {
  artifactMatchesJobContext,
  extractICimsJobIdentity,
  extractWorkdayJobIdentity,
  type GeneratedResumeArtifactV1,
} from '../src/resume-autofill-contract';

const REAL_WORKDAY_LISTING_URL =
  'https://interpublic.wd5.myworkdayjobs.com/OMC/job/New-York-New-York-United-States-of-America/Analyst--Business-Analytics_12235-SL?jr_id=6a58623b68d16a30e2412e0f';
const REAL_WORKDAY_APPLY_URL =
  'https://interpublic.wd5.myworkdayjobs.com/en-US/OMC/job/New-York%2C-New-York%2C-United-States-of-America/Analyst--Business-Analytics_12235-SL/apply/autofillWithResume?jr_id=6a58623b68d16a30e2412e0f';
const REAL_ICIMS_LISTING_URL =
  'https://careers-cfins.icims.com/jobs/4991/reporting-%26-data-call-analyst---hybrid/job?jr_id=6a5a51814da96a42cfd952b9&mobile=false&width=768&height=500&bga=true&needsRedirect=false&jan1offset=-300&jun1offset=-240';
const REAL_ICIMS_APPLY_URL =
  'https://careers-cfins.icims.com/jobs/4991/reporting-%26-data-call-analyst---hybrid/job?mode=apply&apply=yes&in_iframe=1&hashed=-1834443227';

function artifactForJobA(): GeneratedResumeArtifactV1 {
  return {
    schemaVersion: 1,
    artifactId: 'artifact-job-a',
    sourceResumeId: 'resume-a',
    sourceResumeFilename: 'resume-a.pdf',
    templateId: 'classic',
    job: {
      jobKey: 'workday:job-a',
      companyName: 'Company A',
      roleTitle: 'Software Engineer',
      sourceUrl:
        'https://company-a.wd5.myworkdayjobs.com/jobs/job-a?utm_source=test',
      requisitionId: 'REQ-A',
    },
    generatedAt: '2026-07-16T12:00:00.000Z',
    expiresAt: '2026-07-16T12:30:00.000Z',
    generatedContentHash: 'a'.repeat(64),
    pdf: {
      filename: 'resume-a.pdf',
      base64: 'JVBERi0xLjQK',
      sha256: 'b'.repeat(64),
    },
    snapshot: {
      contact: { fullName: 'Ada Lovelace', email: 'ada@example.com' },
      skills: ['TypeScript'],
      experience: [
        {
          company: 'Company A',
          title: 'Software Engineer',
          startDate: {
            originalText: 'Jan 2022',
            year: 2022,
            month: 1,
            precision: 'month',
          },
          isCurrent: true,
          bullets: [],
          descriptionText: '',
        },
      ],
      education: [],
      certifications: [],
    },
  };
}

test('Job A artifact never matches Job B context', () => {
  const artifact = artifactForJobA();

  assert.equal(
    artifactMatchesJobContext(artifact, {
      jobUrl: 'https://company-b.wd5.myworkdayjobs.com/jobs/job-b',
      companyName: 'Company B',
      roleTitle: 'Platform Engineer',
    }),
    false
  );
});

test('job comparison normalizes tracking parameters and text', () => {
  const artifact = artifactForJobA();

  assert.equal(
    artifactMatchesJobContext(artifact, {
      jobUrl: 'https://company-a.wd5.myworkdayjobs.com/jobs/job-a',
      companyName: '  company   a ',
      roleTitle: 'software engineer',
    }),
    true
  );
});

test('real Workday listing and apply URLs resolve to the same requisition identity', () => {
  assert.deepEqual(extractWorkdayJobIdentity(REAL_WORKDAY_LISTING_URL), {
    requisitionId: '6a58623b68d16a30e2412e0f',
    jobSlug: 'Analyst--Business-Analytics_12235-SL',
    slugRequisitionId: '12235-SL',
    queryRequisitionId: '6a58623b68d16a30e2412e0f',
  });
  assert.deepEqual(
    extractWorkdayJobIdentity(REAL_WORKDAY_APPLY_URL),
    extractWorkdayJobIdentity(REAL_WORKDAY_LISTING_URL),
  );

  const artifact = artifactForJobA();
  artifact.job.sourceUrl = REAL_WORKDAY_LISTING_URL;
  artifact.job.requisitionId = '6a58623b68d16a30e2412e0f';
  artifact.job.companyName = 'Interpublic';
  artifact.job.roleTitle = 'Analyst, Business Analytics';

  assert.equal(artifactMatchesJobContext(artifact, {
    jobUrl: REAL_WORKDAY_APPLY_URL,
    companyName: 'Interpublic',
    roleTitle: 'Analyst, Business Analytics',
  }), true);
  assert.equal(artifactMatchesJobContext(artifact, {
    jobUrl: REAL_WORKDAY_APPLY_URL,
    companyName: 'Different company',
    roleTitle: 'Analyst, Business Analytics',
  }), false);

  assert.equal(
    artifactMatchesJobContext(artifact, {
      jobUrl: REAL_WORKDAY_APPLY_URL.replace(
        '6a58623b68d16a30e2412e0f',
        'different-requisition',
      ),
      companyName: 'Interpublic',
      roleTitle: 'Analyst, Business Analytics',
    }),
    false,
  );

  const listingWithoutQuery = REAL_WORKDAY_LISTING_URL.split('?')[0];
  const applyWithoutQuery = REAL_WORKDAY_APPLY_URL.split('?')[0];
  assert.deepEqual(extractWorkdayJobIdentity(listingWithoutQuery), {
    requisitionId: '12235-SL',
    jobSlug: 'Analyst--Business-Analytics_12235-SL',
    slugRequisitionId: '12235-SL',
  });
  artifact.job.sourceUrl = listingWithoutQuery;
  artifact.job.requisitionId = '12235-SL';
  assert.equal(artifactMatchesJobContext(artifact, {
    jobUrl: applyWithoutQuery,
    companyName: 'Interpublic',
    roleTitle: 'Analyst, Business Analytics',
  }), true);
});

test('real iCIMS listing and application URLs resolve to the same job identity', () => {
  assert.deepEqual(extractICimsJobIdentity(REAL_ICIMS_LISTING_URL), {
    jobId: '4991',
  });
  assert.deepEqual(
    extractICimsJobIdentity(REAL_ICIMS_APPLY_URL),
    extractICimsJobIdentity(REAL_ICIMS_LISTING_URL),
  );

  const artifact = artifactForJobA();
  artifact.job.sourceUrl = REAL_ICIMS_LISTING_URL;
  artifact.job.requisitionId = '4991';
  artifact.job.companyName = 'Crum & Forster';
  artifact.job.roleTitle = 'Reporting & Data Call Analyst - Hybrid';

  assert.equal(artifactMatchesJobContext(artifact, {
    jobUrl: REAL_ICIMS_APPLY_URL,
    companyName: 'Crum & Forster',
    roleTitle: 'Reporting & Data Call Analyst - Hybrid',
  }), true);
  assert.equal(artifactMatchesJobContext(artifact, {
    jobUrl: REAL_ICIMS_APPLY_URL.replace('/4991/', '/4992/'),
    companyName: 'Crum & Forster',
    roleTitle: 'Reporting & Data Call Analyst - Hybrid',
  }), false);
  assert.equal(artifactMatchesJobContext(artifact, {
    jobUrl: REAL_ICIMS_APPLY_URL,
    companyName: 'Different company',
    roleTitle: 'Reporting & Data Call Analyst - Hybrid',
  }), false);
});
