import type { SavedScreeningAnswer, SavedScreeningAnswerWrite } from './saved-screening-answer-schema';

type DbRow = {
  question_hash: string;
  normalized_question_text: string;
  edited_answer: string;
  source: SavedScreeningAnswer['source'];
  created_at: string;
  updated_at: string;
};

export function toSavedScreeningAnswer(row: DbRow): SavedScreeningAnswer {
  return {
    questionHash: row.question_hash,
    normalizedQuestionText: row.normalized_question_text,
    editedAnswer: row.edited_answer,
    source: row.source,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toUserScopedUpsert(userId: string, answer: SavedScreeningAnswerWrite) {
  return {
    user_id: userId,
    question_hash: answer.questionHash,
    normalized_question_text: answer.normalizedQuestionText,
    edited_answer: answer.editedAnswer,
    source: answer.source,
  };
}

/** Defense in depth for service-role routes: every mutation includes both ownership keys. */
export function ownedAnswerMatch(userId: string, questionHash: string) {
  return { user_id: userId, question_hash: questionHash } as const;
}

