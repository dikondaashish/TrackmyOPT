import { WEBSITE_URL } from './config';
import type { SavedScreeningAnswer } from './screening-question-drafts';

export interface SavedAnswerWrite {
  questionHash: string;
  normalizedQuestionText: string;
  editedAnswer: string;
  source: 'user_edited_ai_draft' | 'user_written';
}

type SavedAnswerResponse = { ok: boolean; answer?: SavedScreeningAnswer | null; deleted?: boolean; error?: string };

async function request(path: string, token: string, init?: RequestInit): Promise<SavedAnswerResponse> {
  const response = await fetch(`${WEBSITE_URL}/api/extension/screening-answers${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`,
    },
  });
  const body = await response.json().catch(() => ({ ok: false, error: 'invalid_response' }));
  if (!response.ok) return { ok: false, error: body.error || 'request_failed' };
  return body;
}

export function loadSavedScreeningAnswer(token: string, questionHash: string) {
  return request(`?questionHash=${encodeURIComponent(questionHash)}`, token);
}

export function saveScreeningAnswer(token: string, answer: SavedAnswerWrite) {
  return request('', token, { method: 'POST', body: JSON.stringify(answer) });
}

export function deleteSavedScreeningAnswer(token: string, questionHash: string) {
  return request(`?questionHash=${encodeURIComponent(questionHash)}`, token, { method: 'DELETE' });
}

/** Safe telemetry contains no question or answer material. */
export function savedAnswerAnalyticsProperties(action: 'saved' | 'deleted' | 'reused') {
  return { action, matchType: 'exact_text' as const };
}

