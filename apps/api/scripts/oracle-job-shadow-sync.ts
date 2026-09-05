import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { OracleJobDataStore } from '../src/job-board/oracle-job-data-store';
import {
  assertSupabaseProductionStore,
  createSupabaseJobsPageFetcher,
  parseShadowSyncArgs,
  runOracleShadowSync,
  ShadowSyncError,
  type SupabaseJobsReader,
} from '../src/job-board/oracle-shadow-sync';

function requireEnvironment(name: string, trim = true) {
  const rawValue = process.env[name];
  const value = trim ? rawValue?.trim() : rawValue;
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function safeErrorCode(error: unknown) {
  if (error instanceof ShadowSyncError) return error.code;
  if (error instanceof Error && error.message.startsWith('Missing ')) {
    return 'configuration_missing';
  }
  return 'shadow_sync_failed';
}

function safeErrorDetails(error: unknown) {
  if (!(error instanceof ShadowSyncError)) return undefined;
  if (
    error.code === 'invalid_arguments' ||
    error.code === 'invalid_source_row' ||
    error.code === 'oracle_readback_mismatch' ||
    error.code === 'oracle_idempotence_failed'
  ) {
    return error.message;
  }
  return undefined;
}

async function main() {
  const args = parseShadowSyncArgs(process.argv.slice(2));

  // This command is deliberately a separate Oracle writer, but production
  // job traffic must remain on Supabase while shadow validation is running.
  assertSupabaseProductionStore(process.env.JOB_DATA_STORE);

  const supabaseUrl = requireEnvironment('NEXT_PUBLIC_SUPABASE_URL');
  const supabaseServiceRoleKey = requireEnvironment(
    'SUPABASE_SERVICE_ROLE_KEY',
  );
  const oracleEnvironment: Record<string, string | undefined> = {
    ORACLE_JOB_DB_CONNECT_STRING: requireEnvironment(
      'ORACLE_JOB_DB_CONNECT_STRING',
    ),
    ORACLE_JOB_DB_USER: requireEnvironment('ORACLE_JOB_DB_USER'),
    ORACLE_JOB_DB_PASSWORD: requireEnvironment('ORACLE_JOB_DB_PASSWORD', false),
    ORACLE_JOB_DB_POOL_MAX: process.env.ORACLE_JOB_DB_POOL_MAX,
  };

  const oracle = OracleJobDataStore.fromEnvironment(oracleEnvironment);
  try {
    const supabase = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
    ) as unknown as SupabaseClient;
    const fetchPage = createSupabaseJobsPageFetcher(
      supabase as unknown as SupabaseJobsReader,
      args.sourceId,
    );
    const result = await runOracleShadowSync({
      sourceId: args.sourceId,
      limit: args.limit,
      verifyIdempotence: args.verifyIdempotence,
      fetchPage,
      store: oracle,
    });

    // Counts only; never emit credentials, connection details, SQL, or job
    // descriptions. A successful result means every selected row matched on
    // all shared fields after the committed Oracle MERGE.
    console.log(
      JSON.stringify({
        status: 'succeeded',
        sourceId: args.sourceId,
        selectedRows: result.selectedRows,
        rowsSubmitted: result.rowsSubmitted,
        rowsVerified: result.rowsVerified,
        idempotenceRowsVerified: result.idempotenceRowsVerified,
        mismatches: result.mismatches,
        idempotenceChecked: result.idempotenceChecked,
        idempotenceVerified: result.idempotenceVerified,
        limitReached: result.capped,
      }),
    );
  } finally {
    await oracle.close();
  }
}

main().catch((error: unknown) => {
  const code = safeErrorCode(error);
  const details = safeErrorDetails(error);
  console.error(
    JSON.stringify({ status: 'failed', code, ...(details ? { details } : {}) }),
  );
  process.exitCode = 1;
});
