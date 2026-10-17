/**
 * Application-submission lifecycle shared by the page-context monitor, the
 * isolated content script, the background worker, and the web API.
 *
 * Trust model: events from the page context are untrusted signals. A page can
 * read and forge them, so the isolated world re-validates every field, and the
 * background binds an attempt to the tab, frame, page, signed-in user and job
 * it recorded itself. A network verdict is client-observed evidence about the
 * site's own response, never authenticated proof.
 *
 * Pure module (no chrome.* or DOM globals) shared with apps/web.
 */
import { PLATFORM_IDS, type PlatformId } from '../platform-config/remote-config';

export const SUBMISSION_PROTOCOL_VERSION = 1 as const;

/** CustomEvent names on window between the isolated and page worlds. */
export const SUBMISSION_PAGE_EVENTS = {
  arm: 'tmo:submission-monitor-arm',
  disarm: 'tmo:submission-monitor-disarm',
  result: 'tmo:submission-monitor-result',
} as const;

/** Network monitoring for one attempt ends after this long. */
export const NETWORK_ARM_TTL_MS = 5 * 60 * 1000;
/** A trusted submit activation must precede the arm request by at most this. */
export const ARM_ACTIVATION_WINDOW_MS = 1500;
/** Confirmation-page evidence is accepted for this long after the click. */
export const ATTEMPT_TTL_MS = 15 * 60 * 1000;
/** Response inspection bounds. */
export const RESPONSE_MAX_BYTES = 64 * 1024;
export const RESPONSE_READ_TIMEOUT_MS = 2000;

export type SubmissionStatus = 'pending' | 'confirmed' | 'failed' | 'not_confirmed';
/** User-facing outcome names: confirmed / failed / not confirmed. */
export const SUBMISSION_STATUS_COPY: Record<SubmissionStatus | 'sync_pending', string> = {
  pending: 'Checking whether your application was submitted…',
  confirmed: 'Submission confirmed',
  failed: 'Submission failed — the site reported a problem. Check the application before trying again.',
  not_confirmed: 'Submission not confirmed. If you submitted it, confirm below so your tracker stays accurate.',
  sync_pending: 'Application submitted; tracker sync pending',
};

export const EVIDENCE_KINDS = ['network', 'page', 'manual'] as const;
export type EvidenceKind = (typeof EVIDENCE_KINDS)[number];

export const NETWORK_VERDICTS = [
  'success',
  'application_error',
  'http_error',
  'redirected',
  'unexpected_status',
  'malformed',
  'unreadable',
  'oversize',
  'timeout',
  'network_error',
] as const;
export type NetworkVerdict = (typeof NETWORK_VERDICTS)[number];

/** Only explicit success or explicit failure evidence changes the outcome. */
export function verdictOutcome(verdict: NetworkVerdict): 'confirmed' | 'failed' | 'inconclusive' {
  if (verdict === 'success') return 'confirmed';
  if (verdict === 'application_error' || verdict === 'http_error') return 'failed';
  return 'inconclusive';
}

export const NETWORK_DETECTORS = ['workday_network'] as const;
export type NetworkDetectorId = (typeof NETWORK_DETECTORS)[number];

const ATTEMPT_ID_RE = /^[A-Za-z0-9_-]{16,64}$/;
export function isAttemptId(value: unknown): value is string {
  return typeof value === 'string' && ATTEMPT_ID_RE.test(value);
}

export interface MonitorArmDetail {
  protocol: typeof SUBMISSION_PROTOCOL_VERSION;
  detector: NetworkDetectorId;
  attemptId: string;
  pageUrl: string;
  armedAt: number;
}

export interface MonitorResultDetail {
  protocol: typeof SUBMISSION_PROTOCOL_VERSION;
  detector: NetworkDetectorId;
  attemptId: string;
  verdict: NetworkVerdict;
  /** HTTP status, or 0 when no response was received. */
  status: number;
  requestStartedAt: number;
  observedAt: number;
}

function parseDetail(raw: unknown, maxLength = 2000): Record<string, unknown> | null {
  if (typeof raw !== 'string' || raw.length > maxLength) return null;
  try {
    const value = JSON.parse(raw);
    return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
  } catch { return null; }
}

function exactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const present = Object.keys(value);
  return present.length === keys.length && present.every(key => keys.includes(key));
}

export function parseMonitorArmDetail(raw: unknown): MonitorArmDetail | null {
  const value = parseDetail(raw);
  if (!value || !exactKeys(value, ['protocol', 'detector', 'attemptId', 'pageUrl', 'armedAt'])) return null;
  if (value.protocol !== SUBMISSION_PROTOCOL_VERSION) return null;
  if (!NETWORK_DETECTORS.includes(value.detector as NetworkDetectorId)) return null;
  if (!isAttemptId(value.attemptId)) return null;
  if (typeof value.pageUrl !== 'string' || value.pageUrl.length > 2048 || !value.pageUrl.startsWith('https://')) return null;
  if (typeof value.armedAt !== 'number' || !Number.isFinite(value.armedAt)) return null;
  return value as unknown as MonitorArmDetail;
}

export function parseMonitorResultDetail(raw: unknown): MonitorResultDetail | null {
  const value = parseDetail(raw);
  if (!value || !exactKeys(value, ['protocol', 'detector', 'attemptId', 'verdict', 'status', 'requestStartedAt', 'observedAt'])) return null;
  if (value.protocol !== SUBMISSION_PROTOCOL_VERSION) return null;
  if (!NETWORK_DETECTORS.includes(value.detector as NetworkDetectorId)) return null;
  if (!isAttemptId(value.attemptId)) return null;
  if (!NETWORK_VERDICTS.includes(value.verdict as NetworkVerdict)) return null;
  if (!Number.isInteger(value.status) || (value.status as number) < 0 || (value.status as number) > 599) return null;
  for (const key of ['requestStartedAt', 'observedAt'] as const) {
    if (typeof value[key] !== 'number' || !Number.isFinite(value[key])) return null;
  }
  if ((value.observedAt as number) < (value.requestStartedAt as number)) return null;
  return value as unknown as MonitorResultDetail;
}

/** Minimal job identity kept with an attempt. No description or salary. */
export interface SubmissionJobSnapshot {
  company_name: string;
  role_title: string;
  job_url: string;
  location?: string;
}

export function normalizeSubmissionJob(value: unknown): SubmissionJobSnapshot | null {
  if (!value || typeof value !== 'object') return null;
  const input = value as Record<string, unknown>;
  const text = (raw: unknown, max: number) => typeof raw === 'string' ? raw.replace(/\s+/g, ' ').trim().slice(0, max) : '';
  const company = text(input.company_name, 300);
  const role = text(input.role_title, 300);
  const jobUrl = text(input.job_url, 2048);
  if (!company || !role || !/^https:\/\//.test(jobUrl)) return null;
  const location = text(input.location, 500);
  return { company_name: company, role_title: role, job_url: jobUrl, ...(location ? { location } : {}) };
}

/** Evidence metadata stored with a tracker update. Never a response body. */
export interface SubmissionEvidence {
  kind: EvidenceKind;
  platform: PlatformId;
  detector: NetworkDetectorId | 'page_confirmation' | 'manual';
  verdict?: NetworkVerdict;
  status?: number;
  ruleVersion: string;
}

export function normalizeSubmissionEvidence(value: unknown): SubmissionEvidence | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const allowed = ['kind', 'platform', 'detector', 'verdict', 'status', 'ruleVersion'];
  if (Object.keys(input).some(key => !allowed.includes(key))) return null;
  if (!EVIDENCE_KINDS.includes(input.kind as EvidenceKind)) return null;
  if (!PLATFORM_IDS.includes(input.platform as PlatformId)) return null;
  const detectors = [...NETWORK_DETECTORS, 'page_confirmation', 'manual'];
  if (!detectors.includes(input.detector as string)) return null;
  if (input.kind === 'network' && !NETWORK_DETECTORS.includes(input.detector as NetworkDetectorId)) return null;
  if (input.kind === 'page' && input.detector !== 'page_confirmation') return null;
  if (input.kind === 'manual' && input.detector !== 'manual') return null;
  if (input.verdict !== undefined && !NETWORK_VERDICTS.includes(input.verdict as NetworkVerdict)) return null;
  if (input.status !== undefined && (!Number.isInteger(input.status) || (input.status as number) < 0 || (input.status as number) > 599)) return null;
  if (typeof input.ruleVersion !== 'string' || !/^[A-Za-z0-9._-]{1,40}$/.test(input.ruleVersion)) return null;
  return input as unknown as SubmissionEvidence;
}

export type ConfirmationSource = 'automatic' | 'manual';

/** Idempotent tracker update; attemptId is the idempotency key. */
export interface SubmissionTrackerUpdate {
  attempt_id: string;
  confirmation: ConfirmationSource;
  confirmed_at: string;
  evidence: SubmissionEvidence;
  job: SubmissionJobSnapshot;
  /** Optional tracker row the client believes matches; the server verifies ownership. */
  application_id?: string;
}
