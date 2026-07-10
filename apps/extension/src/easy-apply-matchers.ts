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
  | 'portfolioUrl';

/**
 * Fields we refuse to auto-fill under any circumstance. (Unchanged from slice 1.)
 */
export const SENSITIVE_FIELD_RE =
  /\b(visa|sponsor|sponsorship|authoriz|work permit|eligib|citizen|immigration|clearance|gender|sex|race|ethnic|hispanic|latino|veteran|disab|eeo|equal opportunity|salary|compensation|expected pay|desired pay|date of birth|dob|ssn|social security)\b/i;

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
const ORG_TRAP_RE =
  /\b(company|employer|organization|organisation|school|university|college|institution|reference|referral|referrer|manager|supervisor)\b/i;

/**
 * Classify a form field from its combined label text. Returns null when there
 * is no confident, safe match (the caller then leaves the field untouched).
 */
export function classifyField(labelText: string): FieldKind | null {
  const t = labelText.trim().toLowerCase();
  if (!t) return null;

  // Order matters: exclusions first, then most-specific matches.
  if (SENSITIVE_FIELD_RE.test(t)) return null; // always left for the user
  if (ESSAY_RE.test(t)) return null;
  if (ORG_TRAP_RE.test(t)) return null;

  if (/\b(e-?mail|courriel|correo)\b/.test(t)) return 'email';
  if (/\b(phone|telephone|téléphone|telefono|mobile|cell|portable)\b/.test(t)) return 'phone';
  if (/\blinkedin\b/.test(t)) return 'linkedinUrl';
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

  if (/\b(city|town|ville|ciudad)\b/.test(t)) return 'city';
  if (/\b(state|province|région|region)\b/.test(t)) return 'state';
  if (/\b(location|localisation)\b/.test(t)) return 'location';

  return null;
}
