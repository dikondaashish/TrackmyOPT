import { z } from 'zod';

export const SAVED_QUESTION_MAX_LENGTH = 2_000;
export const SAVED_ANSWER_MAX_LENGTH = 8_000;

export const SavedScreeningAnswerSourceSchema = z.enum([
  'user_edited_ai_draft',
  'user_written',
]);

export const SavedScreeningAnswerWriteSchema = z.object({
  questionHash: z.string().regex(/^[0-9a-f]{64}$/),
  normalizedQuestionText: z.string().trim().min(1).max(SAVED_QUESTION_MAX_LENGTH),
  editedAnswer: z.string().trim().min(1).max(SAVED_ANSWER_MAX_LENGTH),
  source: SavedScreeningAnswerSourceSchema,
}).strict();

export const SavedScreeningAnswerSchema = SavedScreeningAnswerWriteSchema.extend({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type SavedScreeningAnswerWrite = z.infer<typeof SavedScreeningAnswerWriteSchema>;
export type SavedScreeningAnswer = z.infer<typeof SavedScreeningAnswerSchema>;

