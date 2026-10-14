import { ConfigService } from '@nestjs/config';
import { OracleJobDataStore } from './oracle-job-data-store';
import {
  readOracleJobDataConfig,
  resolveJobDataStore,
} from './job-data-store.config';
import type { JobDataStore } from './job-data-store.contract';
import { SupabaseJobDataStore } from './supabase-job-data-store';

/** Nest injection token for the job-record store only. */
export const JOB_DATA_STORE = Symbol('JOB_DATA_STORE');

function optionalString(value: unknown) {
  return typeof value === 'string' || typeof value === 'number'
    ? String(value).trim()
    : undefined;
}

export function createJobDataStore(config: ConfigService): JobDataStore {
  const kind = resolveJobDataStore(config.get<string>('JOB_DATA_STORE'));
  if (kind === 'supabase') {
    return SupabaseJobDataStore.fromEnvironment({
      NEXT_PUBLIC_SUPABASE_URL: config.get<string>('NEXT_PUBLIC_SUPABASE_URL'),
      SUPABASE_SERVICE_ROLE_KEY: config.get<string>(
        'SUPABASE_SERVICE_ROLE_KEY',
      ),
    });
  }

  // readOracleJobDataConfig performs the complete required-variable check and
  // deliberately has no fallback to Supabase when Oracle is selected.
  const oracle = readOracleJobDataConfig({
    JOB_DATA_STORE: 'oracle',
    ORACLE_JOB_DB_CONNECT_STRING: config.get<string>(
      'ORACLE_JOB_DB_CONNECT_STRING',
    ),
    ORACLE_JOB_DB_USER: config.get<string>('ORACLE_JOB_DB_USER'),
    ORACLE_JOB_DB_PASSWORD: config.get<string>('ORACLE_JOB_DB_PASSWORD'),
    ORACLE_JOB_DB_POOL_MAX: String(
      config.get<number>('ORACLE_JOB_DB_POOL_MAX') ?? 4,
    ),
    // Passed raw: invalid values fall back to safe defaults in
    // readOracleJobDataConfig instead of failing boot validation.
    ORACLE_JOB_DB_CALL_TIMEOUT_MS: optionalString(
      config.get<unknown>('ORACLE_JOB_DB_CALL_TIMEOUT_MS'),
    ),
    JOB_INGEST_INCREMENTAL: optionalString(
      config.get<unknown>('JOB_INGEST_INCREMENTAL'),
    ),
  });
  if (!oracle) throw new Error('Oracle job store configuration is unavailable');
  return new OracleJobDataStore(oracle);
}

export const jobDataStoreProvider = {
  provide: JOB_DATA_STORE,
  inject: [ConfigService],
  useFactory: createJobDataStore,
};
