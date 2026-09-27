import assert from 'node:assert/strict';
import test from 'node:test';
import { emptyPrefillCoverage } from '../src/prefill-coverage';
import { applyPrefillProgressPatch, snapshotPrefillProgress } from '../src/prefill-progress-protocol';

const identity = { runId: 'run-one', navigationGeneration: 4, frameId: 2, adapterId: 'greenhouse' as const };

test('progress snapshot carries field status and reason without answer text or URLs', () => {
  const result = emptyPrefillCoverage();
  result.applicationScan = { requiredTotal: 1, requiredFilled: 0, requiredPercent: 0,
    unansweredRequired: 1, optionalTotal: 0,
    required: [{ key: 'secret-key', label: 'Private immigration answer', required: true, filled: false }], optional: [] };
  result.remainingRecords = { experience: 1, education: 0 };
  result.uploadVerification = { resume: 'unverified' };
  const snapshot = snapshotPrefillProgress(identity, result);
  assert.equal(snapshot.version, 1);
  assert.deepEqual(snapshot.operations.map(item => [item.id, item.status, item.reason]), [
    ['upload:resume', 'unverified', 'upload_unverified'],
    ['field:required:0', 'needs_user', 'required_blank'],
    ['rows:experience', 'needs_user', 'needs_row'],
  ]);
  assert.doesNotMatch(JSON.stringify(snapshot), /immigration|secret-key|https?:\/\//i);
});

test('only the next patch from the same run, generation, frame, and adapter applies', () => {
  const result = emptyPrefillCoverage();
  result.retryOperations = [{ id: 'contact:0', fieldGroup: 'contact', label: 'email', source: 'profile',
    originalControl: {} as HTMLElement, retry: async () => null }];
  const snapshot = snapshotPrefillProgress(identity, result);
  const patch = { version: 1 as const, identity, revision: 1,
    operation: { id: 'retry:contact:0', group: 'contact' as const,
      source: 'profile' as const, status: 'verified' as const } };
  const applied = applyPrefillProgressPatch(snapshot, patch);
  assert.equal(applied.revision, 1);
  assert.equal(applied.operations[0].status, 'verified');
  assert.equal(applyPrefillProgressPatch(applied, patch), applied, 'duplicate patch is ignored');
  for (const changed of [
    { runId: 'another-run' }, { navigationGeneration: 5 }, { frameId: 3 },
    { adapterId: 'lever' as const },
  ]) assert.equal(applyPrefillProgressPatch(snapshot, {
    ...patch, identity: { ...identity, ...changed },
  }), snapshot);
  assert.equal(applyPrefillProgressPatch(snapshot, { ...patch, revision: 3 }), snapshot);
  assert.equal(applyPrefillProgressPatch(snapshot, { ...patch,
    operation: { ...patch.operation, id: 'retry:missing' },
  }), snapshot);
});
