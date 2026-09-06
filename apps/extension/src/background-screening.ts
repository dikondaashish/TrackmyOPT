import { WEBSITE_URL } from './config';
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

export async function requestScreeningDraft(input: Record<string, unknown>) {
  const artifact = await readCurrentGeneratedResumeArtifact();
  if (!artifact) return { ok: false, error: 'artifact_unavailable' };
  const job = resolveScreeningDraftJobContext({
    artifactJob: artifact.job,
    pageContext: {
      companyName: String(input.companyName ?? ''),
      roleTitle: String(input.roleTitle ?? ''),
      jobDescription: String(input.jobDescription ?? ''),
    },
  });
  if (!job.jobDescription) {
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
  return response.json().catch(() => ({ ok: false, error: 'invalid_response' }));
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
