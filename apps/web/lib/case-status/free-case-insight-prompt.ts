/**
 * Frequency controls for the contextual Free -> Pro case-insight prompt.
 *
 * The prompt appears only after the user has received value from case tracking.
 * A durable cooldown prevents it from turning into a repetitive interruption.
 */

export const CASE_INSIGHT_PROMPT_STORAGE_KEY =
  'trackmyopt_case_insight_prompt_last_shown_at_v1';

export const CASE_INSIGHT_PROMPT_SESSION_KEY =
  'trackmyopt_case_insight_prompt_shown_this_session_v1';

export const CASE_INSIGHT_PROMPT_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000;
export const CASE_INSIGHT_PROMPT_DELAY_MS = 8_000;

type CaseInsightPromptEligibility = {
  isPremium: boolean | null;
  hasCase: boolean;
  hasResolvedStatus: boolean;
  competingPromptOpen: boolean;
  shownThisSession: boolean;
  lastShownAtMs: number | null;
  nowMs?: number;
};

export function shouldShowCaseInsightPrompt({
  isPremium,
  hasCase,
  hasResolvedStatus,
  competingPromptOpen,
  shownThisSession,
  lastShownAtMs,
  nowMs = Date.now(),
}: CaseInsightPromptEligibility): boolean {
  if (isPremium !== false) return false;
  if (!hasCase || !hasResolvedStatus) return false;
  if (competingPromptOpen || shownThisSession) return false;

  if (lastShownAtMs === null || !Number.isFinite(lastShownAtMs)) return true;
  return nowMs - lastShownAtMs >= CASE_INSIGHT_PROMPT_COOLDOWN_MS;
}

export function parsePromptTimestamp(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}
