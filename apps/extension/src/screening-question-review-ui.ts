import {
  confirmDraftReview,
  createDraftReviewState,
  insertScreeningDraft,
  type DraftReviewState,
  type EligibleScreeningQuestion,
  type SavedScreeningAnswer,
} from './screening-question-drafts';

export interface ScreeningDraftLimits {
  dailyRemaining: number;
  itemRegenerationsRemaining: number;
  itemRegenerationLimit: number;
}

export interface ScreeningDraftResult {
  draft: string;
  limits: ScreeningDraftLimits;
}

export interface ScreeningQuestionReviewOptions {
  question: EligibleScreeningQuestion;
  limits: ScreeningDraftLimits;
  savedAnswer?: SavedScreeningAnswer;
  generateDraft(regenerate: boolean): Promise<ScreeningDraftResult>;
  onReviewed(answer: string): void;
  onDeleteSavedAnswer?: (questionHash: string) => Promise<void>;
}

function button(label: string): HTMLButtonElement {
  const element = document.createElement('button');
  element.type = 'button';
  element.textContent = label;
  return element;
}

/**
 * Builds the review surface only. Detection remains separate from classifyField(),
 * and neither generation nor insertion happens until its explicit button is used.
 */
export function createScreeningQuestionReviewUI(
  options: ScreeningQuestionReviewOptions,
): HTMLElement {
  const root = document.createElement('section');
  root.className = 'tmo-screening-question-review';
  root.dataset.questionHash = options.question.questionHash;

  const heading = document.createElement('strong');
  heading.textContent = options.question.normalizedQuestionText;
  const usage = document.createElement('p');
  const preview = document.createElement('textarea');
  preview.readOnly = false;
  preview.hidden = true;
  preview.setAttribute('aria-label', 'AI draft preview');
  const status = document.createElement('p');
  status.setAttribute('role', 'status');

  let limits = options.limits;
  let selectedDraft = '';
  let insertedValue = '';
  let reviewState: DraftReviewState | null = null;
  const renderUsage = () => {
    usage.textContent = `You have ${limits.dailyRemaining} AI generations left today. ${limits.itemRegenerationsRemaining} of ${limits.itemRegenerationLimit} regenerations remaining.`;
  };
  renderUsage();

  const insert = button('Insert draft');
  insert.hidden = true;
  const confirm = button('Confirm reviewed');
  confirm.hidden = true;
  insert.addEventListener('click', () => {
    if (!selectedDraft || !insertScreeningDraft(options.question, selectedDraft)) {
      status.textContent = 'The answer field must be empty before inserting.';
      return;
    }
    insertedValue = selectedDraft;
    reviewState = createDraftReviewState(selectedDraft);
    status.textContent = 'Needs your review/edit';
    status.dataset.reviewState = 'needs-review';
    confirm.hidden = false;
  });
  confirm.addEventListener('click', () => {
    if (!reviewState?.needsReview) return;
    const current = options.question.element?.value ?? insertedValue;
    if (!current.trim()) return;
    reviewState = confirmDraftReview(reviewState, current);
    status.textContent = 'Reviewed and confirmed';
    status.dataset.reviewState = 'reviewed';
    confirm.hidden = true;
    options.onReviewed(reviewState.text);
  });

  const showDraft = (draft: string) => {
    selectedDraft = draft;
    preview.value = draft;
    preview.hidden = false;
    insert.hidden = false;
    status.textContent = 'Review this draft before inserting it.';
  };

  const requestDraft = async (regenerate: boolean) => {
    if (limits.dailyRemaining <= 0 || (regenerate && limits.itemRegenerationsRemaining <= 0)) {
      status.textContent = 'AI generation limit reached.';
      return;
    }
    const result = await options.generateDraft(regenerate);
    limits = result.limits;
    renderUsage();
    showDraft(result.draft);
  };

  const generate = button('Generate draft');
  generate.addEventListener('click', () => void requestDraft(false));
  root.append(heading, usage, generate);

  if (options.savedAnswer) {
    const reuse = button('Use your previously edited answer');
    reuse.addEventListener('click', () => showDraft(options.savedAnswer!.editedAnswer));
    const regenerate = button(
      `Regenerate fresh (${limits.itemRegenerationsRemaining} remaining)`,
    );
    regenerate.addEventListener('click', () => void requestDraft(true));
    root.append(reuse, regenerate);
    if (options.onDeleteSavedAnswer) {
      const remove = button('Delete saved answer');
      remove.addEventListener('click', async () => {
        await options.onDeleteSavedAnswer!(options.question.questionHash);
        reuse.remove();
        remove.remove();
      });
      root.append(remove);
    }
  }

  root.append(preview, insert, confirm, status);

  options.question.element?.addEventListener('input', (event) => {
    if (!event.isTrusted || status.dataset.reviewState !== 'needs-review') return;
    const current = options.question.element?.value ?? '';
    if (!current || current === insertedValue) return;
    reviewState = confirmDraftReview(
      reviewState ?? createDraftReviewState(insertedValue),
      current
    );
    status.textContent = 'Reviewed and edited';
    status.dataset.reviewState = 'reviewed';
    confirm.hidden = true;
    options.onReviewed(reviewState.text);
  });

  return root;
}
