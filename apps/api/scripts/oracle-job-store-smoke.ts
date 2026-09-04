import { OracleJobDataStore } from '../src/job-board/oracle-job-data-store';
import type { JobStoreRecord } from '../src/job-board/job-data-store.contract';

const smokeJob: JobStoreRecord = {
  id: '00000000-0000-4000-8000-000000000001',
  sourceId: '00000000-0000-4000-8000-000000000002',
  sourceAts: 'consumer_board',
  boardToken: '__oracle_shadow_smoke__',
  externalJobId: '__oracle_shadow_smoke__',
  title: 'Oracle shadow smoke test',
  companyName: 'TrackMyOPT',
  location: 'Remote',
  department: 'Engineering',
  description: 'Deterministic Oracle shadow CRUD probe.',
  jobUrl: 'https://www.trackmyopt.com/',
  postedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  optEligible: null,
  stemOptEligible: null,
  cptEligible: null,
  h1bSponsorStatus: null,
  createdAt: new Date().toISOString(),
  firstSeenAt: new Date().toISOString(),
  lastConfirmedAt: new Date().toISOString(),
  listingStatus: 'open',
  employerBoardName: 'TrackMyOPT',
  sourceTrustTier: 'verified_ats',
  employerMatchId: null,
  missingSinceAt: null,
  removedAt: null,
};

async function main() {
  const store = OracleJobDataStore.fromEnvironment(process.env);
  try {
    await store.healthCheck();
    await store.upsertJobs([smokeJob]);
    const inserted = await store.getJob(smokeJob.id);
    if (!inserted)
      throw new Error('Oracle smoke row was not readable after insert');

    const updatedJob = {
      ...smokeJob,
      title: 'Oracle shadow smoke test (updated)',
      updatedAt: new Date().toISOString(),
    };
    await store.upsertJobs([updatedJob]);
    const updated = await store.getJob(smokeJob.id);
    if (updated?.title !== updatedJob.title)
      throw new Error('Oracle smoke row did not update through MERGE');

    const page = await store.listJobs({
      page: 1,
      pageSize: 10,
      query: 'oracle shadow smoke',
    });
    console.log(
      JSON.stringify({
        health: 'ok',
        inserted: Boolean(inserted),
        updated: updated.title === updatedJob.title,
        matchingRows: page.total,
      }),
    );
  } finally {
    await store.close();
  }
}

main().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : 'Oracle smoke test failed';
  console.error(message);
  process.exitCode = 1;
});
