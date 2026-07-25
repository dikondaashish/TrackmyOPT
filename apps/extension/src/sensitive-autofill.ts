export interface SensitiveAnswerSession {
  confirmed: boolean;
  workAuthorization?: 'yes' | 'no';
  requiresSponsorship?: 'yes' | 'no';
  visaStatus?: string;
  citizenship?: string;
  salaryExpectation?: string;
  dateOfBirth?: string;
  eeoPreference?: 'prefer_not_to_answer';
}

export type SensitiveAnswerKind =
  | 'workAuthorization'
  | 'requiresSponsorship'
  | 'visaStatus'
  | 'citizenship'
  | 'salaryExpectation'
  | 'dateOfBirth'
  | 'eeoPreference';

function boundedText(value: unknown, max: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  const text = value.trim().slice(0, max);
  return text || undefined;
}

/** Strictly normalize the ephemeral top-frame -> child-frame relay payload. */
export function normalizeSensitiveAnswerSession(
  value: unknown
): SensitiveAnswerSession | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  if (candidate.confirmed !== true) return null;
  const yesNo = (answer: unknown): 'yes' | 'no' | undefined =>
    answer === 'yes' || answer === 'no' ? answer : undefined;
  const workAuthorization = yesNo(candidate.workAuthorization);
  const requiresSponsorship = yesNo(candidate.requiresSponsorship);
  const visaStatus = boundedText(candidate.visaStatus, 120);
  const citizenship = boundedText(candidate.citizenship, 120);
  const salaryExpectation = boundedText(candidate.salaryExpectation, 200);
  const dateOfBirth =
    typeof candidate.dateOfBirth === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(candidate.dateOfBirth)
      ? candidate.dateOfBirth
      : undefined;
  return {
    confirmed: true,
    ...(workAuthorization ? { workAuthorization } : {}),
    ...(requiresSponsorship ? { requiresSponsorship } : {}),
    ...(visaStatus ? { visaStatus } : {}),
    ...(citizenship ? { citizenship } : {}),
    ...(salaryExpectation ? { salaryExpectation } : {}),
    ...(dateOfBirth ? { dateOfBirth } : {}),
    ...(candidate.eeoPreference === 'prefer_not_to_answer'
      ? { eeoPreference: 'prefer_not_to_answer' as const }
      : {}),
  };
}

const SPONSORSHIP_RE = /\b(?:sponsor|sponsorship|future visa support)\b/i;
const WORK_AUTH_RE =
  /\b(?:work authori[sz]\w*|authori[sz]\w* to work|work permit|eligib\w* to work)\b/i;
const VISA_RE = /\b(?:visa|immigration status)\b/i;
const CITIZENSHIP_RE = /\b(?:citizen\w*|citizenship)\b/i;
const SALARY_RE =
  /\b(?:salary|compensation|expected pay|desired pay|pay expectation)\b/i;
const DOB_RE = /\b(?:date of birth|birth date|dob)\b/i;
const EEO_RE =
  /\b(?:eeo|equal opportunity|race|ethnic\w*|gender|sex|veteran\w*|disab\w*)\b/i;

export function classifySensitiveAnswer(label: string): SensitiveAnswerKind | null {
  const signal = label
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[\[\]_.:/\\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (SPONSORSHIP_RE.test(signal)) return 'requiresSponsorship';
  if (WORK_AUTH_RE.test(signal)) return 'workAuthorization';
  if (CITIZENSHIP_RE.test(signal)) return 'citizenship';
  if (VISA_RE.test(signal)) return 'visaStatus';
  if (SALARY_RE.test(signal)) return 'salaryExpectation';
  if (DOB_RE.test(signal)) return 'dateOfBirth';
  if (EEO_RE.test(signal)) return 'eeoPreference';
  return null;
}

function labelFor(element: HTMLElement): string {
  const parts = [
    element.getAttribute('aria-label'),
    element.getAttribute('name'),
    element.getAttribute('id'),
    element.closest('label')?.textContent,
    element.closest('fieldset')?.querySelector('legend')?.textContent,
  ];
  if (element.id) {
    const escapedId =
      typeof CSS !== 'undefined' && CSS.escape
        ? CSS.escape(element.id)
        : element.id.replace(/["\\]/g, '\\$&');
    parts.push(document.querySelector(`label[for="${escapedId}"]`)?.textContent);
  }
  return parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

function answerFor(
  kind: SensitiveAnswerKind,
  answers: SensitiveAnswerSession
): string | undefined {
  return answers[kind];
}

function dispatchValueEvents(element: HTMLElement): void {
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

function visiblyAvailable(element: HTMLElement): boolean {
  if (
    element.hidden ||
    element.getAttribute('aria-hidden') === 'true' ||
    element.getAttribute('aria-disabled') === 'true'
  ) {
    return false;
  }
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') return false;
  const isJsdom =
    /jsdom/i.test(element.ownerDocument.defaultView?.navigator.userAgent || '');
  return isJsdom || element.getClientRects().length > 0;
}

function normalized(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function optionMatches(option: HTMLOptionElement, answer: string): boolean {
  const optionText = normalized(`${option.value} ${option.textContent || ''}`);
  if (answer === 'yes') return /^(?:yes|y|true|1)(?: |$)/.test(optionText);
  if (answer === 'no') return /^(?:no|n|false|0)(?: |$)/.test(optionText);
  if (answer === 'prefer_not_to_answer') {
    return /\b(?:prefer not|decline|do not wish|choose not|not disclose)\b/.test(
      optionText
    );
  }
  const expected = normalized(answer);
  return (
    normalized(option.value) === expected ||
    normalized(option.textContent || '') === expected
  );
}

function fillSelect(select: HTMLSelectElement, answer: string): boolean {
  if (select.value) return false;
  const option = Array.from(select.options).find((candidate) =>
    optionMatches(candidate, answer)
  );
  if (!option || !option.value) return false;
  select.value = option.value;
  dispatchValueEvents(select);
  return true;
}

function fillInput(
  input: HTMLInputElement | HTMLTextAreaElement,
  answer: string
): boolean {
  if (input.disabled || input.readOnly) return false;
  if (input instanceof HTMLInputElement && input.type === 'radio') {
    if (input.checked) return false;
    const radioText = normalized(labelFor(input) + ' ' + input.value);
    const matches =
      answer === 'yes'
        ? /(?:^| )yes(?: |$)/.test(radioText)
        : answer === 'no'
          ? /(?:^| )no(?: |$)/.test(radioText)
          : answer === 'prefer_not_to_answer'
            ? /\b(?:prefer not|decline|do not wish|choose not|not disclose)\b/.test(
                radioText
              )
            : normalized(input.value) === normalized(answer) ||
              normalized(input.closest('label')?.textContent || '') ===
                normalized(answer);
    if (!matches) return false;
    input.checked = true;
    dispatchValueEvents(input);
    return true;
  }
  if (input.value.trim()) return false;
  if (
    input instanceof HTMLInputElement &&
    !['text', 'date', 'number'].includes(input.type)
  ) {
    return false;
  }
  input.value = answer;
  if (!input.value) return false;
  dispatchValueEvents(input);
  return true;
}

/**
 * Fill only native, empty controls from answers explicitly confirmed in this
 * in-memory session. EEO is limited to "prefer not to answer."
 */
export function fillConfirmedSensitiveAnswers(
  root: ParentNode,
  answers: SensitiveAnswerSession
): { filled: number; unresolved: SensitiveAnswerKind[] } {
  if (!answers.confirmed) return { filled: 0, unresolved: [] };
  let filled = 0;
  const unresolved = new Set<SensitiveAnswerKind>();
  const controls = Array.from(
    root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      'input,textarea,select'
    )
  );
  for (const control of controls) {
    if (!visiblyAvailable(control) || control.disabled) continue;
    const kind = classifySensitiveAnswer(labelFor(control));
    if (!kind) continue;
    const answer = answerFor(kind, answers);
    if (!answer) {
      if (control.required || control.getAttribute('aria-required') === 'true') {
        unresolved.add(kind);
      }
      continue;
    }
    if (
      kind === 'eeoPreference' &&
      answer !== 'prefer_not_to_answer'
    ) {
      continue;
    }
    const changed =
      control instanceof HTMLSelectElement
        ? fillSelect(control, answer)
        : fillInput(control, answer);
    if (changed) filled += 1;
  }
  return { filled, unresolved: Array.from(unresolved) };
}
