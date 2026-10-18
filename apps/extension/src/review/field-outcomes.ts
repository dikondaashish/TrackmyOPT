/**
 * Per-field results of one Prefill run, used by the review-before-submit
 * panel. Ephemeral and in-memory only: controls and closures never leave the
 * document, and nothing here is serialized, logged, or sent to analytics.
 */
import type { PrefillValueSource } from '../prefill/prefill-contact-source';

/** Where a filled value came from. 'you' means the applicant typed it. */
export type AnswerSource =
  | PrefillValueSource
  | 'confirmed_answer'
  | 'saved_answer'
  | 'generated'
  | 'you';

export type FieldOutcomeStatus =
  | 'filled'
  /** The field already had a different answer, kept unless the applicant chooses otherwise. */
  | 'kept_existing'
  /** A value is ready but the applicant must confirm it applies to this question. */
  | 'needs_confirmation'
  /** The applicant must answer it; TrackMyOPT never does (declarations, signatures). */
  | 'user_only'
  | 'unsupported'
  | 'failed'
  | 'skipped';

export type FieldOutcomeReason =
  | 'feature_paused'
  | 'no_matching_option'
  | 'unsupported_control'
  | 'value_not_accepted'
  | 'meaning_changed'
  | 'answer_due_for_review'
  | 'compound_question'
  | 'attestation'
  | 'no_saved_answer';

export interface FieldOutcome {
  control: HTMLElement;
  status: FieldOutcomeStatus;
  source?: AnswerSource;
  reason?: FieldOutcomeReason;
  /** The exact question text, shown when the applicant must confirm meaning. */
  question?: string;
  /** Short, value-free description of the proposed answer ("Yes", "No"). */
  proposedAnswer?: string;
  /** Replace a kept answer with the proposed one (explicit applicant action). */
  replace?: () => Promise<boolean>;
  /** Confirm and apply a proposed answer (explicit applicant action). */
  confirm?: () => Promise<boolean>;
  /** Answer a yes/no authorization question; saves it as a confirmed answer. */
  answerWith?: (answer: 'yes' | 'no') => Promise<boolean>;
}

export const FIELD_OUTCOME_REASON_COPY: Record<FieldOutcomeReason, string> = {
  feature_paused: 'Paused by TrackMyOPT for this site — please answer it yourself.',
  no_matching_option: 'None of the options matched your saved answer exactly.',
  unsupported_control: 'This kind of field is not supported yet.',
  value_not_accepted: 'The site did not keep the value TrackMyOPT entered.',
  meaning_changed: 'This question is worded differently from the one you confirmed. Check that your answer still applies.',
  answer_due_for_review: 'Your saved answer is due for review. Confirm it is still accurate.',
  compound_question: 'This question combines several topics, so TrackMyOPT will not answer it for you.',
  attestation: 'Declarations, consents, and signatures must be completed by you.',
  no_saved_answer: 'You have not saved an answer for this question.',
};

export const ANSWER_SOURCE_LABEL: Record<AnswerSource, string> = {
  profile: 'From your saved profile',
  resume: 'From this job’s resume',
  profile_and_resume: 'From your resume and saved profile',
  default: 'Default value — review',
  confirmed_answer: 'Your confirmed answer',
  saved_answer: 'Your saved answer — review',
  generated: 'AI suggestion — review before submitting',
  you: 'Entered by you',
};

/** Generated or reused text the applicant has not yet reviewed. */
export function sourceNeedsReview(source: AnswerSource | undefined): boolean {
  return source === 'generated' || source === 'saved_answer' || source === 'default';
}

const sources = new WeakMap<HTMLElement, { source: AnswerSource; reviewed: boolean }>();

/** Record a value's source. A later trusted edit by the applicant makes it theirs. */
export function markAnswerSource(control: HTMLElement, source: AnswerSource): void {
  const fresh = !sources.has(control);
  sources.set(control, { source, reviewed: false });
  if (!fresh) return;
  const takeOwnership = (event: Event) => {
    if (!event.isTrusted) return;
    const entry = sources.get(control);
    if (entry) sources.set(control, { source: 'you', reviewed: true });
  };
  control.addEventListener('input', takeOwnership, { capture: true });
  control.addEventListener('change', takeOwnership, { capture: true });
}

export function answerSourceOf(control: HTMLElement): { source: AnswerSource; reviewed: boolean } | undefined {
  return sources.get(control);
}

/** The applicant reviewed a suggestion and kept it as is. */
export function markAnswerReviewed(control: HTMLElement): void {
  const entry = sources.get(control);
  if (entry) sources.set(control, { ...entry, reviewed: true });
}
