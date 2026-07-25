import { describe, expect, it } from 'vitest';

import type { ScreeningQuestionDraftRequest } from '../screening-answer-contract';
import type { GenerateCoverLetterRequest } from '@/lib/resume/autofill-schema';
import { buildCoverLetterPrompt } from './cover-letter';
import { buildScreeningAnswerPrompt } from './screening-answer';

const snapshot = {
  contact: { firstName: 'Asha', lastName: 'Patel' },
  skills: ['TypeScript'],
  experience: [],
  education: [],
  certifications: [],
};
const job = {
  companyName: 'Acme',
  roleTitle: 'Software Engineer',
  jobDescription: 'Build reliable TypeScript products.',
};

describe('autofill AI prompts', () => {
  it('grounds screening answers and forbids sensitive or invented facts', () => {
    const request: ScreeningQuestionDraftRequest = {
      questionText: 'Why are you interested?',
      characterLimit: 300,
      job,
      snapshot,
      sourceContentHash: 'a'.repeat(64),
    };
    const prompt = buildScreeningAnswerPrompt(request);

    expect(prompt).toContain('Use only facts');
    expect(prompt).toContain('NEEDS_USER_INPUT');
    expect(prompt).toContain('Never invent');
    expect(prompt).toContain('untrusted reference data');
    expect(prompt).toContain('within 300 characters');
  });

  it.each([
    'Why do you want to work at Acme?',
    'Why are you interested in this Software Engineer role?',
    'What experience makes you a strong fit for this position?',
    'Describe a project that prepared you for this work.',
    'How would you approach the responsibilities in this role?',
  ])(
    'requires a specific job/resume connection for "%s"',
    (questionText) => {
      const prompt = buildScreeningAnswerPrompt({
        questionText,
        characterLimit: 600,
        job,
        snapshot,
        sourceContentHash: 'a'.repeat(64),
      });

      expect(prompt).toContain(
        'connect concrete job-description details to concrete resume facts'
      );
      expect(prompt).toContain(
        'For company-interest or role-interest questions'
      );
      expect(prompt).toContain(
        'For experience, accomplishment, project, or behavioral questions'
      );
      expect(prompt).toContain(JSON.stringify(questionText));
      expect(prompt).toContain(JSON.stringify(job));
      expect(prompt).toContain(JSON.stringify(snapshot));
    }
  );

  it('preserves official history facts in cover letters', () => {
    const request: GenerateCoverLetterRequest = {
      job,
      snapshot,
      sourceContentHash: 'a'.repeat(64),
    };
    const prompt = buildCoverLetterPrompt(request);

    expect(prompt).toContain('Use only facts');
    expect(prompt).toContain('Never invent');
    expect(prompt).toContain('Preserve official employer');
    expect(prompt).toContain('untrusted reference data');
  });
});
