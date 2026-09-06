/**
 * Database-neutral contract for the job-board records only.
 *
 * This boundary covers job records only. Source authorization, ingestion
 * audits, evidence, accounts, and user-owned tracker data remain separate
 * Supabase concerns.
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
  searchScope?: 'title_description' | 'title' | 'company';
  exclude?: string;
  sourceAts?: string;
  companyName?: string;
  location?: string;
  workplace?: 'all' | 'remote' | 'hybrid' | 'on_site' | 'unspecified';
  degree?: 'all' | 'bachelor' | 'master' | 'doctorate' | 'unspecified';
  experience?: 'all' | 'entry' | 'mid' | 'senior' | 'unspecified';
  employerEvidence?: 'all' | 'source_backed';
  role?:
    | 'all'
    | 'engineering'
    | 'data'
    | 'product'
    | 'design'
    | 'operations'
    | 'sales'
    | 'other';
  jobType?:
    | 'all'
    | 'internship'
    | 'contract'
    | 'temporary'
    | 'permanent'
    | 'unspecified';
  employmentType?: 'all' | 'full_time' | 'part_time' | 'unspecified';
  listingStatus?: 'open' | 'stale' | 'removed' | 'all';
  sourceId?: string;
  postedAfter?: string;
  sortBy?: 'posted_at' | 'last_confirmed_at';
  includeJobUrls?: readonly string[];
  excludeJobUrls?: readonly string[];
};

export type JobStorePage = {
  rows: JobStoreRecord[];
  total: number;
};

export type JobStoreVisaSignal = {
  jobId: string;
  signalType: string;
  evidenceSnippet: string;
  sourceUrl: string;
  observedDate: string;
  confidence: number;
  source: string;
};

export interface JobDataStore {
  /** Optional resource cleanup for stores that own a connection pool. */
  close?(): Promise<void>;
  healthCheck(): Promise<void>;
  listJobs(query: JobStoreSearch): Promise<JobStorePage>;
  /** Full lifecycle read used by reconciliation; callers must paginate inside the store. */
  listSourceJobs(sourceId: string): Promise<JobStoreRecord[]>;
  listSourceJobsPage(
    sourceId: string,
    offset: number,
    pageSize: number,
  ): Promise<JobStorePage>;
  getJob(id: string): Promise<JobStoreRecord | null>;
  upsertJobs(rows: readonly JobStoreRecord[]): Promise<void>;
  reconcileSource(
    sourceId: string,
    seenExternalJobIds: readonly string[],
    runStartedAt?: string,
  ): Promise<void>;
}
