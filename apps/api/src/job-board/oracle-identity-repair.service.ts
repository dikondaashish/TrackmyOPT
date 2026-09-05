import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OracleJobDataStore } from './oracle-job-data-store';
import type { JobDataStore, JobStoreRecord } from './job-data-store.contract';
import { JOB_DATA_STORE } from './job-data-store.provider';
import { compareJobRecords } from './job-store-parity';
import { resolveJobDataStore } from './job-data-store.config';

type AllowedIdentity = {
  sourceId: string;
  sourceAts: string;
  boardToken: string;
  externalJobId: string;
  canonicalId: string;
};

/**
 * The one-time repair is deliberately a closed set. It accepts no request
 * body, IDs, SQL, or arbitrary source selectors. Canonical state in Oracle
 * acts as the durable completion marker: once all five IDs match, the
 * operation refuses to mutate again.
 */
export const ALLOWED_CANONICAL_IDENTITIES: readonly AllowedIdentity[] = [
  {
    sourceId: '02f2e194-75fe-424e-aabd-99faa0b0d425',
    sourceAts: 'ashby',
    boardToken: 'angi',
    externalJobId: '3494df9f-0ec4-43a9-8bee-560bfd37f392',
    canonicalId: '3b578570-5062-4d66-9f8b-fd55de66d91b',
  },
  {
    sourceId: '02f2e194-75fe-424e-aabd-99faa0b0d425',
    sourceAts: 'ashby',
    boardToken: 'angi',
    externalJobId: '94745ec1-80a4-4e01-983f-22ab66abe894',
    canonicalId: 'bcc8ef52-b15d-44cc-9a94-677a4556c3f2',
  },
  {
    sourceId: '88ead09e-fe5f-4584-a82f-407e481eb1c1',
    sourceAts: 'greenhouse',
    boardToken: 'abacusinsights',
    externalJobId: '8783925002',
    canonicalId: '79d99873-033b-4edd-92d3-ace87dfa1408',
  },
  {
    sourceId: '88ead09e-fe5f-4584-a82f-407e481eb1c1',
    sourceAts: 'greenhouse',
    boardToken: 'abacusinsights',
    externalJobId: '8773589002',
    canonicalId: '1f408794-c7d1-45f6-9bd1-db0eb3c13d29',
  },
  {
    sourceId: '8b41f3cb-e62c-4d0f-9def-95e822d81458',
    sourceAts: 'greenhouse',
    boardToken: 'aidashinc',
    externalJobId: '4392561009',
    canonicalId: '837de51d-96f0-405a-822b-561a51f82cb9',
  },
];

export type CanonicalIdentityRepairResult = {
  status: 'completed' | 'already_complete';
  jobs: Array<{
    externalJobId: string;
    verified: boolean;
    previousOracleId: string | null;
    visaSignalsPreserved: number;
  }>;
};

@Injectable()
export class OracleIdentityRepairService {
  constructor(
    private readonly config: ConfigService,
    @Inject(JOB_DATA_STORE) private readonly sourceStore: JobDataStore,
  ) {}

  async runOnce(): Promise<CanonicalIdentityRepairResult> {
    if (
      resolveJobDataStore(this.config.get<string>('JOB_DATA_STORE')) !==
      'supabase'
    ) {
      throw new Error(
        'Canonical identity repair requires Supabase as the source store',
      );
    }

    const sourceRows = await Promise.all(
      ALLOWED_CANONICAL_IDENTITIES.map(async (identity) => {
        const row = await this.sourceStore.getJob(identity.canonicalId);
        if (!row)
          throw new Error(
            `Allowlisted source row is missing: ${identity.externalJobId}`,
          );
        this.validateSourceRow(identity, row);
        return row;
      }),
    );

    const oracle = OracleJobDataStore.fromEnvironment({
      JOB_DATA_STORE: 'oracle',
      ORACLE_JOB_DB_CONNECT_STRING: this.config.get<string>(
        'ORACLE_JOB_DB_CONNECT_STRING',
      ),
      ORACLE_JOB_DB_USER: this.config.get<string>('ORACLE_JOB_DB_USER'),
      ORACLE_JOB_DB_PASSWORD: this.config.get<string>('ORACLE_JOB_DB_PASSWORD'),
      ORACLE_JOB_DB_POOL_MAX: String(
        this.config.get<number>('ORACLE_JOB_DB_POOL_MAX') ?? 4,
      ),
    });
    try {
      await oracle.healthCheck();
      const repairs = await oracle.repairCanonicalIdentities(
        ALLOWED_CANONICAL_IDENTITIES.map((identity) => ({
          sourceAts: identity.sourceAts,
          boardToken: identity.boardToken,
          externalJobId: identity.externalJobId,
          canonicalId: identity.canonicalId,
        })),
      );
      const changed = repairs.some(
        (repair) =>
          repair.previousId && repair.previousId !== repair.canonicalId,
      );
      const missing = repairs.some((repair) => !repair.previousId);
      if (changed || missing) await oracle.upsertJobs(sourceRows);

      const jobs = await Promise.all(
        sourceRows.map(async (sourceRow, index) => {
          const stored = await oracle.getJob(sourceRow.id);
          if (!stored)
            throw new Error(
              `Oracle row is missing after repair: ${sourceRow.id}`,
            );
          const mismatches = compareJobRecords(sourceRow, stored);
          return {
            externalJobId: ALLOWED_CANONICAL_IDENTITIES[index].externalJobId,
            verified: mismatches.length === 0,
            previousOracleId: repairs[index].previousId,
            visaSignalsPreserved: repairs[index].dependentVisaSignals,
            mismatches,
          };
        }),
      );
      const failed = jobs.filter((job) => !job.verified);
      if (failed.length)
        throw new Error('Canonical identity repair verification failed');
      return {
        status: changed || missing ? 'completed' : 'already_complete',
        jobs: jobs.map((job) => ({
          externalJobId: job.externalJobId,
          verified: job.verified,
          previousOracleId: job.previousOracleId,
          visaSignalsPreserved: job.visaSignalsPreserved,
        })),
      };
    } finally {
      await oracle.close();
    }
  }

  private validateSourceRow(identity: AllowedIdentity, row: JobStoreRecord) {
    if (
      row.id !== identity.canonicalId ||
      row.sourceId !== identity.sourceId ||
      row.sourceAts !== identity.sourceAts ||
      row.boardToken !== identity.boardToken ||
      row.externalJobId !== identity.externalJobId
    ) {
      throw new Error(
        `Allowlisted source identity mismatch: ${identity.externalJobId}`,
      );
    }
  }
}
