import { beforeEach, describe, expect, it } from 'vitest';
import {
  INACTIVE_ARTIFACT_FALLBACK_MESSAGE,
  rememberArtifactExpectedForSession,
  renderInactiveArtifactFallback,
} from '../../../extension/src/artifact-fallback-ui';
import type { GeneratedResumeArtifactV1 } from '../../../extension/src/resume-autofill-contract';

const listingUrl =
  'https://interpublic.wd5.myworkdayjobs.com/OMC/job/New-York-New-York-United-States-of-America/Analyst--Business-Analytics_12235-SL?jr_id=6a58623b68d16a30e2412e0f';
const applyUrl =
  'https://interpublic.wd5.myworkdayjobs.com/en-US/OMC/job/New-York%2C-New-York%2C-United-States-of-America/Analyst--Business-Analytics_12235-SL/apply/autofillWithResume?jr_id=6a58623b68d16a30e2412e0f';

function artifact(): GeneratedResumeArtifactV1 {
  return {
    schemaVersion: 1,
    artifactId: 'artifact-workday-recreation',
    sourceResumeId: 'resume-a',
    sourceResumeFilename: 'resume-a.pdf',
    templateId: 'classic',
    job: {
      jobKey: 'workday:6a58623b68d16a30e2412e0f',
      companyName: 'Interpublic',
      roleTitle: 'Analyst, Business Analytics',
      sourceUrl: listingUrl,
      requisitionId: '6a58623b68d16a30e2412e0f',
    },
    generatedAt: '2026-07-16T12:00:00.000Z',
    expiresAt: '2026-07-16T12:30:00.000Z',
    generatedContentHash: 'a'.repeat(64),
    pdf: { filename: 'resume-a.pdf', base64: 'JVBERi0xLjQK', sha256: 'b'.repeat(64) },
    snapshot: { contact: {}, skills: [], experience: [], education: [], certifications: [] },
  };
}

describe('artifact fallback after content-script recreation', () => {
  beforeEach(() => {
    document.body.textContent = '';
    sessionStorage.clear();
  });

  it('renders the documented fallback instead of a blank state when memory is lost', () => {
    rememberArtifactExpectedForSession(sessionStorage, artifact());

    // Simulate a recreated content script: sessionStorage survives, module
    // memory does not, and the background reports no active artifact.
    const host = document.createElement('div');
    document.body.appendChild(host);
    const rendered = renderInactiveArtifactFallback({
      host,
      storage: sessionStorage,
      jobContext: {
        jobUrl: applyUrl,
        companyName: 'Interpublic',
        roleTitle: 'Analyst, Business Analytics',
      },
      artifactAvailable: false,
    });

    expect(rendered).toBe(true);
    expect(host.getAttribute('role')).toBe('alert');
    expect(host.textContent).toBe(INACTIVE_ARTIFACT_FALLBACK_MESSAGE);
    expect(host.textContent).toBe(
      'This generated resume is no longer active for this job. Generate again or continue with profile-only prefill.',
    );
  });

  it('does not show the fallback for another company or while the artifact is available', () => {
    rememberArtifactExpectedForSession(sessionStorage, artifact());
    const host = document.createElement('div');

    expect(renderInactiveArtifactFallback({
      host,
      storage: sessionStorage,
      jobContext: {
        jobUrl: applyUrl,
        companyName: 'Different company',
        roleTitle: 'Analyst, Business Analytics',
      },
      artifactAvailable: false,
    })).toBe(false);
    expect(renderInactiveArtifactFallback({
      host,
      storage: sessionStorage,
      jobContext: {
        jobUrl: applyUrl,
        companyName: 'Interpublic',
        roleTitle: 'Analyst, Business Analytics',
      },
      artifactAvailable: true,
    })).toBe(false);
    expect(host.textContent).toBe('');
  });
});
