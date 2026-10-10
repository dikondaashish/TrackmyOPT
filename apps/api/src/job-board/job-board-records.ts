import { randomUUID } from 'node:crypto';
import type { ScrapedAtsJob } from './ats-scrapers.runner';
import type {
  JobStorePersistenceRecord,
  JobStoreRecord,
} from './job-data-store.contract';
import type { AtsSource } from './job-board.types';

/** Maps scraped ATS jobs onto store records, preserving existing identities. */
export function buildJobStoreRecords(
  source: AtsSource,
  scraped: ScrapedAtsJob[],
  existingByExternalId: Map<string, JobStorePersistenceRecord>,
  now: string,
): JobStoreRecord[] {
  return scraped.map((job) => {
    const existing = existingByExternalId.get(job.external_job_id);
    return {
      id: existing?.id || randomUUID(),
      sourceId: source.id,
      sourceAts: source.ats_type,
      boardToken: source.board_token,
      externalJobId: job.external_job_id,
      title: job.title,
      companyName:
        job.company_name ||
        source.employer_board_name ||
        existing?.companyName ||
        '',
      location: job.location,
      department: job.department,
      description: job.description,
      jobUrl: job.job_url,
      postedAt: job.posted_at,
      updatedAt: now,
      optEligible: existing?.optEligible ?? null,
      stemOptEligible: existing?.stemOptEligible ?? null,
      cptEligible: existing?.cptEligible ?? null,
      h1bSponsorStatus: existing?.h1bSponsorStatus ?? null,
      createdAt: existing?.createdAt || now,
      firstSeenAt: existing?.firstSeenAt || now,
      lastConfirmedAt: now,
      listingStatus: 'open',
      employerBoardName: source.employer_board_name,
      sourceTrustTier: 'verified_ats',
      employerMatchId: existing?.employerMatchId ?? null,
      missingSinceAt: null,
      removedAt: null,
    };
  });
}
