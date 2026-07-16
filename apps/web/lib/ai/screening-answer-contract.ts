import { createHash } from 'node:crypto';

import { z } from 'zod';

import {
  ResumeAutofillSnapshotV1Schema,
  type ResumeAutofillSnapshotV1,
} from '@/lib/resume/autofill-schema';
import type { AiGenerationLimitState } from './ai-generation-limits';

export const SCREENING_QUESTION_LIMITS = {
  questionText: 2_000,
  characterLimit: 10_000,
  companyName: 500,
  roleTitle: 500,
  jobDescription: 15_000,
  requestBytes: 512 * 1024,
} as const;

const sha256 = z.string().regex(/^[a-f0-9]{64}$/i);

export const ScreeningQuestionDraftRequestSchema = z
  .object({
    questionText: z.string().trim().min(1).max(SCREENING_QUESTION_LIMITS.questionText),
    characterLimit: z
      .number()
      .int()
      .min(1)
      .max(SCREENING_QUESTION_LIMITS.characterLimit)
      .optional(),
    job: z
      .object({
        companyName: z.string().trim().min(1).max(SCREENING_QUESTION_LIMITS.companyName),
        roleTitle: z.string().trim().min(1).max(SCREENING_QUESTION_LIMITS.roleTitle),
        jobDescription: z.string().trim().min(1).max(SCREENING_QUESTION_LIMITS.jobDescription),
      })
      .strict(),
    snapshot: ResumeAutofillSnapshotV1Schema,
    sourceContentHash: sha256,
  })
  .strict();

export interface ScreeningQuestionDraftRequest {
  questionText: string;
  characterLimit?: number;
  job: {
    companyName: string;
    roleTitle: string;
    jobDescription: string;
  };
  snapshot: ResumeAutofillSnapshotV1;
  sourceContentHash: string;
}

export interface ScreeningQuestionDraftResponse {
  ok: boolean;
  questionHash: string;
  draft?: string;
  sourceContentHash?: string;
  error?:
    | 'sensitive'
    | 'insufficient_context'
    | 'limit'
    | 'generation_failed';
}

export interface SavedScreeningAnswer {
  questionHash: string;
  normalizedQuestionText: string;
  editedAnswer: string;
  source: 'user_edited_ai_draft' | 'user_written';
  createdAt: string;
  updatedAt: string;
}

export type ScreeningQuestionDraftEndpointResponse =
  ScreeningQuestionDraftResponse & { limits?: AiGenerationLimitState };

const SENSITIVE_QUESTION_RE =
  /\b(visa|sponsor(?:ship|ed|ing)?|work authori[sz]\w*|authori[sz]\w*|work permit|eligib\w*|citizen\w*|immigration|clearance|security clearance|gender|sex|race|ethnic\w*|hispanic|latino|national origin|demographic|protected class|veteran\w*|disab\w*|eeo|equal opportunity|salary|compensation|expected pay|desired pay|date of birth|dob|ssn|social security)\b/i;

export function normalizeScreeningQuestionText(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function hashScreeningQuestion(value: string): string {
  return createHash('sha256')
    .update(normalizeScreeningQuestionText(value), 'utf8')
    .digest('hex');
}

export function isSensitiveScreeningQuestion(value: string): boolean {
  return SENSITIVE_QUESTION_RE.test(normalizeScreeningQuestionText(value));
}
