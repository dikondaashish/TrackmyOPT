/**
 * Heuristic label -> field-kind matchers for job-application forms.
 *
 * Written from scratch for TrackMyOPT. The multilingual label vocabulary is
 * INFORMED BY the field-matching regexes in AutoApplyMax
 * (github.com/Azoo92i/AutoApplyMax, AGPL-3.0), used by Zyene, Inc. under a
 * separate written license grant. None of AutoApplyMax's control flow,
 * auto-submit, or detection-evasion code is used here.
 *
 * SAFETY: SENSITIVE_FIELD_RE fields are NEVER classified for ordinary profile
 * autofill. They may only be handled by the separate, explicitly reviewed
 * encrypted-answer flow.
 */

import { SENSITIVE_QUESTION_RE } from '../prefill/sensitive-question-policy';

export { SENSITIVE_QUESTION_RE } from '../prefill/sensitive-question-policy';

export type FieldKind =
  | 'email'
  | 'phone'
  | 'phoneCountryCode'
  | 'phoneDeviceType'
  | 'firstName'
  | 'lastName'
  | 'fullName'
  | 'country'
  | 'streetAddress'
  | 'city'
  | 'state'
  | 'postalCode'
  | 'countyDistrict'
  | 'location'
  | 'yearsExperience'
  | 'linkedinUrl'
  | 'githubUrl'
  | 'portfolioUrl'
  | 'skills'
  // Resume-only kinds: filled solely from this job's generated resume.
  | 'currentCompany'
  | 'currentTitle'
  | 'summary';

/** Questions about a name, not requests for it ("How do you pronounce your name?"). */
const NAME_QUESTION_RE = /\b(pronounc\w*|preferred|nickname|pronouns?|phonetic|how do|how should)\b/;
/** Location choices about the role or office rather than where the applicant lives. */
const ROLE_LOCATION_RE = /\b(opportunity|office|preferred|desired|which location|work location|job location|position location|hiring location|relocat\w*)\b/;

/** Backwards-compatible name used by the deterministic prefill modules. */
export const SENSITIVE_FIELD_RE = SENSITIVE_QUESTION_RE;

/**
 * Free-text prompts (cover letters, "describe…", essays). Never dump identity
 * data into these — skip them.
 */
const ESSAY_RE =
  /\b(describe|tell us|why do|why are|explain|cover letter|message|summary|additional information|anything else|share|contributions?|elaborate)\b/i;
/** Consent and acknowledgement prompts mention a channel ("Phone") but ask for agreement. */
const CONSENT_RE = /\b(consent|i agree|acknowledge|opt in|opt-in|authori[sz]e (?:you|us) to)\b/i;

/**
 * Fields about a company / school / reference / manager — someone or something
 * OTHER than the applicant. Skipped entirely (also stops "company website" etc.
 * from being treated as the applicant's own field).
 */
export const ORG_TRAP_RE =
  /\b(referr\w*|manager|supervisor|(?:company|employer|organization|organisation)\s+(?:email|website|web\s*site|github))\b/i;
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
  const resumeKind = classifyResumeOnlyField(t);
  if (resumeKind) return resumeKind;
  if (ESSAY_RE.test(t)) return null;
  if (CONSENT_RE.test(t)) return null;
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

  // Phone sub-controls before the general phone rule. Forms routinely split the
  // number into a dial-code select, a device-type select, and the digits; all
  // three match /phone/, so without these the country-code and type dropdowns
  // received the full phone number and silently matched nothing.
  // A bare "country code" stays an address field — it is usually an ISO list.
  // Only an explicit dial-code term, or a country code sitting in a phone
  // context, is treated as the "+1" select.
  const phoneContext = /\b(phone|telephone|tel|mobile|cell)\b/.test(t);
  if (
    /\b(?:dial|isd|std)\s*code\b/.test(t) ||
    (phoneContext && /\b(code|country)\b/.test(t))
  ) {
    return 'phoneCountryCode';
  }
  if (
    /\b(?:phone|telephone|tel|contact)\s*(?:number\s*)?(?:device\s*)?type\b/.test(t) ||
    /\b(?:device|number)\s*type\b/.test(t)
  ) {
    return 'phoneDeviceType';
  }

  // A bare "tel" is a phone token only outside a parenthesised code:
  // "Telugu (TEL)" in a language list is not a phone number.
  if (/\b(phone|telephone|téléphone|telefono|mobile|cell|portable)\b/.test(t) ||
      (/\btel\b/.test(t) && !/\(\s*tel\s*\)/.test(labelText.toLowerCase()))) return 'phone';
  // normalizeFieldSignal splits camelCase, so "LinkedIn" becomes "linked in";
  // tolerate the space/hyphen so human-facing "LinkedIn Profile URL" labels match.
  if (/\blinked[\s-]?in\b/.test(t)) return 'linkedinUrl';
  // CamelCase normalization turns "GitHub" into "git hub".
  if (/\bgit[\s-]?hub\b/.test(t)) return 'githubUrl';
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
  if (/\b(full name|legal name|your name|nom complet|nombre completo)\b/.test(t) &&
      !NAME_QUESTION_RE.test(t)) return 'fullName';
  if (t === 'name') return 'fullName'; // HTML autocomplete="name"

  if (/\b(address line\s*1|street address|street-address)\b/.test(t)) return 'streetAddress';
  if (/\baddress level\s*2\b/.test(t)) return 'city'; // HTML autocomplete token
  if (/\baddress level\s*1\b/.test(t)) return 'state'; // HTML autocomplete token
  if (/\b(country|country name|country-name)\b/.test(t)) return 'country';
  if (/\b(zip|zip code|postal code|postal-code)\b/.test(t)) return 'postalCode';
  if (/\b(county|district)\b/.test(t)) return 'countyDistrict';
  if (/\b(city|town|ville|ciudad)\b/.test(t)) return 'city';
  if (/\b(state|province|région|region)\b/.test(t)) return 'state';
  // "Which office / job location?" is a choice about the role, not the
  // applicant's home location, and stays with the applicant.
  if (/\b(location|localisation|where are you currently located)\b/.test(t) &&
      !ROLE_LOCATION_RE.test(t)) return 'location';

  return null;
}

const RECENCY_RE = /\b(?:current|currently|present|most recent|latest)\b/;
/** Yes/no and permission prompts mention an employer but do not ask for it. */
const YES_NO_PROMPT_RE =
  /\?|\b(?:are you|do you|have you|did you|will you|would you|may we|can we|contact|reference|permission|ok to|okay to|notice)\b/;
const SUMMARY_PHRASE_RE =
  /\b(?:(?:professional|resume|career|profile|executive) summary|summary of qualifications)\b/;
const SUMMARY_FILLER_RE =
  /\b(?:summary|professional|resume|career|profile|executive|your|enter|required|optional|field)\b/g;
const OPEN_QUESTION_RE =
  /\b(?:describe|tell us|why|explain|cover letter|message|additional information|anything else|how|what|share|elaborate)\b/;

/**
 * Applicant-history fields that sit outside a repeatable employment row:
 * "Current company", "Most recent job title", "Professional summary". They are
 * resume facts, never profile facts, so a value exists only when this job's
 * generated resume does.
 */
function classifyResumeOnlyField(t: string): FieldKind | null {
  if (ORG_TRAP_RE.test(t)) return null;
  if (RECENCY_RE.test(t) && !OPEN_QUESTION_RE.test(t) && !YES_NO_PROMPT_RE.test(t)) {
    if (/\b(?:company|employer|organization|organisation)\b/.test(t) &&
        !/\b(?:email|website|web site|phone|address|url|size|industry)\b/.test(t)) {
      return 'currentCompany';
    }
    if (/\b(?:job title|title|position|designation|role)\b/.test(t) &&
        !/\b(?:salary|compensation|pay|level|description|responsibilit\w*)\b/.test(t)) {
      return 'currentTitle';
    }
  }
  if (!OPEN_QUESTION_RE.test(t) &&
      (SUMMARY_PHRASE_RE.test(t) ||
       (/\bsummary\b/.test(t) && !t.replace(SUMMARY_FILLER_RE, ' ').replace(/[(),*]/g, ' ').trim()))) {
    return 'summary';
  }
  return null;
}

/** Kinds whose value comes only from the generated resume snapshot. */
export function isResumeOnlyFieldKind(
  kind: FieldKind
): kind is 'currentCompany' | 'currentTitle' | 'summary' {
  return kind === 'currentCompany' || kind === 'currentTitle' || kind === 'summary';
}
