import { ConfigService } from '@nestjs/config';
import { OracleJobDataStore } from './oracle-job-data-store';
import type { JobDataStore, JobStoreRecord } from './job-data-store.contract';
import {
  ALLOWED_CANONICAL_IDENTITIES,
  OracleIdentityRepairService,
} from './oracle-identity-repair.service';

const timestamp = '2026-09-05T22:15:00.000Z';

function sourceRow(index: number): JobStoreRecord {
  const identity = ALLOWED_CANONICAL_IDENTITIES[index];
  return {
    id: identity.canonicalId,
    sourceId: identity.sourceId,
    sourceAts: identity.sourceAts,
    boardToken: identity.boardToken,
    externalJobId: identity.externalJobId,
    title: `Job ${index}`,
    companyName: 'Test employer',
    location: null,
    department: null,
    description: `Description ${index}`,
    jobUrl: `https://example.test/${index}`,
    postedAt: timestamp,
    updatedAt: timestamp,
    optEligible: null,
    stemOptEligible: null,
    cptEligible: null,
    h1bSponsorStatus: null,
    createdAt: timestamp,
    firstSeenAt: timestamp,
    lastConfirmedAt: timestamp,
    listingStatus: 'open',
    employerBoardName: null,
    sourceTrustTier: 'verified_ats',
    employerMatchId: null,
    missingSinceAt: null,
    removedAt: null,
  };
}

describe('OracleIdentityRepairService', () => {
  afterEach(() => jest.restoreAllMocks());

  it('reads only the five allowlisted Supabase rows and verifies the Oracle repair', async () => {
    const rows = ALLOWED_CANONICAL_IDENTITIES.map((_, index) =>
      sourceRow(index),
    );
    const getJob = jest.fn((id: string) =>
      Promise.resolve(rows.find((row) => row.id === id) || null),
    );
    const source = { getJob } as unknown as JobDataStore;
    const target = {
      healthCheck: jest.fn(),
      repairCanonicalIdentities: jest.fn().mockResolvedValue(
        ALLOWED_CANONICAL_IDENTITIES.map((identity) => ({
          externalJobId: identity.externalJobId,
          previousId: `old-${identity.externalJobId}`,
          canonicalId: identity.canonicalId,
          dependentVisaSignals: 0,
        })),
      ),
      upsertJobs: jest.fn(),
      getJob: jest.fn((id: string) =>
        Promise.resolve(rows.find((row) => row.id === id) || null),
      ),
      close: jest.fn(),
    };
    jest
      .spyOn(OracleJobDataStore, 'fromEnvironment')
      .mockReturnValue(target as never);
    const config = {
      get: jest.fn(
        (key: string) =>
          ({
            JOB_DATA_STORE: 'supabase',
            ORACLE_JOB_DB_CONNECT_STRING: 'redacted',
            ORACLE_JOB_DB_USER: 'redacted',
            ORACLE_JOB_DB_PASSWORD: 'redacted',
            ORACLE_JOB_DB_POOL_MAX: 4,
          })[key],
      ),
    } as unknown as ConfigService;

    const result = await new OracleIdentityRepairService(
      config,
      source,
    ).runOnce();

    expect(result.status).toBe('completed');
    expect(getJob).toHaveBeenCalledTimes(5);
    expect(target.upsertJobs).toHaveBeenCalledWith(rows);
    expect(target.close).toHaveBeenCalledTimes(1);
    expect(result.jobs.every((job) => job.verified)).toBe(true);
  });

  it('refuses a second mutating run once canonical IDs are already present', async () => {
    const rows = ALLOWED_CANONICAL_IDENTITIES.map((_, index) =>
      sourceRow(index),
    );
    const source = {
      getJob: jest.fn((id: string) =>
        Promise.resolve(rows.find((row) => row.id === id) || null),
      ),
    } as unknown as JobDataStore;
    const target = {
      healthCheck: jest.fn(),
      repairCanonicalIdentities: jest.fn().mockResolvedValue(
        ALLOWED_CANONICAL_IDENTITIES.map((identity) => ({
          externalJobId: identity.externalJobId,
          previousId: identity.canonicalId,
          canonicalId: identity.canonicalId,
          dependentVisaSignals: 0,
        })),
      ),
      upsertJobs: jest.fn(),
      getJob: jest.fn((id: string) =>
        Promise.resolve(rows.find((row) => row.id === id) || null),
      ),
      close: jest.fn(),
    };
    jest
      .spyOn(OracleJobDataStore, 'fromEnvironment')
      .mockReturnValue(target as never);
    const config = {
      get: jest.fn((key: string) =>
        key === 'JOB_DATA_STORE' ? 'supabase' : undefined,
      ),
    } as unknown as ConfigService;

    const result = await new OracleIdentityRepairService(
      config,
      source,
    ).runOnce();

    expect(result.status).toBe('already_complete');
    expect(target.upsertJobs).not.toHaveBeenCalled();
  });
});
