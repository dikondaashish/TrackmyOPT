/** Coverage and row-planning helpers shared by ATS history adapters. */

export type HistoryRecordGroup = 'experience' | 'education';

export interface HistoryFieldOutcome {
  group: HistoryRecordGroup;
  filled: boolean;
  needsUser?: boolean;
}

export interface HistoryGroupCoverage {
  filled: number;
  skipped: number;
  total: number;
  artifactRecordsRemaining: number;
}

export type HistoryPrefillCoverage = Record<HistoryRecordGroup, HistoryGroupCoverage>;

export function summarizeHistoryPrefillCoverage(
  outcomes: readonly HistoryFieldOutcome[],
  remaining: Partial<Record<HistoryRecordGroup, number>> = {},
): HistoryPrefillCoverage {
  const result: HistoryPrefillCoverage = {
    experience: { filled: 0, skipped: 0, total: 0, artifactRecordsRemaining: Math.max(0, remaining.experience || 0) },
    education: { filled: 0, skipped: 0, total: 0, artifactRecordsRemaining: Math.max(0, remaining.education || 0) },
  };

  for (const outcome of outcomes) {
    if (outcome.filled) result[outcome.group].filled += 1;
    else if (outcome.needsUser) result[outcome.group].skipped += 1;
  }
  for (const group of Object.values(result)) group.total = group.filled + group.skipped;
  return result;
}

export function formatHistoryCoverageSummary(coverage: HistoryPrefillCoverage): string {
  const parts: string[] = [];
  for (const group of ['experience', 'education'] as const) {
    const count = coverage[group].filled;
    if (count > 0) parts.push(`${count} ${group} field${count === 1 ? '' : 's'}`);
  }
  return parts.join(' · ');
}

export function remainingHistoryRecordsMessage(
  group: HistoryRecordGroup,
  count: number,
): string | null {
  if (!Number.isInteger(count) || count <= 0) return null;
  const record = group === 'experience' ? 'experience entry' : 'education entry';
  const label = count === 1 ? record : record.replace(/entry$/, 'entries');
  const verb = count === 1 ? 'is' : 'are';
  return `${count} more ${label} ${verb} ready. Add another row, then click Prefill again.`;
}

export interface VisibleRecordPair<RecordValue, RowValue> {
  recordIndex: number;
  record: RecordValue;
  row: RowValue;
}

export interface VisibleRecordPlan<RecordValue, RowValue> {
  pairs: Array<VisibleRecordPair<RecordValue, RowValue>>;
  remainingRecords: number;
}

/**
 * Pairs snapshot records with rows that the ATS already exposes, in displayed
 * order. It intentionally has no container/button argument: adapters cannot
 * use this path to click "Add another" or create application state.
 */
export function planVisibleRecordPrefill<RecordValue, RowValue>(
  records: readonly RecordValue[],
  visibleRows: readonly RowValue[],
): VisibleRecordPlan<RecordValue, RowValue> {
  const visibleCount = Math.min(records.length, visibleRows.length);
  return {
    pairs: Array.from({ length: visibleCount }, (_, recordIndex) => ({
      recordIndex,
      record: records[recordIndex],
      row: visibleRows[recordIndex],
    })),
    remainingRecords: Math.max(0, records.length - visibleCount),
  };
}
