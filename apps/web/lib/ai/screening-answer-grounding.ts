import type { ScreeningQuestionDraftRequest } from './screening-answer-contract';

type ScreeningDraftGroundingValidation =
  | { valid: true }
  | { valid: false; reason: 'insufficient_context' | 'sensitive' };

const SENSITIVE_DRAFT_RE =
  /\b(?:visa|sponsor(?:ship)?|work\s+authori[sz]ation|authori[sz]ed\s+to\s+work|eligible\s+to\s+work|work\s+permit|citizen(?:ship)?|immigration\s+status|security\s+clearance|gender|sex|race|ethnic(?:ity)?|equal\s+employment|equal\s+opportunity|eeo|salary|compensation|desired\s+pay|pay\s+range|date\s+of\s+birth|dob|social\s+security|ssn|disabilit(?:y|ies)|veteran)\b/i;

const GENERIC_TOKEN_RE =
  /^(?:about|applicant|application|company|contribute|excited|experience|great|interested|join|opportunity|position|professional|responsibilities|role|skills|strong|team|wonderful|work|working|would|your)$/;

function evidenceTokens(value: unknown): Set<string> {
  const tokens = JSON.stringify(value)
    .normalize('NFKC')
    .toLowerCase()
    .match(/[a-z0-9+#.-]{4,}/g);
  return new Set(
    (tokens ?? []).filter((token) => !GENERIC_TOKEN_RE.test(token))
  );
}

function draftTokens(value: string): Set<string> {
  return evidenceTokens(value);
}

function overlaps(draft: Set<string>, evidence: Set<string>): boolean {
  for (const token of draft) {
    if (evidence.has(token)) return true;
  }
  return false;
}

export function validateScreeningDraftGrounding(
  draft: string,
  request: ScreeningQuestionDraftRequest
): ScreeningDraftGroundingValidation {
  const normalizedDraft = draft.normalize('NFKC').trim();
  if (!normalizedDraft || normalizedDraft === 'NEEDS_USER_INPUT') {
    return { valid: false, reason: 'insufficient_context' };
  }
  if (SENSITIVE_DRAFT_RE.test(normalizedDraft)) {
    return { valid: false, reason: 'sensitive' };
  }

  const resumeEvidence = {
    summary: request.snapshot.summary,
    skills: request.snapshot.skills,
    experience: request.snapshot.experience,
    education: request.snapshot.education,
    certifications: request.snapshot.certifications,
  };
  const generatedTokens = draftTokens(normalizedDraft);
  const hasJobAnchor = overlaps(generatedTokens, evidenceTokens(request.job));
  const hasResumeAnchor = overlaps(
    generatedTokens,
    evidenceTokens(resumeEvidence)
  );

  return hasJobAnchor && hasResumeAnchor
    ? { valid: true }
    : { valid: false, reason: 'insufficient_context' };
}
