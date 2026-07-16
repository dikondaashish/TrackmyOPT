import { describe, expect, it } from 'vitest';

import {
  AUTOFILL_CONTRACT_LIMITS,
  GeneratedResumeArtifactV1Schema,
  ResumeAutofillSnapshotV1Schema,
  ResumeDateValueSchema,
} from '../autofill-schema';

const date = {
  originalText: 'Jan 2020',
  year: 2020,
  month: 1,
  precision: 'month' as const,
};

function validSnapshot() {
  return {
    contact: {
      firstName: 'Ada',
      lastName: 'Lovelace',
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      phone: '+1 555 0100',
      city: 'New York',
      state: 'NY',
      country: 'United States',
      linkedinUrl: 'https://www.linkedin.com/in/ada-lovelace',
      portfolioUrl: 'https://ada.example.com',
    },
    summary: 'Software engineer focused on reliable systems.',
    totalYearsExperience: 5,
    skills: ['TypeScript', 'React'],
    experience: [
      {
        company: 'Analytical Engines, Inc.',
        title: 'Senior Software Engineer',
        location: 'New York, NY',
        startDate: date,
        isCurrent: true,
        bullets: ['Built deterministic application workflows.'],
        descriptionText: 'Built deterministic application workflows.',
      },
    ],
    education: [
      {
        school: 'University of London',
        degree: 'BSc',
        fieldOfStudy: 'Mathematics',
        endDate: { ...date, originalText: '2020', precision: 'year' as const },
      },
    ],
    certifications: [],
  };
}

function validArtifact() {
  return {
    schemaVersion: 1 as const,
    artifactId: 'artifact-job-a',
    sourceResumeId: 'resume-a',
    sourceResumeFilename: 'ada-resume.pdf',
    templateId: 'classic',
    job: {
      jobKey: 'workday:job-a',
      companyName: 'Company A',
      roleTitle: 'Software Engineer',
      sourceUrl: 'https://company-a.wd5.myworkdayjobs.com/jobs/job-a',
      requisitionId: 'REQ-A',
    },
    generatedAt: '2026-07-16T12:00:00.000Z',
    expiresAt: '2026-07-16T12:30:00.000Z',
    generatedContentHash: 'a'.repeat(64),
    pdf: {
      filename: 'ada-company-a-resume.pdf',
      base64: 'JVBERi0xLjQK',
      sha256: 'b'.repeat(64),
    },
    snapshot: validSnapshot(),
  };
}

describe('resume autofill schemas', () => {
  it('accepts the README V1 contract', () => {
    expect(ResumeDateValueSchema.safeParse(date).success).toBe(true);
    expect(
      ResumeAutofillSnapshotV1Schema.safeParse(validSnapshot()).success
    ).toBe(true);
    expect(
      GeneratedResumeArtifactV1Schema.safeParse(validArtifact()).success
    ).toBe(true);
  });

  it('keeps sensitive applicant data out of the structured snapshot', () => {
    const snapshot = validSnapshot() as ReturnType<typeof validSnapshot> & {
      visaStatus?: string;
      contact: ReturnType<typeof validSnapshot>['contact'] & {
        race?: string;
        disability?: string;
      };
    };
    snapshot.visaStatus = 'F-1';
    snapshot.contact.race = 'decline-to-answer';
    snapshot.contact.disability = 'no';

    expect(ResumeAutofillSnapshotV1Schema.safeParse(snapshot).success).toBe(
      false
    );
  });

  it('rejects malformed dates and hashes', () => {
    expect(
      ResumeDateValueSchema.safeParse({ ...date, month: 13 }).success
    ).toBe(false);

    expect(
      GeneratedResumeArtifactV1Schema.safeParse({
        ...validArtifact(),
        generatedContentHash: 'not-a-sha256',
      }).success
    ).toBe(false);

    expect(
      GeneratedResumeArtifactV1Schema.safeParse({
        ...validArtifact(),
        pdf: { ...validArtifact().pdf, base64: 'not base64' },
      }).success
    ).toBe(false);
  });

  it('rejects oversized structured content and PDF payloads', () => {
    expect(
      ResumeAutofillSnapshotV1Schema.safeParse({
        ...validSnapshot(),
        summary: 'x'.repeat(AUTOFILL_CONTRACT_LIMITS.summary + 1),
      }).success
    ).toBe(false);

    expect(
      GeneratedResumeArtifactV1Schema.safeParse({
        ...validArtifact(),
        pdf: {
          ...validArtifact().pdf,
          base64: 'A'.repeat(AUTOFILL_CONTRACT_LIMITS.pdfBase64 + 1),
        },
      }).success
    ).toBe(false);
  });
});
