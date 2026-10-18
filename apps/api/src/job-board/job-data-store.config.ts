/** Oracle is the only job store. The legacy Supabase store has been removed. */
export const JOB_DATA_STORE_VALUES = ['oracle'] as const;

export type JobDataStoreKind = (typeof JOB_DATA_STORE_VALUES)[number];

export type OracleJobDataConfig = {
  connectString: string;
  user: string;
  password: string;
  poolMax: number;
  /**
   * How long a request waits for a free pooled connection before NJS-040.
   * Long enough to ride out a short burst while ingestion loads the database.
   */
  queueTimeoutMs?: number;
  /** Per-round-trip limit; a blocked statement errors instead of hanging. */
  callTimeoutMs?: number;
  /**
   * JOB_INGEST_INCREMENTAL=true. Requires sql/oracle/jobs-content-hash.sql to
   * be applied first; off by default so a deploy before the migration is safe.
   */
  incrementalIngestion?: boolean;
};

export const DEFAULT_ORACLE_CALL_TIMEOUT_MS = 1_800_000;
export const DEFAULT_ORACLE_QUEUE_TIMEOUT_MS = 15_000;
const MIN_ORACLE_CALL_TIMEOUT_MS = 1_000;
const MAX_ORACLE_CALL_TIMEOUT_MS = 2_147_483_647;

/**
 * Oracle is the only job store. An unset value means Oracle; any other value,
 * including the removed "supabase" store, fails boot instead of silently
 * selecting a different database.
 */
export function resolveJobDataStore(value: unknown): JobDataStoreKind {
  if (value === undefined || value === null || value === '') return 'oracle';
  if (value === 'oracle') return value;
  throw new Error(
    'JOB_DATA_STORE must be "oracle" or unset; the Supabase job store has been removed',
  );
}

/**
 * Read the Oracle job-store credentials; missing values fail closed. The
 * legacy DATABASE_URL/DB_PASSWORD pair is deliberately ignored: the
 * deployed DB_PASSWORD is an ADMIN credential and must never be used by the
 * application. No secret is included in errors or logs.
 */
export function readOracleJobDataConfig(
  env: Record<string, string | undefined>,
): OracleJobDataConfig {
  resolveJobDataStore(env.JOB_DATA_STORE);

  const connectString = env.ORACLE_JOB_DB_CONNECT_STRING?.trim();
  const user = env.ORACLE_JOB_DB_USER?.trim();
  const password = env.ORACLE_JOB_DB_PASSWORD;
  const missing: string[] = [];
  if (!connectString) missing.push('ORACLE_JOB_DB_CONNECT_STRING');
  if (!user) missing.push('ORACLE_JOB_DB_USER');
  if (!password) missing.push('ORACLE_JOB_DB_PASSWORD');

  if (missing.length) {
    throw new Error(`Oracle job store requires: ${missing.join(', ')}`);
  }

  // The missing-variable check above guarantees these values are present.
  if (!connectString || !user || !password)
    throw new Error('Invalid Oracle job store configuration');

  const parsedPoolMax = Number(env.ORACLE_JOB_DB_POOL_MAX || 4);
  const poolMax =
    Number.isInteger(parsedPoolMax) && parsedPoolMax > 0
      ? Math.min(parsedPoolMax, 10)
      : 4;

  // The driver passes callTimeout to setTimeout, which turns any delay above
  // 2^31-1 ms into 1 ms; such a value would fail every Oracle call at once.
  const parsedCallTimeout = Number(env.ORACLE_JOB_DB_CALL_TIMEOUT_MS);
  const callTimeoutMs =
    Number.isInteger(parsedCallTimeout) &&
    parsedCallTimeout >= MIN_ORACLE_CALL_TIMEOUT_MS &&
    parsedCallTimeout <= MAX_ORACLE_CALL_TIMEOUT_MS
      ? parsedCallTimeout
      : DEFAULT_ORACLE_CALL_TIMEOUT_MS;

  const parsedQueueTimeout = Number(env.ORACLE_JOB_DB_QUEUE_TIMEOUT_MS);
  const queueTimeoutMs =
    Number.isInteger(parsedQueueTimeout) &&
    parsedQueueTimeout >= 1_000 &&
    parsedQueueTimeout <= 60_000
      ? parsedQueueTimeout
      : DEFAULT_ORACLE_QUEUE_TIMEOUT_MS;

  const incrementalIngestion = env.JOB_INGEST_INCREMENTAL === 'true';

  return {
    connectString,
    user,
    password,
    poolMax,
    queueTimeoutMs,
    callTimeoutMs,
    incrementalIngestion,
  };
}
