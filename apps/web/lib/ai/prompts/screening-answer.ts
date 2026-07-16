export interface ScreeningAnswerEvidencePromptItem {
  id: string;
  text: string;
}

export interface ScreeningAnswerPromptInput {
  questionText: string;
  companyName: string;
  roleTitle: string;
  jobDescription: string;
  evidence: ScreeningAnswerEvidencePromptItem[];
}

export function buildScreeningAnswerPlanPrompt(input: ScreeningAnswerPromptInput): string {
  return [
    'Create a plan for a job-application screening answer.',
    'Return JSON only with keys motivation (string) and evidenceIds (string array).',
    'The motivation may discuss only the supplied company, role, and job description.',
    'Do not state any candidate qualification in motivation.',
    'Candidate facts will be rendered by the server from selected evidence IDs.',
    'Select at most three evidence IDs. Never create an ID.',
    `Question: ${input.questionText}`,
    `Company: ${input.companyName}`,
    `Role: ${input.roleTitle}`,
    `Job description: ${input.jobDescription}`,
    `Candidate evidence: ${JSON.stringify(input.evidence)}`,
  ].join('\n');
}

export const SCREENING_ANSWER_PLAN_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    motivation: { type: 'string', maxLength: 1_000 },
    evidenceIds: {
      type: 'array',
      maxItems: 3,
      items: { type: 'string', maxLength: 120 },
    },
  },
  required: ['motivation', 'evidenceIds'],
} as const;
