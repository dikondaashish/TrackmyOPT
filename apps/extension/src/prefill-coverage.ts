import type { ApplicationFieldScan } from './application-field-scan';
import { scanApplicationFields } from './application-field-scan';
import { withPrefillUndo } from './prefill-undo';
import type { PrefillValueSource } from './prefill-contact-source';
import { applyPrefillProgressPatch, type PrefillProgressSnapshotV1 } from './prefill-progress-protocol';

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
  fieldSources?: Array<{ control: HTMLElement; source: import('./prefill-contact-source').PrefillValueSource }>;
  paused?: boolean;
  uploadVerification?: Partial<Record<'resume' | 'cover_letter', import('./upload-verification').UploadVerification>>;
  groups: Record<PrefillFieldGroup, PrefillCoverageGroupResult>;
  adapterId?: import('./ats-prefill-adapters').AtsPrefillAdapter['id'];
  remainingRecords?: { experience: number; education: number };
  firstSkippedSelector?: string;
  applicationScan?: ApplicationFieldScan;
  resumeAttachmentResult?: import('./easy-apply-attachments').ResumeAttachmentResult;
  /** Ephemeral local actions. Never serialized or included in telemetry. */
  retryOperations?: PrefillRetryOperation[];
  /** Versioned, value-free operation state. Ephemeral to the current document. */
  progress?: PrefillProgressSnapshotV1;
}

export interface PrefillRetryOperation {
  id: string;
  fieldGroup: PrefillFieldGroup;
  label: string;
  source: PrefillValueSource;
  originalControl: HTMLElement;
  retry: () => Promise<{ control: HTMLElement; root: HTMLElement } | null>;
}

/** Replays exactly one failed operation against a still-blank, uniquely
 * identified control. A changed run, page, or applicant edit makes it a no-op. */
export async function retryPrefillOperation(
  result: PrefillCoverageResult,
  id: string,
): Promise<PrefillCoverageResult> {
  const operation = result.retryOperations?.find(item => item.id === id);
  if (!operation) return result;
  let committed: { control: HTMLElement; root: HTMLElement } | null = null;
  try {
    await withPrefillUndo(async () => { committed = await operation.retry(); });
  } catch { return result; }
  if (!committed) return result;
  const { control, root } = committed as { control: HTMLElement; root: HTMLElement };
  const groups = { ...result.groups, [operation.fieldGroup]: { ...result.groups[operation.fieldGroup] } };
  const wasSkipped = (operation.fieldGroup === 'experience' || operation.fieldGroup === 'education' ||
    result.applicationScan?.required.some(field => !field.filled && field.control === operation.originalControl)) &&
    groups[operation.fieldGroup].skipped > 0;
  groups[operation.fieldGroup].filled += 1;
  if (wasSkipped) groups[operation.fieldGroup].skipped -= 1;
  else groups[operation.fieldGroup].total += 1;
  return {
    ...result,
    filled: result.filled + 1,
    skipped: result.skipped - (wasSkipped ? 1 : 0),
    total: result.total + (wasSkipped ? 0 : 1),
    groups,
    retryOperations: result.retryOperations?.filter(item => item !== operation),
    fieldSources: [...(result.fieldSources ?? []), { control, source: operation.source }],
    applicationScan: scanApplicationFields(root),
    ...(result.progress ? { progress: applyPrefillProgressPatch(result.progress, {
      version: 1, identity: result.progress.identity, revision: result.progress.revision + 1,
      operation: { id: `retry:${operation.id}`, group: operation.fieldGroup,
        source: operation.source, status: 'verified' },
    }) } : {}),
  };
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
  if (result.groups.resume.filled > 0) parts.push(result.uploadVerification?.resume === 'unverified' ? 'Resume file selected — check upload' : 'Resume attached');
  if (result.groups.cover_letter.filled > 0)
    parts.push(result.uploadVerification?.cover_letter === 'unverified' ? 'Cover letter file selected — check upload' : 'Cover letter attached');
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
  const remaining = result.applicationScan?.unansweredRequired ?? result.skipped;
  if (remaining > 0) parts.push(`${remaining} need you`);
  else if (parts.length > 0 && !result.paused && !Object.values(result.uploadVerification ?? {}).some(state => state !== 'verified')) parts.push('ready to review');
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
