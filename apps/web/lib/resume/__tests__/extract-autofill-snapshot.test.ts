import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import type { ResumeAutofillSnapshotV1 } from '../autofill-schema';
import { extractAutofillSnapshot } from '../extract-autofill-snapshot';

function fixture(name: string): string {
  return readFileSync(
    resolve(process.cwd(), 'lib/resume/__fixtures__/autofill', name),
    'utf8'
  );
}

const jobASnapshot: ResumeAutofillSnapshotV1 = {
  contact: {
    firstName: 'Alice',
    lastName: 'Johnson',
    fullName: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    phone: '+1 617 555 0101',
    city: 'Boston',
    state: 'MA',
  },
  summary: 'Data engineer building reliable products.',
  totalYearsExperience: 6,
  skills: ['Python', 'SQL'],
  experience: [
    {
      company: 'Acme Analytics',
      title: 'Senior Data Engineer',
      startDate: {
        originalText: 'Jan 2021',
        year: 2021,
        month: 1,
        precision: 'month',
      },
      endDate: {
        originalText: 'Mar 2024',
        year: 2024,
        month: 3,
        precision: 'month',
      },
      isCurrent: false,
      bullets: ['Built reliable data products for enterprise customers.'],
      descriptionText: 'Built reliable data products for enterprise customers.',
    },
  ],
  education: [
    {
      school: 'Northeastern University',
      degree: 'Master of Science',
      fieldOfStudy: 'Data Science',
    },
  ],
  certifications: [],
};

describe('extractAutofillSnapshot', () => {
  it('normalizes final LaTeX, validates extraction, reconciles source facts, and hashes exact LaTeX', async () => {
    const finalLatex = fixture('job-a-final.tex');
    let normalizedInput = '';

    const result = await extractAutofillSnapshot({
      finalLatex,
      sourceResumeText: fixture('job-a-source.txt'),
      extractStructuredSnapshot: async ({ plainText }) => {
        normalizedInput = plainText;
        return jobASnapshot;
      },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(normalizedInput).toContain('Acme Analytics');
    expect(normalizedInput).toContain('Senior Data Engineer');
    expect(result.snapshot.experience).toHaveLength(1);
    expect(result.snapshot.education).toHaveLength(1);
    expect(result.generatedContentHash).toBe(
      createHash('sha256').update(finalLatex, 'utf8').digest('hex')
    );
  });

  it('drops Job A immutable facts when reconciled against Job B source resume', async () => {
    const result = await extractAutofillSnapshot({
      finalLatex: fixture('job-a-final.tex'),
      sourceResumeText: fixture('job-b-source.txt'),
      extractStructuredSnapshot: async () => jobASnapshot,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.snapshot.contact).toEqual({});
    expect(result.snapshot.experience).toEqual([]);
    expect(result.snapshot.education).toEqual([]);
    expect(result.snapshot.skills).toEqual(['Python', 'SQL']);
  });

  it('decodes LaTeX-escaped company, school, email, and percent values before extraction', async () => {
    let normalizedInput = '';
    const result = await extractAutofillSnapshot({
      finalLatex: fixture('escaped-special-chars-final.tex'),
      sourceResumeText: fixture('escaped-special-chars-source.txt'),
      extractStructuredSnapshot: async ({ plainText }) => {
        normalizedInput = plainText;
        return {
          contact: { fullName: 'Jane Doe', email: 'jane_doe@example.com' },
          skills: [],
          experience: [
            {
              company: 'R&D Partners #1',
              title: 'Software Engineer',
              startDate: {
                originalText: 'Feb 2022',
                year: 2022,
                month: 2,
                precision: 'month',
              },
              isCurrent: true,
              bullets: ['Improved build success by 25%.'],
              descriptionText: 'Improved build success by 25%.',
            },
          ],
          education: [
            {
              school: 'State University & College',
              degree: 'Bachelor of Science',
            },
          ],
          certifications: [],
        };
      },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(normalizedInput).toContain('R&D Partners #1');
    expect(normalizedInput).toContain('State University & College');
    expect(normalizedInput).toContain('jane_doe@example.com');
    expect(normalizedInput).toContain('25%');
    expect(result.snapshot.experience).toHaveLength(1);
    expect(result.snapshot.education).toHaveLength(1);
  });

  it('returns a content hash but no snapshot when extraction fails validation', async () => {
    const finalLatex = fixture('job-a-final.tex');
    const result = await extractAutofillSnapshot({
      finalLatex,
      sourceResumeText: fixture('job-a-source.txt'),
      extractStructuredSnapshot: async () => ({
        ...jobASnapshot,
        visaStatus: 'F-1',
      }),
    });

    expect(result).toEqual({
      ok: false,
      reason: 'invalid_snapshot',
      generatedContentHash: createHash('sha256')
        .update(finalLatex, 'utf8')
        .digest('hex'),
    });
  });

  it('returns a content hash but no snapshot when the constrained extractor is unavailable', async () => {
    const finalLatex = fixture('job-b-final.tex');
    const result = await extractAutofillSnapshot({
      finalLatex,
      sourceResumeText: fixture('job-b-source.txt'),
      extractStructuredSnapshot: async () => {
        throw new Error('model unavailable');
      },
    });

    expect(result.ok).toBe(false);
    expect(result).toMatchObject({
      reason: 'extraction_failed',
      generatedContentHash: createHash('sha256')
        .update(finalLatex, 'utf8')
        .digest('hex'),
    });
    expect('snapshot' in result).toBe(false);
  });
});
