export type AtsSource = {
  id: string;
  ats_type: string;
  board_token: string;
  base_url: string;
  company_id: string | null;
  employer_board_name: string | null;
  enabled: boolean;
};

export type Reservation = {
  audit_log_id: string;
  accepted: boolean;
  reason: string;
};
export type IngestionResult =
  | { sourceId: string; skipped: string }
  | {
      sourceId: string;
      jobsFound: number;
      jobsNew: number;
      jobsDuplicate: number;
      jobsStale: number;
      jobsRemoved: number;
      jobsReopened: number;
    };

export type PersistenceResult = {
  jobsNew: number;
  jobsDuplicate: number;
  jobsStale: number;
  jobsRemoved: number;
  jobsReopened: number;
};

export type SourceBoardHealth = {
  id: string;
  consecutive_failures: number;
  circuit_state: 'closed' | 'open';
  next_retry_at: string | null;
};

export const sleep = (durationMs: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, durationMs));
