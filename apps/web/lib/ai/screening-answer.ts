import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

import type { ResumeAutofillSnapshotV1 } from '@/lib/resume/autofill-schema';
import {
  reserveAiGenerationLimit,
  type AiGenerationLimitState,
} from './ai-generation-limits';
import {
  ScreeningQuestionDraftRequestSchema,
  hashScreeningQuestion,
  isSensitiveScreeningQuestion,
  type ScreeningQuestionDraftEndpointResponse,
  type ScreeningQuestionDraftRequest,
} from './screening-answer-contract';
import {
  SCREENING_ANSWER_PLAN_JSON_SCHEMA,
  buildScreeningAnswerPlanPrompt,
  type ScreeningAnswerEvidencePromptItem,
} from './prompts/screening-answer';

const ScreeningAnswerPlanSchema = z
  .object({
    motivation: z.string().trim().max(1_000),
    evidenceIds: z.array(z.string().trim().min(1).max(120)).max(3),
  })
  .strict();

export type ScreeningAnswerPlan = z.infer<typeof ScreeningAnswerPlanSchema>;
export type ScreeningAnswerPlanGenerator = (input: {
  request: ScreeningQuestionDraftRequest;
  evidence: ScreeningAnswerEvidencePromptItem[];
}) => Promise<ScreeningAnswerPlan>;

interface ScreeningAnswerDependencies {
  reserve: (input: {
    userId: string;
    kind: 'screening_answer';
    itemHash: string;
  }) => Promise<AiGenerationLimitState>;
  generatePlan: ScreeningAnswerPlanGenerator;
}

function addEvidence(
  evidence: ScreeningAnswerEvidencePromptItem[],
  id: string,
  text: string | undefined,
): void {
  const normalized = text?.trim().replace(/\s+/g, ' ');
  if (normalized) evidence.push({ id, text: normalized });
}

export function buildScreeningAnswerEvidence(
  snapshot: ResumeAutofillSnapshotV1,
): ScreeningAnswerEvidencePromptItem[] {
  const evidence: ScreeningAnswerEvidencePromptItem[] = [];
  addEvidence(evidence, 'summary', snapshot.summary);
  if (snapshot.skills.length > 0) {
    addEvidence(evidence, 'skills', `My documented skills include ${snapshot.skills.join(', ')}.`);
  }
  snapshot.experience.forEach((experience, experienceIndex) => {
    addEvidence(
      evidence,
      `experience:${experienceIndex}:role`,
      `I am documented as ${experience.title} at ${experience.company}.`,
    );
    experience.bullets.forEach((bullet, bulletIndex) => {
      addEvidence(evidence, `experience:${experienceIndex}:bullet:${bulletIndex}`, bullet);
    });
    addEvidence(
      evidence,
      `experience:${experienceIndex}:description`,
      experience.descriptionText,
    );
  });
  snapshot.education.forEach((education, index) => {
    addEvidence(
      evidence,
      `education:${index}`,
      [education.degree, education.fieldOfStudy, education.school]
        .filter(Boolean)
        .join(' — '),
    );
  });
  snapshot.certifications.forEach((certification, index) => {
    addEvidence(
      evidence,
      `certification:${index}`,
      [certification.name, certification.issuer].filter(Boolean).join(' — '),
    );
  });
  return evidence;
}

const FIRST_PERSON_FACT_CLAIM_RE =
  /\bI\s+(?:have|worked|led|managed|built|created|increased|reduced|saved|earned|hold|graduated|speciali[sz]e|am skilled|was|served)\b/i;

function motivationIsGrounded(
  motivation: string,
  request: ScreeningQuestionDraftRequest,
): boolean {
  if (FIRST_PERSON_FACT_CLAIM_RE.test(motivation)) return false;
  const context = [
    request.job.companyName,
    request.job.roleTitle,
    request.job.jobDescription,
  ].join(' ').toLocaleLowerCase('en-US');
  const numbers = motivation.match(/\b\d+(?:\.\d+)?%?\b/g) ?? [];
  if (numbers.some((number) => !context.includes(number.toLocaleLowerCase('en-US')))) {
    return false;
  }
  const namedPhrases = motivation.match(/\b[A-Z][A-Za-z0-9&.-]+(?:\s+[A-Z][A-Za-z0-9&.-]+)+\b/g) ?? [];
  return namedPhrases.every((phrase) =>
    context.includes(phrase.toLocaleLowerCase('en-US')),
  );
}

function boundedDraft(parts: string[], limit: number): string {
  let result = '';
  for (const part of parts) {
    const next = result ? `${result} ${part}` : part;
    if (next.length <= limit) {
      result = next;
      continue;
    }
    if (!result) {
      const clipped = part.slice(0, limit + 1);
      result = clipped.slice(0, Math.max(0, clipped.lastIndexOf(' '))).trim();
    }
    break;
  }
  return result;
}

export async function generateScreeningAnswerPlanWithGemini(input: {
  request: ScreeningQuestionDraftRequest;
  evidence: ScreeningAnswerEvidencePromptItem[];
}): Promise<ScreeningAnswerPlan> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: buildScreeningAnswerPlanPrompt({
      questionText: input.request.questionText,
      companyName: input.request.job.companyName,
      roleTitle: input.request.job.roleTitle,
      jobDescription: input.request.job.jobDescription,
      evidence: input.evidence,
    }),
    config: {
      temperature: 0,
      responseMimeType: 'application/json',
      responseJsonSchema: SCREENING_ANSWER_PLAN_JSON_SCHEMA,
    },
  });
  return ScreeningAnswerPlanSchema.parse(JSON.parse(response.text || '{}'));
}

const defaultDependencies: ScreeningAnswerDependencies = {
  reserve: (input) => reserveAiGenerationLimit(input),
  generatePlan: generateScreeningAnswerPlanWithGemini,
};

export async function processScreeningQuestionDraft(
  rawRequest: unknown,
  userId: string,
  dependencies: ScreeningAnswerDependencies = defaultDependencies,
): Promise<ScreeningQuestionDraftEndpointResponse> {
  const parsed = ScreeningQuestionDraftRequestSchema.safeParse(rawRequest);
  if (!parsed.success) {
    return { ok: false, questionHash: '', error: 'insufficient_context' };
  }
  const request = parsed.data as ScreeningQuestionDraftRequest;
  const questionHash = hashScreeningQuestion(request.questionText);

  if (isSensitiveScreeningQuestion(request.questionText)) {
    return { ok: false, questionHash, error: 'sensitive' };
  }

  const limits = await dependencies.reserve({
    userId,
    kind: 'screening_answer',
    itemHash: questionHash,
  });
  if (!limits.allowed) {
    return { ok: false, questionHash, error: 'limit', limits };
  }

  try {
    const evidence = buildScreeningAnswerEvidence(request.snapshot);
    const plan = ScreeningAnswerPlanSchema.parse(
      await dependencies.generatePlan({ request, evidence }),
    );
    if (!motivationIsGrounded(plan.motivation, request)) {
      return { ok: false, questionHash, error: 'generation_failed', limits };
    }
    const evidenceById = new Map(evidence.map((item) => [item.id, item.text]));
    const selected: string[] = [];
    for (const id of [...new Set(plan.evidenceIds)]) {
      const fact = evidenceById.get(id);
      if (!fact) {
        return { ok: false, questionHash, error: 'generation_failed', limits };
      }
      selected.push(fact);
    }
    const maxLength = request.characterLimit ?? 2_000;
    const draft = boundedDraft(
      [plan.motivation, ...selected].filter(Boolean),
      maxLength,
    );
    if (!draft) {
      return { ok: false, questionHash, error: 'insufficient_context', limits };
    }
    return {
      ok: true,
      questionHash,
      draft,
      sourceContentHash: request.sourceContentHash,
      limits,
    };
  } catch {
    return { ok: false, questionHash, error: 'generation_failed', limits };
  }
}
