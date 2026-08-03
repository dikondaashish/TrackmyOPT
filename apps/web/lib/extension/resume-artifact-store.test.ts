import { describe, expect, it } from 'vitest';

import {
  MAX_STORED_ARTIFACTS_PER_USER,
  STORED_ARTIFACT_TTL_MS,
  buildArtifactRow,
  overflowArtifactIds,
  reviveStoredArtifact,
  selectMatchingArtifact,
  supersededArtifactIds,
  type StoredArtifactCandidate,
} from './resume-artifact-store';
import type { GeneratedResumeArtifactV1 } from '../../../extension/src/resume-autofill-contract';

const NOW = Date.parse('2026-08-02T12:00:00.000Z');

function candidate(
  overrides: Partial<StoredArtifactCandidate> & { id: string },
): StoredArtifactCandidate {
  return {
    source_url: 'https://jobs.lever.co/acme/9f2b1c3d-1111-2222-3333-444455556666',
    requisition_id: null,
    created_at: '2026-08-02T11:00:00.000Z',
    expires_at: '2026-09-01T11:00:00.000Z',
    ...overrides,
  };
}

function artifact(sourceUrl: string): GeneratedResumeArtifactV1 {
  return {
    schemaVersion: 1,
    artifactId: 'artifact-1',
    sourceResumeId: 'resume-1',
    sourceResumeFilename: 'resume.pdf',
    templateId: 'classic',
    job: {
      jobKey: 'job-1',
      companyName: 'Acme',
      roleTitle: 'Software Engineer',
      sourceUrl,
    },
    generatedAt: '2026-08-02T11:00:00.000Z',
    expiresAt: '2026-08-02T11:30:00.000Z',
    generatedContentHash: 'a'.repeat(64),
    pdf: { filename: 'resume.pdf', base64: 'JVBERi0xLjQK', sha256: 'b'.repeat(64) },
    snapshot: {
      contact: {},
      skills: [],
      experience: [],
      education: [],
      certifications: [],
    },
  };
}

describe('selectMatchingArtifact', () => {
  it('returns the stored resume for the apply route of the same posting', () => {
    const match = selectMatchingArtifact(
      [candidate({ id: 'a' })],
      {
        jobUrl:
          'https://jobs.lever.co/acme/9f2b1c3d-1111-2222-3333-444455556666/apply',
      },
      NOW,
    );
    expect(match?.id).toBe('a');
  });

  it('never returns a resume tailored for a different posting', () => {
    const match = selectMatchingArtifact(
      [candidate({ id: 'a' })],
      { jobUrl: 'https://jobs.lever.co/acme/00000000-0000-0000-0000-000000000000' },
      NOW,
    );
    expect(match).toBeNull();
  });

  it('skips expired rows', () => {
    const match = selectMatchingArtifact(
      [candidate({ id: 'a', expires_at: '2026-08-01T00:00:00.000Z' })],
      { jobUrl: 'https://jobs.lever.co/acme/9f2b1c3d-1111-2222-3333-444455556666' },
      NOW,
    );
    expect(match).toBeNull();
  });

  it('prefers the most recent match when a posting was regenerated', () => {
    const match = selectMatchingArtifact(
      [
        candidate({ id: 'old', created_at: '2026-08-01T09:00:00.000Z' }),
        candidate({ id: 'new', created_at: '2026-08-02T09:00:00.000Z' }),
      ],
      { jobUrl: 'https://jobs.lever.co/acme/9f2b1c3d-1111-2222-3333-444455556666' },
      NOW,
    );
    expect(match?.id).toBe('new');
  });

  it('ignores rows with an unparseable expiry', () => {
    const match = selectMatchingArtifact(
      [candidate({ id: 'a', expires_at: 'not-a-date' })],
      { jobUrl: 'https://jobs.lever.co/acme/9f2b1c3d-1111-2222-3333-444455556666' },
      NOW,
    );
    expect(match).toBeNull();
  });
});

describe('supersededArtifactIds', () => {
  it('retires only the previous resume for the same posting', () => {
    const ids = supersededArtifactIds(
      [
        candidate({ id: 'same-job' }),
        candidate({
          id: 'other-job',
          source_url: 'https://jobs.lever.co/acme/11112222-3333-4444-5555-666677778888',
        }),
      ],
      artifact('https://jobs.lever.co/acme/9f2b1c3d-1111-2222-3333-444455556666/apply'),
    );
    expect(ids).toEqual(['same-job']);
  });
});

describe('overflowArtifactIds', () => {
  it('keeps the newest rows and reports the rest', () => {
    const candidates = Array.from({ length: 4 }, (_, index) =>
      candidate({
        id: `id-${index}`,
        created_at: new Date(NOW - index * 60_000).toISOString(),
      }),
    );
    expect(overflowArtifactIds(candidates, 2)).toEqual(['id-2', 'id-3']);
  });

  it('reports nothing while the user is under the cap', () => {
    expect(overflowArtifactIds([candidate({ id: 'a' })])).toEqual([]);
    expect(MAX_STORED_ARTIFACTS_PER_USER).toBeGreaterThan(1);
  });
});

describe('buildArtifactRow', () => {
  it('denormalizes the ATS identity and sets the storage expiry', () => {
    const row = buildArtifactRow(
      'user-1',
      artifact('https://jobs.lever.co/acme/9f2b1c3d-1111-2222-3333-444455556666'),
      NOW,
    );
    expect(row.ats_platform).toBe('lever');
    expect(row.ats_tenant).toBe('acme');
    expect(row.ats_job_id).toBe('9f2b1c3d-1111-2222-3333-444455556666');
    expect(Date.parse(row.expires_at)).toBe(NOW + STORED_ARTIFACT_TTL_MS);
  });

  it('leaves the ATS columns null for an unrecognised board', () => {
    const row = buildArtifactRow(
      'user-1',
      artifact('https://careers.acme-industries.com/openings/engineer'),
      NOW,
    );
    expect(row.ats_platform).toBeNull();
    expect(row.ats_job_id).toBeNull();
    expect(row.source_url).toBe('https://careers.acme-industries.com/openings/engineer');
  });
});

describe('reviveStoredArtifact', () => {
  it('restamps the short in-page review window without touching the PDF', () => {
    const original = artifact('https://jobs.lever.co/acme/abc');
    const revived = reviveStoredArtifact(original, 30 * 60 * 1000, NOW);
    expect(Date.parse(revived.generatedAt)).toBe(NOW);
    expect(Date.parse(revived.expiresAt)).toBe(NOW + 30 * 60 * 1000);
    expect(revived.pdf).toEqual(original.pdf);
    expect(revived.generatedContentHash).toBe(original.generatedContentHash);
  });
});
