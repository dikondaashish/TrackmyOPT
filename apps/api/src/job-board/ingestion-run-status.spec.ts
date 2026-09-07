import { summarizeIngestionRun } from './ingestion-run-status';

describe('ingestion terminal accounting', () => {
  it('requires exact selected identities, not just equal audit counts', () => {
    expect(
      summarizeIngestionRun(
        ['a'],
        [{ source_id: 'b', status: 'succeeded' }],
        0,
        'completed',
      ),
    ).toMatchObject({ status: 'failed', missing: 1, terminal: 0 });
  });
  it('never treats an empty queue with a stranded audit as success', () => {
    expect(
      summarizeIngestionRun(
        ['a'],
        [{ source_id: 'a', status: 'started' }],
        0,
        'completed',
      ),
    ).toMatchObject({ status: 'failed', started: 1, terminal: 0 });
  });
  it('waits for retry work even when the previous attempt has a failed audit', () => {
    expect(
      summarizeIngestionRun(
        ['a'],
        [{ source_id: 'a', status: 'failed' }],
        1,
        'completed',
      ).status,
    ).toBe('running');
  });
  it('counts only the newest audit and requires drained work', () => {
    const audits = [
      { source_id: 'a', status: 'succeeded' },
      { source_id: 'a', status: 'failed' },
    ];
    expect(summarizeIngestionRun(['a'], audits, 1, 'completed').status).toBe(
      'running',
    );
    expect(summarizeIngestionRun(['a'], audits, 0, 'completed')).toMatchObject({
      status: 'completed',
      selected: 1,
      terminal: 1,
      failed: 0,
    });
  });
  it('does not assert completeness for legacy runs lacking a manifest', () => {
    expect(
      summarizeIngestionRun(
        undefined,
        [{ source_id: 'a', status: 'succeeded' }],
        0,
        'completed',
      ),
    ).toMatchObject({ status: 'failed', manifestAvailable: false });
  });
  it('reports enqueue failure and terminal source failures', () => {
    expect(summarizeIngestionRun(['a'], [], 0, 'failed').status).toBe('failed');
    expect(
      summarizeIngestionRun(
        ['a'],
        [{ source_id: 'a', status: 'failed' }],
        0,
        'completed',
      ),
    ).toMatchObject({ status: 'failed', terminal: 1, failed: 1 });
  });
});
