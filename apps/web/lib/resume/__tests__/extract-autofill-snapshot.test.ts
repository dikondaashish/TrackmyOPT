import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it, vi } from 'vitest';

const sentry = vi.hoisted(() => ({ captureException: vi.fn() }));
vi.mock('@sentry/nextjs', () => sentry);

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

  it('never lets a rewritten job title enter the autofill snapshot', async () => {
    const result = await extractAutofillSnapshot({
      finalLatex: fixture('job-a-final.tex'),
      sourceResumeText: fixture('job-a-source.txt'),
      recoverSourceTitles: async () => ({ roles: [] }),
      extractStructuredSnapshot: async () => ({
        ...jobASnapshot,
        experience: [
          {
            ...jobASnapshot.experience[0],
            title: 'Target-JD Software Engineer',
          },
        ],
      }),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.snapshot.experience).toEqual([]);
    expect(
      result.snapshot.experience.some(
        ({ title }) => title === 'Target-JD Software Engineer'
      )
    ).toBe(false);
  });

  it('replaces an aligned job title with the real title from the source resume', async () => {
    let recoveryInput: unknown;
    const result = await extractAutofillSnapshot({
      finalLatex: fixture('job-a-final.tex'),
      sourceResumeText: fixture('job-a-source.txt'),
      extractStructuredSnapshot: async () => ({
        ...jobASnapshot,
        experience: [
          { ...jobASnapshot.experience[0], title: 'Staff Platform Engineer' },
        ],
      }),
      recoverSourceTitles: async (input) => {
        recoveryInput = input;
        return { roles: [{ index: 0, title: 'Senior Data Engineer' }] };
      },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(recoveryInput).toMatchObject({
      roles: [
        {
          index: 0,
          company: 'Acme Analytics',
          tailoredTitle: 'Staff Platform Engineer',
          startDateText: 'Jan 2021',
        },
      ],
    });
    expect(result.snapshot.experience).toHaveLength(1);
    expect(result.snapshot.experience[0].title).toBe('Senior Data Engineer');
    // Tailored bullets are kept; only the identity facts come from the source.
    expect(result.snapshot.experience[0].descriptionText).toBe(
      'Built reliable data products for enterprise customers.'
    );
  });

  it('rejects a recovered title the source resume does not show for that employer', async () => {
    const result = await extractAutofillSnapshot({
      finalLatex: fixture('job-a-final.tex'),
      sourceResumeText: fixture('job-a-source.txt'),
      extractStructuredSnapshot: async () => ({
        ...jobASnapshot,
        experience: [
          { ...jobASnapshot.experience[0], title: 'Staff Platform Engineer' },
        ],
      }),
      recoverSourceTitles: async () => ({
        roles: [{ index: 0, title: 'Chief Data Officer' }],
      }),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.snapshot.experience).toEqual([]);
  });

  it('drops a recovered title that appears only far from the employer', async () => {
    const source = `${fixture('job-a-source.txt')}\n${'filler '.repeat(120)}\nVolunteer: Chief Data Officer`;
    const result = await extractAutofillSnapshot({
      finalLatex: fixture('job-a-final.tex'),
      sourceResumeText: source,
      extractStructuredSnapshot: async () => ({
        ...jobASnapshot,
        experience: [
          { ...jobASnapshot.experience[0], title: 'Staff Platform Engineer' },
        ],
      }),
      recoverSourceTitles: async () => ({
        roles: [{ index: 0, title: 'Chief Data Officer' }],
      }),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.snapshot.experience).toEqual([]);
  });

  it('keeps a verified job when only a date or location cannot be confirmed', async () => {
    const result = await extractAutofillSnapshot({
      finalLatex: fixture('job-a-final.tex'),
      sourceResumeText: fixture('job-a-source.txt'),
      recoverSourceTitles: async () => {
        throw new Error('recovery must not run for confirmed titles');
      },
      extractStructuredSnapshot: async () => ({
        ...jobASnapshot,
        experience: [
          {
            ...jobASnapshot.experience[0],
            location: 'Seattle, WA',
            endDate: {
              originalText: 'Jun 2024',
              year: 2024,
              month: 6,
              precision: 'month' as const,
            },
          },
        ],
      }),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const [job] = result.snapshot.experience;
    expect(job.company).toBe('Acme Analytics');
    expect(job.title).toBe('Senior Data Engineer');
    expect(job.location).toBeUndefined();
    expect(job.startDate).toMatchObject({ year: 2021, month: 1, precision: 'month' });
    // An unconfirmed date keeps its text but can no longer be written to a form.
    expect(job.endDate).toEqual({ originalText: 'Jun 2024', precision: 'text' });
  });

  it('confirms numeric month/year dates written differently in the source', async () => {
    const result = await extractAutofillSnapshot({
      finalLatex: fixture('job-a-final.tex'),
      sourceResumeText: fixture('job-a-source.txt').replace('Jan 2021 - Mar 2024', '01/2021 - 2024-03'),
      recoverSourceTitles: async () => ({ roles: [] }),
      extractStructuredSnapshot: async () => jobASnapshot,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.snapshot.experience[0].startDate.precision).toBe('month');
    expect(result.snapshot.experience[0].endDate?.precision).toBe('month');
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

  it('reports extraction and title-recovery failures to Sentry without resume content', async () => {
    sentry.captureException.mockClear();
    await extractAutofillSnapshot({
      finalLatex: fixture('job-a-final.tex'),
      sourceResumeText: fixture('job-a-source.txt'),
      extractStructuredSnapshot: async () => ({
        ...jobASnapshot,
        experience: [{ ...jobASnapshot.experience[0], title: 'Staff Platform Engineer' }],
      }),
      recoverSourceTitles: async () => {
        throw new Error('Alice Johnson Acme Analytics');
      },
    });
    await extractAutofillSnapshot({
      finalLatex: fixture('job-b-final.tex'),
      sourceResumeText: fixture('job-b-source.txt'),
      extractStructuredSnapshot: async () => {
        throw new TypeError('model unavailable');
      },
    });

    const reports = sentry.captureException.mock.calls.map(([error, context]) => ({
      message: (error as Error).message,
      stage: context.tags.stage,
      errorName: context.extra.errorName,
    }));
    expect(reports).toEqual([
      { message: 'Resume autofill snapshot title_recovery failed', stage: 'title_recovery', errorName: 'Error' },
      { message: 'Resume autofill snapshot extract failed', stage: 'extract', errorName: 'TypeError' },
    ]);
    expect(JSON.stringify(sentry.captureException.mock.calls)).not.toContain('Alice');
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
