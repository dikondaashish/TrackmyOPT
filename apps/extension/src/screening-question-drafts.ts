import { classifyField, SENSITIVE_FIELD_RE } from './easy-apply-matchers';

export const SCREENING_QUESTION_MAX_CHARS = 2_000;

const ADDITIONAL_SENSITIVE_QUESTION_RE =
  /\b(demographic|protected class|national origin|security clearance)\b/i;
const DETERMINISTIC_HISTORY_EDUCATION_RE =
  /^(?:current |previous |most recent )?(?:company|employer(?: name)?|job title|position title|start date|end date|school|university|college|degree|field of study|graduation date)$/i;
const SCREENING_PROMPT_RE =
  /\b(?:why|describe|tell us|explain|what (?:interests|motivates|makes)|how (?:does|would|have|can)|give (?:an example|examples)|provide (?:an example|examples)|relevant project)\b/i;
const COVER_LETTER_PROMPT_RE = /\b(?:cover letter|letter of interest)\b/i;

export interface ScreeningQuestionState {
  questionText: string;
  value: string;
  visible: boolean;
  disabled: boolean;
  readOnly: boolean;
  characterLimit?: number;
}

export type ScreeningQuestionEligibility =
  | {
      eligible: true;
      questionText: string;
      characterLimit?: number;
    }
  | {
      eligible: false;
      reason:
        | 'sensitive'
        | 'deterministic'
        | 'unavailable'
        | 'already_filled'
        | 'not_screening_question';
    };

export interface ScreeningQuestionCandidate {
  control: HTMLInputElement | HTMLTextAreaElement;
  questionText: string;
  characterLimit?: number;
}

export function normalizeScreeningQuestionText(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

/** Sensitive-first pure eligibility gate shared by detection and insertion. */
export function evaluateScreeningQuestion(
  state: ScreeningQuestionState,
): ScreeningQuestionEligibility {
  const questionText = normalizeScreeningQuestionText(state.questionText)
    .slice(0, SCREENING_QUESTION_MAX_CHARS);
  if (!questionText) return { eligible: false, reason: 'not_screening_question' };

  // Rule 6 must run before deterministic or essay eligibility checks.
  if (
    SENSITIVE_FIELD_RE.test(questionText) ||
    ADDITIONAL_SENSITIVE_QUESTION_RE.test(questionText)
  ) {
    return { eligible: false, reason: 'sensitive' };
  }

  if (
    classifyField(questionText) !== null ||
    DETERMINISTIC_HISTORY_EDUCATION_RE.test(questionText)
  ) {
    return { eligible: false, reason: 'deterministic' };
  }

  if (!state.visible || state.disabled || state.readOnly) {
    return { eligible: false, reason: 'unavailable' };
  }
  if (state.value.trim()) return { eligible: false, reason: 'already_filled' };
  if (
    COVER_LETTER_PROMPT_RE.test(questionText) ||
    !SCREENING_PROMPT_RE.test(questionText)
  ) {
    return { eligible: false, reason: 'not_screening_question' };
  }

  const characterLimit = Number.isInteger(state.characterLimit) &&
    (state.characterLimit ?? 0) > 0
    ? state.characterLimit
    : undefined;
  return {
    eligible: true,
    questionText,
    ...(characterLimit ? { characterLimit } : {}),
  };
}

function isVisible(control: HTMLElement): boolean {
  if (
    !control.isConnected ||
    control.hidden ||
    control.getAttribute('aria-hidden') === 'true'
  ) return false;
  const view = control.ownerDocument.defaultView;
  if (!view) return false;
  const style = view.getComputedStyle(control);
  if (
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    style.opacity === '0'
  ) return false;
  const rect = control.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function questionTextForControl(
  control: HTMLInputElement | HTMLTextAreaElement,
): string {
  const parts: string[] = [];
  const push = (value: string | null | undefined) => {
    const normalized = normalizeScreeningQuestionText(value ?? '');
    if (normalized && !parts.includes(normalized)) parts.push(normalized);
  };

  push(control.getAttribute('aria-label'));
  for (const label of Array.from(control.labels ?? [])) push(label.textContent);
  const labelledBy = control.getAttribute('aria-labelledby')
    ?.split(/\s+/)
    .filter(Boolean) ?? [];
  for (const id of labelledBy) push(control.ownerDocument.getElementById(id)?.textContent);
  push(control.closest('fieldset')?.querySelector('legend')?.textContent);
  push(control.getAttribute('placeholder'));
  return normalizeScreeningQuestionText(parts.join(' '));
}

/** Browser adapter: detection only. It never generates or inserts text. */
export function detectScreeningQuestions(
  root: ParentNode = document,
): ScreeningQuestionCandidate[] {
  const controls = Array.from(
    root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      'textarea, input[type="text"]',
    ),
  );
  const candidates: ScreeningQuestionCandidate[] = [];

  for (const control of controls) {
    const characterLimit = control.maxLength > 0 ? control.maxLength : undefined;
    const result = evaluateScreeningQuestion({
      questionText: questionTextForControl(control),
      value: control.value,
      visible: isVisible(control),
      disabled: control.disabled,
      readOnly: control.readOnly,
      characterLimit,
    });
    if (!result.eligible) continue;
    candidates.push({
      control,
      questionText: result.questionText,
      ...(result.characterLimit ? { characterLimit: result.characterLimit } : {}),
    });
  }

  return candidates;
}
