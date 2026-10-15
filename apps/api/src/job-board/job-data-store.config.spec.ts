import {
  readOracleJobDataConfig,
  resolveJobDataStore,
} from './job-data-store.config';

describe('job data store configuration', () => {
  it('treats an unset JOB_DATA_STORE as Oracle', () => {
    expect(resolveJobDataStore(undefined)).toBe('oracle');
    expect(resolveJobDataStore(null)).toBe('oracle');
    expect(resolveJobDataStore('')).toBe('oracle');
    expect(resolveJobDataStore('oracle')).toBe('oracle');
  });

  it.each(['supabase', 'postgres', 'ORACLE', ' oracle'])(
    'rejects JOB_DATA_STORE=%s instead of falling back to another store',
    (value) => {
      expect(() => resolveJobDataStore(value)).toThrow(
        'JOB_DATA_STORE must be "oracle" or unset; the Supabase job store has been removed',
      );
    },
  );

  it('rejects the removed Supabase store even when Oracle credentials exist', () => {
    expect(() =>
      readOracleJobDataConfig({
        JOB_DATA_STORE: 'supabase',
        ORACLE_JOB_DB_CONNECT_STRING: 'tcps://oracle.example/service',
        ORACLE_JOB_DB_USER: 'TRACKMYOPT_JOBS',
        ORACLE_JOB_DB_PASSWORD: 'not-logged',
      }),
    ).toThrow('the Supabase job store has been removed');
  });

  it('requires Oracle credentials when JOB_DATA_STORE is unset', () => {
    expect(() => readOracleJobDataConfig({})).toThrow(
      'Oracle job store requires: ORACLE_JOB_DB_CONNECT_STRING, ORACLE_JOB_DB_USER, ORACLE_JOB_DB_PASSWORD',
    );
  });

  it('requires dedicated Oracle credentials and never falls back to ADMIN envs', () => {
    expect(() =>
      readOracleJobDataConfig({
        JOB_DATA_STORE: 'oracle',
        DATABASE_URL: 'tls://database.example',
        DB_PASSWORD: 'admin-secret',
      }),
    ).toThrow(
      'Oracle job store requires: ORACLE_JOB_DB_CONNECT_STRING, ORACLE_JOB_DB_USER, ORACLE_JOB_DB_PASSWORD',
    );
  });

  it('bounds the Oracle pool and returns no secret in the configuration error path', () => {
    const config = readOracleJobDataConfig({
      JOB_DATA_STORE: 'oracle',
      ORACLE_JOB_DB_CONNECT_STRING: 'tcps://oracle.example/service',
      ORACLE_JOB_DB_USER: 'TRACKMYOPT_JOBS',
      ORACLE_JOB_DB_PASSWORD: 'not-logged',
      ORACLE_JOB_DB_POOL_MAX: '100',
    });

    expect(config).toEqual({
      connectString: 'tcps://oracle.example/service',
      user: 'TRACKMYOPT_JOBS',
      password: 'not-logged',
      poolMax: 10,
      callTimeoutMs: 1_800_000,
      incrementalIngestion: false,
    });
  });

  it.each([
    [undefined, false],
    ['false', false],
    ['TRUE', false],
    ['true', true],
  ])(
    'enables incremental ingestion only for JOB_INGEST_INCREMENTAL=%s',
    (value, expected) => {
      const config = readOracleJobDataConfig({
        JOB_DATA_STORE: 'oracle',
        ORACLE_JOB_DB_CONNECT_STRING: 'tcps://oracle.example/service',
        ORACLE_JOB_DB_USER: 'TRACKMYOPT_JOBS',
        ORACLE_JOB_DB_PASSWORD: 'not-logged',
        JOB_INGEST_INCREMENTAL: value,
      });
      expect(config?.incrementalIngestion).toBe(expected);
    },
  );

  it.each([
    [undefined, 1_800_000],
    ['45000', 45_000],
    ['0', 1_800_000],
    ['abc', 1_800_000],
    ['999', 1_800_000],
    ['1000', 1_000],
    ['-5000', 1_800_000],
    ['1500.5', 1_800_000],
    ['Infinity', 1_800_000],
    ['2147483647', 2_147_483_647],
    ['2147483648', 1_800_000],
  ])(
    'bounds every Oracle round trip (ORACLE_JOB_DB_CALL_TIMEOUT_MS=%s)',
    (value, expected) => {
      const config = readOracleJobDataConfig({
        JOB_DATA_STORE: 'oracle',
        ORACLE_JOB_DB_CONNECT_STRING: 'tcps://oracle.example/service',
        ORACLE_JOB_DB_USER: 'TRACKMYOPT_JOBS',
        ORACLE_JOB_DB_PASSWORD: 'not-logged',
        ORACLE_JOB_DB_CALL_TIMEOUT_MS: value,
      });
      expect(config?.callTimeoutMs).toBe(expected);
    },
  );
});
