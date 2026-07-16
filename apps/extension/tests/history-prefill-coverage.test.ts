import assert from 'node:assert/strict';
import {
  formatHistoryCoverageSummary,
  planVisibleRecordPrefill,
  remainingHistoryRecordsMessage,
  summarizeHistoryPrefillCoverage,
} from '../src/history-prefill-coverage';

const coverage = summarizeHistoryPrefillCoverage([
  { group: 'experience', filled: true },
  { group: 'experience', filled: true },
  { group: 'experience', filled: false, needsUser: true },
  { group: 'education', filled: true },
  { group: 'education', filled: false, needsUser: true },
], { experience: 2 });

assert.deepEqual(coverage, {
  experience: { filled: 2, skipped: 1, total: 3, artifactRecordsRemaining: 2 },
  education: { filled: 1, skipped: 1, total: 2, artifactRecordsRemaining: 0 },
});
assert.equal(formatHistoryCoverageSummary(coverage), '2 experience fields · 1 education field');
assert.equal(
  remainingHistoryRecordsMessage('experience', 2),
  '2 more experience entries are ready. Add another row, then click Prefill again.',
);
assert.equal(
  remainingHistoryRecordsMessage('education', 1),
  '1 more education entry is ready. Add another row, then click Prefill again.',
);
assert.equal(remainingHistoryRecordsMessage('experience', 0), null);

// Two-employer regression fixture: displayed ordering is stable and a field
// from employer 1 can never be paired with employer 2's visible card.
const employers = [
  { company: 'Northstar Labs', title: 'Software Engineer', start: '2023-01' },
  { company: 'Harbor Health', title: 'Data Analyst', start: '2021-06' },
];
const rows = [{ id: 'visible-row-0' }, { id: 'visible-row-1' }];
const employerPlan = planVisibleRecordPrefill(employers, rows);
assert.deepEqual(employerPlan.pairs.map(({ record, row }) => [record.company, row.id]), [
  ['Northstar Labs', 'visible-row-0'],
  ['Harbor Health', 'visible-row-1'],
]);
assert.equal(employerPlan.remainingRecords, 0);

// Fewer visible cards reports the record instead of clicking Add another.
let hostActionClicks = 0;
const unavailableAddAnotherButton = { click: () => { hostActionClicks += 1; } };
void unavailableAddAnotherButton;
const oneRowPlan = planVisibleRecordPrefill(employers, rows.slice(0, 1));
assert.equal(oneRowPlan.pairs.length, 1);
assert.equal(oneRowPlan.remainingRecords, 1);
assert.equal(hostActionClicks, 0);

console.log('history-prefill-coverage: grouping, remaining records, ordered mapping, and no host clicks passed');

