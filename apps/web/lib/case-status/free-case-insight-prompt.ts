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
/**
 * The prompt waits for a return visit. In the weeks before this rule it opened
 * right after the receipt was saved: about 300 people saw the offer and 5
 * continued to checkout, and the 14-day cooldown then kept it from showing on
 * the visit where a status change had just been found.
 */
export const CASE_INSIGHT_MIN_CASE_AGE_MS = 20 * 60 * 60 * 1000;

type CaseInsightPromptEligibility = {
  isPremium: boolean | null;
  hasCase: boolean;
  hasResolvedStatus: boolean;
  competingPromptOpen: boolean;
  shownThisSession: boolean;
  lastShownAtMs: number | null;
  /** When the case was saved (ISO). Missing or invalid means "not yet". */
  caseCreatedAt?: string | null;
  nowMs?: number;
};

export function shouldShowCaseInsightPrompt({
  isPremium,
  hasCase,
  hasResolvedStatus,
  competingPromptOpen,
  shownThisSession,
  lastShownAtMs,
  caseCreatedAt,
  nowMs = Date.now(),
}: CaseInsightPromptEligibility): boolean {
  if (isPremium !== false) return false;
  if (!hasCase || !hasResolvedStatus) return false;
  if (competingPromptOpen || shownThisSession) return false;
  const createdAtMs = caseCreatedAt ? Date.parse(caseCreatedAt) : NaN;
  if (
    !Number.isFinite(createdAtMs) ||
    nowMs - createdAtMs < CASE_INSIGHT_MIN_CASE_AGE_MS
  )
    return false;

  if (lastShownAtMs === null || !Number.isFinite(lastShownAtMs)) return true;
  return nowMs - lastShownAtMs >= CASE_INSIGHT_PROMPT_COOLDOWN_MS;
}

export function parsePromptTimestamp(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}
