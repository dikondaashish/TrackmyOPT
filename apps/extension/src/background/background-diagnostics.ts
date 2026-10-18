import { WEBSITE_URL } from '../shared/config';
import {
  normalizeDiagnosticSignal,
  type DiagnosticCode,
  type DiagnosticSignal,
  type DiagnosticStage,
} from '../shared/diagnostics-protocol';
import type { PlatformId } from '../platform-config/remote-config';
import { getExtensionBearerToken } from './background-auth';

/** One report per code/stage/platform per hour keeps quota use predictable. */
const REPORT_INTERVAL_MS = 60 * 60 * 1000;
const lastReported = new Map<string, number>();

export interface DiagnosticTransport {
  post: (signal: DiagnosticSignal, bearer: string | null) => Promise<void>;
  bearer: () => Promise<string | null>;
  now: () => number;
  version: () => string;
}

const defaultTransport: DiagnosticTransport = {
  post: async (signal, bearer) => {
    await fetch(`${WEBSITE_URL}/api/extension/diagnostic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}) },
      body: JSON.stringify(signal),
    });
  },
  bearer: () => getExtensionBearerToken().catch(() => null),
  now: () => Date.now(),
  version: () => chrome.runtime.getManifest().version,
};

/** Report a sanitized unexpected failure. Never throws and never blocks UI. */
export async function reportExtensionDiagnostic(
  input: { code: DiagnosticCode; stage: DiagnosticStage; platform?: PlatformId; status?: number },
  transport: DiagnosticTransport = defaultTransport,
): Promise<boolean> {
  try {
    const signal = normalizeDiagnosticSignal({ ...input, extensionVersion: transport.version() });
    if (!signal) return false;
    const key = `${signal.code}:${signal.stage}:${signal.platform ?? ''}`;
    const now = transport.now();
    if (now - (lastReported.get(key) ?? -Infinity) < REPORT_INTERVAL_MS) return false;
    lastReported.set(key, now);
    await transport.post(signal, await transport.bearer());
    return true;
  } catch {
    return false;
  }
}

export function resetDiagnosticThrottleForTests(): void {
  lastReported.clear();
}
