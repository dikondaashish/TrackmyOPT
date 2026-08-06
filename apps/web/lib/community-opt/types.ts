/** Partner case kinds from opt-tracker.com */
export type CommunityCaseKind = "initial_opt" | "stem_extension";

/** Normalized service-center keys we store / match on */
export type CommunityServiceCenter =
  | "potomac"
  | "nebraska"
  | "texas"
  | "vermont"
  | "california"
  | "nbc";

export type CommunitySource = "reddit" | "registered" | "other";

export type PartnerCasePayload = {
  id: string;
  source?: string | null;
  type?: string | null;
  service_center?: string | null;
  premium_processing?: boolean | null;
  init_date?: string | null;
  biometrics_date?: string | null;
  pp_date?: string | null;
  approve_date?: string | null;
  card_produce_date?: string | null;
  delivered_date?: string | null;
  nationality?: string | null;
  updated_at?: string | null;
};

export type CleanedCommunityCase = {
  external_id: string;
  source: CommunitySource;
  case_kind: CommunityCaseKind;
  service_center: CommunityServiceCenter | null;
  premium_processing: boolean;
  init_date: string | null;
  biometrics_date: string | null;
  pp_date: string | null;
  approve_date: string | null;
  card_produce_date: string | null;
  delivered_date: string | null;
  nationality: string | null;
  days_to_approval: number | null;
  days_to_produce: number | null;
  days_to_deliver: number | null;
  external_updated_at: string | null;
};

export type CommunityEstimate = {
  cohortSize: number;
  /** Always timeline-focused; do not treat as denial/approval predictor. */
  medianDays: number;
  p25Days: number;
  p75Days: number;
  fastestDays: number;
  estimatedDecisionRange: [string, string];
  distribution: Array<{ label: string; count: number }>;
  cohortPosition: { behind: number; ahead: number; percentile: number };
  approvalsLast24h: number;
  matchLevel: "center_pp" | "pp" | "kind" | "none";
  caseKind: CommunityCaseKind;
  serviceCenter: CommunityServiceCenter | null;
  premiumProcessing: boolean;
  sourceNote: string;
};

export type CommunityHeatmapRow = {
  month: string; // YYYY-MM
  buckets: number[]; // 6 buckets matching PredictionPanel
};
