import {
  FILING_LOOKUP_SQL,
  FILING_PROFILE_COLUMNS,
  OracleH1bFilingsReader,
  toFilingRow,
  type OracleFilingsDriver,
} from './oracle-h1b-filings-reader';
import { H1B_FILING_COLUMNS } from './oracle-h1b-filings';

const env = {
  ORACLE_JOB_DB_CONNECT_STRING: 'tcps://example/db',
  ORACLE_JOB_DB_USER: 'TRACKMYOPT_JOB_APP',
  ORACLE_JOB_DB_PASSWORD: 'not-a-real-password',
};

function fakeDriver(resultsBySql: (sql: string) => Record<string, unknown>[]) {
  const execute = jest.fn<
    Promise<{ rows: Record<string, unknown>[] }>,
    [sql: string, binds?: unknown]
  >((sql) => Promise.resolve({ rows: resultsBySql(sql) }));
  const close = jest.fn().mockResolvedValue(undefined);
  const poolClose = jest.fn().mockResolvedValue(undefined);
  const createPool = jest.fn().mockResolvedValue({
    getConnection: () => Promise.resolve({ execute, close }),
    close: poolClose,
  });
  const driver = {
    OUT_FORMAT_OBJECT: 'OBJECT',
    createPool,
  } as unknown as OracleFilingsDriver;
  return { driver, execute, close, createPool, poolClose };
}

describe('OracleH1bFilingsReader', () => {
  it('projects only real columns and formats dates as text', () => {
    const known = new Set(H1B_FILING_COLUMNS.map(([name]) => name));
    expect(FILING_PROFILE_COLUMNS.every((name) => known.has(name))).toBe(true);
    expect(FILING_LOOKUP_SQL.bySponsor).toContain(
      "TO_CHAR(received_date, 'YYYY-MM-DD') AS received_date",
    );
    expect(FILING_LOOKUP_SQL.bySponsor).toContain(
      'ORDER BY received_date DESC FETCH FIRST 500 ROWS ONLY',
    );
    expect(FILING_LOOKUP_SQL.byEmployerInsensitive).toContain(
      'UPPER(employer_name) = UPPER(:value)',
    );
  });

  it('maps upper-case Oracle keys to the web payload names', () => {
    const row = toFilingRow({
      ID: 'a',
      RECEIVED_DATE: '2024-01-02',
      TOTAL_WORKERS: 3,
      JOB_TITLE: null,
    });
    expect(row.id).toBe('a');
    expect(row.received_date).toBe('2024-01-02');
    expect(row.total_workers).toBe(3);
    expect(row.job_title).toBeNull();
    expect(Object.keys(row)).toHaveLength(FILING_PROFILE_COLUMNS.length);
  });

  it('stops at the sponsor-id lookup when it finds filings', async () => {
    const { driver, execute, close } = fakeDriver(() => [{ ID: 'x' }]);
    const reader = new OracleH1bFilingsReader(env, driver);

    const rows = await reader.listFilings('sponsor-1', 'Example Corp');

    expect(rows).toHaveLength(1);
    expect(execute).toHaveBeenCalledTimes(1);
    expect(execute.mock.calls[0][1]).toEqual({ value: 'sponsor-1' });
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('falls through to exact then case-insensitive employer name', async () => {
    const { driver, execute } = fakeDriver((sql) =>
      sql === FILING_LOOKUP_SQL.byEmployerInsensitive ? [{ ID: 'y' }] : [],
    );
    const reader = new OracleH1bFilingsReader(env, driver);

    const rows = await reader.listFilings('sponsor-1', 'example corp');

    expect(rows.map((row) => row.id)).toEqual(['y']);
    expect(execute.mock.calls.map(([sql]) => sql)).toEqual([
      FILING_LOOKUP_SQL.bySponsor,
      FILING_LOOKUP_SQL.byEmployer,
      FILING_LOOKUP_SQL.byEmployerInsensitive,
    ]);
  });

  it('skips name lookups when no employer name is given', async () => {
    const { driver, execute } = fakeDriver(() => []);
    const reader = new OracleH1bFilingsReader(env, driver);

    await expect(reader.listFilings('sponsor-1')).resolves.toEqual([]);
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it('creates one pool lazily, retries after a pool failure, and closes it', async () => {
    const { driver, createPool, poolClose } = fakeDriver(() => [{ ID: 'z' }]);
    createPool.mockRejectedValueOnce(new Error('down'));
    const reader = new OracleH1bFilingsReader(env, driver);
    expect(createPool).not.toHaveBeenCalled();

    await expect(reader.healthCheck()).rejects.toThrow('down');
    await expect(reader.healthCheck()).resolves.toMatchObject({
      rowsChecked: 1,
    });
    await reader.healthCheck();
    expect(createPool).toHaveBeenCalledTimes(2);

    await reader.close();
    expect(poolClose).toHaveBeenCalledTimes(1);
  });

  it('refuses to run without Oracle credentials', async () => {
    const { driver } = fakeDriver(() => []);
    const reader = new OracleH1bFilingsReader({}, driver);
    await expect(reader.healthCheck()).rejects.toThrow(
      'Oracle job store requires',
    );
  });
});
