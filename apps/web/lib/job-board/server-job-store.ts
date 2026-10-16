import 'server-only';

// Job records live only in the Oracle job store and are always read through the
// API's authenticated /job-board/jobs boundary; there is no Supabase fallback.

export type ServerJobRecord = {
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

export type ServerVisaSignal = {
  jobId: string;
  signalType: string;
  evidenceSnippet: string;
  sourceUrl: string;
  observedDate: string;
  confidence: number;
  source: string;
};

export type ServerJobPage = {
  rows: ServerJobRecord[];
  total: number;
  visaSignals?: ServerVisaSignal[];
};

function apiConfiguration() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  const apiKey = process.env.API_SECRET_KEY;
  if (!apiUrl || !apiKey) {
    throw new Error('Job data API is not configured');
  }
  return { apiUrl, apiKey };
}

function appendQuery(
  params: URLSearchParams,
  key: string,
  value: string | number | undefined | null,
) {
  if (value !== undefined && value !== null && value !== '') {
    params.set(key, String(value));
  }
}

export async function listServerJobs(
  query: Record<string, string | number | undefined | null>,
): Promise<ServerJobPage> {
  const { apiUrl, apiKey } = apiConfiguration();
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) appendQuery(params, key, value);
  const response = await fetch(`${apiUrl}/job-board/jobs?${params.toString()}`, {
    headers: { 'x-api-key': apiKey },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Unable to load jobs from the job data service');
  const payload = (await response.json()) as {
    rows?: ServerJobRecord[];
    total?: number;
    visaSignals?: ServerVisaSignal[];
  };
  return {
    rows: payload.rows || [],
    total: Number(payload.total || 0),
    visaSignals: payload.visaSignals || [],
  };
}

export type ServerJobFacets = {
  locations: string[];
  companies: string[];
};

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.length > 0)
    : [];
}

/** Every location and company of open verified jobs, for the filter options. */
export async function listServerJobFacets(): Promise<ServerJobFacets> {
  const { apiUrl, apiKey } = apiConfiguration();
  const response = await fetch(`${apiUrl}/job-board/jobs/facets`, {
    headers: { 'x-api-key': apiKey },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Unable to load job filter options from the job data service');
  const payload = (await response.json()) as { locations?: unknown; companies?: unknown };
  return { locations: stringList(payload.locations), companies: stringList(payload.companies) };
}

export async function getServerJob(id: string): Promise<ServerJobRecord | null> {
  const { apiUrl, apiKey } = apiConfiguration();
  const response = await fetch(`${apiUrl}/job-board/jobs/${encodeURIComponent(id)}`, {
    headers: { 'x-api-key': apiKey },
    cache: 'no-store',
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Unable to load job from the job data service');
  return (await response.json()) as ServerJobRecord;
}
