import {
  detectScreeningQuestions,
  normalizeScreeningQuestionText,
  type ScreeningQuestionCandidate,
} from './screening-question-drafts';

export interface AiGenerationLimitState {
  allowed: boolean;
  dailyLimit: number;
  dailyRemaining: number;
  itemRegenerationLimit: number;
  itemRegenerationsRemaining: number;
  resetsAt?: string;
  error?:
    | 'ai_daily_limit_reached'
    | 'ai_item_regeneration_limit_reached'
    | 'ai_rate_limited';
}

export interface ScreeningQuestionDraftResponse {
  ok: boolean;
  questionHash: string;
  draft?: string;
  sourceContentHash?: string;
  error?:
    | 'sensitive'
    | 'insufficient_context'
    | 'limit'
    | 'generation_failed';
  limits?: AiGenerationLimitState;
}

export interface SavedScreeningAnswer {
  questionHash: string;
  normalizedQuestionText: string;
  editedAnswer: string;
  source: 'user_edited_ai_draft' | 'user_written';
  createdAt: string;
  updatedAt: string;
}

export interface ScreeningQuestionLibraryContext {
  answer: SavedScreeningAnswer | null;
  limits?: AiGenerationLimitState;
  exactOnly: true;
}

export interface ScreeningGenerationUsageCopy {
  dailyCopy: string;
  itemCopy: string;
  blockedCopy: string;
  canRegenerate: boolean;
}

export function formatScreeningGenerationUsage(
  limits: AiGenerationLimitState,
): ScreeningGenerationUsageCopy {
  const used = Math.max(
    0,
    limits.itemRegenerationLimit - limits.itemRegenerationsRemaining,
  );
  const blockedCopy = limits.error === 'ai_daily_limit_reached'
    ? 'Your daily AI generation limit was reached.'
    : limits.error === 'ai_item_regeneration_limit_reached' ||
        limits.itemRegenerationsRemaining <= 0
      ? 'This question reached its regeneration limit.'
      : limits.error === 'ai_rate_limited'
        ? 'AI requests are temporarily rate limited. Please wait and try again.'
        : '';
  return {
    dailyCopy: `You have ${Math.max(0, limits.dailyRemaining)} AI generations left today.`,
    itemCopy: `${used} of ${limits.itemRegenerationLimit} regenerations used for this question.`,
    blockedCopy,
    canRegenerate:
      limits.allowed &&
      limits.dailyRemaining > 0 &&
      limits.itemRegenerationsRemaining > 0,
  };
}

export async function hashNormalizedScreeningQuestion(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(normalizeScreeningQuestionText(value));
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');
}

export type ScreeningQuestionReviewStatus =
  | 'eligible'
  | 'generating'
  | 'draft_ready'
  | 'needs_review'
  | 'reviewed'
  | 'error';

export interface ScreeningQuestionReviewState {
  status: ScreeningQuestionReviewStatus;
  response?: ScreeningQuestionDraftResponse;
}

export type ScreeningQuestionActionOrigin = 'user' | 'automation';
export type ScreeningQuestionMode = 'step_by_step' | 'continuous';

export function screeningQuestionModePolicy(_mode: ScreeningQuestionMode): {
  surfaceActions: true;
  autoGenerate: false;
  autoInsert: false;
} {
  return {
    surfaceActions: true,
    autoGenerate: false,
    autoInsert: false,
  };
}

export interface ScreeningQuestionReviewController {
  getState(): ScreeningQuestionReviewState;
  surface(mode: ScreeningQuestionMode): void;
  requestDraft(origin: ScreeningQuestionActionOrigin): Promise<boolean>;
  previewSavedAnswer(
    origin: ScreeningQuestionActionOrigin,
    answer: SavedScreeningAnswer,
  ): boolean;
  insertDraft(origin: ScreeningQuestionActionOrigin, editedDraft?: string): boolean;
  recordControlInput(isTrusted: boolean): void;
  confirmReview(origin: ScreeningQuestionActionOrigin): boolean;
}

export function createScreeningQuestionReviewController(input: {
  generate: () => Promise<ScreeningQuestionDraftResponse>;
  insert: (draft: string) => boolean;
  onStateChange?: (state: ScreeningQuestionReviewState) => void;
}): ScreeningQuestionReviewController {
  let state: ScreeningQuestionReviewState = { status: 'eligible' };
  const publish = (next: ScreeningQuestionReviewState) => {
    state = next;
    input.onStateChange?.(state);
  };

  return {
    getState: () => state,
    surface(mode) {
      // Surfacing is intentionally side-effect free in both modes.
      screeningQuestionModePolicy(mode);
    },
    async requestDraft(origin) {
      if (origin !== 'user' || state.status === 'generating') return false;
      publish({ status: 'generating' });
      let response: ScreeningQuestionDraftResponse;
      try {
        response = await input.generate();
      } catch {
        response = {
          ok: false,
          questionHash: '',
          error: 'generation_failed',
        };
      }
      if (!response.ok || !response.draft?.trim()) {
        publish({ status: 'error', response });
        return false;
      }
      publish({ status: 'draft_ready', response });
      return true;
    },
    previewSavedAnswer(origin, answer) {
      if (origin !== 'user' || state.status === 'generating') return false;
      publish({
        status: 'draft_ready',
        response: {
          ok: true,
          questionHash: answer.questionHash,
          draft: answer.editedAnswer,
        },
      });
      return true;
    },
    insertDraft(origin, editedDraft) {
      if (origin !== 'user' || state.status !== 'draft_ready') return false;
      const draft = (editedDraft ?? state.response?.draft ?? '').trim();
      if (!draft || !input.insert(draft)) return false;
      publish({
        status: 'needs_review',
        response: state.response ? { ...state.response, draft } : undefined,
      });
      return true;
    },
    recordControlInput(isTrusted) {
      if (!isTrusted || state.status !== 'needs_review') return;
      publish({ status: 'reviewed', response: state.response });
    },
    confirmReview(origin) {
      if (origin !== 'user' || state.status !== 'needs_review') return false;
      publish({ status: 'reviewed', response: state.response });
      return true;
    },
  };
}

const REVIEW_STYLE_ID = 'tmo-screening-question-review-style';
const REVIEW_BADGE_CLASS = 'tmo-screening-question-review-badge';
let reviewControlSequence = 0;

function ensureReviewStyle(document: Document): void {
  if (document.getElementById(REVIEW_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = REVIEW_STYLE_ID;
  style.textContent = `
    [data-tmo-screening-review="needs_review"] {
      outline: 3px solid rgba(217, 119, 6, 0.34) !important;
      outline-offset: 2px !important;
    }
    .${REVIEW_BADGE_CLASS} {
      display: block;
      width: fit-content;
      margin-top: 5px;
      padding: 3px 7px;
      border-radius: 999px;
      background: #fffbeb;
      color: #92400e;
      font: 700 11px/1.35 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .${REVIEW_BADGE_CLASS}[data-status="reviewed"] {
      background: #ecfdf5;
      color: #065f46;
    }
  `;
  (document.head || document.documentElement).appendChild(style);
}

function setControlReviewStatus(
  control: HTMLInputElement | HTMLTextAreaElement,
  status: 'needs_review' | 'reviewed',
): void {
  ensureReviewStyle(control.ownerDocument);
  let badgeId = control.dataset.tmoScreeningReviewBadge;
  let badge = badgeId
    ? control.ownerDocument.getElementById(badgeId)
    : null;
  if (!badge) {
    reviewControlSequence += 1;
    badgeId = `tmo-screening-review-${reviewControlSequence}`;
    badge = control.ownerDocument.createElement('span');
    badge.id = badgeId;
    badge.className = REVIEW_BADGE_CLASS;
    badge.setAttribute('role', 'status');
    control.insertAdjacentElement('afterend', badge);
    control.dataset.tmoScreeningReviewBadge = badgeId;
    const describedBy = new Set(
      (control.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean),
    );
    describedBy.add(badgeId);
    control.setAttribute('aria-describedby', [...describedBy].join(' '));
  }
  control.dataset.tmoScreeningReview = status;
  badge.dataset.status = status;
  badge.textContent = status === 'needs_review'
    ? 'Needs your review/edit'
    : 'Reviewed';
}

/**
 * The only DOM insertion path for screening drafts. It re-runs eligibility,
 * requires a trusted UI-origin marker, and refuses non-empty controls.
 */
export function insertDraftIntoEmptyScreeningControl(input: {
  candidate: ScreeningQuestionCandidate;
  draft: string;
  origin: ScreeningQuestionActionOrigin;
  onTrustedEdit: () => void;
}): boolean {
  if (input.origin !== 'user') return false;
  const { control } = input.candidate;
  const draft = input.draft.trim();
  if (!draft || control.value.trim() || control.disabled || control.readOnly) {
    return false;
  }
  if (
    input.candidate.characterLimit &&
    draft.length > input.candidate.characterLimit
  ) {
    return false;
  }
  const stillEligible = detectScreeningQuestions(control.ownerDocument).some(
    (candidate) => candidate.control === control,
  );
  if (!stillEligible) return false;

  const prototype = control instanceof HTMLTextAreaElement
    ? HTMLTextAreaElement.prototype
    : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
  if (setter) setter.call(control, draft);
  else control.value = draft;
  control.dispatchEvent(new Event('input', { bubbles: true }));
  control.dispatchEvent(new Event('change', { bubbles: true }));
  setControlReviewStatus(control, 'needs_review');

  const onInput = (event: Event) => {
    if (!event.isTrusted) return;
    setControlReviewStatus(control, 'reviewed');
    input.onTrustedEdit();
    control.removeEventListener('input', onInput);
  };
  control.addEventListener('input', onInput);
  return true;
}

export function confirmScreeningControlReview(
  control: HTMLInputElement | HTMLTextAreaElement,
  origin: ScreeningQuestionActionOrigin,
): boolean {
  if (
    origin !== 'user' ||
    control.dataset.tmoScreeningReview !== 'needs_review'
  ) {
    return false;
  }
  setControlReviewStatus(control, 'reviewed');
  return true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isLimitState(value: unknown): value is AiGenerationLimitState {
  if (!isRecord(value)) return false;
  return (
    typeof value.allowed === 'boolean' &&
    Number.isInteger(value.dailyLimit) &&
    Number.isInteger(value.dailyRemaining) &&
    Number.isInteger(value.itemRegenerationLimit) &&
    Number.isInteger(value.itemRegenerationsRemaining)
  );
}

export function normalizeSavedScreeningAnswer(
  value: unknown,
): SavedScreeningAnswer | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.questionHash !== 'string' ||
    !/^[a-f0-9]{64}$/i.test(value.questionHash) ||
    typeof value.normalizedQuestionText !== 'string' ||
    value.normalizedQuestionText.length < 1 ||
    value.normalizedQuestionText.length > 2_000 ||
    typeof value.editedAnswer !== 'string' ||
    value.editedAnswer.length < 1 ||
    value.editedAnswer.length > 10_000 ||
    !['user_edited_ai_draft', 'user_written'].includes(String(value.source)) ||
    typeof value.createdAt !== 'string' ||
    !Number.isFinite(Date.parse(value.createdAt)) ||
    typeof value.updatedAt !== 'string' ||
    !Number.isFinite(Date.parse(value.updatedAt))
  ) {
    return null;
  }
  return {
    questionHash: value.questionHash,
    normalizedQuestionText: value.normalizedQuestionText,
    editedAnswer: value.editedAnswer,
    source: value.source as SavedScreeningAnswer['source'],
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

export function normalizeScreeningQuestionLibraryContext(
  value: unknown,
): ScreeningQuestionLibraryContext {
  if (!isRecord(value) || value.ok !== true || value.exactOnly !== true) {
    return { answer: null, exactOnly: true };
  }
  return {
    answer: normalizeSavedScreeningAnswer(value.answer),
    ...(isLimitState(value.limits) ? { limits: value.limits } : {}),
    exactOnly: true,
  };
}

export function normalizeScreeningQuestionDraftResponse(
  value: unknown,
): ScreeningQuestionDraftResponse {
  if (!isRecord(value)) {
    return { ok: false, questionHash: '', error: 'generation_failed' };
  }
  const questionHash =
    typeof value.questionHash === 'string' && /^[a-f0-9]{64}$/i.test(value.questionHash)
      ? value.questionHash
      : '';
  const draft = typeof value.draft === 'string' && value.draft.length <= 10_000
    ? value.draft
    : undefined;
  const sourceContentHash =
    typeof value.sourceContentHash === 'string' &&
    /^[a-f0-9]{64}$/i.test(value.sourceContentHash)
      ? value.sourceContentHash
      : undefined;
  const allowedErrors = new Set([
    'sensitive',
    'insufficient_context',
    'limit',
    'generation_failed',
  ]);
  const error = typeof value.error === 'string' && allowedErrors.has(value.error)
    ? value.error as ScreeningQuestionDraftResponse['error']
    : undefined;
  return {
    ok: value.ok === true && Boolean(questionHash && draft && sourceContentHash),
    questionHash,
    ...(draft ? { draft } : {}),
    ...(sourceContentHash ? { sourceContentHash } : {}),
    ...(error ? { error } : {}),
    ...(isLimitState(value.limits) ? { limits: value.limits } : {}),
  };
}
