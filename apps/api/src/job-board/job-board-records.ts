import { randomUUID } from 'node:crypto';
import { normalizeAtsJobFacts } from './ats-job-facts';
import type { ScrapedAtsJob } from './ats-scrapers.runner';
import type {
  JobStorePersistenceRecord,
  JobStoreRecord,
} from './job-data-store.contract';
import type { AtsSource } from './job-board.types';
import { jobContentHash, parseContentHash } from './job-content-hash';

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
      atsFacts: normalizeAtsJobFacts(job.workplace_type, job.employment_types),
    };
  });
}

export type IncrementalWritePlan = {
  /** New, changed, reopened or not-yet-hashed jobs: full job-row upsert. */
  writeRows: JobStoreRecord[];
  /** Subset of writeRows whose description changed (search reindex). */
  searchJobIds: Set<string>;
  /** Open, unchanged jobs: last_confirmed_at only. */
  confirmIds: string[];
};

/**
 * Splits a source response into full writes and lightweight confirmations.
 * Anything not provably unchanged and open is written in full, so lifecycle
 * transitions (reopening stale/removed jobs) keep the existing upsert path.
 */
export function planIncrementalWrites(
  records: readonly JobStoreRecord[],
  existingByExternalId: ReadonlyMap<string, JobStorePersistenceRecord>,
): IncrementalWritePlan {
  const writeRows: JobStoreRecord[] = [];
  const searchJobIds = new Set<string>();
  const confirmIds: string[] = [];
  for (const record of records) {
    const contentHash = jobContentHash(record);
    const existing = existingByExternalId.get(record.externalJobId);
    const previous = parseContentHash(existing?.contentHash);
    const next = parseContentHash(contentHash);
    const isOpen =
      existing?.listingStatus === 'open' && existing.missingSinceAt == null;
    if (existing && isOpen && existing.contentHash === contentHash) {
      confirmIds.push(record.id);
      continue;
    }
    writeRows.push({ ...record, contentHash });
    if (!previous || previous.description !== next?.description)
      searchJobIds.add(record.id);
  }
  return { writeRows, searchJobIds, confirmIds };
}
