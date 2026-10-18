import { WEBSITE_URL } from '../shared/config';
import {
  REMOTE_CONFIG_MAX_BYTES,
  normalizeEffectiveConfig,
  resolveEffectiveConfig,
  validateRemoteConfig,
  type EffectiveExtensionConfig,
  type RemoteConfigV1,
} from '../platform-config/remote-config';
import { BASELINE_CONFIG, baselineEffectiveConfig } from '../platform-config/remote-config-baseline';
import { getExtensionBearerToken } from './background-auth';
import { reportExtensionDiagnostic } from './background-diagnostics';

export const REMOTE_CONFIG_STATE_KEY = 'tmo_remote_config_state_v1';
/** Derived, non-sensitive switches that content scripts read and watch. */
export const EFFECTIVE_CONFIG_KEY = 'tmo_effective_config_v1';
export const REMOTE_CONFIG_ALARM = 'tmo-remote-config-refresh';
export const REMOTE_CONFIG_ALARM_PERIOD_MINUTES = 60;

const SUCCESS_INTERVAL_MS = 55 * 60 * 1000;
const FIRST_RETRY_MS = 5 * 60 * 1000;
const MAX_RETRY_MS = 6 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 10_000;

/** Last-known-good config plus refresh bookkeeping. Never holds secrets. */
export interface RemoteConfigState {
  config: RemoteConfigV1 | null;
  etag: string | null;
  receivedAt: string | null;
  lastCheckedAt: string | null;
  failures: number;
  nextAttemptAt: number;
}

const EMPTY_STATE: RemoteConfigState = {
  config: null, etag: null, receivedAt: null, lastCheckedAt: null, failures: 0, nextAttemptAt: 0,
};

export interface RemoteConfigDeps {
  read: () => Promise<RemoteConfigState | undefined>;
  write: (state: RemoteConfigState, effective: EffectiveExtensionConfig) => Promise<void>;
  fetch: (headers: Record<string, string>, signal: AbortSignal) => Promise<Response>;
  bearer: (forceRefresh?: boolean) => Promise<string | null>;
  now: () => number;
  version: () => string;
  random: () => number;
  report: typeof reportExtensionDiagnostic;
}

export type RefreshOutcome =
  | 'updated' | 'not_modified' | 'no_remote_config' | 'skipped_backoff'
  | 'signed_out' | 'rejected_invalid' | 'failed';

function normalizeState(value: RemoteConfigState | undefined): RemoteConfigState {
  if (!value || typeof value !== 'object') return { ...EMPTY_STATE };
  const config = value.config ? validateRemoteConfig(value.config) : null;
  return {
    config: config?.ok ? config.config : null,
    etag: typeof value.etag === 'string' ? value.etag.slice(0, 200) : null,
    receivedAt: typeof value.receivedAt === 'string' ? value.receivedAt : null,
    lastCheckedAt: typeof value.lastCheckedAt === 'string' ? value.lastCheckedAt : null,
    failures: Number.isInteger(value.failures) && value.failures >= 0 ? Math.min(value.failures, 20) : 0,
    nextAttemptAt: Number.isFinite(value.nextAttemptAt) ? value.nextAttemptAt : 0,
  };
}

export function retryDelayMs(failures: number, random: () => number): number {
  const base = Math.min(MAX_RETRY_MS, FIRST_RETRY_MS * 2 ** Math.max(0, failures - 1));
  // ±20% jitter so many browsers do not retry in lockstep after an outage.
  return Math.round(base * (0.8 + random() * 0.4));
}

export function createRemoteConfigController(deps: RemoteConfigDeps) {
  const effectiveFor = (state: RemoteConfigState) => resolveEffectiveConfig({
    baseline: BASELINE_CONFIG, stored: state.config, now: deps.now(), extensionVersion: deps.version(),
  });
  const persist = async (state: RemoteConfigState) => {
    const effective = effectiveFor(state);
    await deps.write(state, effective);
    return effective;
  };
  let inFlight: Promise<RefreshOutcome> | null = null;

  /** Recompute without network: expiry depends on the clock. */
  async function recompute(): Promise<EffectiveExtensionConfig> {
    return persist(normalizeState(await deps.read()));
  }

  async function refreshOnce(force: boolean): Promise<RefreshOutcome> {
    const state = normalizeState(await deps.read());
    const now = deps.now();
    if (!force && now < state.nextAttemptAt) { await persist(state); return 'skipped_backoff'; }
    const fail = async (outcome: RefreshOutcome, stage: 'network' | 'http' | 'json' | 'validation', status?: number) => {
      const failures = state.failures + 1;
      await persist({ ...state, failures, lastCheckedAt: new Date(now).toISOString(),
        nextAttemptAt: now + retryDelayMs(failures, deps.random) });
      void deps.report({ code: outcome === 'rejected_invalid' ? 'remote_config_invalid' : 'remote_config_fetch_failed', stage, status });
      return outcome;
    };
    let bearer = await deps.bearer();
    if (!bearer) {
      await persist({ ...state, nextAttemptAt: now + SUCCESS_INTERVAL_MS });
      return 'signed_out';
    }
    let response: Response;
    try {
      const request = async (token: string) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
        try {
          return await deps.fetch({
            Authorization: `Bearer ${token}`,
            ...(state.config && state.etag ? { 'If-None-Match': state.etag } : {}),
          }, controller.signal);
        } finally { clearTimeout(timer); }
      };
      response = await request(bearer);
      if (response.status === 401) {
        bearer = await deps.bearer(true);
        if (!bearer) { await persist({ ...state, nextAttemptAt: now + SUCCESS_INTERVAL_MS }); return 'signed_out'; }
        response = await request(bearer);
      }
    } catch {
      return fail('failed', 'network');
    }
    const checked = { ...state, failures: 0, lastCheckedAt: new Date(now).toISOString(), nextAttemptAt: now + SUCCESS_INTERVAL_MS };
    if (response.status === 401) { await persist({ ...state, nextAttemptAt: now + SUCCESS_INTERVAL_MS }); return 'signed_out'; }
    if (response.status === 304) { await persist(checked); return 'not_modified'; }
    // No active server config: keep the last-known-good one. Only a newer valid
    // config can lift an emergency switch; absence never silently re-enables.
    if (response.status === 204) { await persist(checked); return 'no_remote_config'; }
    if (!response.ok) return fail('failed', 'http', response.status);
    let text: string;
    try { text = await response.text(); } catch { return fail('failed', 'network'); }
    const bytes = new TextEncoder().encode(text).length;
    if (bytes > REMOTE_CONFIG_MAX_BYTES + 512) return fail('rejected_invalid', 'validation');
    let body: unknown;
    try { body = JSON.parse(text); } catch { return fail('rejected_invalid', 'json'); }
    const candidate = body && typeof body === 'object' ? (body as { config?: unknown }).config : undefined;
    const validation = validateRemoteConfig(candidate);
    if (!validation.ok) return fail('rejected_invalid', 'validation');
    await persist({
      ...checked,
      config: validation.config,
      etag: response.headers.get('ETag')?.slice(0, 200) ?? null,
      receivedAt: new Date(now).toISOString(),
    });
    return 'updated';
  }

  return {
    recompute,
    /** Coalesces concurrent alarm/startup refreshes into one request. */
    refresh(options: { force?: boolean } = {}): Promise<RefreshOutcome> {
      inFlight ??= refreshOnce(options.force === true).finally(() => { inFlight = null; });
      return inFlight;
    },
  };
}

export function createChromeRemoteConfigController() {
  return createRemoteConfigController({
    read: async () => (await chrome.storage.local.get(REMOTE_CONFIG_STATE_KEY))[REMOTE_CONFIG_STATE_KEY],
    write: (state, effective) => chrome.storage.local.set({
      [REMOTE_CONFIG_STATE_KEY]: state,
      [EFFECTIVE_CONFIG_KEY]: effective,
    }),
    fetch: (headers, signal) => fetch(`${WEBSITE_URL}/api/extension/config`, {
      method: 'GET', headers, signal, cache: 'no-store',
    }),
    bearer: forceRefresh => getExtensionBearerToken(forceRefresh === true).catch(() => null),
    now: () => Date.now(),
    version: () => chrome.runtime.getManifest().version,
    random: () => Math.random(),
    report: reportExtensionDiagnostic,
  });
}

/** Alarms may not survive every restart path; re-create on each worker start. */
export async function ensureRemoteConfigAlarm(): Promise<void> {
  if (!chrome.alarms) return;
  const existing = await chrome.alarms.get(REMOTE_CONFIG_ALARM).catch(() => undefined);
  if (!existing) {
    await chrome.alarms.create(REMOTE_CONFIG_ALARM, {
      delayInMinutes: 1, periodInMinutes: REMOTE_CONFIG_ALARM_PERIOD_MINUTES,
    });
  }
}

/** The worker's view of the derived config, for enforcing switches at message boundaries. */
export async function readEffectiveConfigInWorker(): Promise<EffectiveExtensionConfig> {
  try {
    const stored = (await chrome.storage.local.get(EFFECTIVE_CONFIG_KEY))[EFFECTIVE_CONFIG_KEY];
    return normalizeEffectiveConfig(stored, baselineEffectiveConfig());
  } catch {
    return baselineEffectiveConfig();
  }
}
