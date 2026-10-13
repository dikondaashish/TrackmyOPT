/** Private versioned evidence keyed by internal UUIDs. No USCIS receipt numbers. */
export const MODEL_VERSION = 'opt-aj-v2';
export type CaseKind = 'initial_opt' | 'stem_extension';
export type Outcome =
  | 'approval'
  | 'denial'
  | 'withdrawal'
  | 'pending'
  | 'unknown';
export type Processing = 'regular_unconfirmed' | 'premium';
export type ProviderEvidence = {
  status: string;
  form: string;
  received: string | null;
  events: Array<{ date: string; status: string }>;
};
export type Observation = {
  id: number;
  case_id: string;
  application_id: string;
  observed_at: string;
  synced_at: string;
  provider: ProviderEvidence;
  reported: {
    category: string | null;
    category_confirmed_at: string | null;
    filing_date: string | null;
    premium_start: string | null;
    legacy_premium_start?: string | null;
  };
};
export type Timeline = {
  applicationId: string;
  caseIds: string[];
  kind: CaseKind | null;
  processing: Processing;
  receiptDate: string | null;
  reportedFilingDate: string | null;
  premiumStart: string | null;
  origin: string | null;
  firstPendingAt: string | null;
  lastPendingAt: string | null;
  lastObservedAt: string;
  lastSyncedAt: string;
  currentStatus: string;
  outcome: Outcome;
  eventDate: string | null;
  flags: string[];
};
/** (entry, exit] on the application's age clock; censoring follows events at ties. */
export type SurvivalRecord = {
  id: string;
  entry: number;
  exit: number;
  event: 'approval' | 'denial' | 'withdrawal' | 'upgrade' | 'censored';
};
export type CurvePoint = {
  day: number;
  atRisk: number;
  riskAfter: number;
  approvals: number;
  competing: number;
  survival: number;
  approval: number;
};
export type Curve = { size: number; points: CurvePoint[]; support: number };
export type Forecast = {
  modelVersion: string;
  state: 'estimate' | 'limited_data' | 'approved' | 'nonapproval' | 'shadow';
  asOf: string;
  medianDate: string | null;
  interval50: [string | null, string | null];
  interval80: [string | null, string | null];
  approvalDate: string | null;
  waitingDays: number | null;
  remainingDays: {
    p10: number | null;
    p25: number | null;
    p50: number | null;
    p75: number | null;
    p90: number | null;
  };
  sampleSize: number;
  atRisk: number;
  reliability: 'Limited Data' | null;
  lastSuccessfulSync: string | null;
  modelUpdatedAt: string | null;
  explanation: string;
};
