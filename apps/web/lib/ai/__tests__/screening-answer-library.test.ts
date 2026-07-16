import { describe, expect, it } from 'vitest';

import {
  deleteSavedScreeningAnswer,
  findSavedScreeningAnswer,
  saveScreeningAnswer,
  type ScreeningAnswerLibraryRecord,
  type ScreeningAnswerLibraryRepository,
} from '../screening-answer-library';

class MemoryLibrary implements ScreeningAnswerLibraryRepository {
  records = new Map<string, ScreeningAnswerLibraryRecord>();

  async find(userId: string, questionHash: string) {
    return this.records.get(`${userId}:${questionHash}`) ?? null;
  }

  async upsert(record: ScreeningAnswerLibraryRecord) {
    const now = '2026-07-16T12:00:00.000Z';
    const stored = {
      ...record,
      createdAt: this.records.get(`${record.userId}:${record.questionHash}`)?.createdAt ?? now,
      updatedAt: now,
    };
    this.records.set(`${record.userId}:${record.questionHash}`, stored);
    return stored;
  }

  async delete(userId: string, questionHash: string) {
    return this.records.delete(`${userId}:${questionHash}`);
  }
}

describe('screening answer library', () => {
  it('reuses only the exact question after trim and whitespace collapse', async () => {
    const repository = new MemoryLibrary();
    await saveScreeningAnswer({
      questionText: 'Why do you want to work here?',
      editedAnswer: 'My reviewed answer.',
      source: 'user_edited_ai_draft',
    }, 'user-a', repository);

    await expect(findSavedScreeningAnswer({
      userId: 'user-a',
      questionText: '  Why do  you want to work here?\n',
    }, repository)).resolves.toMatchObject({ editedAnswer: 'My reviewed answer.' });

    await expect(findSavedScreeningAnswer({
      userId: 'user-a',
      questionText: 'Why are you interested in this role?',
    }, repository)).resolves.toBeNull();
  });

  it('keeps records user-scoped and supports explicit deletion', async () => {
    const repository = new MemoryLibrary();
    const saved = await saveScreeningAnswer({
      questionText: 'Describe a relevant project.',
      editedAnswer: 'A bounded reviewed response.',
      source: 'user_written',
    }, 'user-a', repository);

    await expect(findSavedScreeningAnswer({
      userId: 'user-b',
      questionText: 'Describe a relevant project.',
    }, repository)).resolves.toBeNull();
    await expect(deleteSavedScreeningAnswer({
      userId: 'user-a',
      questionHash: saved.questionHash,
    }, repository)).resolves.toBe(true);
    await expect(findSavedScreeningAnswer({
      userId: 'user-a',
      questionText: 'Describe a relevant project.',
    }, repository)).resolves.toBeNull();
  });

  it('rejects oversized question and answer payloads', async () => {
    const repository = new MemoryLibrary();
    await expect(saveScreeningAnswer({
      questionText: 'Q'.repeat(2_001),
      editedAnswer: 'Answer',
      source: 'user_written',
    }, 'user-a', repository)).rejects.toThrow();
    await expect(saveScreeningAnswer({
      questionText: 'Why this role?',
      editedAnswer: 'A'.repeat(10_001),
      source: 'user_written',
    }, 'user-a', repository)).rejects.toThrow();
  });
});
