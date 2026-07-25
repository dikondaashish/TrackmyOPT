import { flashAutofillField } from './autofill-visual-feedback';

export interface SensitiveAnswerSession {
  confirmed: boolean;
  workAuthorization?: 'yes' | 'no';
  requiresSponsorship?: 'yes' | 'no';
  visaStatus?: string;
  citizenship?: string;
  salaryExpectation?: string;
  dateOfBirth?: string;
  sexGender?: 'female' | 'male' | 'non_binary' | 'prefer_not_to_answer';
  hispanicLatino?: 'yes' | 'no' | 'prefer_not_to_answer';
  raceEthnicity?:
    | 'american_indian_or_alaska_native'
    | 'asian'
    | 'black_or_african_american'
    | 'hispanic_or_latino'
    | 'native_hawaiian_or_pacific_islander'
    | 'white'
    | 'two_or_more_races'
    | 'prefer_not_to_answer';
  veteranStatus?:
    | 'not_protected_veteran'
    | 'protected_veteran'
    | 'prefer_not_to_answer';
  disabilityStatus?: 'yes' | 'no' | 'prefer_not_to_answer';
  eeoPreference?: 'prefer_not_to_answer';
}

export type SensitiveAnswerKind =
  | 'workAuthorization'
  | 'requiresSponsorship'
  | 'visaStatus'
  | 'citizenship'
  | 'salaryExpectation'
  | 'dateOfBirth'
  | 'sexGender'
  | 'hispanicLatino'
  | 'raceEthnicity'
  | 'veteranStatus'
  | 'disabilityStatus'
  | 'eeoPreference';

export type SavedPrivateApplicationAnswers = Omit<
  SensitiveAnswerSession,
  'confirmed'
>;

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
  const sexGender = [
    'female',
    'male',
    'non_binary',
    'prefer_not_to_answer',
  ].includes(String(candidate.sexGender))
    ? (candidate.sexGender as SensitiveAnswerSession['sexGender'])
    : undefined;
  const hispanicLatino = ['yes', 'no', 'prefer_not_to_answer'].includes(
    String(candidate.hispanicLatino)
  )
    ? (candidate.hispanicLatino as SensitiveAnswerSession['hispanicLatino'])
    : undefined;
  const raceEthnicity = [
    'american_indian_or_alaska_native',
    'asian',
    'black_or_african_american',
    'hispanic_or_latino',
    'native_hawaiian_or_pacific_islander',
    'white',
    'two_or_more_races',
    'prefer_not_to_answer',
  ].includes(String(candidate.raceEthnicity))
    ? (candidate.raceEthnicity as SensitiveAnswerSession['raceEthnicity'])
    : undefined;
  const veteranStatus = [
    'not_protected_veteran',
    'protected_veteran',
    'prefer_not_to_answer',
  ].includes(String(candidate.veteranStatus))
    ? (candidate.veteranStatus as SensitiveAnswerSession['veteranStatus'])
    : undefined;
  const disabilityStatus = ['yes', 'no', 'prefer_not_to_answer'].includes(
    String(candidate.disabilityStatus)
  )
    ? (candidate.disabilityStatus as SensitiveAnswerSession['disabilityStatus'])
    : undefined;
  return {
    confirmed: true,
    ...(workAuthorization ? { workAuthorization } : {}),
    ...(requiresSponsorship ? { requiresSponsorship } : {}),
    ...(visaStatus ? { visaStatus } : {}),
    ...(citizenship ? { citizenship } : {}),
    ...(salaryExpectation ? { salaryExpectation } : {}),
    ...(dateOfBirth ? { dateOfBirth } : {}),
    ...(sexGender ? { sexGender } : {}),
    ...(hispanicLatino ? { hispanicLatino } : {}),
    ...(raceEthnicity ? { raceEthnicity } : {}),
    ...(veteranStatus ? { veteranStatus } : {}),
    ...(disabilityStatus ? { disabilityStatus } : {}),
    ...(candidate.eeoPreference === 'prefer_not_to_answer'
      ? { eeoPreference: 'prefer_not_to_answer' as const }
      : {}),
  };
}

/** Sanitize decrypted API data without approving it for the current form. */
export function normalizeSavedPrivateApplicationAnswers(
  value: unknown
): SavedPrivateApplicationAnswers | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const normalized = normalizeSensitiveAnswerSession({
    ...(value as Record<string, unknown>),
    confirmed: true,
  });
  if (!normalized) return null;
  const { confirmed: _confirmed, ...answers } = normalized;
  return answers;
}

const SPONSORSHIP_RE = /\b(?:sponsor|sponsorship|future visa support)\b/i;
const WORK_AUTH_RE =
  /\b(?:work authori[sz]\w*|authori[sz]\w* to work|work permit|eligib\w* to work)\b/i;
const VISA_RE = /\b(?:visa|immigration status)\b/i;
const CITIZENSHIP_RE = /\b(?:citizen\w*|citizenship)\b/i;
const SALARY_RE =
  /\b(?:salary|compensation|expected pay|desired pay|pay expectation)\b/i;
const DOB_RE = /\b(?:date of birth|birth date|dob)\b/i;
const SEX_GENDER_RE = /\b(?:gender|sex)\b/i;
const HISPANIC_LATINO_RE = /\b(?:hispanic|latino|latina|latinx)\b/i;
const RACE_ETHNICITY_RE = /\b(?:race|racial|ethnic\w*)\b/i;
const VETERAN_RE = /\bveteran\w*\b/i;
const DISABILITY_RE = /\b(?:disab\w*|self identification of disability)\b/i;
const EEO_RE = /\b(?:eeo|equal opportunity)\b/i;

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
  if (SEX_GENDER_RE.test(signal)) return 'sexGender';
  if (HISPANIC_LATINO_RE.test(signal)) return 'hispanicLatino';
  if (RACE_ETHNICITY_RE.test(signal)) return 'raceEthnicity';
  if (VETERAN_RE.test(signal)) return 'veteranStatus';
  if (DISABILITY_RE.test(signal)) return 'disabilityStatus';
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

function candidateMatches(candidate: string, answer: string): boolean {
  const optionText = normalized(candidate);
  if (answer === 'yes') {
    return /(?:^| )(?:yes|y|true|1)(?: |$)/.test(optionText);
  }
  if (answer === 'no') {
    return /(?:^| )(?:no|n|false|0)(?: |$)/.test(optionText);
  }
  if (answer === 'prefer_not_to_answer') {
    return /\b(?:prefer not|decline|do not wish|choose not|not disclose)\b/.test(
      optionText
    );
  }
  if (answer === 'female') return /\b(?:female|woman)\b/.test(optionText);
  if (answer === 'male') return /\b(?:male|man)\b/.test(optionText);
  if (answer === 'non_binary') {
    return /\b(?:non binary|nonbinary|gender non conforming)\b/.test(optionText);
  }
  if (answer === 'american_indian_or_alaska_native') {
    return /\b(?:american indian|alaska native|indigenous)\b/.test(optionText);
  }
  if (answer === 'asian') return /\basian\b/.test(optionText);
  if (answer === 'black_or_african_american') {
    return /\b(?:black|african american)\b/.test(optionText);
  }
  if (answer === 'hispanic_or_latino') {
    return /\b(?:hispanic|latino|latina|latinx)\b/.test(optionText);
  }
  if (answer === 'native_hawaiian_or_pacific_islander') {
    return /\b(?:native hawaiian|pacific islander)\b/.test(optionText);
  }
  if (answer === 'white') return /\bwhite\b/.test(optionText);
  if (answer === 'two_or_more_races') {
    return /\b(?:two or more|multiracial|multi racial)\b/.test(optionText);
  }
  if (answer === 'not_protected_veteran') {
    return /\b(?:not|non)\b.{0,20}\b(?:protected )?veteran\b/.test(optionText);
  }
  if (answer === 'protected_veteran') {
    return (
      !/\b(?:not|non)\b.{0,20}\bveteran\b/.test(optionText) &&
      /\bprotected veteran\b/.test(optionText)
    );
  }
  const expected = normalized(answer);
  return optionText === expected;
}

function optionMatches(option: HTMLOptionElement, answer: string): boolean {
  return candidateMatches(`${option.value} ${option.textContent || ''}`, answer);
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
  if (
    input instanceof HTMLInputElement &&
    (input.type === 'radio' || input.type === 'checkbox')
  ) {
    if (input.checked) return false;
    const matches = candidateMatches(
      `${labelFor(input)} ${input.value}`,
      answer
    );
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
 * Fill only native, empty controls from answers explicitly reviewed and
 * confirmed for this application session. The function never guesses values.
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
    if (kind === 'eeoPreference' && answer !== 'prefer_not_to_answer') {
      continue;
    }
    const changed =
      control instanceof HTMLSelectElement
        ? fillSelect(control, answer)
        : fillInput(control, answer);
    if (changed) {
      filled += 1;
      flashAutofillField(control, 'filled');
    }
  }
  return { filled, unresolved: Array.from(unresolved) };
}
