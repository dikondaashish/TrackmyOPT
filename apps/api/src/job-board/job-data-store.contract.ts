import type { AtsJobFacts } from './ats-job-facts';

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
  /** `v1.<description>.<metadata>` digests; written only by incremental ingestion. */
  contentHash?: string | null;
  /**
   * Workplace and employment type from the ATS's structured fields. Not a
   * JOBS column: it is stored in the search table's filter flags.
   */
  atsFacts?: AtsJobFacts | null;
};

/** Minimal projection needed while persisting a fresh source response. */
export type JobStorePersistenceRecord = {
  id: string;
  externalJobId: string;
  companyName: string;
  optEligible: boolean | null;
  stemOptEligible: boolean | null;
  cptEligible: boolean | null;
  h1bSponsorStatus: string | null;
  createdAt: string;
  firstSeenAt: string;
  employerMatchId: string | null;
  listingStatus: JobStoreRecord['listingStatus'];
  missingSinceAt: string | null;
  /** Present only when the store supports incremental ingestion. */
  contentHash?: string | null;
};

/** Lifecycle transitions committed by one reconcileSource call. */
export type JobStoreReconcileResult = {
  staleCount: number;
  removedCount: number;
};

export type JobStoreUpsertOptions = {
  /** When set, only these job IDs are written to the search table. */
  searchJobIds?: ReadonlySet<string>;
};

export type JobStoreEmployerMatchUpdate = {
  id: string;
  employerMatchId: string | null;
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
  /** 'us' hides jobs whose location names only places outside the US. */
  country?: 'us' | 'all';
  /** US place keys (see us-location.ts); a job matches any of them. */
  places?: readonly string[];
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

/**
 * Filter option values. `companies` holds the value the company filter
 * matches (company_name, else employer_board_name).
 */
export type JobStoreFacets = {
  locations: string[];
  companies: string[];
  /** US states, cities and remote, most jobs first. */
  places: JobStorePlaceFacet[];
};

export type JobStorePlaceFacet = {
  /** `state:CA`, `city:San Francisco, CA` or `remote:us`. */
  key: string;
  kind: 'state' | 'city' | 'remote';
  label: string;
  count: number;
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
  /** Every location and company of open verified jobs, for filter options. */
  listJobFacets(): Promise<JobStoreFacets>;
  /** Full lifecycle read used by reconciliation; callers must paginate inside the store. */
  listSourceJobs(sourceId: string): Promise<JobStoreRecord[]>;
  /** Avoids loading CLOB descriptions during live ingestion reconciliation. */
  listSourceJobsForIngestion(
    sourceId: string,
  ): Promise<JobStorePersistenceRecord[]>;
  listSourceJobsPage(
    sourceId: string,
    offset: number,
    pageSize: number,
  ): Promise<JobStorePage>;
  getJob(id: string): Promise<JobStoreRecord | null>;
  upsertJobs(
    rows: readonly JobStoreRecord[],
    options?: JobStoreUpsertOptions,
  ): Promise<void>;
  /**
   * Incremental ingestion (JOB_INGEST_INCREMENTAL=true with the content_hash
   * column applied). Stores without it keep the full-upsert path.
   */
  readonly supportsIncrementalIngestion?: boolean;
  /** Re-confirm unchanged open jobs without rewriting content or search rows. */
  confirmJobs?(ids: readonly string[], confirmedAt: string): Promise<void>;
  /** Update only the employer link of jobs whose match changed. */
  updateEmployerMatches?(
    updates: readonly JobStoreEmployerMatchUpdate[],
  ): Promise<void>;
  /**
   * Stores that apply their own lifecycle rules (Oracle's 20-hour removal
   * window) return the transitions they actually committed, so audits report
   * those instead of the in-memory plan.
   */
  reconcileSource(
    sourceId: string,
    seenExternalJobIds: readonly string[],
    runStartedAt?: string,
  ): Promise<void | JobStoreReconcileResult>;
}
