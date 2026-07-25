/**
 * Heuristic label -> field-kind matchers for job-application forms.
 *
 * Written from scratch for TrackMyOPT. The multilingual label vocabulary is
 * INFORMED BY the field-matching regexes in AutoApplyMax
 * (github.com/Azoo92i/AutoApplyMax, AGPL-3.0), used by Zyene, Inc. under a
 * separate written license grant. None of AutoApplyMax's control flow,
 * auto-submit, or detection-evasion code is used here.
 *
 * SAFETY: SENSITIVE_FIELD_RE fields are NEVER classified for auto-fill. Work
 * authorization, visa/sponsorship, EEO, salary, DOB and SSN answers must be
 * entered by the user — they carry outsized consequences for F-1/OPT users.
 */

import { SENSITIVE_QUESTION_RE } from './sensitive-question-policy';

export { SENSITIVE_QUESTION_RE } from './sensitive-question-policy';

export type FieldKind =
  | 'email'
  | 'phone'
  | 'firstName'
  | 'lastName'
  | 'fullName'
  | 'city'
  | 'state'
  | 'location'
  | 'yearsExperience'
  | 'linkedinUrl'
  | 'portfolioUrl'
  | 'skills';

/** Backwards-compatible name used by the deterministic prefill modules. */
export const SENSITIVE_FIELD_RE = SENSITIVE_QUESTION_RE;

/**
 * Free-text prompts (cover letters, "describe…", essays). Never dump identity
 * data into these — skip them.
 */
const ESSAY_RE =
  /\b(describe|tell us|why do|why are|explain|cover letter|message|summary|additional information|anything else)\b/i;

/**
 * Fields about a company / school / reference / manager — someone or something
 * OTHER than the applicant. Skipped entirely (also stops "company website" etc.
 * from being treated as the applicant's own field).
 */
export const ORG_TRAP_RE =
  /\b(website|web\s*site|referr\w*|manager|supervisor|(?:company|employer|organization|organisation)\s+email)\b/i;
const NON_APPLICANT_ORG_RE =
  /\b(company|employer|organization|organisation|school|university|college|institution|reference)\b/i;

/** Normalize machine-oriented ATS identifiers before applying human-label
 * matchers. This makes candidate[first_name], first_name and firstName behave
 * like "first name" and, critically, lets sensitive-field exclusions see
 * compound identifiers such as visa_sponsorship_email. */
export function normalizeFieldSignal(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/[\[\]_.:/\\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Classify a form field from its combined label text. Returns null when there
 * is no confident, safe match (the caller then leaves the field untouched).
 */
export function classifyField(labelText: string): FieldKind | null {
  const t = normalizeFieldSignal(labelText);
  if (!t) return null;

  // Order matters: exclusions first, then most-specific matches.
  if (SENSITIVE_FIELD_RE.test(t)) return null; // always left for the user
  if (ESSAY_RE.test(t)) return null;
  if (NON_APPLICANT_ORG_RE.test(t) || ORG_TRAP_RE.test(t)) return null;

  // Rule 8: only a dedicated, plainly labelled skills field. Qualifiers are
  // intentionally allowlisted so technology-specific or eligibility prompts
  // do not become resume-backed skills targets.
  const dedicatedSkillsSignal = /\b(?:(?:technical|core|professional|key) )?skills\b/.test(t);
  const skillsSignalRemainder = t
    .replace(/\b(?:(?:technical|core|professional|key) )?skills\b/g, ' ')
    .replace(/\b(?:enter|your|list|comma|separated|required|optional|field|add)\b/g, ' ')
    .replace(/[(),*]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (dedicatedSkillsSignal && !skillsSignalRemainder) return 'skills';

  if (/\b(e-?mail|courriel|correo)\b/.test(t)) return 'email';
  if (/\b(phone|telephone|tel|téléphone|telefono|mobile|cell|portable)\b/.test(t)) return 'phone';
  // normalizeFieldSignal splits camelCase, so "LinkedIn" becomes "linked in";
  // tolerate the space/hyphen so human-facing "LinkedIn Profile URL" labels match.
  if (/\blinked[\s-]?in\b/.test(t)) return 'linkedinUrl';
  if (/\b(portfolio|personal website|personal site|website|web site)\b/.test(t)) return 'portfolioUrl';

  // Years of experience — CONSERVATIVE. Only a bare, general question fills.
  // Skill/technology/domain-qualified variants ("years with Java", "years of X
  // experience", "experience in <domain>") are left blank on purpose: a
  // plausible-but-wrong number is worse than an empty field.
  if (/\byears?\b/.test(t) && /\bexperience\b/.test(t)) {
    const skillQualified =
      /\b(with|using|in)\s+[a-z]/.test(t) ||
      /years?\s+of\s+(?!work\b|professional\b|relevant\b|total\b|paid\b|overall\b)[a-z][\w ]*?\bexperience\b/.test(t);
    const bareGeneral =
      /\b(how many\s+)?(total\s+|overall\s+)?years?\s+(of\s+)?(work\s+|professional\s+|relevant\s+)?experience\b/.test(t);
    return !skillQualified && bareGeneral ? 'yearsExperience' : null;
  }

  if (/\b(first name|given name|prénom|prenom|nombre|vorname)\b/.test(t)) return 'firstName';
  if (/\b(last name|surname|family name|apellido|nachname)\b/.test(t)) return 'lastName';
  if (/\b(full name|legal name|your name|nom complet|nombre completo)\b/.test(t)) return 'fullName';
  if (t === 'name') return 'fullName'; // HTML autocomplete="name"

  if (/\baddress level\s*2\b/.test(t)) return 'city'; // HTML autocomplete token
  if (/\baddress level\s*1\b/.test(t)) return 'state'; // HTML autocomplete token
  if (/\b(city|town|ville|ciudad)\b/.test(t)) return 'city';
  if (/\b(state|province|région|region)\b/.test(t)) return 'state';
  if (/\b(location|localisation)\b/.test(t)) return 'location';

  return null;
}
