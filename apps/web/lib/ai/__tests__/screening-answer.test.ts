import { describe, expect, it, vi } from 'vitest';

import type { ResumeAutofillSnapshotV1 } from '@/lib/resume/autofill-schema';
import {
  ScreeningQuestionDraftRequestSchema,
  hashScreeningQuestion,
} from '../screening-answer-contract';
import { processScreeningQuestionDraft } from '../screening-answer';

const snapshot: ResumeAutofillSnapshotV1 = {
  contact: { firstName: 'Asha', lastName: 'Patel' },
  summary: 'Software engineer focused on reliable developer tools.',
  totalYearsExperience: 4,
  skills: ['TypeScript', 'React'],
  experience: [
    {
      company: 'Acme Systems',
      title: 'Software Engineer',
      startDate: { originalText: 'Jan 2022', year: 2022, month: 1, precision: 'month' },
      isCurrent: true,
      bullets: ['Built a TypeScript release dashboard used by engineering teams.'],
      descriptionText: 'Developed reliable internal developer tooling.',
    },
  ],
  education: [
    { school: 'State University', degree: 'BS Computer Science' },
  ],
  certifications: [],
};

const request = {
  questionText: 'Describe a relevant project',
  characterLimit: 500,
  job: {
    companyName: 'Example Labs',
    roleTitle: 'Frontend Engineer',
    jobDescription: 'Build reliable TypeScript tools for product teams.',
  },
  snapshot,
  sourceContentHash: 'a'.repeat(64),
};

const allowedLimits = {
  allowed: true,
  dailyLimit: 25,
  dailyRemaining: 24,
  itemRegenerationLimit: 3,
  itemRegenerationsRemaining: 3,
};

describe('screening answer contracts and generation', () => {
  it('strictly validates the documented request contract', () => {
    expect(ScreeningQuestionDraftRequestSchema.safeParse(request).success).toBe(true);
    expect(ScreeningQuestionDraftRequestSchema.safeParse({ ...request, extra: true }).success).toBe(false);
  });

  it('hashes only trim and whitespace-collapse normalization', () => {
    expect(hashScreeningQuestion('  Why  this role?\n')).toBe(
      hashScreeningQuestion('Why this role?'),
    );
    expect(hashScreeningQuestion('why this role?')).not.toBe(
      hashScreeningQuestion('Why this role?'),
    );
  });

  it('rejects sensitive questions before quota reservation or any AI call', async () => {
    const reserve = vi.fn();
    const generatePlan = vi.fn();
    const result = await processScreeningQuestionDraft(
      { ...request, questionText: 'Why will you need visa sponsorship?' },
      'user-1',
      { reserve, generatePlan },
    );

    expect(result.error).toBe('sensitive');
    expect(reserve).not.toHaveBeenCalled();
    expect(generatePlan).not.toHaveBeenCalled();
  });

  it('returns the authoritative limit state without calling AI when capped', async () => {
    const limits = {
      ...allowedLimits,
      allowed: false,
      dailyRemaining: 0,
      error: 'ai_daily_limit_reached' as const,
    };
    const generatePlan = vi.fn();
    const result = await processScreeningQuestionDraft(request, 'user-1', {
      reserve: vi.fn().mockResolvedValue(limits),
      generatePlan,
    });

    expect(result).toMatchObject({
      ok: false,
      error: 'limit',
      questionHash: hashScreeningQuestion(request.questionText),
      limits,
    });
    expect(generatePlan).not.toHaveBeenCalled();
  });

  it('constructs the returned candidate evidence only from the validated snapshot', async () => {
    const result = await processScreeningQuestionDraft(request, 'user-1', {
      reserve: vi.fn().mockResolvedValue(allowedLimits),
      generatePlan: vi.fn().mockResolvedValue({
        motivation: 'Example Labs builds the reliable TypeScript tools described in this role.',
        evidenceIds: ['experience:0:bullet:0'],
      }),
    });

    expect(result.ok).toBe(true);
    expect(result.draft).toContain('Built a TypeScript release dashboard used by engineering teams.');
    expect(result.draft).not.toContain('Globex');
    expect(result.sourceContentHash).toBe(request.sourceContentHash);
  });

  it('rejects a generated plan that introduces an unsupported candidate claim', async () => {
    const result = await processScreeningQuestionDraft(request, 'user-1', {
      reserve: vi.fn().mockResolvedValue(allowedLimits),
      generatePlan: vi.fn().mockResolvedValue({
        motivation: 'I led a 40-person program at Globex Corporation.',
        evidenceIds: ['experience:0:bullet:0'],
      }),
    });

    expect(result).toMatchObject({ ok: false, error: 'generation_failed' });
  });
});
