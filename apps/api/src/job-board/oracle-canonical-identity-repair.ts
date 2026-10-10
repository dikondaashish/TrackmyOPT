import type { OracleConnection, OracleDriver } from './oracle-job-data-helpers';
import { outputOptions } from './oracle-job-data-helpers';

export type OracleCanonicalIdentityRepair = {
  sourceAts: string;
  boardToken: string;
  externalJobId: string;
  canonicalId: string;
};

export type OracleCanonicalIdentityRepairResult = {
  externalJobId: string;
  previousId: string | null;
  canonicalId: string;
  dependentVisaSignals: number;
};

/**
 * Runs the repair statements on an open connection. The caller owns the
 * transaction: it must commit on success and roll back on failure.
 */
export async function runOracleCanonicalIdentityRepair(
  connection: OracleConnection,
  driver: OracleDriver,
  entries: readonly OracleCanonicalIdentityRepair[],
): Promise<OracleCanonicalIdentityRepairResult[]> {
  const dependentConstraints = await connection.execute<{
    TABLE_NAME: string;
    COLUMN_NAME: string;
  }>(
    `SELECT child.table_name AS "TABLE_NAME", child_cols.column_name AS "COLUMN_NAME"
         FROM user_constraints child
         JOIN user_cons_columns child_cols
           ON child.owner = child_cols.owner
          AND child.constraint_name = child_cols.constraint_name
         JOIN user_constraints parent
           ON child.r_owner = parent.owner
          AND child.r_constraint_name = parent.constraint_name
         JOIN user_cons_columns parent_cols
           ON parent.owner = parent_cols.owner
          AND parent.constraint_name = parent_cols.constraint_name
         WHERE child.constraint_type = 'R'
           AND parent.table_name = 'JOBS'
           AND parent_cols.column_name = 'ID'`,
    {},
    outputOptions(driver),
  );
  for (const row of dependentConstraints.rows || []) {
    if (
      String(row.TABLE_NAME).toUpperCase() !== 'JOB_VISA_SIGNALS' ||
      String(row.COLUMN_NAME).toUpperCase() !== 'JOB_ID'
    ) {
      throw new Error('Unexpected Oracle JOBS foreign-key dependency');
    }
  }

  const results: OracleCanonicalIdentityRepairResult[] = [];
  for (const entry of entries) {
    const target = await connection.execute<{
      ID: string;
    }>(
      `SELECT id AS "ID" FROM jobs
           WHERE source_ats = :sourceAts
             AND board_token = :boardToken
             AND external_job_id = :externalJobId
           FOR UPDATE`,
      {
        sourceAts: entry.sourceAts,
        boardToken: entry.boardToken,
        externalJobId: entry.externalJobId,
      },
      outputOptions(driver),
    );
    const previousId = target.rows?.[0]?.ID ? String(target.rows[0].ID) : null;
    if (!previousId || previousId === entry.canonicalId) {
      results.push({
        externalJobId: entry.externalJobId,
        previousId,
        canonicalId: entry.canonicalId,
        dependentVisaSignals: 0,
      });
      continue;
    }

    const conflicting = await connection.execute<{ ID: string }>(
      `SELECT id AS "ID" FROM jobs WHERE id = :canonicalId FOR UPDATE`,
      { canonicalId: entry.canonicalId },
      outputOptions(driver),
    );
    if (conflicting.rows?.length) {
      throw new Error(
        `Canonical job ID conflict for external identity ${entry.externalJobId}`,
      );
    }

    const signals = await connection.execute<{
      ID: string;
      SIGNAL_TYPE: string;
      EVIDENCE_SNIPPET: string;
      SOURCE_URL: string;
      OBSERVED_DATE: Date | string;
      CONFIDENCE: number;
      SOURCE: string;
    }>(
      `SELECT id AS "ID", signal_type AS "SIGNAL_TYPE",
                  evidence_snippet AS "EVIDENCE_SNIPPET", source_url AS "SOURCE_URL",
                  observed_date AS "OBSERVED_DATE", confidence AS "CONFIDENCE",
                  source AS "SOURCE"
           FROM job_visa_signals WHERE job_id = :oldId`,
      { oldId: previousId },
      outputOptions(driver),
    );
    const dependentVisaSignals = signals.rows?.length || 0;

    if (dependentVisaSignals) {
      await connection.execute(
        'DELETE FROM job_visa_signals WHERE job_id = :oldId',
        { oldId: previousId },
      );
    }
    await connection.execute(
      'UPDATE jobs SET id = :canonicalId WHERE id = :oldId',
      { canonicalId: entry.canonicalId, oldId: previousId },
    );
    if (dependentVisaSignals) {
      await connection.executeMany(
        `INSERT INTO job_visa_signals
              (id, job_id, signal_type, evidence_snippet, source_url,
               observed_date, confidence, source)
             VALUES (:id, :jobId, :signalType, :evidenceSnippet, :sourceUrl,
                     :observedDate, :confidence, :source)`,
        (signals.rows || []).map((signal) => ({
          id: String(signal.ID),
          jobId: entry.canonicalId,
          signalType: String(signal.SIGNAL_TYPE),
          evidenceSnippet: String(signal.EVIDENCE_SNIPPET),
          sourceUrl: String(signal.SOURCE_URL),
          observedDate: signal.OBSERVED_DATE,
          confidence: Number(signal.CONFIDENCE),
          source: String(signal.SOURCE),
        })),
        { autoCommit: false },
      );
    }
    results.push({
      externalJobId: entry.externalJobId,
      previousId,
      canonicalId: entry.canonicalId,
      dependentVisaSignals,
    });
  }
  return results;
}
