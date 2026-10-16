import { createRequire } from 'node:module';
import { readOracleJobDataConfig } from '../src/job-board/job-data-store.config';
import {
  ORACLE_DESCRIPTION_FLAG_MASKS,
  ORACLE_DESCRIPTION_FLAGS,
  ORACLE_JOB_SEARCH_TABLE,
  textFilterFlags,
} from '../src/job-board/oracle-job-data-helpers';

/**
 * Recomputes TRACKMYOPT_JOB_SEARCH.description_filter_flags for every search
 * row from the stored job description. Incremental ingestion rewrites flags
 * only when a job's content hash changes, so rows written by an older
 * inference keep their old flags until this runs.
 *
 *   dry run (default, read-only):
 *     node -r ts-node/register/transpile-only \
 *       scripts/oracle-job-filter-flags-backfill.ts [--examples 3]
 *   apply:
 *     node -r ts-node/register/transpile-only \
 *       scripts/oracle-job-filter-flags-backfill.ts --apply [--batch-size 200]
 *
 * Credentials come from ORACLE_JOB_DB_* (e.g. `node --env-file=.env.oracle`).
 *
 * The UPDATE sets only description_filter_flags, a NUMBER column outside the
 * Oracle Text index (which covers search_text_index), so no text index
 * synchronization is queued. Bits set from structured ATS fields are kept as
 * they are: stored data has no ATS fields, and ingestion maintains them. Each
 * row is updated only if its flags and content hash are unchanged since it was
 * read, so a concurrent ingestion write always wins. Batches commit
 * separately; rerunning is safe and skips rows already current.
 */

const PAGE_SIZE = 500;
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
  ) => Promise<{ rowsAffected?: number }>;
  commit: () => Promise<void>;
  close: () => Promise<void>;
  callTimeout?: number;
};

type OracleDriver = {
  STRING: unknown;
  NUMBER: unknown;
  OUT_FORMAT_OBJECT: unknown;
  getConnection: (
    options: Record<string, unknown>,
  ) => Promise<OracleConnection>;
};

type Change = {
  jobId: string;
  title: string;
  status: string;
  previous: number;
  next: number;
  contentHash: string | null;
};

const FLAG_NAMES = Object.entries(ORACLE_DESCRIPTION_FLAGS) as [
  string,
  number,
][];
// Bits 32768-131072 were plain-word degree flags in the first version.
const RETIRED_FLAGS: [string, number][] = [
  ['retiredPlainBachelor', 32768],
  ['retiredPlainMaster', 65536],
  ['retiredPlainDoctorate', 131072],
];

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

function experienceLabel(flags: number) {
  const { experienceEntry, experienceMid, experienceSenior } =
    ORACLE_DESCRIPTION_FLAGS;
  const labels = [
    flags & experienceEntry ? 'entry' : '',
    flags & experienceMid ? 'mid' : '',
    flags & experienceSenior ? 'senior' : '',
  ].filter(Boolean);
  return labels.join('+') || 'none';
}

async function oracleConnection() {
  const config = readOracleJobDataConfig({
    ...process.env,
    JOB_DATA_STORE: 'oracle',
  });
  const driver = nodeRequire('oracledb') as OracleDriver;
  const connection = await driver.getConnection({
    user: config.user,
    password: config.password,
    connectString: config.connectString,
    connectTimeout: 15,
  });
  connection.callTimeout = 120_000;
  return { driver, connection };
}

/** Recomputed flags for one stored row; ATS bits are carried over. */
export function backfilledFlags(previous: number, description: string | null) {
  return (
    textFilterFlags(description) |
    (previous & ORACLE_DESCRIPTION_FLAG_MASKS.ats)
  );
}

async function* readRows(connection: OracleConnection, driver: OracleDriver) {
  let after = ' ';
  for (;;) {
    const result = await connection.execute(
      `SELECT s.job_id AS "JOB_ID", s.description_filter_flags AS "FLAGS",
              j.title AS "TITLE", j.listing_status AS "STATUS",
              j.content_hash AS "CONTENT_HASH", j.description AS "DESCRIPTION"
         FROM ${ORACLE_JOB_SEARCH_TABLE} s
         JOIN jobs j ON j.id = s.job_id
        WHERE s.job_id > :after
        ORDER BY s.job_id
        FETCH FIRST ${PAGE_SIZE} ROWS ONLY`,
      { after },
      {
        outFormat: driver.OUT_FORMAT_OBJECT,
        fetchInfo: { DESCRIPTION: { type: driver.STRING } },
      },
    );
    const rows = result.rows || [];
    if (!rows.length) return;
    yield rows;
    after = String(rows[rows.length - 1].JOB_ID);
  }
}

const UPDATE_SQL = `UPDATE ${ORACLE_JOB_SEARCH_TABLE} s
           SET s.description_filter_flags = :next
         WHERE s.job_id = :job_id
           AND s.description_filter_flags = :previous
           AND NVL((SELECT j.content_hash FROM jobs j WHERE j.id = s.job_id), '-')
               = NVL(:content_hash, '-')`;

async function applyBatch(
  connection: OracleConnection,
  driver: OracleDriver,
  batch: Change[],
) {
  const result = await connection.executeMany(
    UPDATE_SQL,
    batch.map((change) => ({
      job_id: change.jobId,
      next: change.next,
      previous: change.previous,
      content_hash: change.contentHash,
    })),
    {
      autoCommit: false,
      bindDefs: {
        job_id: { type: driver.STRING, maxSize: 36 },
        next: { type: driver.NUMBER },
        previous: { type: driver.NUMBER },
        content_hash: { type: driver.STRING, maxSize: 140 },
      },
    },
  );
  await connection.commit();
  return result.rowsAffected ?? 0;
}

async function main() {
  const apply = process.argv.includes('--apply');
  const examplesPerFlag = positiveInt(argument('--examples'), 3);
  const batchSize = positiveInt(argument('--batch-size'), 200);
  const { driver, connection } = await oracleConnection();

  const totals = { rows: 0, open: 0, changed: 0, changedOpen: 0 };
  const perFlag = new Map<
    string,
    { gained: number; lost: number; gainedOpen: number; lostOpen: number }
  >();
  const experience = new Map<string, number>();
  const examples = new Map<string, string[]>();
  let pending: Change[] = [];
  let updated = 0;
  let skipped = 0;

  try {
    for await (const rows of readRows(connection, driver)) {
      for (const row of rows) {
        const previous = Number(row.FLAGS) || 0;
        const description =
          typeof row.DESCRIPTION === 'string' ? row.DESCRIPTION : null;
        const next = backfilledFlags(previous, description);
        const open = row.STATUS === 'open';
        totals.rows += 1;
        if (open) totals.open += 1;
        if (open) {
          const key = `${experienceLabel(previous)} -> ${experienceLabel(next)}`;
          experience.set(key, (experience.get(key) || 0) + 1);
        }
        if (next === previous) continue;
        totals.changed += 1;
        if (open) totals.changedOpen += 1;
        const title = (typeof row.TITLE === 'string' ? row.TITLE : '').slice(
          0,
          80,
        );
        for (const [name, bit] of [...FLAG_NAMES, ...RETIRED_FLAGS]) {
          const had = (previous & bit) !== 0;
          const has = (next & bit) !== 0;
          if (had === has) continue;
          const tally = perFlag.get(name) || {
            gained: 0,
            lost: 0,
            gainedOpen: 0,
            lostOpen: 0,
          };
          if (has) tally.gained += 1;
          else tally.lost += 1;
          if (has && open) tally.gainedOpen += 1;
          if (!has && open) tally.lostOpen += 1;
          perFlag.set(name, tally);
          const exampleKey = `${name} ${has ? '+' : '-'}`;
          const list = examples.get(exampleKey) || [];
          if (open && list.length < examplesPerFlag) {
            list.push(`"${title}"`);
            examples.set(exampleKey, list);
          }
        }
        if (!apply) continue;
        pending.push({
          jobId: String(row.JOB_ID),
          title,
          status: String(row.STATUS),
          previous,
          next,
          contentHash:
            typeof row.CONTENT_HASH === 'string' ? row.CONTENT_HASH : null,
        });
        if (pending.length >= batchSize) {
          const affected = await applyBatch(connection, driver, pending);
          updated += affected;
          skipped += pending.length - affected;
          pending = [];
        }
      }
      process.stderr.write(`scanned ${totals.rows}\r`);
    }
    if (apply && pending.length) {
      const affected = await applyBatch(connection, driver, pending);
      updated += affected;
      skipped += pending.length - affected;
    }
  } finally {
    await connection.close();
  }

  console.log(apply ? 'Mode: APPLY' : 'Mode: dry run (no writes)');
  console.log(
    `Search rows: ${totals.rows} (${totals.open} open). Rows whose flags change: ${totals.changed} (${totals.changedOpen} open).`,
  );
  console.log('\nPer flag (all rows / open rows):');
  console.table(
    Object.fromEntries(
      [...perFlag.entries()].map(([name, tally]) => [
        name,
        {
          gained: tally.gained,
          lost: tally.lost,
          'gained (open)': tally.gainedOpen,
          'lost (open)': tally.lostOpen,
        },
      ]),
    ),
  );
  console.log('\nExperience bucket, open rows (before -> after):');
  console.table(
    Object.fromEntries(
      [...experience.entries()].sort((left, right) => right[1] - left[1]),
    ),
  );
  console.log('\nExamples (open rows):');
  for (const [key, titles] of [...examples.entries()].sort()) {
    console.log(`  ${key}: ${titles.join('; ')}`);
  }
  if (apply) {
    console.log(
      `\nUpdated ${updated} rows; skipped ${skipped} that changed concurrently (rerun to pick them up).`,
    );
  }
}

if (require.main === module) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
