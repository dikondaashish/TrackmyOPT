/**
 * Database-neutral contract for the job-board records only.
 *
 * This is intentionally not used by the current production service yet. It
 * gives the future Oracle adapter the same boundary as the existing Supabase
 * persistence without moving auth, accounts, applications, or H-1B data.
 */
export type JobStoreRecord = {
  id: string;
  sourceId: string;
  sourceAts: string;
  boardToken: string;
  externalJobId: string;
  title: string;
  companyName: string;
  location: string | null;
  department: string | null;
  description: string | null;
  jobUrl: string | null;
  postedAt: string | null;
  updatedAt: string;
  optEligible: boolean | null;
  stemOptEligible: boolean | null;
  cptEligible: boolean | null;
  h1bSponsorStatus: string | null;
  createdAt: string;
  firstSeenAt: string;
  lastConfirmedAt: string;
  listingStatus: 'open' | 'stale' | 'removed';
  employerBoardName: string | null;
  sourceTrustTier: string;
  employerMatchId: string | null;
  missingSinceAt: string | null;
  removedAt: string | null;
};

export type JobStoreSearch = {
  page: number;
  pageSize: number;
  query?: string;
  sourceAts?: string;
  companyName?: string;
  location?: string;
  listingStatus?: 'open' | 'stale' | 'removed';
  postedAfter?: string;
};

export type JobStorePage = {
  rows: JobStoreRecord[];
  total: number;
};

export interface JobDataStore {
  healthCheck(): Promise<void>;
  listJobs(query: JobStoreSearch): Promise<JobStorePage>;
  getJob(id: string): Promise<JobStoreRecord | null>;
  upsertJobs(rows: readonly JobStoreRecord[]): Promise<void>;
  reconcileSource(
    sourceId: string,
    seenExternalJobIds: readonly string[],
  ): Promise<void>;
}
