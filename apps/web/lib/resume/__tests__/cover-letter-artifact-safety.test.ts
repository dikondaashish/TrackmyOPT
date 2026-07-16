import { describe, expect, it } from 'vitest';
import { GeneratedResumeArtifactV1Schema } from '../autofill-schema';

const artifact = {
  schemaVersion: 1,
  artifactId: 'artifact-a',
  sourceResumeId: 'resume-a',
  sourceResumeFilename: 'resume.pdf',
  templateId: 'classic',
  job: { jobKey: 'job-a', companyName: 'Acme', roleTitle: 'Engineer', sourceUrl: 'https://example.com/jobs/a' },
  generatedAt: '2026-07-16T12:00:00.000Z',
  expiresAt: '2026-07-16T12:30:00.000Z',
  generatedContentHash: 'a'.repeat(64),
  pdf: { filename: 'resume.pdf', base64: 'JVBERi0xLjQK', sha256: 'b'.repeat(64) },
  snapshot: { contact: {}, skills: [], experience: [], education: [], certifications: [] },
  coverLetter: {
    filename: 'cover-letter.pdf', base64: 'JVBERi0xLjQK', sha256: 'c'.repeat(64),
    generatedAt: '2026-07-16T12:05:00.000Z', sourceContentHash: 'd'.repeat(64),
  },
};

describe('cover-letter artifact hash lock', () => {
  it('rejects a cover letter derived from a different resume content hash', () => {
    expect(GeneratedResumeArtifactV1Schema.safeParse(artifact).success).toBe(false);
  });
});
