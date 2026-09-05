import { readFile, writeFile, rename } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
import { OracleJobDataStore } from '../src/job-board/oracle-job-data-store';
import { SupabaseJobDataStore } from '../src/job-board/supabase-job-data-store';
import {
  parseBackfillCheckpoint,
  parseBackfillLimit,
  runOracleBackfillBatch,
  type BackfillResult,
  type BackfillSource,
  type BackfillCheckpoint,
} from '../src/job-board/oracle-backfill';

/**
 * Resolve the complete source set for a backfill.  Disabled sources are
 * intentionally included because their historical jobs are part of the
 * corpus being copied.  The query's deterministic id ordering makes
 * sourceIndex checkpoints stable across resumptions.
 */
export async function discoverBackfillSources(
  supabase: { from: (table: string) => any },
  sourceId?: string,
): Promise<BackfillSource[]> {
  const sourceQuery = supabase.from('ats_sources').select('id').order('id');
  const filtered = sourceId ? sourceQuery.eq('id', sourceId) : sourceQuery;
  const { data: sourceRows, error: sourceError } = await filtered;
  if (sourceError) throw new Error(sourceError.message);
  return (sourceRows || []).map((row: { id: string }) => ({
    id: String(row.id),
  }));
}

export function shouldPersistBackfillCheckpoint(
  result: Pick<BackfillResult, 'failures'>,
) {
  return result.failures.length === 0;
}

function argument(name: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function hasFlag(name: string) {
  return process.argv.includes(name);
}

async function loadCheckpoint(path: string): Promise<BackfillCheckpoint> {
  try {
    return parseBackfillCheckpoint(JSON.parse(await readFile(path, 'utf8')));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT')
      return parseBackfillCheckpoint(null);
    throw error;
  }
}

async function saveCheckpoint(path: string, checkpoint: BackfillCheckpoint) {
  const temporaryPath = `${path}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(checkpoint, null, 2)}\n`, {
    mode: 0o600,
  });
  await rename(temporaryPath, path);
}

async function main() {
  const sourceId = argument('--source-id');
  const limitValue = argument('--limit');
  const checkpointPath = argument('--checkpoint');
  if (!hasFlag('--write')) throw new Error('--write is required');
  if (!limitValue)
    throw new Error('--limit is required; the backfill is always bounded');
  if (!checkpointPath)
    throw new Error('--checkpoint is required for resumability');
  const limit = parseBackfillLimit(limitValue);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey)
    throw new Error('Supabase credentials are not configured');
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const sources = await discoverBackfillSources(supabase, sourceId);
  if (!sources.length)
    throw new Error('No job-board sources matched the request');

  const sourceStore = SupabaseJobDataStore.fromEnvironment({
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey,
  });
  const targetStore = OracleJobDataStore.fromEnvironment({
    ...process.env,
    JOB_DATA_STORE: 'oracle',
  });
  try {
    await targetStore.healthCheck();
    const checkpoint = await loadCheckpoint(checkpointPath);
    const result = await runOracleBackfillBatch({
      sources,
      checkpoint,
      limit,
      sourceStore,
      targetStore,
      verifyEveryRow: true,
    });
    // A failed page must be retried from the last durable checkpoint rather
    // than recording an apparently successful partial batch.
    if (shouldPersistBackfillCheckpoint(result)) {
      await saveCheckpoint(checkpointPath, result.checkpoint);
    }
    console.log(
      JSON.stringify({
        status: result.failures.length ? 'failed' : 'succeeded',
        processed: result.processed,
        submitted: result.submitted,
        verified: result.verified,
        failures: result.failures,
        checksum: result.checksum,
        checkpoint: result.checkpoint,
      }),
    );
    if (result.failures.length) process.exitCode = 1;
  } finally {
    await targetStore.close();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(
      JSON.stringify({
        status: 'failed',
        message: error instanceof Error ? error.message : 'backfill failed',
      }),
    );
    process.exitCode = 1;
  });
}
