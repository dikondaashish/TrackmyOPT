/** Completion must be proved against the selected identities, not queue depth
 * or the number of audit rows (which can include historical attempts). */
export function summarizeIngestionRun(
  sourceIds: string[] | undefined,
  audits: { source_id: string; status: string }[],
  runnable: number,
  orchestratorState: string,
) {
  const latest = new Map<string, string>();
  for (const audit of audits) {
    if (!latest.has(audit.source_id)) latest.set(audit.source_id, audit.status);
  }
  const selected = sourceIds ? [...new Set(sourceIds)] : [...latest.keys()];
  const counts = {
    selected: selected.length,
    succeeded: 0,
    failed: 0,
    policySkipped: 0,
    started: 0,
    missing: 0,
  };
  for (const id of selected) {
    const status = latest.get(id);
    if (status === 'succeeded') counts.succeeded++;
    else if (status === 'failed') counts.failed++;
    else if (status === 'rate_limited' || status === 'skipped_disabled')
      counts.policySkipped++;
    else if (status === 'started') counts.started++;
    else counts.missing++;
  }
  const terminal = counts.succeeded + counts.failed + counts.policySkipped;
  const complete =
    !!sourceIds &&
    orchestratorState === 'completed' &&
    runnable === 0 &&
    terminal === selected.length;
  const status =
    orchestratorState === 'failed' ||
    (!runnable &&
      (!sourceIds || counts.started || counts.missing || counts.failed))
      ? 'failed'
      : complete
        ? 'completed'
        : 'running';
  return {
    status,
    manifestAvailable: !!sourceIds,
    ...counts,
    terminal,
    runnable,
    orchestratorState,
  };
}
