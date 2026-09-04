export const JOB_DATA_STORE_VALUES = ['supabase', 'oracle'] as const;

export type JobDataStoreKind = (typeof JOB_DATA_STORE_VALUES)[number];

export type OracleJobDataConfig = {
  connectString: string;
  user: string;
  password: string;
  poolMax: number;
};

/**
 * Resolve the store without ever falling back from an explicitly selected
 * provider. The default is intentionally Supabase until Oracle shadow
 * validation is complete.
 */
export function resolveJobDataStore(value: unknown): JobDataStoreKind {
  if (value === undefined || value === null || value === '') return 'supabase';
  if (value === 'supabase' || value === 'oracle') return value;
  throw new Error('JOB_DATA_STORE must be either "supabase" or "oracle"');
}

/**
 * Read Oracle credentials only when the Oracle store is explicitly selected.
 * The legacy DATABASE_URL/DB_PASSWORD pair is deliberately ignored: the
 * deployed DB_PASSWORD is an ADMIN credential and must never be used by the
 * application. No secret is included in errors or logs.
 */
export function readOracleJobDataConfig(
  env: Record<string, string | undefined>,
): OracleJobDataConfig | null {
  if (resolveJobDataStore(env.JOB_DATA_STORE) !== 'oracle') return null;

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

  return { connectString, user, password, poolMax };
}
