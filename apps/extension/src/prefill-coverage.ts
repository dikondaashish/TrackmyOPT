import type { ApplicationFieldScan } from './application-field-scan';

export type PrefillFieldGroup =
  | 'resume'
  | 'cover_letter'
  | 'contact'
  | 'skills'
  | 'experience'
  | 'education';

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
  adapterId?: 'generic' | 'workday' | 'greenhouse';
  remainingRecords?: { experience: number; education: number };
  firstSkippedSelector?: string;
  applicationScan?: ApplicationFieldScan;
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
      cover_letter: { filled: 0, skipped: 0, total: 0 },
      contact: { filled: 0, skipped: 0, total: 0 },
      skills: { filled: 0, skipped: 0, total: 0 },
      experience: { filled: 0, skipped: 0, total: 0 },
      education: { filled: 0, skipped: 0, total: 0 },
    },
  };
}

/** Human-readable grouped result; analytics continue to receive counts only. */
export function formatPrefillCoverageSummary(result: PrefillCoverageResult): string {
  const parts: string[] = [];
  if (result.applicationScan?.requiredTotal) {
    const scan = result.applicationScan;
    parts.push(
      `${scan.requiredFilled}/${scan.requiredTotal} required fields complete`
    );
  }
  if (result.groups.resume.filled > 0) parts.push('Resume attached');
  if (result.groups.cover_letter.filled > 0)
    parts.push('Cover letter attached');
  if (result.groups.contact.filled > 0) {
    const count = result.groups.contact.filled;
    parts.push(`${count} contact field${count === 1 ? '' : 's'}`);
  }
  if (result.groups.skills.filled > 0) {
    const count = result.groups.skills.filled;
    parts.push(`${count} skills field${count === 1 ? '' : 's'} filled`);
  }
  if (result.groups.experience.filled > 0) {
    const count = result.groups.experience.filled;
    parts.push(`${count} experience field${count === 1 ? '' : 's'} filled`);
  }
  if (result.groups.education.filled > 0) {
    const count = result.groups.education.filled;
    parts.push(`${count} education field${count === 1 ? '' : 's'} filled`);
  }
  const experienceRemaining = result.remainingRecords?.experience ?? 0;
  const educationRemaining = result.remainingRecords?.education ?? 0;
  if (experienceRemaining > 0) parts.push(`${experienceRemaining} more experience ${experienceRemaining === 1 ? 'entry is' : 'entries are'} ready. Add another row, then click Prefill again.`);
  if (educationRemaining > 0) parts.push(`${educationRemaining} more education ${educationRemaining === 1 ? 'entry is' : 'entries are'} ready. Add another row, then click Prefill again.`);
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
