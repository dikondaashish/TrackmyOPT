import { describe, expect, it, vi } from 'vitest';
import { createScreeningQuestionReviewUI } from '../../../extension/src/screening-question-review-ui';
import { CoverLetterReviewController } from '../../../extension/src/cover-letter-review';
import { attachGeneratedCoverLetter } from '../../../extension/src/easy-apply-engine';

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

  it('never attaches a cover letter to Resume/CV or other document inputs', () => {
    const originalDataTransfer = globalThis.DataTransfer;
    class FakeDataTransfer {
      files: File[] = [];
      items = { add: (file: File) => { this.files.push(file); } };
    }
    Object.defineProperty(globalThis, 'DataTransfer', { value: FakeDataTransfer, configurable: true });
    const form = document.createElement('form');
    form.innerHTML = [
      '<label for="resume">Resume/CV</label><input id="resume" type="file" accept="application/pdf">',
      '<label for="transcript">Transcript</label><input id="transcript" type="file" accept="application/pdf">',
    ].join('');
    document.body.appendChild(form);
    const result = attachGeneratedCoverLetter(form, {
      filename: 'cover-letter.pdf', base64: 'JVBERi0xLjQK', sha256: 'b'.repeat(64),
      generatedAt: '2026-07-16T12:00:00.000Z', sourceContentHash: 'a'.repeat(64),
    }, 'a'.repeat(64));

    expect(result).toBe('not_found');
    expect((form.querySelector('#resume') as HTMLInputElement).files?.length).toBe(0);
    expect((form.querySelector('#transcript') as HTMLInputElement).files?.length).toBe(0);
    Object.defineProperty(globalThis, 'DataTransfer', { value: originalDataTransfer, configurable: true });
  });

  it('rejects a cover letter whose source hash differs from the active resume', () => {
    const form = document.createElement('form');
    form.innerHTML =
      '<label for="cover">Cover letter</label><input id="cover" type="file" accept="application/pdf">';
    const result = attachGeneratedCoverLetter(
      form,
      {
        filename: 'cover-letter.pdf',
        base64: 'JVBERi0xLjQK',
        sha256: 'b'.repeat(64),
        generatedAt: '2026-07-16T12:00:00.000Z',
        sourceContentHash: 'a'.repeat(64),
      },
      'c'.repeat(64),
    );

    expect(result).toBe('source_mismatch');
    expect((form.querySelector('#cover') as HTMLInputElement).files?.length)
      .toBe(0);
  });

  it('attaches a hash-matched cover letter only to an empty cover-letter input', () => {
    const originalDataTransfer = globalThis.DataTransfer;
    class FakeDataTransfer {
      files: File[] = [];
      items = { add: (file: File) => { this.files.push(file); } };
    }
    Object.defineProperty(globalThis, 'DataTransfer', {
      value: FakeDataTransfer,
      configurable: true,
    });
    const form = document.createElement('form');
    form.innerHTML = [
      '<label for="resume-positive">Resume/CV</label><input id="resume-positive" type="file" accept="application/pdf">',
      '<label for="cover-positive">Cover letter</label><input id="cover-positive" type="file" accept="application/pdf">',
    ].join('');
    const coverInput = form.querySelector(
      '#cover-positive',
    ) as HTMLInputElement;
    Object.defineProperty(coverInput, 'files', {
      value: [],
      writable: true,
      configurable: true,
    });
    const sourceContentHash = 'a'.repeat(64);
    const result = attachGeneratedCoverLetter(
      form,
      {
        filename: 'cover-letter.pdf',
        base64: 'JVBERi0xLjQK',
        sha256: 'b'.repeat(64),
        generatedAt: '2026-07-16T12:00:00.000Z',
        sourceContentHash,
      },
      sourceContentHash,
    );

    expect(result).toBe('attached');
    expect(coverInput.files?.length).toBe(1);
    expect(
      (form.querySelector('#resume-positive') as HTMLInputElement).files?.length,
    ).toBe(0);
    Object.defineProperty(globalThis, 'DataTransfer', {
      value: originalDataTransfer,
      configurable: true,
    });
  });

  it('lets an unedited draft leave needs-review only through Confirm reviewed', async () => {
    const field = document.createElement('textarea');
    const reviewed = vi.fn();
    const root = createScreeningQuestionReviewUI({
      question: {
        label: 'Why this role?',
        normalizedQuestionText: 'Why this role?',
        questionHash: 'c'.repeat(64),
        element: field,
        value: '',
      },
      limits: {
        dailyRemaining: 25,
        itemRegenerationsRemaining: 3,
        itemRegenerationLimit: 3,
      },
      generateDraft: async () => ({
        draft: 'Confirmed draft',
        limits: {
          dailyRemaining: 24,
          itemRegenerationsRemaining: 3,
          itemRegenerationLimit: 3,
        },
      }),
      onReviewed: reviewed,
    });
    document.body.append(root, field);

    const findButton = (label: string) =>
      Array.from(root.querySelectorAll('button')).find(
        (candidate) => candidate.textContent === label,
      ) as HTMLButtonElement;
    findButton('Generate draft').click();
    await vi.waitFor(() =>
      expect(root.textContent).toContain('Review this draft'),
    );
    findButton('Insert draft').click();

    expect(reviewed).not.toHaveBeenCalled();
    expect(root.querySelector('[data-review-state="needs-review"]')).not.toBeNull();
    findButton('Confirm reviewed').click();
    expect(reviewed).toHaveBeenCalledWith('Confirmed draft');
    expect(root.querySelector('[data-review-state="reviewed"]')?.textContent)
      .toBe('Reviewed and confirmed');
  });
});
