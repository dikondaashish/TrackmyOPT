/**
 * Content-free diagnostic signals for unexpected extension failures. The
 * extension has no Sentry SDK; the web API turns these into Sentry events
 * (docs/ops/SENTRY.md). Only closed enums and small integers cross this
 * boundary: never URLs, field labels or values, applicant data, tokens,
 * documents, or response bodies.
 *
 * Pure module shared with apps/web.
 */
import { PLATFORM_IDS, type PlatformId } from '../platform-config/remote-config';

export const DIAGNOSTIC_CODES = [
  'remote_config_fetch_failed',
  'remote_config_invalid',
  'submission_monitor_error',
  'submission_result_rejected',
  'tracker_sync_failed',
  'tracker_sync_abandoned',
  'verified_answer_save_failed',
  'review_panel_error',
  'prefill_runtime_error',
] as const;
export type DiagnosticCode = (typeof DIAGNOSTIC_CODES)[number];

export const DIAGNOSTIC_STAGES = ['network', 'http', 'json', 'payload', 'processing', 'storage', 'validation'] as const;
export type DiagnosticStage = (typeof DIAGNOSTIC_STAGES)[number];

export interface DiagnosticSignal {
  code: DiagnosticCode;
  stage: DiagnosticStage;
  platform?: PlatformId;
  /** HTTP status or small count; never an identifier. */
  status?: number;
  extensionVersion: string;
}

export function normalizeDiagnosticSignal(value: unknown): DiagnosticSignal | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const allowed = ['code', 'stage', 'platform', 'status', 'extensionVersion'];
  if (Object.keys(input).some(key => !allowed.includes(key))) return null;
  if (!DIAGNOSTIC_CODES.includes(input.code as DiagnosticCode)) return null;
  if (!DIAGNOSTIC_STAGES.includes(input.stage as DiagnosticStage)) return null;
  if (input.platform !== undefined && !PLATFORM_IDS.includes(input.platform as PlatformId)) return null;
  if (input.status !== undefined &&
      (!Number.isInteger(input.status) || (input.status as number) < 0 || (input.status as number) > 999)) return null;
  if (typeof input.extensionVersion !== 'string' || !/^\d{1,4}\.\d{1,4}\.\d{1,4}$/.test(input.extensionVersion)) return null;
  return {
    code: input.code as DiagnosticCode,
    stage: input.stage as DiagnosticStage,
    ...(input.platform ? { platform: input.platform as PlatformId } : {}),
    ...(input.status !== undefined ? { status: input.status as number } : {}),
    extensionVersion: input.extensionVersion,
  };
}

/** Fixed message shape used by docs/ops/SENTRY.md: no variable free text. */
export function diagnosticMessage(signal: DiagnosticSignal): string {
  return `Extension ${signal.code} (stage=${signal.stage}` +
    `${signal.platform ? `, platform=${signal.platform}` : ''}` +
    `${signal.status !== undefined ? `, status=${signal.status}` : ''}, version=${signal.extensionVersion})`;
}
