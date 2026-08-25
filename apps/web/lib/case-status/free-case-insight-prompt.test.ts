import { describe, expect, it } from 'vitest';
import {
  CASE_INSIGHT_PROMPT_COOLDOWN_MS,
  parsePromptTimestamp,
  shouldShowCaseInsightPrompt,
} from '@/lib/case-status/free-case-insight-prompt';

const NOW = Date.UTC(2026, 7, 24);

function eligible(
  overrides: Partial<Parameters<typeof shouldShowCaseInsightPrompt>[0]> = {}
) {
  return shouldShowCaseInsightPrompt({
    isPremium: false,
    hasCase: true,
    hasResolvedStatus: true,
    competingPromptOpen: false,
    shownThisSession: false,
    lastShownAtMs: null,
    nowMs: NOW,
    ...overrides,
  });
}

describe('shouldShowCaseInsightPrompt', () => {
  it('shows for a free user with a resolved case and no previous prompt', () => {
    expect(eligible()).toBe(true);
  });

  it('does not show for premium or unresolved plan state', () => {
    expect(eligible({ isPremium: true })).toBe(false);
    expect(eligible({ isPremium: null })).toBe(false);
  });

  it('waits until a case has a real status', () => {
    expect(eligible({ hasCase: false })).toBe(false);
    expect(eligible({ hasResolvedStatus: false })).toBe(false);
  });

  it('does not compete with another prompt or repeat in the same session', () => {
    expect(eligible({ competingPromptOpen: true })).toBe(false);
    expect(eligible({ shownThisSession: true })).toBe(false);
  });

  it('enforces the fourteen-day cooldown', () => {
    expect(
      eligible({ lastShownAtMs: NOW - CASE_INSIGHT_PROMPT_COOLDOWN_MS + 1 })
    ).toBe(false);
    expect(
      eligible({ lastShownAtMs: NOW - CASE_INSIGHT_PROMPT_COOLDOWN_MS })
    ).toBe(true);
  });
});

describe('parsePromptTimestamp', () => {
  it('accepts stored timestamps and rejects invalid values', () => {
    expect(parsePromptTimestamp('1234')).toBe(1234);
    expect(parsePromptTimestamp(null)).toBeNull();
    expect(parsePromptTimestamp('not-a-number')).toBeNull();
    expect(parsePromptTimestamp('-1')).toBeNull();
  });
});
