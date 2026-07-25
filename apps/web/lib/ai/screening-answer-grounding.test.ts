import { describe, expect, it } from 'vitest';

import type { ScreeningQuestionDraftRequest } from './screening-answer-contract';
import { validateScreeningDraftGrounding } from './screening-answer-grounding';

const request: ScreeningQuestionDraftRequest = {
  questionText: 'Why are you interested in this role?',
  job: {
    companyName: 'Acme',
    roleTitle: 'Software Engineer',
    jobDescription:
      'Build reliable TypeScript products and collaborate with product partners.',
  },
  snapshot: {
    contact: { firstName: 'Asha', lastName: 'Patel' },
    skills: ['TypeScript', 'React'],
    experience: [
      {
        company: 'Example Labs',
        title: 'Frontend Engineer',
        startDate: { originalText: '2024', year: 2024, precision: 'year' },
        isCurrent: true,
        bullets: ['Built reliable React interfaces with product partners.'],
        descriptionText:
          'Built reliable React interfaces with product partners.',
      },
    ],
    education: [],
    certifications: [],
  },
  sourceContentHash: 'a'.repeat(64),
};

describe('screening draft grounding validation', () => {
  it('accepts a draft that connects job and resume evidence', () => {
    expect(
      validateScreeningDraftGrounding(
        'I am interested in building reliable TypeScript products, and my React interface work with product partners prepares me to contribute.',
        request
      )
    ).toEqual({ valid: true });
  });

  it('rejects a generic answer with no job or resume anchor', () => {
    expect(
      validateScreeningDraftGrounding(
        'I am very excited about this wonderful opportunity and would love to join your team.',
        request
      )
    ).toEqual({ valid: false, reason: 'insufficient_context' });
  });

  it.each([
    'I am authorized to work in the United States.',
    'I will require visa sponsorship in the future.',
    'I am a United States citizen.',
    'My desired salary is $100,000.',
    'My EEO response is already complete.',
    'My date of birth is January 1.',
  ])(
    'rejects a sensitive model statement: "%s"',
    (draft) => {
      expect(validateScreeningDraftGrounding(draft, request)).toEqual({
        valid: false,
        reason: 'sensitive',
      });
    }
  );

  it('treats the model fallback token as insufficient context', () => {
    expect(validateScreeningDraftGrounding('NEEDS_USER_INPUT', request)).toEqual(
      { valid: false, reason: 'insufficient_context' }
    );
  });
});
