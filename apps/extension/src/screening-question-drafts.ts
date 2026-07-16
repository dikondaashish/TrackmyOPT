import { classifyField, SENSITIVE_FIELD_RE, normalizeFieldSignal, type FieldKind } from './easy-apply-matchers';

export interface ScreeningQuestionControl {
  label: string;
  value?: string;
  hidden?: boolean;
  disabled?: boolean;
  kind?: FieldKind | null;
  element?: HTMLTextAreaElement | HTMLInputElement;
  characterLimit?: number;
}

export interface EligibleScreeningQuestion extends ScreeningQuestionControl {
  normalizedQuestionText: string;
  questionHash: string;
}

const NON_SCREENING = new Set<FieldKind>([
  'email','phone','firstName','lastName','fullName','city','state','location',
  'yearsExperience','linkedinUrl','portfolioUrl','skills',
]);

export function normalizeQuestionText(text: string): string {
  return text.normalize('NFKC').trim().replace(/\s+/g, ' ');
}

/** SHA-256 is intentionally async so the browser implementation uses WebCrypto. */
export async function questionHash(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(normalizeQuestionText(text));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function detectScreeningQuestion(control: ScreeningQuestionControl): Promise<EligibleScreeningQuestion | null> {
  const normalized = normalizeQuestionText(control.label || '');
  if (!normalized || control.hidden || control.disabled || (control.value || '').trim()) return null;
  if (SENSITIVE_FIELD_RE.test(normalizeFieldSignal(normalized))) return null;
  const kind = control.kind === undefined ? classifyField(normalized) : control.kind;
  if (kind && NON_SCREENING.has(kind)) return null;
  return { ...control, normalizedQuestionText: normalized, questionHash: await questionHash(normalized) };
}

export function insertScreeningDraft(control: ScreeningQuestionControl, draft: string): boolean {
  if (!draft.trim() || control.hidden || control.disabled || (control.value || '').trim()) return false;
  if (control.element) {
    control.element.value = draft;
    control.element.dispatchEvent(new Event('input', { bubbles: true }));
    control.element.dispatchEvent(new Event('change', { bubbles: true }));
  }
  control.value = draft;
  return true;
}

export interface DraftReviewState { text: string; needsReview: boolean; confirmed: boolean; }
export function createDraftReviewState(text: string): DraftReviewState {
  return { text, needsReview: true, confirmed: false };
}
export function confirmDraftReview(state: DraftReviewState, editedText?: string): DraftReviewState {
  return { text: editedText ?? state.text, needsReview: false, confirmed: true };
}

export interface SavedScreeningAnswer {
  questionHash: string;
  normalizedQuestionText: string;
  editedAnswer: string;
  source: 'user_edited_ai_draft' | 'user_written';
  createdAt: string;
  updatedAt: string;
}
export function findExactSavedAnswer(questionText: string, answers: SavedScreeningAnswer[]): SavedScreeningAnswer | undefined {
  const normalized = normalizeQuestionText(questionText);
  return answers.find((answer) => answer.normalizedQuestionText === normalized);
}
