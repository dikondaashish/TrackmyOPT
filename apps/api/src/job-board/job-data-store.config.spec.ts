import {
  readOracleJobDataConfig,
  resolveJobDataStore,
} from './job-data-store.config';

describe('job data store configuration', () => {
  it('defaults to Supabase', () => {
    expect(resolveJobDataStore(undefined)).toBe('supabase');
    expect(resolveJobDataStore('')).toBe('supabase');
  });

  it('accepts only the supported providers', () => {
    expect(resolveJobDataStore('supabase')).toBe('supabase');
    expect(resolveJobDataStore('oracle')).toBe('oracle');
    expect(() => resolveJobDataStore('postgres')).toThrow(
      'JOB_DATA_STORE must be either "supabase" or "oracle"',
    );
  });

  it('does not require Oracle credentials while Supabase is selected', () => {
    expect(readOracleJobDataConfig({ JOB_DATA_STORE: 'supabase' })).toBeNull();
    expect(readOracleJobDataConfig({})).toBeNull();
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
    });
  });
});
