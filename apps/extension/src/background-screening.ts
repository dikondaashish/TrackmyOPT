import { WEBSITE_URL } from './config';
import { looksLikeRealJobPostingText } from './job-description';
import { normalizeQuestionText } from './screening-question-drafts';
import {
  deleteSavedScreeningAnswer,
  loadSavedScreeningAnswer,
  saveScreeningAnswer,
  type SavedAnswerWrite,
} from './saved-screening-answers';
import { resolveScreeningDraftJobContext } from './screening-draft-context';
import { getExtensionBearerToken } from './background-auth';
import { readCurrentGeneratedResumeArtifact } from './background-resume-artifact';
import { validateArtifactForPrefill } from './resume-artifact-lifecycle';
import { isSensitiveApplicationQuestion } from './sensitive-question-policy';
import {hasQuestionEvidence} from './screening-answer-evidence';

export async function requestScreeningDraft(input: Record<string, unknown>) {
  if (isSensitiveApplicationQuestion(String(input.questionText ?? ''))) return {ok:false,error:'sensitive'};
  const artifact = await readCurrentGeneratedResumeArtifact();
  if (!artifact) return { ok: false, error: 'artifact_unavailable' };
  if (typeof input.jobUrl !== 'string' || !input.jobUrl) return {ok:false,error:'job_changed'};
  const validation = validateArtifactForPrefill(artifact, {
    jobUrl: input.jobUrl,
    companyName: String(input.companyName ?? ''),
    roleTitle: String(input.roleTitle ?? ''),
  });
  if (!validation.valid) return {ok:false,error:validation.reason};
  if (!hasQuestionEvidence(String(input.questionText ?? ''),artifact.snapshot)) return {ok:false,error:'insufficient_context'};
  const job = resolveScreeningDraftJobContext({
    artifactJob: artifact.job,
    pageContext: {
      companyName: String(input.companyName ?? ''),
      roleTitle: String(input.roleTitle ?? ''),
      jobDescription: String(input.jobDescription ?? ''),
    },
  });
  if (!looksLikeRealJobPostingText(job.jobDescription)) {
    return { ok: false, error: 'insufficient_context' };
  }
  const bearer = await getExtensionBearerToken();
  if (!bearer) return { ok: false, error: 'not_signed_in' };
  const response = await fetch(`${WEBSITE_URL}/api/extension/screening-answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${bearer}` },
    body: JSON.stringify({
      questionText: normalizeQuestionText(String(input.questionText ?? '')),
      ...(typeof input.characterLimit === 'number' ? { characterLimit: input.characterLimit } : {}),
      job,
      snapshot: artifact.snapshot,
      sourceContentHash: artifact.generatedContentHash,
      regenerate: input.regenerate === true,
    }),
  });
  const body = await response.json().catch(() => ({ ok: false, error: 'invalid_response' }));
  return response.ok ? body : {ok:false,error:body.error || 'generation_failed'};
}

export async function requestSavedScreeningAnswer(method: 'GET' | 'DELETE', questionHash: string) {
  const bearer = await getExtensionBearerToken();
  if (!bearer) return { ok: false, error: 'not_signed_in' };
  return method === 'GET'
    ? loadSavedScreeningAnswer(bearer, questionHash)
    : deleteSavedScreeningAnswer(bearer, questionHash);
}

export async function saveScreeningAnswerForCurrentUser(answer: SavedAnswerWrite) {
  const bearer = await getExtensionBearerToken();
  if (!bearer) return { ok: false, error: 'not_signed_in' };
  return saveScreeningAnswer(bearer, answer);
}
