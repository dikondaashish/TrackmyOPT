import assert from 'node:assert/strict';
import test from 'node:test';

import { buildGeneratedResumeArtifactV1 } from '../src/resume-artifact-lifecycle';
import { resolveV1PrefillPayload } from '../src/prefill-payload-resolver';
import { jobMemoryKey } from '../src/smart-flow';
import { resolveAutofillFeatureFlags } from '../src/autofill-feature-flags';
import type {
  BasicContactProfile,
  GeneratedResumeArtifactV1,
  V1PrefillPayloadRequest,
} from '../src/resume-autofill-contract';

const fallback: BasicContactProfile = {
  firstName: 'Profile',
  lastName: 'Person',
  fullName: 'Profile Person',
  email: 'profile@example.com',
  phone: '+1 555 0100',
  country: 'United States',
  streetAddress: '1 Profile Way',
  city: 'Boston',
  state: 'MA',
  postalCode: '02110',
  countyDistrict: 'Suffolk County',
  yearsExperience: '7',
  linkedinUrl: 'https://linkedin.com/in/profile-person',
  githubUrl: 'https://github.com/profile-person',
  portfolioUrl: 'https://profile.example.com',
};

const request: V1PrefillPayloadRequest = {
  now: '2026-07-16T12:10:00.000Z',
  jobContext: {
    jobUrl: 'https://company-a.wd5.myworkdayjobs.com/jobs/job-a',
    companyName: 'Company A',
    roleTitle: 'Software Engineer',
  },
};

const REAL_WORKDAY_LISTING_URL =
  'https://interpublic.wd5.myworkdayjobs.com/OMC/job/New-York-New-York-United-States-of-America/Analyst--Business-Analytics_12235-SL?jr_id=6a58623b68d16a30e2412e0f';
const REAL_WORKDAY_APPLY_URL =
  'https://interpublic.wd5.myworkdayjobs.com/en-US/OMC/job/New-York%2C-New-York%2C-United-States-of-America/Analyst--Business-Analytics_12235-SL/apply/autofillWithResume?jr_id=6a58623b68d16a30e2412e0f';
const REAL_ICIMS_LISTING_URL =
  'https://careers-cfins.icims.com/jobs/4991/reporting-%26-data-call-analyst---hybrid/job?jr_id=6a5a51814da96a42cfd952b9&mobile=false&width=768&height=500&bga=true&needsRedirect=false&jan1offset=-300&jun1offset=-240';
const REAL_ICIMS_APPLY_URL =
  'https://careers-cfins.icims.com/jobs/4991/reporting-%26-data-call-analyst---hybrid/job?mode=apply&apply=yes&in_iframe=1&hashed=-1834443227';

async function validArtifact(): Promise<GeneratedResumeArtifactV1> {
  const result = await buildGeneratedResumeArtifactV1({
    artifactId: 'artifact-a',
    generatedAt: '2026-07-16T12:00:00.000Z',
    sourceResumeId: 'resume-a',
    sourceResumeFilename: 'resume-a.pdf',
    templateId: 'classic',
    jobKey: 'workday:job-a',
    jobContext: request.jobContext,
    jobDescription:
      'Build reliable TypeScript services and collaborate with product partners.',
    finalLatex: '\\begin{document}Ada\\end{document}',
    pdfBase64: 'JVBERi0xLjQK',
    pdfFilename: 'resume-a.pdf',
  });
  return result.artifact;
}

test('valid artifact resolves generated resume, snapshot, and profile fallback together', async () => {
  const artifact = await validArtifact();
  const response = await resolveV1PrefillPayload({
    artifact,
    request,
    fetchProfileFallback: async () => ({ ok: true, profile: fallback }),
  });

  assert.equal(response.ok, true);
  if (!response.ok) return;
  assert.equal(response.source, 'generated_resume');
  if (response.source !== 'generated_resume') return;
  assert.equal(response.artifactId, artifact.artifactId);
  assert.equal(response.generatedContentHash, artifact.generatedContentHash);
  assert.equal(
    response.jobDescription,
    artifact.job.jobDescription,
  );
  assert.equal(response.resume.pdfBase64, artifact.pdf.base64);
  assert.deepEqual(response.snapshot, artifact.snapshot);
  assert.deepEqual(response.profileFallback, fallback);
});

test('artifact prefill can be disabled without removing profile-only prefill', async () => {
  const artifact = await validArtifact();
  let rejected = false;
  const response = await resolveV1PrefillPayload({
    artifact,
    request,
    featureFlags: {
      artifactPrefill: false,
      skills: false,
      continuousMode: false,
      aiScreeningDrafts: false,
      coverLetter: false,
      guidedAutopilot: false,
      historyFields: false,
      atsAdapters: false,
    },
    onArtifactRejected: () => {
      rejected = true;
    },
    fetchProfileFallback: async () => ({ ok: true, profile: fallback }),
  });

  assert.deepEqual(response, {
    ok: true,
    source: 'profile_only',
    reason: 'feature_disabled',
    profileFallback: fallback,
  });
  assert.equal(rejected, false);
});

test('missing generated resume stays profile-only with no resume attachment', async () => {
  const response = await resolveV1PrefillPayload({
    artifact: null,
    request,
    fetchProfileFallback: async () => ({ ok: true, profile: fallback }),
  });

  assert.equal(response.ok, true);
  if (!response.ok) return;
  assert.equal(response.source, 'profile_only');
  assert.equal(response.reason, 'missing');
  assert.equal('resume' in response, false);
});

test('cover letter is relayed only when its independent flag is enabled', async () => {
  const artifact = await validArtifact();
  artifact.coverLetter = {
    filename: 'cover-letter.pdf',
    base64: 'JVBERi0xLjQK',
    sha256: 'b'.repeat(64),
    generatedAt: '2026-07-16T12:05:00.000Z',
    sourceContentHash: artifact.generatedContentHash,
  };

  const disabled = await resolveV1PrefillPayload({
    artifact,
    request,
    featureFlags: resolveAutofillFeatureFlags({ coverLetter: false }),
    fetchProfileFallback: async () => ({ ok: true, profile: fallback }),
  });
  assert.equal(
    disabled.ok &&
      disabled.source === 'generated_resume' &&
      disabled.coverLetter,
    undefined,
  );

  const enabled = await resolveV1PrefillPayload({
    artifact,
    request,
    featureFlags: resolveAutofillFeatureFlags({ coverLetter: true }),
    fetchProfileFallback: async () => ({ ok: true, profile: fallback }),
  });
  assert.equal(enabled.ok, true);
  if (!enabled.ok || enabled.source !== 'generated_resume') return;
  assert.deepEqual(enabled.coverLetter, artifact.coverLetter);
  assert.equal(enabled.generatedContentHash, artifact.generatedContentHash);
});

test('a disabled invalid cover letter cannot block deterministic resume prefill', async () => {
  const artifact = await validArtifact();
  artifact.coverLetter = {
    filename: 'cover-letter.pdf',
    base64: 'JVBERi0xLjQK',
    sha256: 'b'.repeat(64),
    generatedAt: '2026-07-16T12:05:00.000Z',
    sourceContentHash: 'c'.repeat(64),
  };

  const disabled = await resolveV1PrefillPayload({
    artifact,
    request,
    featureFlags: resolveAutofillFeatureFlags({ coverLetter: false }),
    fetchProfileFallback: async () => ({ ok: true, profile: fallback }),
  });
  assert.equal(
    disabled.ok && disabled.source === 'generated_resume',
    true,
  );

  const enabled = await resolveV1PrefillPayload({
    artifact,
    request,
    featureFlags: resolveAutofillFeatureFlags({ coverLetter: true }),
    fetchProfileFallback: async () => ({ ok: true, profile: fallback }),
  });
  assert.deepEqual(enabled, {
    ok: true,
    source: 'profile_only',
    reason: 'invalid',
    profileFallback: fallback,
  });
});

test('missing, expired, and mismatched artifacts return profile_only and never query latest resume', async () => {
  const baseArtifact = await validArtifact();

  for (const scenario of [
    { artifact: null, request, reason: 'missing' as const },
    {
      artifact: baseArtifact,
      request: { ...request, now: '2026-07-16T12:30:00.000Z' },
      reason: 'expired' as const,
    },
    {
      artifact: baseArtifact,
      request: {
        ...request,
        jobContext: {
          ...request.jobContext,
          jobUrl: 'https://company-b.wd5.myworkdayjobs.com/jobs/job-b',
        },
      },
      reason: 'job_changed' as const,
    },
  ]) {
    const reads: string[] = [];
    const response = await resolveV1PrefillPayload({
      artifact: scenario.artifact,
      request: scenario.request,
      fetchProfileFallback: async () => {
        reads.push('application_profile');
        return { ok: true, profile: fallback };
      },
    });

    assert.deepEqual(reads, ['application_profile']);
    assert.deepEqual(response, {
      ok: true,
      source: 'profile_only',
      reason: scenario.reason,
      profileFallback: fallback,
    });
  }
});

test('invalid artifact hash returns profile_only instead of a saved-resume fallback', async () => {
  const artifact = await validArtifact();
  artifact.pdf.sha256 = '0'.repeat(64);
  const reads: string[] = [];
  const response = await resolveV1PrefillPayload({
    artifact,
    request,
    fetchProfileFallback: async () => {
      reads.push('application_profile');
      return { ok: true, profile: fallback };
    },
  });

  assert.deepEqual(reads, ['application_profile']);
  assert.deepEqual(response, {
    ok: true,
    source: 'profile_only',
    reason: 'invalid',
    profileFallback: fallback,
  });
});

test('real Workday listing artifact resolves on the same-job apply route within 30 minutes', async () => {
  const generation = await buildGeneratedResumeArtifactV1({
    artifactId: 'artifact-real-workday-route',
    generatedAt: '2026-07-16T12:00:00.000Z',
    sourceResumeId: 'resume-a',
    sourceResumeFilename: 'resume-a.pdf',
    templateId: 'classic',
    jobKey: 'workday:6a58623b68d16a30e2412e0f',
    jobContext: {
      jobUrl: REAL_WORKDAY_LISTING_URL,
      companyName: 'Interpublic',
      roleTitle: 'Analyst, Business Analytics',
    },
    finalLatex: '\\begin{document}Workday route fixture\\end{document}',
    pdfBase64: 'JVBERi0xLjQK',
    pdfFilename: 'resume-a.pdf',
  });

  assert.equal(
    generation.artifact.job.requisitionId,
    '6a58623b68d16a30e2412e0f',
  );
  const response = await resolveV1PrefillPayload({
    artifact: generation.artifact,
    request: {
      now: '2026-07-16T12:29:59.999Z',
      jobContext: {
        jobUrl: REAL_WORKDAY_APPLY_URL,
        companyName: 'Interpublic',
        roleTitle: 'Analyst, Business Analytics',
      },
    },
    fetchProfileFallback: async () => ({ ok: true, profile: fallback }),
  });

  assert.equal(response.ok, true);
  if (!response.ok) return;
  assert.equal(response.source, 'generated_resume');
  if (response.source !== 'generated_resume') return;
  assert.equal(response.artifactId, 'artifact-real-workday-route');
  assert.equal(response.resume.pdfBase64, generation.artifact.pdf.base64);
});

test('real iCIMS listing artifact resolves on the same-job apply route within 30 minutes', async () => {
  const generation = await buildGeneratedResumeArtifactV1({
    artifactId: 'artifact-real-icims-route',
    generatedAt: '2026-07-16T12:00:00.000Z',
    sourceResumeId: 'resume-a',
    sourceResumeFilename: 'resume-a.pdf',
    templateId: 'classic',
    jobKey: 'icims:4991',
    jobContext: {
      jobUrl: REAL_ICIMS_LISTING_URL,
      companyName: 'Crum & Forster',
      roleTitle: 'Reporting & Data Call Analyst - Hybrid',
    },
    finalLatex: '\\begin{document}iCIMS route fixture\\end{document}',
    pdfBase64: 'JVBERi0xLjQK',
    pdfFilename: 'resume-a.pdf',
  });

  assert.equal(generation.artifact.job.requisitionId, '4991');
  const response = await resolveV1PrefillPayload({
    artifact: generation.artifact,
    request: {
      now: '2026-07-16T12:29:59.999Z',
      jobContext: {
        jobUrl: REAL_ICIMS_APPLY_URL,
        companyName: 'Crum & Forster',
        roleTitle: 'Reporting & Data Call Analyst - Hybrid',
      },
    },
    fetchProfileFallback: async () => ({ ok: true, profile: fallback }),
  });

  assert.equal(response.ok, true);
  if (!response.ok || response.source !== 'generated_resume') return;
  assert.equal(response.artifactId, 'artifact-real-icims-route');
  assert.equal(response.resume.pdfBase64, generation.artifact.pdf.base64);
});

test('live Workday artifact with the literal company, role, and generated job key resolves on the apply route', async () => {
  const liveCompanyName = 'OMLUS Hearts and Science LLC';
  const liveRoleTitle = 'Analyst, Business Analytics';
  const liveJobKey = jobMemoryKey({
    jobUrl: REAL_WORKDAY_LISTING_URL,
    companyName: liveCompanyName,
    roleTitle: liveRoleTitle,
  });

  // This is the exact 217-character key produced during the live reproduction.
  assert.equal(liveJobKey.length, 217);

  const generation = await buildGeneratedResumeArtifactV1({
    artifactId: 'artifact-live-workday-route',
    generatedAt: '2026-07-16T12:00:00.000Z',
    sourceResumeId: 'resume-a',
    sourceResumeFilename: 'resume-a.pdf',
    templateId: 'classic',
    jobKey: liveJobKey,
    jobContext: {
      jobUrl: REAL_WORKDAY_LISTING_URL,
      companyName: liveCompanyName,
      roleTitle: liveRoleTitle,
    },
    finalLatex: '\\begin{document}Live Workday route fixture\\end{document}',
    pdfBase64: 'JVBERi0xLjQK',
    pdfFilename: 'resume-a.pdf',
  });

  assert.match(generation.artifact.job.jobKey, /^sha256:[a-f0-9]{64}$/);
  assert.ok(generation.artifact.job.jobKey.length <= 200);

  const response = await resolveV1PrefillPayload({
    artifact: generation.artifact,
    request: {
      now: '2026-07-16T12:29:59.999Z',
      jobContext: {
        jobUrl: REAL_WORKDAY_APPLY_URL,
        companyName: liveCompanyName,
        roleTitle: liveRoleTitle,
      },
    },
    fetchProfileFallback: async () => ({ ok: true, profile: fallback }),
  });

  assert.equal(response.ok, true);
  if (!response.ok) return;
  assert.equal(response.source, 'generated_resume');
});
