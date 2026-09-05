import type { JobDataStore, JobStoreRecord } from './job-data-store.contract';
import {
  compareJobRecords,
  compareJobStoreDetail,
  compareJobStorePage,
} from './job-store-parity';

const job: JobStoreRecord = {
  id: 'job-1',
  sourceId: 'source-1',
  sourceAts: 'greenhouse',
  boardToken: 'board',
  externalJobId: 'external-1',
  title: 'Engineer',
  companyName: 'Example',
  location: 'Remote',
  department: 'Engineering',
  description: 'Build',
  jobUrl: 'https://example.test/job-1',
  postedAt: '2026-09-04T00:00:00.000Z',
  updatedAt: '2026-09-04T00:00:00.000Z',
  optEligible: null,
  stemOptEligible: null,
  cptEligible: null,
  h1bSponsorStatus: null,
  createdAt: '2026-09-04T00:00:00.000Z',
  firstSeenAt: '2026-09-04T00:00:00.000Z',
  lastConfirmedAt: '2026-09-04T00:00:00.000Z',
  listingStatus: 'open',
  employerBoardName: 'Example',
  sourceTrustTier: 'verified_ats',
  employerMatchId: null,
  missingSinceAt: null,
  removedAt: null,
};

function store(
  pageRows: JobStoreRecord[],
  detail: JobStoreRecord | null,
): Pick<JobDataStore, 'listJobs' | 'getJob'> {
  return {
    listJobs: jest
      .fn()
      .mockResolvedValue({ rows: pageRows, total: pageRows.length }),
    getJob: jest.fn().mockResolvedValue(detail),
  };
}

describe('job-store dual-read parity helpers', () => {
  it('compares every timestamp by UTC millisecond instant without ignoring real differences', () => {
    const fields = [
      'postedAt',
      'updatedAt',
      'createdAt',
      'firstSeenAt',
      'lastConfirmedAt',
      'missingSinceAt',
      'removedAt',
    ] as const;
    for (const field of fields) {
      const left = { ...job, [field]: '2026-09-04T00:00:00.123456+00:00' };
      expect(
        compareJobRecords(left, {
          ...job,
          [field]: '2026-09-03T20:00:00.123-04:00',
        }),
      ).toEqual([]);
      expect(
        compareJobRecords(left, {
          ...job,
          [field]: '2026-09-04T00:00:00.124Z',
        }),
      ).toEqual([expect.objectContaining({ field })]);
    }
  });

  it('compares descriptions without returning their contents in diagnostic output', () => {
    const result = compareJobRecords(job, {
      ...job,
      description: 'Changed private description',
    });
    expect(result).toEqual([expect.objectContaining({ field: 'description' })]);
    expect(JSON.stringify(result)).not.toContain('Changed private description');
  });

  it('detects ordering differences even when page membership matches', async () => {
    const other = { ...job, id: 'job-2' };
    const result = await compareJobStorePage(
      store([job, other], job),
      store([other, job], job),
      { page: 1, pageSize: 50 },
    );
    expect(result.matched).toBe(false);
    expect(result.mismatches.map((item) => item.kind)).toContain('order');
  });
  it('compares all canonical job fields and reports mismatches', () => {
    expect(compareJobRecords(job, { ...job, title: 'Different' })).toEqual([
      expect.objectContaining({
        kind: 'field',
        field: 'title',
        jobId: 'job-1',
      }),
    ]);
  });

  it('compares page counts and identities without exposing descriptions', async () => {
    const result = await compareJobStorePage(
      store([job], job),
      store([{ ...job, id: 'job-2' }], { ...job, id: 'job-2' }),
      { page: 1, pageSize: 50 },
    );
    expect(result.matched).toBe(false);
    expect(result.mismatches.map((item) => item.kind)).toContain('identity');
  });

  it('compares detail reads and treats two missing rows as equal', async () => {
    await expect(
      compareJobStoreDetail(
        store([], job),
        store([], { ...job, location: 'Palo Alto' }),
        'job-1',
      ),
    ).resolves.toMatchObject({ matched: false });
    await expect(
      compareJobStoreDetail(store([], null), store([], null), 'missing'),
    ).resolves.toEqual({ matched: true, mismatches: [] });
  });
});
