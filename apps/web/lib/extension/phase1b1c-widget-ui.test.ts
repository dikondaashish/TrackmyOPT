import { describe, expect, it, vi } from 'vitest';
import { createScreeningQuestionReviewUI } from '../../../extension/src/screening-question-review-ui';
import { CoverLetterReviewController } from '../../../extension/src/cover-letter-review';

describe('screening-question review DOM', () => {
  it('never inserts generated text before the explicit Insert draft action', async () => {
    const field = document.createElement('textarea');
    const generateDraft = vi.fn().mockResolvedValue({
      draft: 'Grounded draft',
      limits: { dailyRemaining: 24, itemRegenerationsRemaining: 3, itemRegenerationLimit: 3 },
    });
    const root = createScreeningQuestionReviewUI({
      question: {
        label: 'Why this role?',
        normalizedQuestionText: 'Why this role?',
        questionHash: 'a'.repeat(64),
        element: field,
        value: '',
      },
      limits: { dailyRemaining: 25, itemRegenerationsRemaining: 3, itemRegenerationLimit: 3 },
      generateDraft,
      onReviewed: vi.fn(),
    });
    document.body.append(root, field);

    expect(field.value).toBe('');
    (Array.from(root.querySelectorAll('button')).find((button) => button.textContent === 'Generate draft') as HTMLButtonElement).click();
    await vi.waitFor(() => expect(generateDraft).toHaveBeenCalledOnce());
    expect(field.value).toBe('');
    expect(root.textContent).toContain('Review this draft before inserting it.');

    (Array.from(root.querySelectorAll('button')).find((button) => button.textContent === 'Insert draft') as HTMLButtonElement).click();
    expect(field.value).toBe('Grounded draft');
    expect(root.querySelector('[data-review-state="needs-review"]')?.textContent)
      .toBe('Needs your review/edit');
  });

  it('does not clear Needs review for an untrusted synthetic event', async () => {
    const field = document.createElement('textarea');
    const reviewed = vi.fn();
    const root = createScreeningQuestionReviewUI({
      question: {
        label: 'Why this role?', normalizedQuestionText: 'Why this role?',
        questionHash: 'b'.repeat(64), element: field, value: '',
      },
      limits: { dailyRemaining: 25, itemRegenerationsRemaining: 3, itemRegenerationLimit: 3 },
      generateDraft: async () => ({
        draft: 'Draft',
        limits: { dailyRemaining: 24, itemRegenerationsRemaining: 3, itemRegenerationLimit: 3 },
      }),
      onReviewed: reviewed,
    });
    document.body.append(root, field);
    (Array.from(root.querySelectorAll('button')).find((button) => button.textContent === 'Generate draft') as HTMLButtonElement).click();
    await vi.waitFor(() => expect(root.textContent).toContain('Review this draft'));
    (Array.from(root.querySelectorAll('button')).find((button) => button.textContent === 'Insert draft') as HTMLButtonElement).click();
    field.value = 'Synthetic edit';
    field.dispatchEvent(new Event('input', { bubbles: true }));

    expect(reviewed).not.toHaveBeenCalled();
    expect(root.querySelector('[data-review-state="needs-review"]')).not.toBeNull();
  });
});

describe('cover-letter edit controller', () => {
  it('invalidates the old attachment before recompilation and installs the new hash-locked result', async () => {
    const order: string[] = [];
    const attachment = {
      filename: 'cover-letter.pdf', base64: 'JVBERi0xLjQK', sha256: 'b'.repeat(64),
      generatedAt: '2026-07-16T12:00:00.000Z', sourceContentHash: 'a'.repeat(64),
    };
    const controller = new CoverLetterReviewController({
      generate: vi.fn(),
      invalidateCurrent: () => order.push('invalidated'),
      recompile: async () => {
        order.push('recompiled');
        return { ok: true, attachment, draftText: 'Edited' };
      },
    });
    controller.state = {
      ...controller.state,
      phase: 'review',
      attachment,
      draftText: 'Original',
    };

    controller.beginEdit();
    await controller.saveEdit('Edited');

    expect(order).toEqual(['invalidated', 'recompiled']);
    expect(controller.state.phase).toBe('review');
    expect(controller.state.attachment?.sourceContentHash).toBe('a'.repeat(64));
  });
});
