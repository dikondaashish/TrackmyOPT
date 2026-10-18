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

const RETRY_DELAY_MS = 1_000;

/**
 * GET from the job data API, retrying once after a short pause when it
 * answers 5xx or cannot be reached. The API returns 500 for a momentary
 * Oracle connection-pool timeout (NJS-040) while ingestion loads the
 * database; one retry rides that out instead of failing the page.
 */
async function fetchJobApi(path: string): Promise<Response> {
  const { apiUrl, apiKey } = apiConfiguration();
  const request = () =>
    fetch(`${apiUrl}${path}`, {
      headers: { 'x-api-key': apiKey },
      cache: 'no-store',
    });
  try {
    const response = await request();
    if (response.status < 500) return response;
  } catch {
    // Network failure: retried below.
  }
  await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  return request();
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
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) appendQuery(params, key, value);
  const response = await fetchJobApi(`/job-board/jobs?${params.toString()}`);
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

export type ServerPlaceOption = {
  key: string;
  kind: 'state' | 'city' | 'remote';
  label: string;
  count: number;
};

export type ServerJobFacets = {
  locations: string[];
  companies: string[];
  /** US states, cities and remote with open-job counts. */
  places: ServerPlaceOption[];
};

function placeList(value: unknown): ServerPlaceOption[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const { key, kind, label, count } = item as Record<string, unknown>;
    if (typeof key !== 'string' || typeof label !== 'string') return [];
    if (kind !== 'state' && kind !== 'city' && kind !== 'remote') return [];
    return [{ key, kind, label, count: Number(count) || 0 }];
  });
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.length > 0)
    : [];
}

/** Every location and company of open verified jobs, for the filter options. */
export async function listServerJobFacets(): Promise<ServerJobFacets> {
  const response = await fetchJobApi('/job-board/jobs/facets');
  if (!response.ok) throw new Error('Unable to load job filter options from the job data service');
  const payload = (await response.json()) as { locations?: unknown; companies?: unknown; places?: unknown };
  return {
    locations: stringList(payload.locations),
    companies: stringList(payload.companies),
    places: placeList(payload.places),
  };
}

export async function getServerJob(id: string): Promise<ServerJobRecord | null> {
  const response = await fetchJobApi(`/job-board/jobs/${encodeURIComponent(id)}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('Unable to load job from the job data service');
  return (await response.json()) as ServerJobRecord;
}
