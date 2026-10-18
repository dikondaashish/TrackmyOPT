/**
 * Applicant-confirmed work-authorization and sponsorship answers.
 *
 * Three separate questions, never merged:
 *  - currentWorkAuthorization: currently legally authorized to work in the US;
 *  - currentSponsorship: currently requires employer visa sponsorship;
 *  - futureSponsorship: will require employer visa sponsorship in the future.
 *
 * Rules:
 *  - answers come only from the applicant's own confirmation; nothing is ever
 *    inferred from nationality, name, resume, visa type, or generated text;
 *  - an answer is reused only for a question with the same meaning: one of the
 *    bundled equivalent wordings, or a wording the applicant confirmed before.
 *    Any other wording is shown verbatim and needs the applicant's confirmation;
 *  - questions combining authorization with sponsorship, or about another
 *    country, are never answered automatically;
 *  - answers past their review-by date (or a year old) need reconfirmation;
 *  - this is not legal or immigration advice and never states eligibility.
 *
 * Pure module shared with apps/web for validation.
 */

export const VERIFIED_MEANINGS = ['currentWorkAuthorization', 'currentSponsorship', 'futureSponsorship'] as const;
export type VerifiedMeaning = (typeof VERIFIED_MEANINGS)[number];
/** A question asking about sponsorship now OR later; answered only from both confirmed answers. */
export type QuestionMeaning = VerifiedMeaning | 'nowOrFutureSponsorship';

/** The precise question each saved answer answers, shown wherever it is used. */
export const VERIFIED_MEANING_QUESTION: Record<QuestionMeaning, string> = {
  currentWorkAuthorization: 'Are you currently legally authorized to work in the United States?',
  currentSponsorship: 'Do you currently require employer sponsorship for employment visa status (for example, H-1B) to work in the United States?',
  futureSponsorship: 'Will you require employer sponsorship for employment visa status in the future to continue working in the United States?',
  nowOrFutureSponsorship: 'Will you now or in the future require employer sponsorship for employment visa status in the United States?',
};

export const VERIFIED_ANSWER_REVIEW_AFTER_DAYS = 365;
const MAX_WORDINGS = 20;
const MAX_WORDING_LENGTH = 300;

export interface VerifiedAnswer {
  answer: 'yes' | 'no';
  /** ISO timestamp set by the server when the applicant confirmed it. */
  confirmedAt: string;
  scope: 'united_states';
  /** Optional date after which the applicant wants to review it (e.g. an EAD end date). */
  reviewBy?: string;
  /** Normalized question wordings the applicant confirmed this answer for. */
  confirmedWordings: string[];
}

export interface VerifiedAuthorizationAnswers {
  meaningVersion: 1;
  currentWorkAuthorization?: VerifiedAnswer;
  currentSponsorship?: VerifiedAnswer;
  futureSponsorship?: VerifiedAnswer;
  /** Wordings confirmed for the combined "now or in the future" question. */
  nowOrFutureWordings?: string[];
}

export function normalizeQuestionWording(text: string): string {
  return text
    .toLowerCase()
    .replace(/\(\s*required\s*\)|\brequired\b\s*$/g, ' ')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_WORDING_LENGTH);
}

/** Bundled wordings that unambiguously carry each meaning. */
const EQUIVALENT_WORDINGS: Record<QuestionMeaning, string[]> = {
  currentWorkAuthorization: [
    'are you legally authorized to work in the united states',
    'are you currently legally authorized to work in the united states',
    'are you authorized to work in the united states',
    'are you currently authorized to work in the united states',
    'are you legally authorized to work in the us',
    'are you legally authorized to work in the u s',
    'are you legally eligible to work in the united states',
  ],
  currentSponsorship: [
    'do you currently require sponsorship for employment visa status',
    'do you currently require visa sponsorship',
    'do you currently require employer sponsorship to work in the united states',
    'do you currently require visa sponsorship to work in the united states',
  ],
  futureSponsorship: [
    'will you in the future require sponsorship for employment visa status',
    'will you require visa sponsorship in the future',
    'will you in the future require visa sponsorship to work in the united states',
  ],
  nowOrFutureSponsorship: [
    'will you now or in the future require sponsorship for employment visa status e g h 1b visa status',
    'will you now or in the future require sponsorship for employment visa status',
    'will you now or in the future require visa sponsorship',
    'will you now or in the future require sponsorship to work in the united states',
    'will you now or in the future require visa sponsorship to work in the united states',
  ],
};

const SPONSORSHIP_RE = /\b(?:sponsor(?:ship|ed|ing)?|visa support)\b/;
const AUTHORIZATION_RE = /\b(?:(?:authori[sz]ed|eligible|permitted|entitled|allowed) to (?:work|be employed)|work authori[sz]ation|right to work|employment authori[sz]ation)\b/;
const FUTURE_RE = /\b(?:in the future|future|going forward|later|at any time)\b/;
const NOW_RE = /\b(?:now|currently|current|at this time|presently|today)\b/;
const US_RE = /\b(?:united states|u s a|u s|us|usa|america)\b/;
const OTHER_COUNTRY_RE = /\b(?:canada|united kingdom|uk|britain|england|india|european union|eu|europe|australia|germany|france|ireland|singapore|mexico|netherlands|japan|china)\b/;
/** Declarations the applicant must make themselves, even if they mention work. */
const ATTESTATION_RE = /\b(?:i (?:certify|attest|declare|acknowledge|understand|agree|consent)|under penalty|true and (?:complete|correct)|signature|sign here|e ?sign)\b/;

export type QuestionClassification =
  | { meaning: QuestionMeaning }
  | { meaning: null; reason: 'compound' | 'not_us' | 'attestation' | 'unrelated' };

export function classifyAuthorizationQuestion(questionText: string): QuestionClassification {
  const text = normalizeQuestionWording(questionText);
  if (ATTESTATION_RE.test(text)) return { meaning: null, reason: 'attestation' };
  const sponsorship = SPONSORSHIP_RE.test(text);
  const authorization = AUTHORIZATION_RE.test(text);
  if (!sponsorship && !authorization) return { meaning: null, reason: 'unrelated' };
  if (OTHER_COUNTRY_RE.test(text) && !US_RE.test(text)) return { meaning: null, reason: 'not_us' };
  // "Authorized to work without sponsorship?" asks two things at once.
  if (sponsorship && authorization) return { meaning: null, reason: 'compound' };
  if (authorization) return FUTURE_RE.test(text) ? { meaning: null, reason: 'compound' } : { meaning: 'currentWorkAuthorization' };
  const future = FUTURE_RE.test(text);
  const now = NOW_RE.test(text);
  if (future && now) return { meaning: 'nowOrFutureSponsorship' };
  if (future) return { meaning: 'futureSponsorship' };
  return { meaning: 'currentSponsorship' };
}

export type VerifiedAnswerState = 'usable' | 'missing' | 'due_for_review';

export function verifiedAnswerState(answer: VerifiedAnswer | undefined, now: number): VerifiedAnswerState {
  if (!answer) return 'missing';
  const confirmed = Date.parse(answer.confirmedAt);
  if (!Number.isFinite(confirmed)) return 'missing';
  if (now - confirmed > VERIFIED_ANSWER_REVIEW_AFTER_DAYS * 24 * 60 * 60 * 1000) return 'due_for_review';
  if (answer.reviewBy && new Date(now).toISOString().slice(0, 10) > answer.reviewBy) return 'due_for_review';
  return 'usable';
}

export type AuthorizationResolution =
  | { kind: 'fill'; meaning: QuestionMeaning; answer: 'yes' | 'no' }
  | { kind: 'confirm'; meaning: QuestionMeaning; proposed?: 'yes' | 'no'; reason: 'meaning_changed' | 'answer_due_for_review' }
  | { kind: 'ask'; meaning: QuestionMeaning | null; reason: 'no_saved_answer' | 'compound_question' | 'attestation' }
  | { kind: 'none' };

function wordingConfirmed(answers: VerifiedAuthorizationAnswers | null, meaning: QuestionMeaning, wording: string): boolean {
  if (EQUIVALENT_WORDINGS[meaning].includes(wording)) return true;
  const confirmed = meaning === 'nowOrFutureSponsorship'
    ? answers?.nowOrFutureWordings
    : answers?.[meaning]?.confirmedWordings;
  return Boolean(confirmed?.includes(wording));
}

/**
 * Decide what to do with one application question. `legacy` holds the older
 * single yes/no answers; they are only ever offered as a proposal to confirm.
 */
export function resolveAuthorizationQuestion(
  answers: VerifiedAuthorizationAnswers | null,
  questionText: string,
  now: number,
  legacy: { workAuthorization?: 'yes' | 'no'; requiresSponsorship?: 'yes' | 'no' } = {},
): AuthorizationResolution {
  const classification = classifyAuthorizationQuestion(questionText);
  if (classification.meaning === null) {
    if (classification.reason === 'unrelated' || classification.reason === 'not_us') return { kind: 'none' };
    return { kind: 'ask', meaning: null, reason: classification.reason === 'attestation' ? 'attestation' : 'compound_question' };
  }
  const meaning = classification.meaning;
  const wording = normalizeQuestionWording(questionText);
  let answer: 'yes' | 'no' | undefined;
  let state: VerifiedAnswerState;
  if (meaning === 'nowOrFutureSponsorship') {
    const current = answers?.currentSponsorship;
    const future = answers?.futureSponsorship;
    const states = [verifiedAnswerState(current, now), verifiedAnswerState(future, now)];
    state = states.includes('missing') ? 'missing' : states.includes('due_for_review') ? 'due_for_review' : 'usable';
    if (state !== 'missing') answer = current!.answer === 'yes' || future!.answer === 'yes' ? 'yes' : 'no';
  } else {
    state = verifiedAnswerState(answers?.[meaning], now);
    answer = answers?.[meaning]?.answer;
  }
  if (state === 'missing') {
    const proposed = meaning === 'currentWorkAuthorization' ? legacy.workAuthorization : legacy.requiresSponsorship;
    return proposed
      ? { kind: 'confirm', meaning, proposed, reason: 'meaning_changed' }
      : { kind: 'ask', meaning, reason: 'no_saved_answer' };
  }
  if (state === 'due_for_review') return { kind: 'confirm', meaning, proposed: answer, reason: 'answer_due_for_review' };
  if (!wordingConfirmed(answers, meaning, wording)) return { kind: 'confirm', meaning, proposed: answer, reason: 'meaning_changed' };
  return { kind: 'fill', meaning, answer: answer! };
}

function validWordings(value: unknown): string[] | null {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > MAX_WORDINGS) return null;
  const wordings = value.filter((item): item is string =>
    typeof item === 'string' && item.length > 0 && item.length <= MAX_WORDING_LENGTH && item === normalizeQuestionWording(item));
  return wordings.length === value.length ? [...new Set(wordings)] : null;
}

/** Strict normalization of stored or relayed answers; anything unexpected is dropped. */
export function normalizeVerifiedAuthorization(value: unknown): VerifiedAuthorizationAnswers | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const allowed = ['meaningVersion', ...VERIFIED_MEANINGS, 'nowOrFutureWordings'];
  if (Object.keys(input).some(key => !allowed.includes(key)) || input.meaningVersion !== 1) return null;
  const result: VerifiedAuthorizationAnswers = { meaningVersion: 1 };
  for (const meaning of VERIFIED_MEANINGS) {
    const entry = input[meaning];
    if (entry === undefined) continue;
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return null;
    const record = entry as Record<string, unknown>;
    if (Object.keys(record).some(key => !['answer', 'confirmedAt', 'scope', 'reviewBy', 'confirmedWordings'].includes(key))) return null;
    if (record.answer !== 'yes' && record.answer !== 'no') return null;
    if (typeof record.confirmedAt !== 'string' || !Number.isFinite(Date.parse(record.confirmedAt))) return null;
    if (record.scope !== 'united_states') return null;
    if (record.reviewBy !== undefined && (typeof record.reviewBy !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(record.reviewBy))) return null;
    const wordings = validWordings(record.confirmedWordings);
    if (!wordings) return null;
    result[meaning] = {
      answer: record.answer, confirmedAt: record.confirmedAt, scope: 'united_states',
      ...(record.reviewBy ? { reviewBy: record.reviewBy as string } : {}), confirmedWordings: wordings,
    };
  }
  const combined = validWordings(input.nowOrFutureWordings);
  if (!combined) return null;
  if (combined.length) result.nowOrFutureWordings = combined;
  return result;
}

/** A confirmation request from the extension; the server sets confirmedAt. */
export type VerifiedAuthorizationChange =
  | { action: 'confirm'; meaning: VerifiedMeaning; answer: 'yes' | 'no'; question?: string; reviewBy?: string | null }
  | { action: 'confirm_wording'; meaning: QuestionMeaning; question: string }
  | { action: 'clear'; meaning: VerifiedMeaning };

export function parseVerifiedAuthorizationChange(value: unknown): VerifiedAuthorizationChange | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const question = typeof input.question === 'string' ? input.question.slice(0, 1000) : undefined;
  if (input.action === 'clear' && VERIFIED_MEANINGS.includes(input.meaning as VerifiedMeaning)) {
    return { action: 'clear', meaning: input.meaning as VerifiedMeaning };
  }
  if (input.action === 'confirm' && VERIFIED_MEANINGS.includes(input.meaning as VerifiedMeaning) &&
      (input.answer === 'yes' || input.answer === 'no')) {
    const reviewBy = input.reviewBy === null ? null
      : typeof input.reviewBy === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input.reviewBy) ? input.reviewBy : undefined;
    if (input.reviewBy !== undefined && reviewBy === undefined) return null;
    return { action: 'confirm', meaning: input.meaning as VerifiedMeaning, answer: input.answer,
      ...(question ? { question } : {}), ...(reviewBy !== undefined ? { reviewBy } : {}) };
  }
  if (input.action === 'confirm_wording' && question &&
      ([...VERIFIED_MEANINGS, 'nowOrFutureSponsorship'] as string[]).includes(input.meaning as string)) {
    return { action: 'confirm_wording', meaning: input.meaning as QuestionMeaning, question };
  }
  return null;
}

/** Apply a confirmation to stored answers. `nowIso` comes from the server clock. */
export function applyVerifiedAuthorizationChange(
  current: VerifiedAuthorizationAnswers | null | undefined,
  change: VerifiedAuthorizationChange,
  nowIso: string,
): VerifiedAuthorizationAnswers | { error: 'missing_answer' | 'unrelated_question' } {
  const next: VerifiedAuthorizationAnswers = structuredCloneish(current ?? { meaningVersion: 1 });
  const addWording = (list: string[] | undefined, question: string) =>
    [...new Set([...(list ?? []), normalizeQuestionWording(question)])].slice(-MAX_WORDINGS);
  if (change.action === 'clear') {
    delete next[change.meaning];
    if (change.meaning !== 'currentWorkAuthorization') delete next.nowOrFutureWordings;
    return next;
  }
  if (change.question) {
    const classified = classifyAuthorizationQuestion(change.question);
    const expected = change.meaning;
    if (classified.meaning !== expected) return { error: 'unrelated_question' };
  }
  if (change.action === 'confirm') {
    const previous = next[change.meaning];
    // A changed answer invalidates wordings confirmed for the old answer.
    const keepWordings = previous?.answer === change.answer ? previous.confirmedWordings : [];
    const reviewBy = change.reviewBy === null ? undefined : change.reviewBy ?? (previous?.answer === change.answer ? previous?.reviewBy : undefined);
    next[change.meaning] = {
      answer: change.answer, confirmedAt: nowIso, scope: 'united_states',
      ...(reviewBy ? { reviewBy } : {}),
      confirmedWordings: change.question ? addWording(keepWordings, change.question) : keepWordings,
    };
    if (change.meaning !== 'currentWorkAuthorization' && previous?.answer !== change.answer) delete next.nowOrFutureWordings;
    return next;
  }
  if (change.meaning === 'nowOrFutureSponsorship') {
    if (!next.currentSponsorship || !next.futureSponsorship) return { error: 'missing_answer' };
    next.nowOrFutureWordings = addWording(next.nowOrFutureWordings, change.question);
    return next;
  }
  const entry = next[change.meaning];
  if (!entry) return { error: 'missing_answer' };
  next[change.meaning] = { ...entry, confirmedAt: nowIso, confirmedWordings: addWording(entry.confirmedWordings, change.question) };
  return next;
}

function structuredCloneish<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
