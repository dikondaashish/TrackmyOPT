/**
 * One fail-closed policy for application questions that TrackMyOPT must never
 * answer or generate. This module is intentionally dependency-free so the
 * extension bundle and the web screening route can import the exact same
 * expression.
 */
export const SENSITIVE_QUESTION_RE =
  /\b(visa|sponsor(?:ship|ed|ing)?|work authori[sz]\w*|authori[sz]\w*|work permit|eligib\w*|citizen\w*|immigration|security clearance|clearance|gender|sex|race|ethnic\w*|hispanic|latino|veteran\w*|disab\w*|eeo|equal opportunity|salary|compensation|expected pay|desired pay|date of birth|dob|ssn|social security)\b/i;

export function isSensitiveApplicationQuestion(value: string): boolean {
  return SENSITIVE_QUESTION_RE.test(value);
}
