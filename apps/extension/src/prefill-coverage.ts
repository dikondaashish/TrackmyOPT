export type PrefillFieldGroup = 'resume' | 'contact' | 'skills';

export interface PrefillCoverageGroupResult {
  filled: number;
  skipped: number;
  total: number;
}

export interface PrefillCoverageResult {
  filled: number;
  skipped: number;
  total: number;
  groups: Record<PrefillFieldGroup, PrefillCoverageGroupResult>;
  firstSkippedSelector?: string;
}

export interface PrefillControlOutcome {
  filled?: boolean;
  needsUser?: boolean;
  /** Controls in one logical field (for example a radio group) share a key. */
  groupKey?: string;
  fieldGroup?: PrefillFieldGroup;
  selector?: string;
}

export function emptyPrefillCoverage(): PrefillCoverageResult {
  return {
    filled: 0,
    skipped: 0,
    total: 0,
    groups: {
      resume: { filled: 0, skipped: 0, total: 0 },
      contact: { filled: 0, skipped: 0, total: 0 },
      skills: { filled: 0, skipped: 0, total: 0 },
    },
  };
}

/** Human-readable grouped result; analytics continue to receive counts only. */
export function formatPrefillCoverageSummary(result: PrefillCoverageResult): string {
  const parts: string[] = [];
  if (result.groups.resume.filled > 0) parts.push('Resume attached');
  if (result.groups.contact.filled > 0) {
    const count = result.groups.contact.filled;
    parts.push(`${count} contact field${count === 1 ? '' : 's'}`);
  }
  if (result.groups.skills.filled > 0) {
    const count = result.groups.skills.filled;
    parts.push(`${count} skills field${count === 1 ? '' : 's'} filled`);
  }
  if (result.skipped > 0) parts.push(`${result.skipped} need you`);
  else if (parts.length > 0) parts.push('ready to review');
  return parts.join(' · ');
}

/** Convert per-control outcomes into the compact coverage shown by the widget. */
export function summarizePrefillOutcomes(
  outcomes: PrefillControlOutcome[],
): PrefillCoverageResult {
  const result = emptyPrefillCoverage();
  const filled = outcomes.reduce((count, outcome) => count + (outcome.filled ? 1 : 0), 0);
  const skippedGroups = new Set<string>();
  let firstSkippedSelector: string | undefined;

  for (const outcome of outcomes) {
    if (!outcome.filled || !outcome.fieldGroup) continue;
    result.groups[outcome.fieldGroup].filled += 1;
  }

  for (let index = 0; index < outcomes.length; index += 1) {
    const outcome = outcomes[index];
    if (!outcome.needsUser) continue;
    const key = outcome.groupKey || `control:${index}`;
    if (skippedGroups.has(key)) continue;
    skippedGroups.add(key);
    if (outcome.fieldGroup) result.groups[outcome.fieldGroup].skipped += 1;
    if (!firstSkippedSelector && outcome.selector) {
      firstSkippedSelector = outcome.selector;
    }
  }

  const skipped = skippedGroups.size;
  for (const group of Object.values(result.groups)) {
    group.total = group.filled + group.skipped;
  }
  return {
    filled,
    skipped,
    total: filled + skipped,
    groups: result.groups,
    ...(firstSkippedSelector ? { firstSkippedSelector } : {}),
  };
}
