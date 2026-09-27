import type { AtsPrefillAdapter } from './ats-prefill-adapters';
import type { PrefillCoverageResult, PrefillFieldGroup } from './prefill-coverage';
import type { PrefillValueSource } from './prefill-contact-source';

export const PREFILL_PROGRESS_VERSION = 1 as const;
export type PrefillProgressStatus = 'verified' | 'unverified' | 'needs_user';
export type PrefillProgressReason =
  | 'required_blank' | 'optional_blank' | 'upload_unverified'
  | 'upload_rejected' | 'upload_timeout' | 'needs_row' | 'retry_available';

export interface PrefillProgressIdentity {
  runId: string;
  navigationGeneration: number;
  frameId: number;
  adapterId: AtsPrefillAdapter['id'];
}

export interface PrefillProgressOperation {
  id: string;
  group: PrefillFieldGroup | 'other';
  source?: PrefillValueSource;
  status: PrefillProgressStatus;
  reason?: PrefillProgressReason;
}

export interface PrefillProgressSnapshotV1 {
  version: typeof PREFILL_PROGRESS_VERSION;
  identity: PrefillProgressIdentity;
  revision: number;
  operations: PrefillProgressOperation[];
}

export interface PrefillProgressPatchV1 {
  version: typeof PREFILL_PROGRESS_VERSION;
  identity: PrefillProgressIdentity;
  revision: number;
  operation: PrefillProgressOperation;
}

/** Only enum states and generated IDs cross this local boundary. No labels,
 * question text, field values, or URLs are carried in the progress protocol. */
export function snapshotPrefillProgress(
  identity: PrefillProgressIdentity,
  result: PrefillCoverageResult,
): PrefillProgressSnapshotV1 {
  const operations: PrefillProgressOperation[] = [];
  for (const [group, state] of Object.entries(result.uploadVerification ?? {})) {
    operations.push({ id: `upload:${group}`, group: group as PrefillFieldGroup,
      status: state === 'verified' ? 'verified' : state === 'unverified' ? 'unverified' : 'needs_user',
      ...(state === 'unverified' ? { reason: 'upload_unverified' as const } :
        state === 'rejected' ? { reason: 'upload_rejected' as const } :
        state === 'timed_out' ? { reason: 'upload_timeout' as const } : {}) });
  }
  for (const [required, fields] of [[true, result.applicationScan?.required], [false, result.applicationScan?.optional]] as const) {
    fields?.forEach((field, index) => {
      const source = result.fieldSources?.find(entry => entry.control === field.control)?.source;
      operations.push({ id: `field:${required ? 'required' : 'optional'}:${index}`, group: 'other',
        ...(source ? { source } : {}), status: field.filled ? 'verified' : 'needs_user',
        ...(!field.filled ? { reason: required ? 'required_blank' as const : 'optional_blank' as const } : {}) });
    });
  }
  for (const section of ['experience', 'education'] as const) {
    if ((result.remainingRecords?.[section] ?? 0) > 0) {
      operations.push({ id: `rows:${section}`, group: section, source: 'resume',
        status: 'needs_user', reason: 'needs_row' });
    }
  }
  for (const retry of result.retryOperations ?? []) {
    operations.push({ id: `retry:${retry.id}`, group: retry.fieldGroup, source: retry.source,
      status: 'needs_user', reason: 'retry_available' });
  }
  return { version: PREFILL_PROGRESS_VERSION, identity, revision: 0, operations };
}

/** Reject stale, duplicated, foreign-frame, or out-of-order operation updates. */
export function applyPrefillProgressPatch(
  snapshot: PrefillProgressSnapshotV1,
  patch: PrefillProgressPatchV1,
): PrefillProgressSnapshotV1 {
  if (patch.version !== snapshot.version || patch.revision !== snapshot.revision + 1 ||
      patch.identity.runId !== snapshot.identity.runId ||
      patch.identity.navigationGeneration !== snapshot.identity.navigationGeneration ||
      patch.identity.frameId !== snapshot.identity.frameId ||
      patch.identity.adapterId !== snapshot.identity.adapterId ||
      !snapshot.operations.some(operation => operation.id === patch.operation.id)) return snapshot;
  return { ...snapshot, revision: patch.revision,
    operations: snapshot.operations.map(operation => operation.id === patch.operation.id ? patch.operation : operation) };
}
