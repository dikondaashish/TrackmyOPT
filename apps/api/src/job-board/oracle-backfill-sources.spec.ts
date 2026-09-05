import {
  discoverBackfillSources,
  shouldPersistBackfillCheckpoint,
} from '../../scripts/oracle-job-backfill';

type SourceRow = { id: string; enabled: boolean };
type SourceResponse = { data: SourceRow[]; error: null };
type SourceBuilder = PromiseLike<SourceResponse> & {
  select(columns: string): SourceBuilder;
  order(column: string): SourceBuilder;
  eq(column: string, value: string): Promise<SourceResponse>;
};

function sourceQuery(rows: SourceRow[]) {
  const calls: string[] = [];
  const result: Promise<SourceResponse> = Promise.resolve({
    data: rows,
    error: null,
  });
  const builder = {
    select(columns: string) {
      calls.push(`select:${columns}`);
      return builder;
    },
    order(column: string) {
      calls.push(`order:${column}`);
      return builder;
    },
    eq(column: string, value: string) {
      calls.push(`eq:${column}:${value}`);
      return Promise.resolve({
        data: rows.filter((row) => row.id === value),
        error: null,
      });
    },
    then<TResult1 = SourceResponse, TResult2 = never>(
      onFulfilled?:
        | ((value: SourceResponse) => TResult1 | PromiseLike<TResult1>)
        | null,
      onRejected?:
        | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
        | null,
    ): PromiseLike<TResult1 | TResult2> {
      return result.then(onFulfilled, onRejected);
    },
  } as SourceBuilder;
  return {
    calls,
    client: {
      from: (table: string) => {
        expect(table).toBe('ats_sources');
        return builder;
      },
    },
  };
}

describe('oracle backfill source discovery', () => {
  const disabledSource = {
    id: '00000000-0000-4000-8000-000000000001',
    enabled: false,
  };
  const enabledSource = {
    id: '00000000-0000-4000-8000-000000000002',
    enabled: true,
  };

  it('includes disabled and enabled sources without an enabled filter', async () => {
    const { calls, client } = sourceQuery([disabledSource, enabledSource]);

    await expect(discoverBackfillSources(client)).resolves.toEqual([
      { id: disabledSource.id },
      { id: enabledSource.id },
    ]);
    expect(calls).toEqual(['select:id', 'order:id']);
  });

  it('targets a disabled source when --source-id is supplied', async () => {
    const { calls, client } = sourceQuery([disabledSource, enabledSource]);

    await expect(
      discoverBackfillSources(client, disabledSource.id),
    ).resolves.toEqual([{ id: disabledSource.id }]);
    expect(calls).toEqual([
      'select:id',
      'order:id',
      `eq:id:${disabledSource.id}`,
    ]);
  });

  it('relies on deterministic source-id ordering for resumable checkpoints', async () => {
    const orderedRows = [enabledSource, disabledSource].sort((a, b) =>
      a.id.localeCompare(b.id),
    );
    const { client } = sourceQuery(orderedRows);
    const sources = await discoverBackfillSources(client);

    expect(sources.map((source) => source.id)).toEqual(
      orderedRows.map((source) => source.id),
    );
    expect(new Set(sources.map((source) => source.id)).size).toBe(
      sources.length,
    );
  });

  it('does not persist a checkpoint for a failed batch', () => {
    expect(shouldPersistBackfillCheckpoint({ failures: [] })).toBe(true);
    expect(
      shouldPersistBackfillCheckpoint({
        failures: [{ sourceId: disabledSource.id, message: 'read failed' }],
      }),
    ).toBe(false);
  });
});
