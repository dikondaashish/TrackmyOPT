import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildGeneratedResumeArtifactV1,
  resolveArtifactLifecycle,
  validateArtifactForPrefill,
} from '../src/resume-artifact-lifecycle';
import type { GeneratedResumeArtifactV1 } from '../src/resume-autofill-contract';

const generatedAt = '2026-07-16T12:00:00.000Z';
const jobContext = {
  jobUrl: 'https://company-a.wd5.myworkdayjobs.com/jobs/job-a',
  companyName: 'Company A',
  roleTitle: 'Software Engineer',
};

function artifact(): GeneratedResumeArtifactV1 {
  return {
    schemaVersion: 1,
    artifactId: 'artifact-job-a',
    sourceResumeId: 'resume-a',
    sourceResumeFilename: 'resume-a.pdf',
    templateId: 'classic',
    job: {
      jobKey: 'workday:job-a',
      companyName: jobContext.companyName,
      roleTitle: jobContext.roleTitle,
      sourceUrl: jobContext.jobUrl,
    },
    generatedAt,
    expiresAt: '2026-07-16T12:30:00.000Z',
    generatedContentHash: 'a'.repeat(64),
    pdf: {
      filename: 'resume-a.pdf',
      base64: 'JVBERi0xLjQK',
      sha256: 'b'.repeat(64),
    },
    snapshot: {
      contact: { email: 'ada@example.com' },
      skills: ['TypeScript'],
      experience: [],
      education: [],
      certifications: [],
    },
  };
}

test('artifact is valid at 29:59 and invalid at exactly 30:00', () => {
  assert.deepEqual(
    validateArtifactForPrefill(
      artifact(),
      jobContext,
      Date.parse('2026-07-16T12:29:59.999Z')
    ),
    { valid: true }
  );
  assert.deepEqual(
    validateArtifactForPrefill(
      artifact(),
      jobContext,
      Date.parse('2026-07-16T12:30:00.000Z')
    ),
    { valid: false, reason: 'expired' }
  );
});

test('URL, company, or role changes invalidate the artifact immediately', () => {
  for (const changedContext of [
    { ...jobContext, jobUrl: `${jobContext.jobUrl}/apply` },
    { ...jobContext, companyName: 'Company B' },
    { ...jobContext, roleTitle: 'Platform Engineer' },
  ]) {
    assert.deepEqual(
      validateArtifactForPrefill(
        artifact(),
        changedContext,
        Date.parse('2026-07-16T12:01:00.000Z')
      ),
      { valid: false, reason: 'job_changed' }
    );
  }
});

test('mid-form expiry never clears or silently refills prior field values', () => {
  const formValues = {
    company: 'Applicant-edited company',
    title: 'Applicant-edited title',
  };
  const before = { ...formValues };
  const resolution = resolveArtifactLifecycle({
    artifact: artifact(),
    jobContext,
    now: Date.parse('2026-07-16T12:30:00.000Z'),
    previouslyFilledFromArtifact: true,
  });

  assert.equal(resolution.status, 'invalid');
  assert.equal(resolution.showStaleWarning, true);
  assert.equal(resolution.clearExistingFields, false);
  assert.equal(resolution.refillExistingFields, false);
  assert.deepEqual(formValues, before);
});

test('builder creates a hash-locked artifact with an exact 30-minute expiry', async () => {
  const finalLatex = '\\begin{document}Ada\\end{document}';
  const result = await buildGeneratedResumeArtifactV1({
    artifactId: 'artifact-job-a',
    generatedAt,
    sourceResumeId: 'resume-a',
    sourceResumeFilename: 'resume-a.pdf',
    templateId: 'classic',
    jobKey: 'workday:job-a',
    jobContext,
    finalLatex,
    extractedContentHash: undefined,
    extractedSnapshot: undefined,
    pdfBase64: 'JVBERi0xLjQK',
    pdfFilename: 'resume-a.pdf',
  });

  assert.equal(result.artifact.expiresAt, '2026-07-16T12:30:00.000Z');
  assert.match(result.artifact.generatedContentHash, /^[a-f0-9]{64}$/);
  assert.match(result.artifact.pdf.sha256, /^[a-f0-9]{64}$/);
  assert.equal(result.structuredFieldsAvailable, false);
  assert.deepEqual(result.artifact.snapshot, {
    contact: {},
    skills: [],
    experience: [],
    education: [],
    certifications: [],
  });

  const extractedSnapshot = {
    contact: { email: 'ada@example.com' },
    skills: ['TypeScript'],
    experience: [],
    education: [],
    certifications: [],
  };
  const hashMatched = await buildGeneratedResumeArtifactV1({
    artifactId: 'artifact-job-a-validated',
    generatedAt,
    sourceResumeId: 'resume-a',
    sourceResumeFilename: 'resume-a.pdf',
    templateId: 'classic',
    jobKey: 'workday:job-a',
    jobContext,
    finalLatex,
    extractedContentHash: result.artifact.generatedContentHash,
    extractedSnapshot,
    pdfBase64: 'JVBERi0xLjQK',
    pdfFilename: 'resume-a.pdf',
  });
  assert.equal(hashMatched.structuredFieldsAvailable, true);
  assert.deepEqual(hashMatched.artifact.snapshot, extractedSnapshot);
});
