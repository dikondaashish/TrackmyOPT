import { ConfigService } from '@nestjs/config';
import { OracleJobDataStore } from './oracle-job-data-store';
import { JOB_DATA_STORE, createJobDataStore } from './job-data-store.provider';
import { SupabaseJobDataStore } from './supabase-job-data-store';

function config(values: Record<string, unknown>) {
  return {
    get: <T>(key: string) => values[key] as T | undefined,
  } as unknown as ConfigService;
}

describe('job data store provider', () => {
  it('selects Supabase by default and when explicitly configured', () => {
    const values = {
      NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
    };

    expect(createJobDataStore(config(values))).toBeInstanceOf(
      SupabaseJobDataStore,
    );
    expect(
      createJobDataStore(config({ ...values, JOB_DATA_STORE: 'supabase' })),
    ).toBeInstanceOf(SupabaseJobDataStore);
  });

  it('selects Oracle only for an explicit oracle setting', () => {
    const store = createJobDataStore(
      config({
        JOB_DATA_STORE: 'oracle',
        ORACLE_JOB_DB_CONNECT_STRING: 'tcps://example/service',
        ORACLE_JOB_DB_USER: 'TRACKMYOPT_JOB_APP',
        ORACLE_JOB_DB_PASSWORD: 'test-only',
        ORACLE_JOB_DB_POOL_MAX: 2,
      }),
    );

    expect(store).toBeInstanceOf(OracleJobDataStore);
  });

  it('passes the call timeout and incremental flag through to the Oracle store', () => {
    const oracle = {
      JOB_DATA_STORE: 'oracle',
      ORACLE_JOB_DB_CONNECT_STRING: 'tcps://example/service',
      ORACLE_JOB_DB_USER: 'TRACKMYOPT_JOB_APP',
      ORACLE_JOB_DB_PASSWORD: 'test-only',
    };
    const configured = createJobDataStore(
      config({
        ...oracle,
        ORACLE_JOB_DB_CALL_TIMEOUT_MS: '600000',
        JOB_INGEST_INCREMENTAL: 'true',
      }),
    ) as OracleJobDataStore;
    const internals = (store: OracleJobDataStore) =>
      (store as unknown as { config: Record<string, unknown> }).config;
    expect(internals(configured)).toMatchObject({
      callTimeoutMs: 600_000,
      incrementalIngestion: true,
    });
    expect(configured.supportsIncrementalIngestion).toBe(true);

    const defaults = createJobDataStore(config(oracle)) as OracleJobDataStore;
    expect(internals(defaults)).toMatchObject({
      callTimeoutMs: 1_800_000,
      incrementalIngestion: false,
    });
  });

  it('fails closed when Oracle is selected without complete configuration', () => {
    expect(() =>
      createJobDataStore(
        config({
          JOB_DATA_STORE: 'oracle',
          ORACLE_JOB_DB_USER: 'TRACKMYOPT_JOB_APP',
        }),
      ),
    ).toThrow(
      /Oracle job store requires: ORACLE_JOB_DB_CONNECT_STRING, ORACLE_JOB_DB_PASSWORD/,
    );
  });

  it('exports a stable Nest injection token', () => {
    expect(typeof JOB_DATA_STORE).toBe('symbol');
  });
});
