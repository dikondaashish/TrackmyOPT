import type {
  ResumeAutofillSnapshotV1,
  ResumeDateValue,
} from '../resume/resume-autofill-contract';
import { normalizeFieldSignal } from '../easy-apply/easy-apply-matchers';

type Experience = ResumeAutofillSnapshotV1['experience'][number];

function dateRank(date: ResumeDateValue | undefined): number | undefined {
  if (!date?.year || date.precision === 'text') return undefined;
  return date.year * 12 + (date.precision === 'month' ? (date.month ?? 1) : 1);
}

/**
 * The role a "most recent" question means: an ongoing role first, then the
 * latest confirmed end date. Undated records cannot be ranked, so the resume's
 * own order (most recent first by convention) is the fallback.
 */
export function mostRecentExperience(
  snapshot: ResumeAutofillSnapshotV1
): Experience | undefined {
  const current = snapshot.experience.filter(record => record.isCurrent);
  if (current.length === 1) return current[0];
  if (current.length > 1) return undefined; // two ongoing roles: ambiguous
  const ranked = snapshot.experience.map(record => ({ record, rank: dateRank(record.endDate) }));
  if (ranked.every(entry => entry.rank !== undefined)) {
    const sorted = [...ranked].sort((left, right) => right.rank! - left.rank!);
    if (sorted.length > 1 && sorted[0].rank === sorted[1].rank) return undefined;
    return sorted[0]?.record;
  }
  return snapshot.experience[0];
}

/**
 * Value for a resume-only field, or '' when the resume cannot answer it.
 * "Current company" is answered only by a role marked current; a resume
 * without one leaves it blank. "Most recent" / "latest" accepts a past role.
 */
export function resumeOnlyFieldValue(
  kind: 'currentCompany' | 'currentTitle' | 'summary',
  snapshot: ResumeAutofillSnapshotV1 | undefined,
  labelText: string
): string {
  if (!snapshot) return '';
  if (kind === 'summary') return snapshot.summary?.trim() ?? '';
  const signal = normalizeFieldSignal(labelText);
  const acceptsPastRole = /\b(?:most recent|latest)\b/.test(signal) &&
    !/\b(?:current|currently|present)\b/.test(signal);
  const ongoing = snapshot.experience.filter(record => record.isCurrent);
  const record = acceptsPastRole
    ? mostRecentExperience(snapshot)
    : ongoing.length === 1 ? ongoing[0] : undefined;
  if (!record) return '';
  return (kind === 'currentCompany' ? record.company : record.title).trim();
}
