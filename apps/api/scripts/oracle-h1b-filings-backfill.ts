import { createRequire } from 'node:module';
import { readFile, rename, writeFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
import { readOracleJobDataConfig } from '../src/job-board/job-data-store.config';
import {
  buildH1bFilingsMergeSql,
  buildH1bFilingsVerifySql,
  comparableFiling,
  filingBindDefinitions,
  toFilingBinds,
} from '../src/sponsor-data/oracle-h1b-filings';

/**
 * Copy h1b_filings from the Supabase filings project into Oracle.
 *
 *   copy:   ts-node scripts/oracle-h1b-filings-backfill.ts --write \
 *             --checkpoint .oracle-h1b-filings.json [--pages 50]
 *   verify: ts-node scripts/oracle-h1b-filings-backfill.ts --verify [--sample 200]
 *
 * Keyset pagination on id makes the copy resumable; the MERGE makes re-runs
 * idempotent. Supabase is only read. Credentials come from the environment.
 */

const PAGE_SIZE = 1000;
const nodeRequire = createRequire(__filename);

type OracleConnection = {
  execute: (
    sql: string,
    binds?: unknown,
    options?: unknown,
  ) => Promise<{ rows?: Record<string, unknown>[] }>;
  executeMany: (
    sql: string,
    binds: unknown[],
    options?: unknown,
  ) => Promise<unknown>;
  commit: () => Promise<void>;
  close: () => Promise<void>;
};

type OracleDriver = {
  STRING: unknown;
  NUMBER: unknown;
  OUT_FORMAT_OBJECT: unknown;
  getConnection: (
    options: Record<string, unknown>,
  ) => Promise<OracleConnection>;
};

function argument(name: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function positiveInt(value: string | undefined, fallback: number) {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed < 1)
    throw new Error('Expected a positive integer');
  return parsed;
}

function filingsClient() {
  const url = process.env.SUPABASE_FILINGS_URL?.trim();
  const key = process.env.SUPABASE_FILINGS_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw new Error('Supabase filings credentials are not configured');
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function oracleConnection() {
  const config = readOracleJobDataConfig({
    ...process.env,
    JOB_DATA_STORE: 'oracle',
  });
  if (!config) throw new Error('Oracle is not configured');
  const driver = nodeRequire('oracledb') as OracleDriver;
  const connection = await driver.getConnection({
    user: config.user,
    password: config.password,
    connectString: config.connectString,
    connectTimeout: 15,
  });
  return { driver, connection };
}

async function readCheckpoint(
  path: string,
): Promise<{ lastId: string | null; copied: number }> {
  try {
    const parsed = JSON.parse(await readFile(path, 'utf8')) as {
      lastId?: unknown;
      copied?: unknown;
    };
    return {
      lastId: typeof parsed.lastId === 'string' ? parsed.lastId : null,
      copied: typeof parsed.copied === 'number' ? parsed.copied : 0,
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT')
      return { lastId: null, copied: 0 };
    throw error;
  }
}

async function saveCheckpoint(
  path: string,
  checkpoint: { lastId: string | null; copied: number },
) {
  await writeFile(`${path}.tmp`, `${JSON.stringify(checkpoint)}\n`, {
    mode: 0o600,
  });
  await rename(`${path}.tmp`, path);
}

async function copy() {
  const checkpointPath = argument('--checkpoint');
  if (!checkpointPath)
    throw new Error('--checkpoint is required for resumability');
  const maxPages = positiveInt(argument('--pages'), 1_000);
  const supabase = filingsClient();
  const { driver, connection } = await oracleConnection();
  const mergeSql = buildH1bFilingsMergeSql();
  const bindDefs = filingBindDefinitions(driver);
  let checkpoint = await readCheckpoint(checkpointPath);

  try {
    for (let page = 0; page < maxPages; page += 1) {
      let query = supabase
        .from('h1b_filings')
        .select('*')
        .order('id')
        .limit(PAGE_SIZE);
      if (checkpoint.lastId) query = query.gt('id', checkpoint.lastId);
      const { data, error } = await query;
      if (error) throw new Error(`Supabase read failed: ${error.message}`);
      const rows = (data ?? []) as Record<string, unknown>[];
      if (!rows.length) {
        console.log(
          JSON.stringify({ status: 'complete', copied: checkpoint.copied }),
        );
        return;
      }
      await connection.executeMany(mergeSql, rows.map(toFilingBinds), {
        autoCommit: false,
        bindDefs,
      });
      await connection.commit();
      checkpoint = {
        lastId: String(rows[rows.length - 1].id),
        copied: checkpoint.copied + rows.length,
      };
      // Persist only after Oracle committed, so a crash re-copies at most one page.
      await saveCheckpoint(checkpointPath, checkpoint);
      console.log(
        JSON.stringify({ status: 'page', copied: checkpoint.copied }),
      );
    }
    console.log(
      JSON.stringify({ status: 'paused', copied: checkpoint.copied }),
    );
  } finally {
    await connection.close();
  }
}

function countMissing(ids: string[], present: Set<string>) {
  return ids.filter((id) => !present.has(id)).length;
}

async function verify() {
  const sampleSize = positiveInt(argument('--sample'), 200);
  const supabase = filingsClient();
  const { driver, connection } = await oracleConnection();
  try {
    const oracleCount = await connection.execute(
      'SELECT COUNT(*) AS n FROM h1b_filings',
      [],
      { outFormat: driver.OUT_FORMAT_OBJECT },
    );
    const oracleRows = Number(oracleCount.rows?.[0]?.N ?? -1);

    // Exact counts hit the filings project's statement timeout, so walk every
    // source id with keyset pages instead and reconcile each page's id range
    // against Oracle. This yields the exact total and any missing/extra ids.
    // Lowercase UUID text sorts identically in Postgres and Oracle (binary).
    const sampleEvery = Math.max(1, Math.floor(233_575 / sampleSize));
    const sampleIds: string[] = [];
    let total = 0;
    let missingIds = 0;
    let extraIds = 0;
    let lastId: string | null = null;
    for (;;) {
      let query = supabase
        .from('h1b_filings')
        .select('id')
        .order('id')
        .limit(PAGE_SIZE);
      if (lastId) query = query.gt('id', lastId);
      const { data, error } = await query;
      if (error) throw new Error(`Supabase id scan failed: ${error.message}`);
      const ids = (data ?? []).map((row: { id: unknown }) => String(row.id));
      if (!ids.length) break;
      const upper = ids[ids.length - 1];
      const oracleIds = await connection.execute(
        lastId
          ? 'SELECT id FROM h1b_filings WHERE id > :lo AND id <= :hi'
          : 'SELECT id FROM h1b_filings WHERE id <= :hi',
        lastId ? { lo: lastId, hi: upper } : { hi: upper },
        { outFormat: driver.OUT_FORMAT_OBJECT },
      );
      const inOracle = new Set((oracleIds.rows ?? []).map((r) => String(r.ID)));
      for (const id of ids) {
        if (!inOracle.has(id)) missingIds += 1;
        if (total % sampleEvery === 0 && sampleIds.length < sampleSize)
          sampleIds.push(id);
        total += 1;
      }
      extraIds += inOracle.size - (ids.length - countMissing(ids, inOracle));
      lastId = upper;
    }
    // Oracle rows above the last source id would also be extras.
    if (lastId) {
      const tail = await connection.execute(
        'SELECT COUNT(*) AS n FROM h1b_filings WHERE id > :lo',
        { lo: lastId },
        { outFormat: driver.OUT_FORMAT_OBJECT },
      );
      extraIds += Number(tail.rows?.[0]?.N ?? 0);
    }

    const sample: Record<string, unknown>[] = [];
    for (let index = 0; index < sampleIds.length; index += 100) {
      const { data, error } = await supabase
        .from('h1b_filings')
        .select('*')
        .in('id', sampleIds.slice(index, index + 100));
      if (error) throw new Error(`Supabase sample failed: ${error.message}`);
      sample.push(...((data ?? []) as Record<string, unknown>[]));
    }

    let mismatched = 0;
    let missing = 0;
    for (let index = 0; index < sample.length; index += 100) {
      const chunk = sample.slice(index, index + 100);
      const binds = Object.fromEntries(
        chunk.map((row, i) => [`id${i}`, String(row.id)]),
      );
      const result = await connection.execute(
        buildH1bFilingsVerifySql(chunk.length),
        binds,
        {
          outFormat: driver.OUT_FORMAT_OBJECT,
        },
      );
      const byId = new Map(
        (result.rows ?? []).map((row) => [String(row.ID), row]),
      );
      for (const source of chunk) {
        const target = byId.get(String(source.id));
        if (!target) {
          missing += 1;
          continue;
        }
        const left = comparableFiling(source);
        const right = comparableFiling(target);
        if (left.some((value, column) => value !== right[column]))
          mismatched += 1;
      }
    }

    const passed =
      oracleRows === total &&
      missingIds === 0 &&
      extraIds === 0 &&
      sample.length === sampleIds.length &&
      missing === 0 &&
      mismatched === 0;
    console.log(
      JSON.stringify({
        status: passed ? 'verified' : 'mismatch',
        supabaseRows: total,
        oracleRows,
        missingIds,
        extraIds,
        sampled: sample.length,
        missing,
        mismatched,
      }),
    );
    if (!passed) process.exitCode = 1;
  } finally {
    await connection.close();
  }
}

if (require.main === module) {
  const run = process.argv.includes('--verify')
    ? verify
    : process.argv.includes('--write')
      ? copy
      : () => Promise.reject(new Error('Pass --write or --verify'));
  run().catch((error) => {
    // Only the message: no row content, credentials, or connection details.
    console.error(
      JSON.stringify({
        status: 'failed',
        code: (error as { code?: unknown })?.code,
        message:
          error instanceof Error ? error.message.split('\n')[0] : 'failed',
      }),
    );
    process.exitCode = 1;
  });
}
