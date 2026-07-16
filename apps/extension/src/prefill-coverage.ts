export interface PrefillCoverageResult {
  filled: number;
  skipped: number;
  total: number;
  firstSkippedSelector?: string;
}

export interface PrefillControlOutcome {
  filled?: boolean;
  needsUser?: boolean;
  /** Controls in one logical field (for example a radio group) share a key. */
  groupKey?: string;
  selector?: string;
}

/** Convert per-control outcomes into the compact coverage shown by the widget. */
export function summarizePrefillOutcomes(
  outcomes: PrefillControlOutcome[],
): PrefillCoverageResult {
  const filled = outcomes.reduce((count, outcome) => count + (outcome.filled ? 1 : 0), 0);
  const skippedGroups = new Set<string>();
  let firstSkippedSelector: string | undefined;

  for (let index = 0; index < outcomes.length; index += 1) {
    const outcome = outcomes[index];
    if (!outcome.needsUser) continue;
    const key = outcome.groupKey || `control:${index}`;
    if (skippedGroups.has(key)) continue;
    skippedGroups.add(key);
    if (!firstSkippedSelector && outcome.selector) {
      firstSkippedSelector = outcome.selector;
    }
  }

  const skipped = skippedGroups.size;
  return {
    filled,
    skipped,
    total: filled + skipped,
    ...(firstSkippedSelector ? { firstSkippedSelector } : {}),
  };
}
