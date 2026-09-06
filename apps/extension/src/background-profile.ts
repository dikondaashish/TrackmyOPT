import { API_ENDPOINTS, WEBSITE_URL } from './config';
import { isJobFitLimitResponse, normalizeJobFitAnalysis } from './job-fit';
import { normalizeOptClockNudge, type OptClockNudge } from './smart-flow';
import {
  WIDGET_ANALYTICS_EVENTS,
  normalizeWidgetAnalyticsProperties,
  type WidgetAnalyticsEvent,
} from './widget-platform';
import type {
  BasicContactProfile,
  V1PrefillPayloadRequest,
  V1PrefillPayloadResponse,
} from './resume-autofill-contract';
import { resolveV1PrefillPayload } from './prefill-payload-resolver';
import {
  normalizeSavedPrivateApplicationAnswers,
  type SavedPrivateApplicationAnswers,
} from './sensitive-autofill';
import {
  filterPrivateAnswersForSenderUrl,
  hostnameFromSenderTabUrl,
} from './private-application-delivery';
import { base64ToUint8Array } from './resume-file-upload';
import { getExtensionBearerToken } from './background-auth';
import {
  cacheCurrentGeneratedResumeArtifact,
  clearCurrentGeneratedResumeArtifact,
  fetchStoredArtifactForJob,
  readCurrentGeneratedResumeArtifact,
} from './background-resume-artifact';

export interface AutofillProfile {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  // application_profile fields (non-sensitive). Empty string when unset.
  phone: string;
  country: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  countyDistrict: string;
  yearsExperience: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
}

export interface AutofillProfileResult {
  ok: boolean;
  error?: string;
  profile?: AutofillProfile;
}

export interface PrivateApplicationAnswersResult {
  ok: boolean;
  error?: string;
  data?: SavedPrivateApplicationAnswers | null;
}

export function sanitizeBasicContactProfile(value: unknown): BasicContactProfile | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const profile = value as Record<string, unknown>;
  const read = (key: keyof BasicContactProfile): string => {
    const field = profile[key];
    return typeof field === 'string' ? field.trim().slice(0, 500) : '';
  };
  return {
    firstName: read('firstName'),
    lastName: read('lastName'),
    fullName: read('fullName'),
    email: read('email'),
    phone: read('phone'),
    country: read('country'),
    streetAddress: read('streetAddress'),
    city: read('city'),
    state: read('state'),
    postalCode: read('postalCode'),
    countyDistrict: read('countyDistrict'),
    yearsExperience: read('yearsExperience'),
    linkedinUrl: read('linkedinUrl'),
    githubUrl: read('githubUrl'),
    portfolioUrl: read('portfolioUrl'),
  };
}

export async function resolveCurrentV1PrefillPayload(
  request: V1PrefillPayloadRequest,
  options?: { discardRejectedArtifact?: boolean }
): Promise<V1PrefillPayloadResponse> {
  const fetchProfileFallback = async () => {
    const result = await getAutofillProfile();
    return {
      ok: result.ok,
      error: result.error,
      profile: result.profile as BasicContactProfile | undefined,
    };
  };

  const artifact = await readCurrentGeneratedResumeArtifact();
  const response = await resolveV1PrefillPayload({
    artifact,
    request,
    discardRejectedArtifact: options?.discardRejectedArtifact,
    onArtifactRejected: clearCurrentGeneratedResumeArtifact,
    fetchProfileFallback,
  });

  // Nothing in this session covers the page. The user may still have tailored a
  // resume for this posting earlier — hours ago, or on another device — so ask
  // storage before falling back to profile-only prefill.
  if (
    response.ok &&
    response.source === 'profile_only' &&
    response.reason !== 'feature_disabled'
  ) {
    const stored = await fetchStoredArtifactForJob(request.jobContext.jobUrl);
    if (stored) {
      const restored = await resolveV1PrefillPayload({
        artifact: stored,
        request,
        discardRejectedArtifact: false,
        fetchProfileFallback,
      });
      if (restored.ok && restored.source === 'generated_resume') {
        await cacheCurrentGeneratedResumeArtifact(stored, {
          persist: false,
          notifyTabs: false,
        });
        return restored;
      }
    }
  }

  return response;
}

export async function getAutofillProfile(): Promise<AutofillProfileResult> {
  const bearer = await getExtensionBearerToken();
  if (!bearer) return { ok: false, error: 'not_signed_in' };

  const res = await fetch(API_ENDPOINTS.ME, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${bearer}` },
  });
  if (!res.ok) return { ok: false, error: 'fetch_failed' };

  const data = (await res.json()) as {
    user?: { email?: string; user_metadata?: Record<string, unknown> };
    profile?: { first_name?: string; last_name?: string; email?: string };
    applicationProfile?: {
      first_name?: string | null;
      last_name?: string | null;
      application_email?: string | null;
      phone?: string | null;
      country?: string | null;
      street_address?: string | null;
      city?: string | null;
      state?: string | null;
      zip_code?: string | null;
      county_district?: string | null;
      years_experience?: number | null;
      linkedin_url?: string | null;
      github_url?: string | null;
      portfolio_url?: string | null;
    } | null;
  };
  const user = data.user ?? {};
  const profile = data.profile ?? {};
  const ap = data.applicationProfile ?? {};
  const meta = (user.user_metadata ?? {}) as {
    firstName?: string;
    first_name?: string;
    full_name?: string;
  };

  const fullNameMeta = (meta.full_name ?? '').trim();
  const firstName = (ap.first_name || profile.first_name || meta.firstName || meta.first_name || fullNameMeta.split(/\s+/)[0] || '').trim();
  const lastName = (ap.last_name || profile.last_name || fullNameMeta.split(/\s+/).slice(1).join(' ') || '').trim();
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || fullNameMeta;
  const email = (ap.application_email || user.email || profile.email || '').trim();

  return {
    ok: true,
    profile: {
      firstName,
      lastName,
      fullName,
      email,
      phone: (ap.phone ?? '').trim(),
      country: (ap.country ?? '').trim(),
      streetAddress: (ap.street_address ?? '').trim(),
      city: (ap.city ?? '').trim(),
      state: (ap.state ?? '').trim(),
      postalCode: (ap.zip_code ?? '').trim(),
      countyDistrict: (ap.county_district ?? '').trim(),
      yearsExperience: ap.years_experience != null ? String(ap.years_experience) : '',
      linkedinUrl: (ap.linkedin_url ?? '').trim(),
      githubUrl: (ap.github_url ?? '').trim(),
      portfolioUrl: (ap.portfolio_url ?? '').trim(),
    },
  };
}

export async function getPrivateApplicationAnswers(
  senderTabUrl: unknown
): Promise<PrivateApplicationAnswersResult> {
  if (!hostnameFromSenderTabUrl(senderTabUrl)) {
    return { ok: false, error: 'unavailable' };
  }
  const bearer = await getExtensionBearerToken();
  if (!bearer) return { ok: false, error: 'not_signed_in' };

  const response = await fetch(API_ENDPOINTS.PRIVATE_APPLICATION_ANSWERS, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearer}`,
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    return {
      ok: false,
      error: response.status === 401 ? 'not_signed_in' : 'unavailable',
    };
  }

  const body = (await response.json()) as { data?: unknown };
  const normalized = body.data
    ? normalizeSavedPrivateApplicationAnswers(body.data)
    : null;
  return {
    ok: true,
    data: filterPrivateAnswersForSenderUrl(normalized, senderTabUrl),
  };
}

export interface SavedResumeOption {
  id: string;
  filename: string;
  updatedAt?: string | null;
}

export interface AnalyzeJobFitResult {
  ok: boolean;
  error?: string;
  matchScore?: number;
  matchedKeywords?: string[];
  missingKeywords?: string[];
  gapSummary?: string;
  resumeName?: string;
}

const OPT_CLOCK_NUDGE_CACHE_KEY = 'tmo_opt_clock_nudge_daily_v1';

export async function getOptClockNudge(): Promise<{ ok: boolean; error?: string; nudge?: OptClockNudge }> {
  const day = new Date().toISOString().slice(0, 10);
  try {
    const cached = await chrome.storage.session.get(OPT_CLOCK_NUDGE_CACHE_KEY);
    const entry = cached[OPT_CLOCK_NUDGE_CACHE_KEY] as { day?: string; nudge?: unknown } | undefined;
    if (entry?.day === day) {
      const nudge = normalizeOptClockNudge(entry.nudge);
      return { ok: true, ...(nudge ? { nudge } : {}) };
    }
  } catch {
    // Cache failure is non-fatal; fetch current data below.
  }

  let bearer = await getExtensionBearerToken();
  if (!bearer) return { ok: false, error: 'not_signed_in' };
  const request = (token: string) => fetch(`${WEBSITE_URL}/api/opt/calculator`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });
  let response = await request(bearer);
  if (response.status === 401) {
    const refreshed = await getExtensionBearerToken(true);
    if (refreshed) {
      bearer = refreshed;
      response = await request(bearer);
    }
  }
  if (!response.ok) return { ok: false, error: response.status === 401 ? 'not_signed_in' : 'load_failed' };
  const payload = await response.json().catch(() => null) as {
    ok?: boolean;
    data?: { unemployment_clock?: unknown } | null;
  } | null;
  const nudge = normalizeOptClockNudge(payload?.ok ? payload.data?.unemployment_clock : null);
  try {
    await chrome.storage.session.set({
      [OPT_CLOCK_NUDGE_CACHE_KEY]: { day, nudge },
    });
  } catch {
    // The nudge is still usable for this render even if caching is unavailable.
  }
  return { ok: true, ...(nudge ? { nudge } : {}) };
}

/**
 * Run the ATS gap analysis for this posting against the user's base resume.
 * Reuses the resume-generator base-resume + analyze-gap routes (already live).
 */
export async function analyzeJobFit(input: { jobDescription: string }): Promise<AnalyzeJobFitResult> {
  const bearer = await getExtensionBearerToken();
  if (!bearer) return { ok: false, error: 'not_signed_in' };
  const jd = (input.jobDescription || '').trim();
  if (jd.length < 200) return { ok: false, error: 'no_job_description' };
  const auth = { 'Content-Type': 'application/json', Authorization: `Bearer ${bearer}` };

  // Pick the user's most recent base resume.
  const list = await listSavedResumes();
  if (!list.ok) return { ok: false, error: 'base_failed' };
  const first = list.resumes && list.resumes[0];
  if (!first) return { ok: false, error: 'no_base_resume' };

  const baseUrl = new URL(`${WEBSITE_URL}/api/resume-generator/base-resume`);
  if (first.id && first.id !== '__latest__') baseUrl.searchParams.set('resumeId', first.id);
  const baseRes = await fetch(baseUrl.toString(), { method: 'GET', headers: auth });
  if (baseRes.status === 404) return { ok: false, error: 'no_base_resume' };
  if (!baseRes.ok) return { ok: false, error: 'base_failed' };
  const base = (await baseRes.json()) as { content?: string; filename?: string };
  if (!base.content || !base.content.trim()) return { ok: false, error: 'no_base_resume' };

  const anRes = await fetch(`${WEBSITE_URL}/api/resume-generator/analyze-gap`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({ resumeText: base.content, jobDescription: jd }),
  });
  const data = await anRes.json().catch(() => ({})) as { code?: string };
  if (anRes.status === 401) return { ok: false, error: 'not_signed_in' };
  if (isJobFitLimitResponse(anRes.status, data.code)) return { ok: false, error: 'limit_reached' };
  if (!anRes.ok) return { ok: false, error: 'analyze_failed' };
  const normalized = normalizeJobFitAnalysis(data);
  return {
    ok: true,
    ...normalized,
    resumeName: base.filename || 'your saved resume',
  };
}

export async function listSavedResumes(): Promise<{
  ok: boolean;
  error?: string;
  resumes?: SavedResumeOption[];
  accountEmail?: string;
}> {
  const bearer = await getExtensionBearerToken();
  if (!bearer) return { ok: false, error: 'not_signed_in' };

  const response = await fetch(`${WEBSITE_URL}/api/resume-generator/base-resume?mode=list`, {
    headers: { Authorization: `Bearer ${bearer}` },
  });
  if (!response.ok) return { ok: false, error: 'load_failed' };
  const data = (await response.json()) as {
    resumes?: SavedResumeOption[];
    id?: string;
    filename?: string;
    content?: string;
  };

  if (Array.isArray(data.resumes)) {
    if (data.resumes.length > 0) return { ok: true, resumes: data.resumes };
    const profile = await getAutofillProfile().catch(() => null);
    return {
      ok: true,
      resumes: [],
      accountEmail: profile?.profile?.email || undefined,
    };
  }

  // Backward compatibility while the production web app still serves the
  // previous single-resume response. Without this, a valid saved resume was
  // incorrectly interpreted as an empty list by the newly built extension.
  if (data.content?.trim()) {
    return {
      ok: true,
      resumes: [{
        id: data.id || '__latest__',
        filename: data.filename || 'Most recently saved resume',
        updatedAt: null,
      }],
    };
  }

  const profile = await getAutofillProfile().catch(() => null);
  return {
    ok: true,
    resumes: [],
    accountEmail: profile?.profile?.email || undefined,
  };
}

export interface UploadResumeFileResult {
  success: boolean;
  error?: string;
  message?: string;
  text?: string;
  filename?: string;
  canOcr?: boolean;
}

/**
 * Extracts text from a résumé file (PDF/DOCX/TXT) using the exact same
 * endpoint and backend parsing the website's own upload flow uses — no
 * PDF/DOCX/OCR parsing is duplicated in the extension. The Bearer token never
 * leaves the background script; the panel only ever sees the extracted text.
 *
 * Scanned PDFs with no extractable text come back with canOcr: true. OCR
 * itself (AWS Textract) is not wired up for the extension yet — that path
 * goes through a separate, security-hardened proxy shared with resume
 * save/download that was deliberately left untouched here. The panel tells
 * the user to open the web app or paste the text manually in that case.
 */
export async function uploadResumeFile(input: {
  filename: string;
  fileType: string;
  fileBase64: string;
}): Promise<UploadResumeFileResult> {
  const bearer = await getExtensionBearerToken();
  if (!bearer) return { success: false, error: 'not_signed_in' };

  const bytes = base64ToUint8Array(input.fileBase64);
  const formData = new FormData();
  formData.append(
    'file',
    // `bytes.buffer` is typed ArrayBufferLike, which includes SharedArrayBuffer
    // and is not a BlobPart. base64ToUint8Array always allocates a plain
    // ArrayBuffer, so slicing to an exact ArrayBuffer is accurate, not a cast.
    new Blob([bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer], {
      type: input.fileType || 'application/octet-stream',
    }),
    input.filename || 'resume'
  );

  let response: Response;
  try {
    response = await fetch(`${WEBSITE_URL}/api/resume-generator/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${bearer}` },
      body: formData,
    });
  } catch {
    return { success: false, error: 'network' };
  }

  const data = (await response.json().catch(() => ({}))) as {
    success?: boolean;
    error?: string;
    message?: string;
    text?: string;
    filename?: string;
    can_ocr?: boolean;
  };

  if (data.success && data.text) {
    return { success: true, text: data.text, filename: data.filename };
  }
  return {
    success: false,
    error: data.error || 'upload_failed',
    message: data.message,
    canOcr: data.can_ocr === true,
  };
}

export async function trackWidgetEvent(
  rawEvent: unknown,
  rawProperties: unknown,
): Promise<{ ok: boolean; error?: string }> {
  if (typeof rawEvent !== 'string' || !WIDGET_ANALYTICS_EVENTS.includes(rawEvent as WidgetAnalyticsEvent)) {
    return { ok: false, error: 'invalid_event' };
  }
  const event = rawEvent as WidgetAnalyticsEvent;
  const properties = normalizeWidgetAnalyticsProperties(event, rawProperties);
  let bearer = await getExtensionBearerToken();
  if (!bearer) return { ok: false, error: 'not_signed_in' };

  const postEvent = (token: string) => fetch(`${WEBSITE_URL}/api/extension/widget-event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ event, properties }),
  });
  let response = await postEvent(bearer);
  if (response.status === 401) {
    const refreshed = await getExtensionBearerToken(true);
    if (refreshed) {
      bearer = refreshed;
      response = await postEvent(bearer);
    }
  }
  return response.ok
    ? { ok: true }
    : { ok: false, error: response.status === 401 ? 'not_signed_in' : 'network' };
}
