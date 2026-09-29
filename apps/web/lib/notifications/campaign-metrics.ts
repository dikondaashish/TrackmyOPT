export interface CampaignSummary {
  id: string;
  subject: string;
  created_at: string;
}

export interface CampaignMetrics {
  campaignId: string;
  subject: string;
  sent: number;
  failed: number;
  needsReview: number;
  observedOpens: number;
  recordedClickers: number;
  knownAutomatedRequests: number;
  links: { key: string; url: string; clickers: number; knownAutomatedClickers: number }[];
}
