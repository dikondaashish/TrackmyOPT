import assert from 'node:assert/strict';
import test from 'node:test';

import {
  artifactMatchesJobContext,
  type GeneratedResumeArtifactV1,
} from '../src/resume-autofill-contract';

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
