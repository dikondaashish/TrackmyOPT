/**
 * Server-delivered extension configuration: a strictly validated, versioned
 * DATA document. It can only switch bundled behaviour off, choose a bundled
 * detector mode, or add label phrases for bundled field kinds.
 *
 * Chrome Web Store MV3 policy permits remote feature flags and configuration
 * only "where all logic for the functionality is contained within the
 * extension package", and treats an interpreter for remote commands as remote
 * code. So this schema has no selectors, scripts, expressions, URLs, domains,
 * or free-form copy: every identifier below is a closed, bundled enum, and
 * page matching always uses the bundled host lists.
 *
 * Pure module (no chrome.* or DOM) so the web API validates with the same code.
 */

export const REMOTE_CONFIG_SCHEMA_VERSION = 1 as const;
/** Serialized size ceiling, enforced by the server and the extension. */
export const REMOTE_CONFIG_MAX_BYTES = 32_768;
/** A config can claim validity for at most this long after it was issued. */
export const REMOTE_CONFIG_MAX_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;

export const PLATFORM_IDS = [
  'workday',
  'greenhouse',
  'lever',
  'smartrecruiters',
  'ashby',
  'linkedin',
  'generic',
] as const;
export type PlatformId = (typeof PLATFORM_IDS)[number];

/** Independently disableable capabilities, each enforced in bundled code. */
export const CAPABILITY_IDS = [
  'contact',
  'skills',
  'experience',
  'education',
  'rowCreation',
  'searchableDropdown',
  'resumeUpload',
  'coverLetterUpload',
  'privateAnswers',
  'verifiedAuthorization',
  'screeningDrafts',
  'continuousMode',
  'guidedAutopilot',
] as const;
export type CapabilityId = (typeof CAPABILITY_IDS)[number];

export const DETECTOR_IDS = ['workday_network', 'page_confirmation'] as const;
export type DetectorId = (typeof DETECTOR_IDS)[number];
export const DETECTOR_MODES = ['off', 'shadow', 'active'] as const;
export type DetectorMode = (typeof DETECTOR_MODES)[number];

/** User-facing copy is bundled; the server selects a reason, never text. */
export const KILL_SWITCH_REASONS = ['maintenance', 'site_change', 'incident', 'policy'] as const;
export type KillSwitchReason = (typeof KILL_SWITCH_REASONS)[number];

/** Remote label phrases may target only these non-sensitive profile kinds. */
export const RULE_FIELD_KINDS = [
  'email',
  'phone',
  'firstName',
  'lastName',
  'fullName',
  'country',
  'streetAddress',
  'city',
  'state',
  'postalCode',
  'linkedinUrl',
  'githubUrl',
  'portfolioUrl',
  'yearsExperience',
] as const;
export type RuleFieldKind = (typeof RULE_FIELD_KINDS)[number];

export interface KillSwitch {
  disabled: true;
  reason: KillSwitchReason;
}

export interface PlatformFieldRules {
  labelAliases?: Array<{ kind: RuleFieldKind; phrases: string[] }>;
  ignoreLabels?: string[];
}

export interface RemoteConfigV1 {
  schemaVersion: typeof REMOTE_CONFIG_SCHEMA_VERSION;
  version: string;
  issuedAt: string;
  expiresAt: string;
  minExtensionVersion?: string;
  killSwitches: {
    autofill?: KillSwitch;
    platforms?: Partial<Record<PlatformId, KillSwitch>>;
    capabilities?: Partial<Record<CapabilityId, KillSwitch>>;
    detectors?: Partial<Record<DetectorId, KillSwitch>>;
  };
  detectors?: Partial<Record<DetectorId, { mode: DetectorMode }>>;
  fieldRules?: Partial<Record<PlatformId, PlatformFieldRules>>;
}

export type RemoteConfigValidation =
  | { ok: true; config: RemoteConfigV1 }
  | { ok: false; error: string };

const VERSION_RE = /^\d{4}-\d{2}-\d{2}\.\d{1,3}$/;
const SEMVER_RE = /^\d{1,4}\.\d{1,4}\.\d{1,4}$/;
const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
/** Plain lowercase words: no selector, regex, or markup metacharacters. */
const PHRASE_RE = /^[a-z0-9][a-z0-9 '&/,()-]{0,58}[a-z0-9)]$/;
const MAX_ALIASES_PER_PLATFORM = 30;
const MAX_PHRASES_PER_ALIAS = 20;
const MAX_IGNORED_LABELS = 30;

type Issue = string;

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function rejectUnknownKeys(value: Record<string, unknown>, allowed: readonly string[], path: string, issues: Issue[]): void {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) issues.push(`${path}.${key} is not allowed`);
  }
}

function validateKillSwitch(value: unknown, path: string, issues: Issue[]): KillSwitch | undefined {
  if (!isRecord(value)) { issues.push(`${path} must be an object`); return undefined; }
  rejectUnknownKeys(value, ['disabled', 'reason'], path, issues);
  if (value.disabled !== true) issues.push(`${path}.disabled must be true`);
  if (!KILL_SWITCH_REASONS.includes(value.reason as KillSwitchReason)) issues.push(`${path}.reason is invalid`);
  return { disabled: true, reason: value.reason as KillSwitchReason };
}

function validateSwitchMap<K extends string>(
  value: unknown, keys: readonly K[], path: string, issues: Issue[],
): Partial<Record<K, KillSwitch>> | undefined {
  if (value === undefined) return undefined;
  if (!isRecord(value)) { issues.push(`${path} must be an object`); return undefined; }
  rejectUnknownKeys(value, keys, path, issues);
  const result: Partial<Record<K, KillSwitch>> = {};
  for (const key of keys) {
    if (value[key] !== undefined) result[key] = validateKillSwitch(value[key], `${path}.${key}`, issues);
  }
  return result;
}

function validatePhrases(value: unknown, max: number, path: string, issues: Issue[]): string[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > max) {
    issues.push(`${path} must list 1-${max} phrases`);
    return [];
  }
  const phrases: string[] = [];
  for (const [index, phrase] of value.entries()) {
    if (typeof phrase !== 'string' || !PHRASE_RE.test(phrase)) {
      issues.push(`${path}[${index}] must be 2-60 lowercase plain-text characters`);
    } else phrases.push(phrase);
  }
  if (new Set(phrases).size !== phrases.length) issues.push(`${path} contains duplicates`);
  return phrases;
}

function validateFieldRules(value: unknown, path: string, issues: Issue[]): PlatformFieldRules | undefined {
  if (!isRecord(value)) { issues.push(`${path} must be an object`); return undefined; }
  rejectUnknownKeys(value, ['labelAliases', 'ignoreLabels'], path, issues);
  const rules: PlatformFieldRules = {};
  if (value.labelAliases !== undefined) {
    if (!Array.isArray(value.labelAliases) || value.labelAliases.length > MAX_ALIASES_PER_PLATFORM) {
      issues.push(`${path}.labelAliases must list at most ${MAX_ALIASES_PER_PLATFORM} aliases`);
    } else {
      rules.labelAliases = value.labelAliases.map((alias, index) => {
        const aliasPath = `${path}.labelAliases[${index}]`;
        if (!isRecord(alias)) { issues.push(`${aliasPath} must be an object`); return { kind: 'email', phrases: [] }; }
        rejectUnknownKeys(alias, ['kind', 'phrases'], aliasPath, issues);
        if (!RULE_FIELD_KINDS.includes(alias.kind as RuleFieldKind)) issues.push(`${aliasPath}.kind is not a supported field kind`);
        return { kind: alias.kind as RuleFieldKind, phrases: validatePhrases(alias.phrases, MAX_PHRASES_PER_ALIAS, `${aliasPath}.phrases`, issues) };
      });
    }
  }
  if (value.ignoreLabels !== undefined) {
    rules.ignoreLabels = validatePhrases(value.ignoreLabels, MAX_IGNORED_LABELS, `${path}.ignoreLabels`, issues);
  }
  return rules;
}

/** Validate an untrusted value. Never throws; returns every issue found. */
export function validateRemoteConfig(value: unknown, serializedBytes?: number): RemoteConfigValidation {
  const issues: Issue[] = [];
  let bytes = serializedBytes;
  if (bytes === undefined) {
    try { bytes = new TextEncoder().encode(JSON.stringify(value) ?? '').length; } catch { return { ok: false, error: 'config is not serializable' }; }
  }
  if (bytes > REMOTE_CONFIG_MAX_BYTES) return { ok: false, error: `config exceeds ${REMOTE_CONFIG_MAX_BYTES} bytes` };
  if (!isRecord(value)) return { ok: false, error: 'config must be an object' };
  rejectUnknownKeys(value, ['schemaVersion', 'version', 'issuedAt', 'expiresAt', 'minExtensionVersion', 'killSwitches', 'detectors', 'fieldRules'], 'config', issues);
  if (value.schemaVersion !== REMOTE_CONFIG_SCHEMA_VERSION) issues.push('config.schemaVersion is unsupported');
  if (typeof value.version !== 'string' || !VERSION_RE.test(value.version)) issues.push('config.version must look like YYYY-MM-DD.N');
  const issuedAt = typeof value.issuedAt === 'string' && ISO_RE.test(value.issuedAt) ? Date.parse(value.issuedAt) : NaN;
  const expiresAt = typeof value.expiresAt === 'string' && ISO_RE.test(value.expiresAt) ? Date.parse(value.expiresAt) : NaN;
  if (!Number.isFinite(issuedAt)) issues.push('config.issuedAt must be an ISO UTC timestamp');
  if (!Number.isFinite(expiresAt)) issues.push('config.expiresAt must be an ISO UTC timestamp');
  if (Number.isFinite(issuedAt) && Number.isFinite(expiresAt) &&
      (expiresAt <= issuedAt || expiresAt - issuedAt > REMOTE_CONFIG_MAX_LIFETIME_MS)) {
    issues.push('config.expiresAt must be after issuedAt and within 30 days');
  }
  if (value.minExtensionVersion !== undefined &&
      (typeof value.minExtensionVersion !== 'string' || !SEMVER_RE.test(value.minExtensionVersion))) {
    issues.push('config.minExtensionVersion must be x.y.z');
  }
  const killSwitches: RemoteConfigV1['killSwitches'] = {};
  if (!isRecord(value.killSwitches)) issues.push('config.killSwitches must be an object');
  else {
    rejectUnknownKeys(value.killSwitches, ['autofill', 'platforms', 'capabilities', 'detectors'], 'config.killSwitches', issues);
    if (value.killSwitches.autofill !== undefined) {
      killSwitches.autofill = validateKillSwitch(value.killSwitches.autofill, 'config.killSwitches.autofill', issues);
    }
    killSwitches.platforms = validateSwitchMap(value.killSwitches.platforms, PLATFORM_IDS, 'config.killSwitches.platforms', issues);
    killSwitches.capabilities = validateSwitchMap(value.killSwitches.capabilities, CAPABILITY_IDS, 'config.killSwitches.capabilities', issues);
    killSwitches.detectors = validateSwitchMap(value.killSwitches.detectors, DETECTOR_IDS, 'config.killSwitches.detectors', issues);
  }
  let detectors: RemoteConfigV1['detectors'];
  if (value.detectors !== undefined) {
    if (!isRecord(value.detectors)) issues.push('config.detectors must be an object');
    else {
      rejectUnknownKeys(value.detectors, DETECTOR_IDS, 'config.detectors', issues);
      detectors = {};
      for (const id of DETECTOR_IDS) {
        const entry = value.detectors[id];
        if (entry === undefined) continue;
        if (!isRecord(entry)) { issues.push(`config.detectors.${id} must be an object`); continue; }
        rejectUnknownKeys(entry, ['mode'], `config.detectors.${id}`, issues);
        if (!DETECTOR_MODES.includes(entry.mode as DetectorMode)) issues.push(`config.detectors.${id}.mode is invalid`);
        else detectors[id] = { mode: entry.mode as DetectorMode };
      }
    }
  }
  let fieldRules: RemoteConfigV1['fieldRules'];
  if (value.fieldRules !== undefined) {
    if (!isRecord(value.fieldRules)) issues.push('config.fieldRules must be an object');
    else {
      rejectUnknownKeys(value.fieldRules, PLATFORM_IDS, 'config.fieldRules', issues);
      fieldRules = {};
      for (const id of PLATFORM_IDS) {
        if (value.fieldRules[id] === undefined) continue;
        fieldRules[id] = validateFieldRules(value.fieldRules[id], `config.fieldRules.${id}`, issues);
      }
    }
  }
  if (issues.length) return { ok: false, error: issues.slice(0, 20).join('; ') };
  return {
    ok: true,
    config: {
      schemaVersion: REMOTE_CONFIG_SCHEMA_VERSION,
      version: value.version as string,
      issuedAt: value.issuedAt as string,
      expiresAt: value.expiresAt as string,
      ...(value.minExtensionVersion ? { minExtensionVersion: value.minExtensionVersion as string } : {}),
      killSwitches,
      ...(detectors ? { detectors } : {}),
      ...(fieldRules ? { fieldRules } : {}),
    },
  };
}

export function compareExtensionVersions(left: string, right: string): number {
  const a = left.split('.').map(Number);
  const b = right.split('.').map(Number);
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    const diff = (a[index] || 0) - (b[index] || 0);
    if (diff) return diff > 0 ? 1 : -1;
  }
  return 0;
}

export type ConfigSource = 'baseline' | 'remote' | 'remote_expired' | 'remote_incompatible';

/** What every bundled feature reads. Derived, never accepted from a page. */
export interface EffectiveExtensionConfig {
  version: 1;
  source: ConfigSource;
  /** Identifies which rule set produced a result ("baseline-1" or remote version). */
  ruleVersion: string;
  /** Remote version whose emergency switches are in force, if any. */
  killSwitchVersion: string | null;
  killSwitches: RemoteConfigV1['killSwitches'];
  detectors: Record<DetectorId, DetectorMode>;
  fieldRules: Partial<Record<PlatformId, PlatformFieldRules>>;
  computedAt: string;
}

export interface BaselineConfig {
  ruleVersion: string;
  detectors: Record<DetectorId, DetectorMode>;
  fieldRules: Partial<Record<PlatformId, PlatformFieldRules>>;
}

function mergeFieldRules(
  base: Partial<Record<PlatformId, PlatformFieldRules>>,
  remote: Partial<Record<PlatformId, PlatformFieldRules>> | undefined,
): Partial<Record<PlatformId, PlatformFieldRules>> {
  const merged: Partial<Record<PlatformId, PlatformFieldRules>> = {};
  for (const id of PLATFORM_IDS) {
    const left = base[id]; const right = remote?.[id];
    if (!left && !right) continue;
    merged[id] = {
      labelAliases: [...(left?.labelAliases ?? []), ...(right?.labelAliases ?? [])],
      ignoreLabels: [...new Set([...(left?.ignoreLabels ?? []), ...(right?.ignoreLabels ?? [])])],
    };
  }
  return merged;
}

/**
 * Offline and expiry policy (also documented in docs/ops/EXTENSION_REMOTE_CONFIG.md):
 * - valid, compatible, unexpired remote config → its rules, detectors, switches;
 * - expired → bundled rules and detector modes, but its kill switches STAY in
 *   force: a known emergency disable is never silently re-enabled by time
 *   passing or by the server being unreachable;
 * - requires a newer extension → bundled rules, kill switches still honoured;
 * - no remote config ever received → bundled baseline.
 * Only a newer valid config from the server can clear a kill switch.
 */
export function resolveEffectiveConfig(input: {
  baseline: BaselineConfig;
  stored: RemoteConfigV1 | null;
  now: number;
  extensionVersion: string;
}): EffectiveExtensionConfig {
  const { baseline, stored, now, extensionVersion } = input;
  const computedAt = new Date(now).toISOString();
  if (!stored) {
    return { version: 1, source: 'baseline', ruleVersion: baseline.ruleVersion, killSwitchVersion: null,
      killSwitches: {}, detectors: { ...baseline.detectors }, fieldRules: baseline.fieldRules, computedAt };
  }
  const incompatible = stored.minExtensionVersion !== undefined &&
    compareExtensionVersions(extensionVersion, stored.minExtensionVersion) < 0;
  const expired = Date.parse(stored.expiresAt) <= now;
  const killSwitches = stored.killSwitches;
  if (incompatible || expired) {
    return { version: 1, source: incompatible ? 'remote_incompatible' : 'remote_expired', ruleVersion: baseline.ruleVersion,
      killSwitchVersion: stored.version, killSwitches, detectors: { ...baseline.detectors },
      fieldRules: baseline.fieldRules, computedAt };
  }
  const detectors = { ...baseline.detectors };
  for (const id of DETECTOR_IDS) {
    const mode = stored.detectors?.[id]?.mode;
    if (mode) detectors[id] = mode;
  }
  return { version: 1, source: 'remote', ruleVersion: stored.version, killSwitchVersion: stored.version,
    killSwitches, detectors, fieldRules: mergeFieldRules(baseline.fieldRules, stored.fieldRules), computedAt };
}

export type FeatureBlock =
  | { blocked: false }
  | { blocked: true; scope: 'autofill' | 'platform' | 'capability' | 'detector'; reason: KillSwitchReason };

/** Single decision point used by UI and background enforcement alike. */
export function featureBlock(
  config: Pick<EffectiveExtensionConfig, 'killSwitches'>,
  query: { platform?: PlatformId; capability?: CapabilityId; detector?: DetectorId; autofill?: boolean },
): FeatureBlock {
  const switches = config.killSwitches;
  if (query.autofill !== false && (query.capability || query.platform || query.autofill) && switches.autofill) {
    return { blocked: true, scope: 'autofill', reason: switches.autofill.reason };
  }
  if (query.platform && switches.platforms?.[query.platform]) {
    return { blocked: true, scope: 'platform', reason: switches.platforms[query.platform]!.reason };
  }
  if (query.capability && switches.capabilities?.[query.capability]) {
    return { blocked: true, scope: 'capability', reason: switches.capabilities[query.capability]!.reason };
  }
  if (query.detector && switches.detectors?.[query.detector]) {
    return { blocked: true, scope: 'detector', reason: switches.detectors[query.detector]!.reason };
  }
  return { blocked: false };
}

/** Effective detector mode after kill switches; a killed detector is off. */
export function detectorMode(config: EffectiveExtensionConfig, detector: DetectorId): DetectorMode {
  return featureBlock(config, { detector, autofill: false }).blocked ? 'off' : config.detectors[detector];
}

/** Brief, bundled explanations. Manual completion is always still possible. */
export const KILL_SWITCH_COPY: Record<KillSwitchReason, string> = {
  maintenance: 'TrackMyOPT paused this feature for maintenance. You can still complete the application yourself.',
  site_change: 'This site changed recently, so TrackMyOPT paused this feature to avoid entering wrong answers. You can still complete the application yourself.',
  incident: 'TrackMyOPT temporarily paused this feature while we fix a problem. You can still complete the application yourself.',
  policy: 'This feature is unavailable on this site. You can still complete the application yourself.',
};

/** Hostname → bundled platform id. Remote config can never add hosts. */
export function platformForHostname(hostname: string): PlatformId {
  const host = hostname.toLowerCase().replace(/\.$/, '');
  const on = (domain: string) => host === domain || host.endsWith(`.${domain}`);
  if (on('myworkdayjobs.com') || on('myworkdaysite.com') || on('myworkday.com')) return 'workday';
  if (on('greenhouse.io') || on('greenhouse.com')) return 'greenhouse';
  if (on('lever.co')) return 'lever';
  if (on('smartrecruiters.com')) return 'smartrecruiters';
  if (on('ashbyhq.com')) return 'ashby';
  if (on('linkedin.com')) return 'linkedin';
  return 'generic';
}

/** Validate a value read back from storage before content scripts trust it. */
export function normalizeEffectiveConfig(value: unknown, fallback: EffectiveExtensionConfig): EffectiveExtensionConfig {
  if (!isRecord(value) || value.version !== 1 || typeof value.ruleVersion !== 'string' ||
      !isRecord(value.detectors) || !isRecord(value.killSwitches)) return fallback;
  const probe = validateRemoteConfig({
    schemaVersion: REMOTE_CONFIG_SCHEMA_VERSION, version: '2000-01-01.1',
    issuedAt: '2000-01-01T00:00:00.000Z', expiresAt: '2000-01-02T00:00:00.000Z',
    killSwitches: value.killSwitches, detectors: Object.fromEntries(Object.entries(value.detectors)
      .map(([id, mode]) => [id, { mode }])), fieldRules: value.fieldRules ?? {},
  });
  if (!probe.ok) return fallback;
  const detectors = { ...fallback.detectors };
  for (const id of DETECTOR_IDS) {
    const mode = probe.config.detectors?.[id]?.mode;
    if (mode) detectors[id] = mode;
  }
  const sources: ConfigSource[] = ['baseline', 'remote', 'remote_expired', 'remote_incompatible'];
  return {
    version: 1,
    source: sources.includes(value.source as ConfigSource) ? value.source as ConfigSource : 'baseline',
    ruleVersion: value.ruleVersion.slice(0, 40),
    killSwitchVersion: typeof value.killSwitchVersion === 'string' ? value.killSwitchVersion.slice(0, 40) : null,
    killSwitches: probe.config.killSwitches,
    detectors,
    fieldRules: probe.config.fieldRules ?? {},
    computedAt: typeof value.computedAt === 'string' ? value.computedAt : fallback.computedAt,
  };
}
