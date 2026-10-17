import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { readOracleJobDataConfig } from '../src/job-board/job-data-store.config';
import { OracleJobDataStore } from '../src/job-board/oracle-job-data-store';
import { readJobLocation } from '../src/job-board/us-location';

/**
 * One-time removal of stored jobs located only outside the United States.
 * Ingestion now skips such jobs and deletes stored ones it sees again, so
 * this clears what was stored before that check existed.
 *
 *   dry run (default, read-only):
 *     node -r ts-node/register/transpile-only \
 *       scripts/oracle-delete-non-us-jobs.ts [--keep-urls urls.txt]
 *   apply:
 *     node -r ts-node/register/transpile-only \
 *       scripts/oracle-delete-non-us-jobs.ts --apply [--keep-urls urls.txt]
 *
 * Credentials come from ORACLE_JOB_DB_* (e.g. `node --env-file=.env.oracle`).
 *
 * A job is deleted when its location text names only places outside the US
 * (see us-location.ts); jobs naming no country are kept. Open Ashby jobs are
 * left to ingestion, which also reads Ashby's structured secondary locations
 * and countries (a "London" job with a New York secondary location is a US
 * job). `--keep-urls` lists job URLs (one per line) that people track, which
 * are never deleted. Rows are deleted with their visa signals and search rows.
 */

const PAGE_SIZE = 1000;
const nodeRequire = createRequire(__filename);

type OracleConnection = {
  execute: (
    sql: string,
    binds?: unknown,
    options?: unknown,
  ) => Promise<{ rows?: Record<string, unknown>[] }>;
  close: () => Promise<void>;
  callTimeout?: number;
};

type OracleDriver = {
  OUT_FORMAT_OBJECT: unknown;
  getConnection: (
    options: Record<string, unknown>,
  ) => Promise<OracleConnection>;
};

function argument(name: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const apply = process.argv.includes('--apply');
  const keepFile = argument('--keep-urls');
  const keepUrls = new Set(
    keepFile
      ? readFileSync(keepFile, 'utf8')
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
      : [],
  );
  const config = readOracleJobDataConfig({
    ...process.env,
    JOB_DATA_STORE: 'oracle',
  });
  const oracledb = nodeRequire('oracledb') as OracleDriver;
  const connection = await oracledb.getConnection({
    user: config.user,
    password: config.password,
    connectString: config.connectString,
  });
  connection.callTimeout = 120_000;

  const deleteIds: string[] = [];
  const counts = new Map<string, number>();
  const examples = new Map<string, number>();
  let kept = 0;
  let leftToIngestion = 0;
  try {
    for (let offset = 0; ; offset += PAGE_SIZE) {
      const result = await connection.execute(
        `SELECT id AS "ID", source_ats AS "ATS", listing_status AS "STATUS",
                location AS "LOCATION", job_url AS "URL"
           FROM jobs ORDER BY id
          OFFSET :offset ROWS FETCH NEXT :pageSize ROWS ONLY`,
        { offset, pageSize: PAGE_SIZE },
        { outFormat: oracledb.OUT_FORMAT_OBJECT },
      );
      const rows = result.rows || [];
      for (const row of rows) {
        const location = row.LOCATION == null ? null : String(row.LOCATION);
        if (readJobLocation(location).scope !== 'non_us') continue;
        if (row.ATS === 'ashby' && row.STATUS === 'open') {
          leftToIngestion++;
          continue;
        }
        if (row.URL && keepUrls.has(String(row.URL))) {
          kept++;
          continue;
        }
        deleteIds.push(String(row.ID));
        const key = `${String(row.ATS)}/${String(row.STATUS)}`;
        counts.set(key, (counts.get(key) || 0) + 1);
        examples.set(location ?? '', (examples.get(location ?? '') || 0) + 1);
      }
      if (rows.length < PAGE_SIZE) break;
    }
  } finally {
    await connection.close();
  }

  console.log(`Jobs to delete: ${deleteIds.length}`);
  for (const [key, count] of [...counts].sort()) console.log(`  ${key}: ${count}`);
  console.log(`Kept because someone tracks them: ${kept}`);
  console.log(`Open Ashby jobs left to ingestion: ${leftToIngestion}`);
  console.log('Most common locations:');
  for (const [location, count] of [...examples]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 15))
    console.log(`  ${count}\t${location}`);

  if (!apply) {
    console.log('Dry run: nothing deleted. Re-run with --apply to delete.');
    return;
  }
  const store = OracleJobDataStore.fromEnvironment(process.env);
  try {
    let deleted = 0;
    for (let offset = 0; offset < deleteIds.length; offset += 500) {
      deleted += await store.deleteJobs(deleteIds.slice(offset, offset + 500));
      console.log(`Deleted ${deleted}/${deleteIds.length}`);
    }
  } finally {
    await store.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Unknown error');
  process.exitCode = 1;
});
