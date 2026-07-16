import type { ScreeningQuestionCandidate } from './screening-question-drafts';
import {
  confirmScreeningControlReview,
  createScreeningQuestionReviewController,
  formatScreeningGenerationUsage,
  insertDraftIntoEmptyScreeningControl,
  screeningQuestionModePolicy,
  type AiGenerationLimitState,
  type SavedScreeningAnswer,
  type ScreeningQuestionDraftResponse,
  type ScreeningQuestionLibraryContext,
  type ScreeningQuestionMode,
  type ScreeningQuestionReviewState,
} from './screening-question-review';

export interface ScreeningQuestionPanelOptions {
  mode: ScreeningQuestionMode;
  candidates: ScreeningQuestionCandidate[];
  requestDraft: (
    candidate: ScreeningQuestionCandidate,
  ) => Promise<ScreeningQuestionDraftResponse>;
  loadContext: (
    candidate: ScreeningQuestionCandidate,
  ) => Promise<ScreeningQuestionLibraryContext>;
  saveAnswer: (
    candidate: ScreeningQuestionCandidate,
    answer: string,
    source: SavedScreeningAnswer['source'],
  ) => Promise<SavedScreeningAnswer | null>;
  deleteAnswer: (questionHash: string) => Promise<boolean>;
}

function button(label: string, primary = false): HTMLButtonElement {
  const element = document.createElement('button');
  element.type = 'button';
  element.textContent = label;
  element.style.cssText = primary
    ? 'min-height:36px;padding:7px 10px;border:0;border-radius:8px;background:var(--tmo-widget-accent);color:#fff;font:inherit;font-size:11.5px;font-weight:800;cursor:pointer;'
    : 'min-height:36px;padding:7px 10px;border:1px solid var(--tmo-widget-border);border-radius:8px;background:var(--tmo-widget-surface);color:var(--tmo-widget-ink);font:inherit;font-size:11.5px;font-weight:750;cursor:pointer;';
  return element;
}

function errorCopy(response?: ScreeningQuestionDraftResponse): string {
  if (response?.error === 'sensitive') {
    return 'This question is sensitive and must be answered manually.';
  }
  if (response?.error === 'limit') {
    return 'Your AI generation limit was reached. Try again after the limit resets.';
  }
  if (response?.error === 'insufficient_context') {
    return 'Generate a custom resume for this job before drafting this answer.';
  }
  return 'We could not create a grounded draft. Please try again.';
}

function statusCopy(state: ScreeningQuestionReviewState): string {
  if (state.status === 'generating') return 'Creating a grounded draft…';
  if (state.status === 'draft_ready') return 'Draft ready — review it before inserting.';
  if (state.status === 'needs_review') return 'Needs your review/edit';
  if (state.status === 'reviewed') return 'Reviewed';
  if (state.status === 'error') return errorCopy(state.response);
  return 'AI will draft only when you choose Generate draft.';
}

const manualInputBindings = new WeakMap<
  HTMLInputElement | HTMLTextAreaElement,
  { notify: (value: string) => void }
>();

function bindManualAnswerInput(
  control: HTMLInputElement | HTMLTextAreaElement,
  notify: (value: string) => void,
): void {
  const existing = manualInputBindings.get(control);
  if (existing) {
    existing.notify = notify;
    return;
  }
  const binding = { notify };
  manualInputBindings.set(control, binding);
  control.addEventListener('input', (event) => {
    if (!event.isTrusted) return;
    binding.notify(control.value.trim());
  });
}

function usageBlock(limits?: AiGenerationLimitState): HTMLElement {
  const copy = document.createElement('div');
  copy.style.cssText = 'flex:1 0 100%;padding:7px 8px;border-radius:7px;background:var(--tmo-widget-surface-2);color:var(--tmo-widget-muted);font-size:10.5px;line-height:1.45;';
  if (!limits) {
    copy.textContent = 'Checking your remaining AI generations…';
    return copy;
  }
  const usage = formatScreeningGenerationUsage(limits);
  copy.textContent = [usage.dailyCopy, usage.itemCopy, usage.blockedCopy]
    .filter(Boolean)
    .join(' ');
  return copy;
}

function renderCandidateCard(
  candidate: ScreeningQuestionCandidate,
  options: ScreeningQuestionPanelOptions,
): HTMLElement {
  const card = document.createElement('div');
  card.style.cssText = 'padding:10px;border:1px solid var(--tmo-widget-border);border-radius:10px;background:var(--tmo-widget-surface);';

  const question = document.createElement('div');
  question.textContent = candidate.questionText;
  question.style.cssText = 'color:var(--tmo-widget-ink);font-size:12px;font-weight:750;line-height:1.4;overflow-wrap:anywhere;';
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.style.cssText = 'margin-top:5px;color:var(--tmo-widget-muted);font-size:11px;line-height:1.4;';
  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;flex-wrap:wrap;gap:7px;margin-top:9px;';
  card.appendChild(question);
  card.appendChild(status);
  card.appendChild(actions);

  let controller: ReturnType<typeof createScreeningQuestionReviewController>;
  let contextLoading = true;
  let savedAnswer: SavedScreeningAnswer | null = null;
  let limits: AiGenerationLimitState | undefined;
  let manualAnswer = '';
  let libraryStatus = '';

  const render = (state: ScreeningQuestionReviewState) => {
    if (state.response?.limits) limits = state.response.limits;
    card.dataset.tmoScreeningActive = contextLoading ||
      Boolean(manualAnswer) ||
      ['generating', 'draft_ready', 'needs_review', 'reviewed'].includes(state.status)
      ? 'true'
      : 'false';
    status.textContent = statusCopy(state);
    status.style.color = state.status === 'needs_review'
      ? '#92400e'
      : state.status === 'reviewed'
        ? '#065f46'
        : state.status === 'error'
          ? '#b91c1c'
          : 'var(--tmo-widget-muted)';
    actions.textContent = '';

    if (state.status === 'eligible' || state.status === 'error') {
      actions.appendChild(usageBlock(limits));
      if (libraryStatus) {
        const libraryCopy = document.createElement('div');
        libraryCopy.textContent = libraryStatus;
        libraryCopy.style.cssText = 'flex:1 0 100%;color:#065f46;font-size:10.5px;font-weight:750;';
        actions.appendChild(libraryCopy);
      }
      if (contextLoading) {
        const checking = button('Checking saved answers…');
        checking.disabled = true;
        checking.setAttribute('aria-busy', 'true');
        actions.appendChild(checking);
        return;
      }
      if (manualAnswer) {
        const saveManual = button(savedAnswer ? 'Update saved answer' : 'Save your answer', true);
        saveManual.addEventListener('click', (event) => {
          if (!event.isTrusted) return;
          saveManual.disabled = true;
          void options.saveAnswer(candidate, manualAnswer, 'user_written').then((answer) => {
            saveManual.disabled = false;
            if (!answer) {
              libraryStatus = 'Could not save this answer.';
            } else {
              savedAnswer = answer;
              libraryStatus = 'Answer saved.';
            }
            render(controller.getState());
          });
        });
        actions.appendChild(saveManual);
        if (savedAnswer) {
          const remove = button('Delete saved answer');
          remove.addEventListener('click', (event) => {
            if (!event.isTrusted) return;
            void options.deleteAnswer(savedAnswer!.questionHash).then((deleted) => {
              if (deleted) savedAnswer = null;
              libraryStatus = deleted ? 'Saved answer deleted.' : 'Could not delete the saved answer.';
              render(controller.getState());
            });
          });
          actions.appendChild(remove);
        }
        return;
      }
      if (savedAnswer) {
        const exactOnly = document.createElement('div');
        exactOnly.textContent = `Matches identical questions only · Last edited ${new Date(savedAnswer.updatedAt).toLocaleDateString()}`;
        exactOnly.style.cssText = 'flex:1 0 100%;color:var(--tmo-widget-muted);font-size:10.5px;line-height:1.4;';
        const savedPreview = document.createElement('div');
        savedPreview.textContent = savedAnswer.editedAnswer;
        savedPreview.style.cssText = 'flex:1 0 100%;max-height:92px;overflow:auto;padding:8px;border:1px solid var(--tmo-widget-border);border-radius:7px;background:var(--tmo-widget-surface-2);color:var(--tmo-widget-ink);font-size:11px;line-height:1.45;white-space:pre-wrap;';
        const useSaved = button('Use your previously edited answer', true);
        useSaved.addEventListener('click', (event) => {
          controller.previewSavedAnswer(
            event.isTrusted ? 'user' : 'automation',
            savedAnswer!,
          );
        });
        const usage = limits ? formatScreeningGenerationUsage(limits) : null;
        const regenerate = button(
          `Regenerate fresh (${limits?.itemRegenerationsRemaining ?? 0} left)`,
        );
        regenerate.disabled = !usage?.canRegenerate;
        regenerate.addEventListener('click', (event) => {
          void controller.requestDraft(event.isTrusted ? 'user' : 'automation');
        });
        const remove = button('Delete saved answer');
        remove.addEventListener('click', (event) => {
          if (!event.isTrusted) return;
          void options.deleteAnswer(savedAnswer!.questionHash).then((deleted) => {
            if (deleted) savedAnswer = null;
            libraryStatus = deleted ? 'Saved answer deleted.' : 'Could not delete the saved answer.';
            render(controller.getState());
          });
        });
        actions.appendChild(exactOnly);
        actions.appendChild(savedPreview);
        actions.appendChild(useSaved);
        actions.appendChild(regenerate);
        actions.appendChild(remove);
        return;
      }
      const usage = limits ? formatScreeningGenerationUsage(limits) : null;
      const generate = button(
        state.status === 'error'
          ? `Regenerate fresh (${limits?.itemRegenerationsRemaining ?? 0} left)`
          : `Generate draft (${limits?.dailyRemaining ?? 0} left today)`,
        true,
      );
      generate.disabled = state.status === 'error'
        ? !usage?.canRegenerate
        : !(limits?.allowed && limits.dailyRemaining > 0);
      generate.addEventListener('click', (event) => {
        void controller.requestDraft(event.isTrusted ? 'user' : 'automation');
      });
      actions.appendChild(generate);
      return;
    }
    if (state.status === 'generating') {
      const waiting = button('Generating…', true);
      waiting.disabled = true;
      waiting.setAttribute('aria-busy', 'true');
      actions.appendChild(waiting);
      return;
    }
    if (state.status === 'draft_ready') {
      actions.appendChild(usageBlock(limits));
      const preview = document.createElement('textarea');
      preview.value = state.response?.draft ?? '';
      preview.setAttribute('aria-label', `Draft answer for: ${candidate.questionText}`);
      preview.rows = 5;
      if (candidate.characterLimit) preview.maxLength = candidate.characterLimit;
      preview.style.cssText = 'width:100%;min-height:104px;resize:vertical;padding:9px;border:1px solid var(--tmo-widget-border);border-radius:8px;background:var(--tmo-widget-surface-2);color:var(--tmo-widget-ink);font:inherit;font-size:11.5px;line-height:1.45;box-sizing:border-box;';
      const insert = button('Insert draft', true);
      insert.addEventListener('click', (event) => {
        controller.insertDraft(
          event.isTrusted ? 'user' : 'automation',
          preview.value,
        );
      });
      actions.appendChild(preview);
      actions.appendChild(insert);
      return;
    }
    if (state.status === 'needs_review') {
      const confirm = button('I reviewed this answer');
      confirm.addEventListener('click', (event) => {
        const origin = event.isTrusted ? 'user' : 'automation';
        if (!confirmScreeningControlReview(candidate.control, origin)) return;
        controller.confirmReview(origin);
      });
      actions.appendChild(confirm);
      return;
    }
    if (state.status === 'reviewed') {
      const save = button(savedAnswer ? 'Update saved answer' : 'Save reviewed answer', true);
      save.addEventListener('click', (event) => {
        if (!event.isTrusted) return;
        const reviewedAnswer = candidate.control.value.trim();
        if (!reviewedAnswer) return;
        save.disabled = true;
        void options.saveAnswer(
          candidate,
          reviewedAnswer,
          'user_edited_ai_draft',
        ).then((answer) => {
          save.disabled = false;
          if (!answer) {
            libraryStatus = 'Could not save this answer.';
          } else {
            savedAnswer = answer;
            libraryStatus = 'Answer saved.';
          }
          render(controller.getState());
        });
      });
      actions.appendChild(save);
      if (libraryStatus) {
        const copy = document.createElement('span');
        copy.textContent = libraryStatus;
        copy.style.cssText = 'align-self:center;color:#065f46;font-size:10.5px;font-weight:750;';
        actions.appendChild(copy);
      }
    }
  };

  controller = createScreeningQuestionReviewController({
    generate: () => options.requestDraft(candidate),
    insert: (draft) => insertDraftIntoEmptyScreeningControl({
      candidate,
      draft,
      origin: 'user',
      onTrustedEdit: () => controller.recordControlInput(true),
    }),
    onStateChange: render,
  });
  controller.surface(options.mode);
  render(controller.getState());
  bindManualAnswerInput(candidate.control, (value) => {
    if (controller.getState().status !== 'eligible') return;
    manualAnswer = value;
    render(controller.getState());
  });
  void options.loadContext(candidate).then((context) => {
    contextLoading = false;
    savedAnswer = context.answer;
    limits = context.limits;
    render(controller.getState());
  }).catch(() => {
    contextLoading = false;
    libraryStatus = 'Saved answers and generation counts are unavailable.';
    render(controller.getState());
  });
  return card;
}

/** Render actions only. No generation or insertion occurs during this call. */
export function renderScreeningQuestionPanel(
  host: HTMLElement,
  options: ScreeningQuestionPanelOptions,
): void {
  const policy = screeningQuestionModePolicy(options.mode);
  if (!policy.surfaceActions) return;
  if (host.querySelector('[data-tmo-screening-active="true"]')) return;

  host.textContent = '';
  if (options.candidates.length === 0) {
    host.style.display = 'none';
    return;
  }
  host.style.display = 'block';

  const heading = document.createElement('div');
  heading.textContent = 'Application questions';
  heading.style.cssText = 'color:var(--tmo-widget-ink);font-size:12.5px;font-weight:800;';
  const note = document.createElement('p');
  note.textContent = options.mode === 'continuous'
    ? 'Continuous mode found questions. Drafts are never generated or inserted automatically.'
    : 'Generate and review each draft before inserting it.';
  note.style.cssText = 'margin:4px 0 9px;color:var(--tmo-widget-muted);font-size:11px;line-height:1.4;';
  const list = document.createElement('div');
  list.style.cssText = 'display:grid;gap:8px;';
  for (const candidate of options.candidates.slice(0, 10)) {
    list.appendChild(renderCandidateCard(candidate, options));
  }
  host.appendChild(heading);
  host.appendChild(note);
  host.appendChild(list);
}
