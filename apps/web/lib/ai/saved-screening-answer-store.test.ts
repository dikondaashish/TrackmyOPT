import { describe, expect, it } from 'vitest';
import { SavedScreeningAnswerWriteSchema } from './saved-screening-answer-schema';
import { ownedAnswerMatch, toUserScopedUpsert } from './saved-screening-answer-store';

const answer = {
  questionHash: 'a'.repeat(64),
  normalizedQuestionText: 'Why this role?',
  editedAnswer: 'Because my validated experience matches the work.',
  source: 'user_edited_ai_draft' as const,
};

describe('saved screening answer ownership and bounds', () => {
  it('prevents one authenticated user from reading or writing another user answer scope', () => {
    expect(ownedAnswerMatch('user-a', answer.questionHash)).toEqual({
      user_id: 'user-a',
      question_hash: answer.questionHash,
    });
    expect(toUserScopedUpsert('user-b', answer).user_id).toBe('user-b');
    expect(ownedAnswerMatch('user-b', answer.questionHash)).not.toEqual(
      ownedAnswerMatch('user-a', answer.questionHash),
    );
  });

  it('rejects oversized question and answer text', () => {
    expect(SavedScreeningAnswerWriteSchema.safeParse({
      ...answer,
      normalizedQuestionText: 'q'.repeat(2_001),
    }).success).toBe(false);
    expect(SavedScreeningAnswerWriteSchema.safeParse({
      ...answer,
      editedAnswer: 'a'.repeat(8_001),
    }).success).toBe(false);
  });
});
