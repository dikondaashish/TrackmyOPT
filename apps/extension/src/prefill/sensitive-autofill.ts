import { flashAutofillField, type AutofillVisualFeedback } from './autofill-visual-feedback';
import { trackPrefillChange } from './prefill-undo';
import { ashbyQuestion } from './ashby-control-context';
import {
  CUSTOM_DROPDOWN_SELECTOR,
  isCustomDropdownControl,
  customDropdownHasValue,
  selectSmartDropdown,
} from './smart-dropdown';
import {
  normalizeDefaultJobPortalLogin,
  type JobPortalLoginCredential,
} from '../job-portal/job-portal-login';
import { setNativeValue } from '../easy-apply/easy-apply-dom';
import { verifyNativeCommit } from './prefill-commit';
import {
  VERIFIED_MEANING_QUESTION,
  classifyAuthorizationQuestion,
  normalizeVerifiedAuthorization,
  resolveAuthorizationQuestion,
  type QuestionMeaning,
  type VerifiedAuthorizationAnswers,
  type VerifiedAuthorizationChange,
} from './verified-authorization';
import { markAnswerSource, type FieldOutcome } from '../review/field-outcomes';
import type { CapabilityId } from '../platform-config/remote-config';

export interface SensitiveAnswerSession {
  confirmed: boolean;
  workAuthorization?: 'yes' | 'no';
  requiresSponsorship?: 'yes' | 'no';
  visaType?:
    | 'us_citizen'
    | 'permanent_resident'
    | 'h1b'
    | 'f1_student'
    | 'opt'
    | 'cpt'
    | 'j1'
    | 'l1'
    | 'o1'
    | 'tn'
    | 'e3'
    | 'other';
  visaOther?: string;
  visaStatus?: string;
  citizenship?: string;
  salaryExpectation?: string;
  expectedAnnualSalary?: string;
  expectedHourlyRate?: string;
  canWorkInPerson?: 'yes' | 'no';
  willingToRelocate?: 'yes' | 'no';
  canStartImmediately?: 'yes' | 'no';
  reliableTransportation?: 'yes' | 'no';
  needsAccommodations?: 'yes' | 'no';
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
  /** Applicant-confirmed authorization/sponsorship answers (verified-authorization.ts). */
  verifiedAuthorization?: VerifiedAuthorizationAnswers;
}

export type SensitiveAnswerKind =
  | 'workAuthorization'
  | 'requiresSponsorship'
  | 'visaStatus'
  | 'citizenship'
  | 'salaryExpectation'
  | 'expectedAnnualSalary'
  | 'expectedHourlyRate'
  | 'canWorkInPerson'
  | 'willingToRelocate'
  | 'canStartImmediately'
  | 'reliableTransportation'
  | 'needsAccommodations'
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
> & {
  defaultJobPortalLogin?: JobPortalLoginCredential;
};

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
  const visaType = [
    'us_citizen',
    'permanent_resident',
    'h1b',
    'f1_student',
    'opt',
    'cpt',
    'j1',
    'l1',
    'o1',
    'tn',
    'e3',
    'other',
  ].includes(String(candidate.visaType))
    ? (candidate.visaType as SensitiveAnswerSession['visaType'])
    : undefined;
  const visaOther = boundedText(candidate.visaOther, 120);
  const visaStatus = boundedText(candidate.visaStatus, 120);
  const citizenship = boundedText(candidate.citizenship, 120);
  const salaryExpectation = boundedText(candidate.salaryExpectation, 200);
  const expectedAnnualSalary = boundedText(candidate.expectedAnnualSalary, 80);
  const expectedHourlyRate = boundedText(candidate.expectedHourlyRate, 80);
  const canWorkInPerson = yesNo(candidate.canWorkInPerson);
  const willingToRelocate = yesNo(candidate.willingToRelocate);
  const canStartImmediately = yesNo(candidate.canStartImmediately);
  const reliableTransportation = yesNo(candidate.reliableTransportation);
  const needsAccommodations = yesNo(candidate.needsAccommodations);
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
  const verifiedAuthorization = normalizeVerifiedAuthorization(candidate.verifiedAuthorization);
  return {
    confirmed: true,
    ...(verifiedAuthorization ? { verifiedAuthorization } : {}),
    ...(workAuthorization ? { workAuthorization } : {}),
    ...(requiresSponsorship ? { requiresSponsorship } : {}),
    ...(visaType ? { visaType } : {}),
    ...(visaOther ? { visaOther } : {}),
    ...(visaStatus ? { visaStatus } : {}),
    ...(citizenship ? { citizenship } : {}),
    ...(salaryExpectation ? { salaryExpectation } : {}),
    ...(expectedAnnualSalary ? { expectedAnnualSalary } : {}),
    ...(expectedHourlyRate ? { expectedHourlyRate } : {}),
    ...(canWorkInPerson ? { canWorkInPerson } : {}),
    ...(willingToRelocate ? { willingToRelocate } : {}),
    ...(canStartImmediately ? { canStartImmediately } : {}),
    ...(reliableTransportation ? { reliableTransportation } : {}),
    ...(needsAccommodations ? { needsAccommodations } : {}),
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
  const defaultJobPortalLogin = normalizeDefaultJobPortalLogin(
    (value as Record<string, unknown>).defaultJobPortalLogin
  );
  return {
    ...answers,
    ...(defaultJobPortalLogin ? { defaultJobPortalLogin } : {}),
  };
}

const SPONSORSHIP_RE = /\b(?:sponsor|sponsorship|future visa support)\b/i;
const WORK_AUTH_RE =
  /\b(?:work authori[sz]\w*|authori[sz]\w* to work|work permit|eligib\w* to work)\b/i;
const VISA_RE = /\b(?:visa|immigration status)\b/i;
const CITIZENSHIP_RE = /\b(?:citizen\w*|citizenship)\b/i;
const SALARY_RE =
  /\b(?:salary|compensation|expected pay|desired pay|pay expectation)\b/i;
const ANNUAL_SALARY_RE =
  /\b(?:annual|yearly|per year)\b.{0,30}\b(?:salary|compensation|pay|rate)\b|\b(?:salary|compensation|pay|rate)\b.{0,30}\b(?:annual|yearly|per year)\b/i;
const HOURLY_RATE_RE =
  /\b(?:hourly|per hour)\b.{0,30}\b(?:rate|pay|salary|compensation)\b|\b(?:rate|pay|salary|compensation)\b.{0,30}\b(?:hourly|per hour)\b/i;
const IN_PERSON_RE = /\b(?:work|available)\b.{0,25}\b(?:in person|on ?site)\b/i;
const RELOCATE_RE = /\brelocat\w*\b/i;
const START_IMMEDIATELY_RE =
  /\b(?:start|available)\b.{0,30}\bimmediately\b/i;
const TRANSPORTATION_RE = /\breliable transportation\b/i;
const ACCOMMODATIONS_RE =
  /\b(?:need|require|request)\w*\b.{0,30}\baccommodation\w*\b|\baccommodation\w*\b/i;
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
  if (ANNUAL_SALARY_RE.test(signal)) return 'expectedAnnualSalary';
  if (HOURLY_RATE_RE.test(signal)) return 'expectedHourlyRate';
  if (SALARY_RE.test(signal)) return 'salaryExpectation';
  if (IN_PERSON_RE.test(signal)) return 'canWorkInPerson';
  if (RELOCATE_RE.test(signal)) return 'willingToRelocate';
  if (START_IMMEDIATELY_RE.test(signal)) return 'canStartImmediately';
  if (TRANSPORTATION_RE.test(signal)) return 'reliableTransportation';
  if (ACCOMMODATIONS_RE.test(signal)) return 'needsAccommodations';
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
  const textWithoutControls = (node: Element | null): string | null => {
    if (!node) return null;
    const copy = node.cloneNode(true) as Element;
    for (const child of Array.from(
      copy.querySelectorAll('input,textarea,select,option,button,script,style')
    )) {
      child.remove();
    }
    return copy.textContent;
  };
  const parts = [
    ashbyQuestion(element)?.textContent,
    element.getAttribute('aria-label'),
    element.getAttribute('name'),
    element.getAttribute('id'),
    textWithoutControls(element.closest('label')),
    element.closest('fieldset')?.querySelector('legend')?.textContent,
  ];
  if (element.id) {
    const escapedId =
      typeof CSS !== 'undefined' && CSS.escape
        ? CSS.escape(element.id)
        : element.id.replace(/["\\]/g, '\\$&');
    parts.push(element.ownerDocument.querySelector(`label[for="${escapedId}"]`)?.textContent);
  }
  for (const id of element.getAttribute('aria-labelledby')?.split(/\s+/) || []) {
    parts.push(element.ownerDocument.getElementById(id)?.textContent);
  }
  return parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

/** The human-readable question, without machine names or ids, for meaning checks. */
function questionTextFor(element: HTMLElement): string {
  const strip = (node: Element | null | undefined) => {
    if (!node) return '';
    const copy = node.cloneNode(true) as Element;
    for (const child of Array.from(copy.querySelectorAll('input,textarea,select,option,button,script,style'))) child.remove();
    return (copy.textContent || '').replace(/\s+/g, ' ').trim();
  };
  const candidates = [
    ashbyQuestion(element)?.textContent,
    element.getAttribute('type') === 'radio' || element.getAttribute('type') === 'checkbox'
      ? strip(element.closest('fieldset')?.querySelector('legend')) : '',
    element.id ? strip(element.ownerDocument.querySelector(`label[for="${typeof CSS !== 'undefined' && CSS.escape
      ? CSS.escape(element.id) : element.id.replace(/["\\]/g, '\\$&')}"]`)) : '',
    strip(element.closest('label')),
    ...(element.getAttribute('aria-labelledby')?.split(/\s+/) || []).map(id => element.ownerDocument.getElementById(id)?.textContent),
    element.getAttribute('aria-label'),
    strip(element.closest('fieldset')?.querySelector('legend')),
  ];
  return (candidates.find(text => text && text.replace(/\s+/g, ' ').trim()) || '').replace(/\s+/g, ' ').trim().slice(0, 1000);
}

/** Declarations and consent the applicant must give themselves. */
const ATTESTATION_RE = /\b(?:i (?:certify|attest|declare|acknowledge|agree|consent)|under penalty|true and (?:complete|correct)|signature|sign here|e-?sign)\b/i;

function answerFor(
  kind: SensitiveAnswerKind,
  answers: SensitiveAnswerSession
): string | undefined {
  if (kind === 'visaStatus') {
    if (answers.visaType === 'other') {
      return answers.visaOther || answers.visaStatus || 'other';
    }
    return answers.visaType || answers.visaStatus;
  }
  if (kind === 'salaryExpectation') {
    return answers.salaryExpectation || answers.expectedAnnualSalary;
  }
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

export function candidateMatches(candidate: string, answer: string): boolean {
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
  if (answer === 'us_citizen') {
    return /\b(?:u s |us |united states )?citizen\b/.test(optionText);
  }
  if (answer === 'permanent_resident') {
    return /\b(?:permanent resident|green card|lawful permanent)\b/.test(optionText);
  }
  if (answer === 'h1b') return /\bh ?1 ?b\b/.test(optionText);
  if (answer === 'f1_student') {
    return /\bf ?1\b/.test(optionText) && /\b(?:student|visa|status|f ?1)\b/.test(optionText);
  }
  if (answer === 'opt') return /\bopt\b/.test(optionText);
  if (answer === 'cpt') return /\bcpt\b/.test(optionText);
  if (answer === 'j1') return /\bj ?1\b/.test(optionText);
  if (answer === 'l1') return /\bl ?1\b/.test(optionText);
  if (answer === 'o1') return /\bo ?1\b/.test(optionText);
  if (answer === 'tn') return /\btn\b/.test(optionText);
  if (answer === 'e3') return /\be ?3\b/.test(optionText);
  if (answer === 'other') return /\bother\b/.test(optionText);
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
  return candidateMatches(option.textContent?.trim() || option.value, answer);
}

function fillSelect(select: HTMLSelectElement, answer: string): boolean {
  if (select.value) return false;
  const matching = Array.from(select.options).filter((candidate) =>
    !candidate.disabled && optionMatches(candidate, answer)
  );
  const option = matching.length === 1 ? matching[0] : undefined;
  if (!option || !option.value) return false;
  trackPrefillChange(select, () => { select.value = option.value; dispatchValueEvents(select); });
  return true;
}

/** A radio's accessible name can be the question for every choice. Read the
 * text of its own option wrapper before falling back to a meaningful value. */
function radioOptionText(input: HTMLInputElement): string {
  const associatedLabel = Array.from(input.labels || [])
    .map((label) => label.textContent?.replace(/\s+/g, ' ').trim() || '')
    .filter(Boolean)
    .join(' ');
  if (associatedLabel) return associatedLabel;
  const fieldset = input.closest('fieldset');
  for (let wrapper = input.parentElement; wrapper && wrapper !== fieldset; wrapper = wrapper.parentElement) {
    if (wrapper.querySelectorAll('input[type="radio"]').length !== 1) break;
    const text = wrapper.textContent?.replace(/\s+/g, ' ').trim() || '';
    if (text && text.length <= 120) return text;
  }
  return input.value === 'on' ? '' : input.value;
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
    if (input.type === 'radio') {
      if (!input.name) return false;
      const group = Array.from((input.form || input.ownerDocument).querySelectorAll<HTMLInputElement>('input[type="radio"]'))
        .filter(other => other.name === input.name && other.getRootNode() === input.getRootNode());
      if (group.some(other => other.checked)) return false;
      // The group is handled once; choose its single matching option.
      const matches = group.filter(other => !other.disabled && candidateMatches(radioOptionText(other), answer));
      if (matches.length !== 1) return false;
      const choice = matches[0];
      return trackPrefillChange(choice, () => { choice.click(); return choice.checked; });
    }
    if (input.checked) return false;
    const matches = candidateMatches(
      `${labelFor(input)} ${input.value}`,
      answer
    );
    if (!matches) return false;
    trackPrefillChange(input, () => { input.checked = true; dispatchValueEvents(input); });
    return true;
  }
  if (input.value.trim()) return false;
  if (
    input instanceof HTMLInputElement &&
    !['text', 'date', 'number'].includes(input.type)
  ) {
    return false;
  }
  // Framework-safe write (native setter + events); acceptance is verified by the caller.
  setNativeValue(input, answer);
  return input.value === answer;
}

export interface SensitiveFillOptions {
  now?: number;
  blockedCapabilities?: ReadonlySet<CapabilityId>;
  /** Persists an applicant confirmation; resolves with the updated answers. */
  saveVerified?: (change: VerifiedAuthorizationChange) => Promise<VerifiedAuthorizationAnswers | null>;
}

async function defaultSaveVerified(change: VerifiedAuthorizationChange): Promise<VerifiedAuthorizationAnswers | null> {
  if (typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) return null;
  const response = await chrome.runtime.sendMessage({ type: 'SAVE_VERIFIED_AUTHORIZATION', change }).catch(() => null) as
    { ok?: boolean; verifiedAuthorization?: unknown } | null;
  return response?.ok ? normalizeVerifiedAuthorization(response.verifiedAuthorization) : null;
}

async function writeAnswer(control: HTMLElement, answer: string, shouldContinue: () => boolean): Promise<boolean> {
  if (isCustomDropdownControl(control)) {
    const selection = await selectSmartDropdown(control, answer, 'generic', candidateMatches, undefined, { shouldContinue });
    return selection.outcome === 'selected';
  }
  if (control instanceof HTMLSelectElement) return fillSelect(control, answer);
  if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement) {
    if (!fillInput(control, answer)) return false;
    if (control instanceof HTMLInputElement && (control.type === 'radio' || control.type === 'checkbox')) return true;
    return verifyNativeCommit(control, answer, shouldContinue);
  }
  return false;
}

const MEANING_LABEL: Record<QuestionMeaning, string> = {
  currentWorkAuthorization: 'current work authorization',
  currentSponsorship: 'current sponsorship need',
  futureSponsorship: 'future sponsorship need',
  nowOrFutureSponsorship: 'current or future sponsorship need',
};

/**
 * Fill native controls and exact-match accessible dropdowns from answers
 * explicitly reviewed and confirmed for this application session. The
 * function never guesses values. Work-authorization and sponsorship questions
 * use only applicant-confirmed answers for an equivalent question; anything
 * else is returned for the applicant to confirm. Declarations are never filled.
 */
export async function fillConfirmedSensitiveAnswers(
  root: ParentNode,
  answers: SensitiveAnswerSession,
  shouldContinue: () => boolean = () => true,
  visual?: AutofillVisualFeedback,
  options: SensitiveFillOptions = {},
): Promise<{ filled: number; unresolved: SensitiveAnswerKind[]; outcomes: FieldOutcome[] }> {
  const outcomes: FieldOutcome[] = [];
  if (!answers.confirmed) return { filled: 0, unresolved: [], outcomes };
  const blocked = options.blockedCapabilities ?? new Set<CapabilityId>();
  if (blocked.has('privateAnswers')) return { filled: 0, unresolved: [], outcomes };
  const saveVerified = options.saveVerified ?? defaultSaveVerified;
  let filled = 0;
  const unresolved = new Set<SensitiveAnswerKind>();
  const handledRadioGroups = new Set<string>();
  const controls = Array.from(
    root.querySelectorAll<HTMLElement>(
      `input,textarea,select,${CUSTOM_DROPDOWN_SELECTOR}`
    )
  );
  for (const control of controls) {
    if (!shouldContinue()) break;
    if (control.parentElement?.closest(CUSTOM_DROPDOWN_SELECTOR)) continue;
    if (
      !visiblyAvailable(control) ||
      ('disabled' in control && Boolean(control.disabled))
    ) {
      continue;
    }
    const kind = classifySensitiveAnswer(labelFor(control));
    if (!kind) continue;
    const question = questionTextFor(control) || labelFor(control);
    if (control instanceof HTMLInputElement && control.type === 'radio' && control.name) {
      if (handledRadioGroups.has(control.name)) continue;
      handledRadioGroups.add(control.name);
    }
    if (ATTESTATION_RE.test(question)) {
      outcomes.push({ control, status: 'user_only', reason: 'attestation', question });
      continue;
    }
    // A value the user already chose needs no action or unresolved warning.
    if (isCustomDropdownControl(control) && customDropdownHasValue(control)) continue;
    if (control instanceof HTMLSelectElement && control.value) continue;
    if ((control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement) &&
        !['radio', 'checkbox'].includes(control.type) && control.value.trim()) continue;
    const isRequired =
      control.hasAttribute('required') ||
      control.getAttribute('aria-required') === 'true';
    if (kind === 'workAuthorization' || kind === 'requiresSponsorship') {
      if (blocked.has('verifiedAuthorization')) {
        outcomes.push({ control, status: 'unsupported', reason: 'feature_paused', question });
        if (isRequired) unresolved.add(kind);
        continue;
      }
      const resolution = resolveAuthorizationQuestion(answers.verifiedAuthorization ?? null, question, options.now ?? Date.now(), {
        workAuthorization: answers.workAuthorization, requiresSponsorship: answers.requiresSponsorship,
      });
      if (resolution.kind === 'none') continue;
      if (resolution.kind === 'ask' && resolution.meaning === null) {
        outcomes.push({ control, status: 'user_only', reason: resolution.reason === 'attestation' ? 'attestation' : 'compound_question', question });
        if (isRequired) unresolved.add(kind);
        continue;
      }
      if (resolution.kind === 'fill') {
        await visual?.prepareField(control, 'private_answers');
        if (!shouldContinue()) { visual?.clearActiveField(); break; }
        const ok = control.isConnected && await writeAnswer(control, resolution.answer, shouldContinue);
        if (ok) {
          filled += 1;
          markAnswerSource(control, 'confirmed_answer');
          outcomes.push({ control, status: 'filled', source: 'confirmed_answer', question });
          if (visual) visual.markFieldFilled(control, 'private_answers'); else flashAutofillField(control, 'filled');
        } else {
          visual?.clearActiveField();
          outcomes.push({ control, status: 'failed', reason: 'value_not_accepted', question });
          if (isRequired) unresolved.add(kind);
        }
        continue;
      }
      // Needs the applicant: show the exact question; confirming saves and fills.
      const meaning = resolution.meaning!;
      const proposed = resolution.kind === 'confirm' ? resolution.proposed : undefined;
      const target = control;
      outcomes.push({
        control, status: 'needs_confirmation', question,
        reason: resolution.reason === 'no_saved_answer' ? 'no_saved_answer' : resolution.reason,
        proposedAnswer: proposed ? `${proposed === 'yes' ? 'Yes' : 'No'} (${MEANING_LABEL[meaning]})` : undefined,
        answerWith: async (choice: 'yes' | 'no') => {
          let change: VerifiedAuthorizationChange;
          if (meaning === 'nowOrFutureSponsorship') {
            // The combined question is answered only from both separate answers.
            if (!proposed || choice !== proposed) return false;
            change = { action: 'confirm_wording', meaning, question };
          } else {
            change = { action: 'confirm', meaning, answer: choice, question,
              ...(resolution.kind === 'confirm' && resolution.reason === 'answer_due_for_review' ? { reviewBy: null } : {}) };
          }
          const saved = await saveVerified(change);
          if (!saved) return false;
          answers.verifiedAuthorization = saved;
          if (!target.isConnected) return false;
          const ok = await writeAnswer(target, choice, () => target.isConnected);
          if (ok) markAnswerSource(target, 'confirmed_answer');
          return ok;
        },
      });
      if (isRequired) unresolved.add(kind);
      continue;
    }
    const answer = answerFor(kind, answers);
    if (!answer) {
      if (isRequired) unresolved.add(kind);
      continue;
    }
    if (kind === 'eeoPreference' && answer !== 'prefer_not_to_answer') {
      continue;
    }
    await visual?.prepareField(control, 'private_answers');
    if (!shouldContinue()) { visual?.clearActiveField(); break; }
    if (!control.isConnected || !visiblyAvailable(control) || ('disabled' in control && Boolean(control.disabled))) {
      visual?.clearActiveField(); continue;
    }
    const changed = await writeAnswer(control, answer, shouldContinue);
    if (changed) {
      markAnswerSource(control, 'confirmed_answer');
      outcomes.push({ control, status: 'filled', source: 'confirmed_answer' });
      filled += 1;
      if (visual) visual.markFieldFilled(control, 'private_answers');
      else flashAutofillField(control, 'filled');
    } else if (isRequired) {
      visual?.clearActiveField();
      outcomes.push({ control, status: 'skipped', reason: 'no_matching_option' });
      unresolved.add(kind);
    } else {
      visual?.clearActiveField();
    }
  }
  return { filled, unresolved: Array.from(unresolved), outcomes };
}

export { VERIFIED_MEANING_QUESTION, classifyAuthorizationQuestion };
