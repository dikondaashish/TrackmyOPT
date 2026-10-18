/**
 * Review-before-submit model. Built from the live field scan plus this run's
 * per-field outcomes; rebuilt whenever the form changes. It never claims an
 * application is complete: at best, everything TrackMyOPT can see is answered
 * and the applicant still reviews and submits it themselves.
 */
import type { ApplicationFieldScan, ScannedApplicationField } from '../prefill/application-field-scan';
import type { UploadVerification } from '../prefill/upload-verification';
import type { ResumeAttachmentResult } from '../easy-apply/easy-apply-attachments';
import {
  ANSWER_SOURCE_LABEL,
  FIELD_OUTCOME_REASON_COPY,
  answerSourceOf,
  sourceNeedsReview,
  type AnswerSource,
  type FieldOutcome,
} from './field-outcomes';

export type ReviewActionKind = 'go_to' | 'use_suggested' | 'keep_mine' | 'looks_right' | 'answer_yes' | 'answer_no';

export interface ReviewItem {
  key: string;
  label: string;
  detail?: string;
  /** Exact question text when the applicant must confirm what it means. */
  question?: string;
  control?: HTMLElement;
  source?: AnswerSource;
  actions: ReviewActionKind[];
  outcome?: FieldOutcome;
}

export type ResumeReviewState =
  | 'attached' | 'attached_unverified' | 'kept_existing' | 'not_attached' | 'failed' | 'none';

export interface ApplicationReview {
  filled: ReviewItem[];
  needsConfirmation: ReviewItem[];
  missingRequired: ReviewItem[];
  problems: ReviewItem[];
  resume: { state: ResumeReviewState; text: string };
  uninspectableFrames: number;
  status: 'ready_to_review' | 'needs_attention' | 'incomplete_inspection';
  statusText: string;
}

export interface ReviewInput {
  scan: ApplicationFieldScan;
  outcomes: FieldOutcome[];
  resume: { result?: ResumeAttachmentResult; verification?: UploadVerification; filename?: string };
  root: ParentNode;
  /** Items the applicant explicitly kept or confirmed in this review. */
  settled?: WeakSet<HTMLElement>;
}

function sameField(field: ScannedApplicationField, control: HTMLElement): boolean {
  if (field.control === control) return true;
  const a = field.control as HTMLInputElement | undefined;
  const b = control as HTMLInputElement;
  return Boolean(a && a.type === 'radio' && b.type === 'radio' && a.name && a.name === b.name && a.form === b.form);
}

/** Visible frames whose content TrackMyOPT cannot read (cross-origin or blocked). */
export function countUninspectableFrames(root: ParentNode): number {
  let count = 0;
  for (const frame of Array.from(root.querySelectorAll('iframe'))) {
    const rect = frame.getBoundingClientRect();
    const isJsdom = /jsdom/i.test(frame.ownerDocument.defaultView?.navigator.userAgent || '');
    if (!isJsdom && (rect.width < 40 || rect.height < 40)) continue;
    let readable = false;
    try { readable = Boolean(frame.contentDocument?.body); } catch { readable = false; }
    if (!readable) count += 1;
  }
  return count;
}

function resumeReview(resume: ReviewInput['resume']): ApplicationReview['resume'] {
  const name = resume.filename ? ` (${resume.filename})` : '';
  switch (resume.result) {
    case 'attached':
      if (resume.verification === 'rejected') return { state: 'failed', text: `The site rejected your resume${name}. Upload it again yourself.` };
      if (resume.verification && resume.verification !== 'verified') {
        return { state: 'attached_unverified', text: `Your tailored resume${name} was selected. Check that the site finished uploading it.` };
      }
      return { state: 'attached', text: `Your tailored resume${name} is attached.` };
    case 'already_present':
      return { state: 'kept_existing', text: 'The form already had a resume, so it was left unchanged. Check it is the one you want to send.' };
    case 'not_found':
      return { state: 'not_attached', text: 'No resume upload field is visible yet. Attach your resume when the form asks for it.' };
    case 'unsupported':
    case 'source_mismatch':
      return { state: 'failed', text: 'TrackMyOPT could not attach your resume here. Upload it yourself.' };
    default:
      return { state: 'none', text: 'No tailored resume was selected for this job. Upload your resume if the form asks for one.' };
  }
}

export function buildApplicationReview(input: ReviewInput): ApplicationReview {
  const filled: ReviewItem[] = [];
  const needsConfirmation: ReviewItem[] = [];
  const missingRequired: ReviewItem[] = [];
  const problems: ReviewItem[] = [];
  const settled = input.settled;
  const outcomeFor = (field: ScannedApplicationField) =>
    field.control ? input.outcomes.find(outcome => sameField(field, outcome.control)) : undefined;

  for (const field of [...input.scan.required, ...input.scan.optional]) {
    const outcome = outcomeFor(field);
    const control = field.control;
    const recorded = control ? answerSourceOf(control) : undefined;
    const base = { key: field.key, label: field.label, control, outcome };
    const isSettled = Boolean(control && settled?.has(control));

    if (field.filled && field.invalid) {
      problems.push({ ...base, detail: field.errorText || 'The site reports a problem with this answer.', actions: ['go_to'] });
      continue;
    }
    if (outcome && !isSettled && (outcome.status === 'needs_confirmation') && !field.filled) {
      needsConfirmation.push({
        ...base, question: outcome.question,
        detail: [outcome.reason ? FIELD_OUTCOME_REASON_COPY[outcome.reason] : '',
          outcome.proposedAnswer ? `Your saved answer: ${outcome.proposedAnswer}.` : ''].filter(Boolean).join(' '),
        actions: outcome.answerWith ? ['answer_yes', 'answer_no', 'go_to'] : ['go_to'],
      });
      continue;
    }
    if (outcome?.status === 'user_only' && !field.filled) {
      (field.required ? missingRequired : needsConfirmation).push({
        ...base, question: outcome.question, detail: outcome.reason ? FIELD_OUTCOME_REASON_COPY[outcome.reason] : undefined, actions: ['go_to'],
      });
      continue;
    }
    if (outcome?.status === 'kept_existing' && !isSettled && recorded?.source !== 'you') {
      needsConfirmation.push({
        ...base, detail: 'This field already had a different answer, so TrackMyOPT kept it. Use your saved value instead, or keep this answer.',
        actions: [...(outcome.replace ? ['use_suggested' as const] : []), 'keep_mine', 'go_to'],
      });
      continue;
    }
    if (field.filled) {
      const source: AnswerSource = recorded?.source ?? 'you';
      if (sourceNeedsReview(source) && !recorded?.reviewed && !isSettled) {
        needsConfirmation.push({ ...base, source, detail: ANSWER_SOURCE_LABEL[source], actions: ['looks_right', 'go_to'] });
      } else {
        filled.push({ ...base, source, detail: ANSWER_SOURCE_LABEL[source], actions: [] });
      }
      continue;
    }
    if (outcome && (outcome.status === 'failed' || outcome.status === 'unsupported')) {
      problems.push({ ...base, detail: outcome.reason ? FIELD_OUTCOME_REASON_COPY[outcome.reason] : undefined, actions: ['go_to'] });
      continue;
    }
    if (field.required) {
      missingRequired.push({
        ...base,
        detail: outcome?.reason ? FIELD_OUTCOME_REASON_COPY[outcome.reason] : 'Needs your answer.',
        actions: ['go_to'],
      });
    }
  }

  const resume = resumeReview(input.resume);
  if (resume.state === 'failed') problems.push({ key: 'resume', label: 'Resume', detail: resume.text, actions: [] });
  const uninspectableFrames = countUninspectableFrames(input.root);
  const attention = needsConfirmation.length + missingRequired.length + problems.length;
  let status: ApplicationReview['status'];
  let statusText: string;
  if (uninspectableFrames > 0) {
    status = 'incomplete_inspection';
    statusText = `Part of this application is inside ${uninspectableFrames === 1 ? 'a section' : `${uninspectableFrames} sections`} TrackMyOPT cannot inspect. Check ${uninspectableFrames === 1 ? 'it' : 'them'} yourself` +
      `${attention ? `, and review the ${attention} item${attention === 1 ? '' : 's'} below` : ''} before you submit.`;
  } else if (attention > 0) {
    status = 'needs_attention';
    statusText = `${attention} item${attention === 1 ? ' needs' : 's need'} your attention before you submit.`;
  } else {
    status = 'ready_to_review';
    statusText = 'Every required field TrackMyOPT can see has an answer. Review your answers, then submit the application yourself.';
  }
  return { filled, needsConfirmation, missingRequired, problems, resume, uninspectableFrames, status, statusText };
}
