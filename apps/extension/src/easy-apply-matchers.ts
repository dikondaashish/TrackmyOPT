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

export type FieldKind = 'email' | 'firstName' | 'lastName' | 'fullName';

/**
 * Fields we refuse to auto-fill under any circumstance.
 */
export const SENSITIVE_FIELD_RE =
  /\b(visa|sponsor|sponsorship|authoriz|work permit|eligib|citizen|immigration|clearance|gender|sex|race|ethnic|hispanic|latino|veteran|disab|eeo|equal opportunity|salary|compensation|expected pay|desired pay|date of birth|dob|ssn|social security)\b/i;

/**
 * "name"-like labels that are NOT the applicant's own name — never treat these
 * as a name field (e.g. "Company name", "School name", "Reference name").
 */
const NAME_TRAP_RE =
  /\b(company|employer|organization|organisation|school|university|college|institution|reference|referral|referrer|middle|preferred|nick|screen|user|display|file|website|url|manager|supervisor)\b/i;

/**
 * Classify a form field from its combined label text. Returns null when there
 * is no confident, safe match (the caller then leaves the field untouched).
 */
export function classifyField(labelText: string): FieldKind | null {
  const t = labelText.trim().toLowerCase();
  if (!t) return null;

  // Sensitive fields are always left for the user.
  if (SENSITIVE_FIELD_RE.test(t)) return null;

  if (/\b(e-?mail|courriel|correo)\b/.test(t)) return 'email';

  // Anything name-like that is clearly someone/something else's name is skipped.
  if (NAME_TRAP_RE.test(t)) return null;

  if (/\b(first name|given name|prénom|prenom|nombre|vorname)\b/.test(t)) return 'firstName';
  if (/\b(last name|surname|family name|apellido|nachname)\b/.test(t)) return 'lastName';
  if (/\b(full name|legal name|your name|nom complet|nombre completo)\b/.test(t)) return 'fullName';

  return null;
}
