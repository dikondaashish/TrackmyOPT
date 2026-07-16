import { z } from 'zod';

import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import {
  hashScreeningQuestion,
  normalizeScreeningQuestionText,
  type SavedScreeningAnswer,
} from './screening-answer-contract';

export const SaveScreeningAnswerSchema = z
  .object({
    questionText: z.string().trim().min(1).max(2_000),
    editedAnswer: z.string().trim().min(1).max(10_000),
    source: z.enum(['user_edited_ai_draft', 'user_written']),
  })
  .strict();

export interface ScreeningAnswerLibraryRecord extends SavedScreeningAnswer {
  userId: string;
}

export interface ScreeningAnswerLibraryRepository {
  find(userId: string, questionHash: string): Promise<ScreeningAnswerLibraryRecord | null>;
  upsert(record: ScreeningAnswerLibraryRecord): Promise<ScreeningAnswerLibraryRecord>;
  delete(userId: string, questionHash: string): Promise<boolean>;
}

interface ScreeningAnswerRow {
  user_id: string;
  question_hash: string;
  normalized_question_text: string;
  edited_answer: string;
  source: SavedScreeningAnswer['source'];
  created_at: string;
  updated_at: string;
}

function rowToRecord(row: ScreeningAnswerRow): ScreeningAnswerLibraryRecord {
  return {
    userId: row.user_id,
    questionHash: row.question_hash,
    normalizedQuestionText: row.normalized_question_text,
    editedAnswer: row.edited_answer,
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const postgresRepository: ScreeningAnswerLibraryRepository = {
  async find(userId, questionHash) {
    const { data, error } = await getSupabaseAdminClient()
      .from('screening_answer_library')
      .select('user_id, question_hash, normalized_question_text, edited_answer, source, created_at, updated_at')
      .eq('user_id', userId)
      .eq('question_hash', questionHash)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToRecord(data as ScreeningAnswerRow) : null;
  },
  async upsert(record) {
    const { data, error } = await getSupabaseAdminClient()
      .from('screening_answer_library')
      .upsert({
        user_id: record.userId,
        question_hash: record.questionHash,
        normalized_question_text: record.normalizedQuestionText,
        edited_answer: record.editedAnswer,
        source: record.source,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,question_hash' })
      .select('user_id, question_hash, normalized_question_text, edited_answer, source, created_at, updated_at')
      .single();
    if (error || !data) throw error ?? new Error('Missing saved screening answer');
    return rowToRecord(data as ScreeningAnswerRow);
  },
  async delete(userId, questionHash) {
    const { error } = await getSupabaseAdminClient()
      .from('screening_answer_library')
      .delete()
      .eq('user_id', userId)
      .eq('question_hash', questionHash);
    if (error) throw error;
    return true;
  },
};

function publicAnswer(record: ScreeningAnswerLibraryRecord): SavedScreeningAnswer {
  const { userId: _userId, ...answer } = record;
  return answer;
}

export async function findSavedScreeningAnswerByHash(input: {
  userId: string;
  questionHash: string;
}, repository: ScreeningAnswerLibraryRepository = postgresRepository): Promise<SavedScreeningAnswer | null> {
  if (!/^[a-f0-9]{64}$/i.test(input.questionHash)) return null;
  const record = await repository.find(input.userId, input.questionHash);
  return record ? publicAnswer(record) : null;
}

export async function findSavedScreeningAnswer(input: {
  userId: string;
  questionText: string;
}, repository: ScreeningAnswerLibraryRepository = postgresRepository): Promise<SavedScreeningAnswer | null> {
  return findSavedScreeningAnswerByHash({
    userId: input.userId,
    questionHash: hashScreeningQuestion(input.questionText),
  }, repository);
}

export async function saveScreeningAnswer(
  rawInput: unknown,
  userId: string,
  repository: ScreeningAnswerLibraryRepository = postgresRepository,
): Promise<SavedScreeningAnswer> {
  const input = SaveScreeningAnswerSchema.parse(rawInput);
  const normalizedQuestionText = normalizeScreeningQuestionText(input.questionText);
  const now = new Date().toISOString();
  const record = await repository.upsert({
    userId,
    questionHash: hashScreeningQuestion(normalizedQuestionText),
    normalizedQuestionText,
    editedAnswer: input.editedAnswer.trim(),
    source: input.source,
    createdAt: now,
    updatedAt: now,
  });
  return publicAnswer(record);
}

export async function deleteSavedScreeningAnswer(input: {
  userId: string;
  questionHash: string;
}, repository: ScreeningAnswerLibraryRepository = postgresRepository): Promise<boolean> {
  if (!/^[a-f0-9]{64}$/i.test(input.questionHash)) return false;
  return repository.delete(input.userId, input.questionHash);
}
