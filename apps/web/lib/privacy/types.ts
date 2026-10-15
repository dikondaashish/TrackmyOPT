/**
 * Shared privacy types. See docs/compliance/PRIVACY_CONSENT_ARCHITECTURE.md.
 */

/** Essential is never stored: it is always on and cannot be refused. */
export type OptionalConsentCategory = 'functional' | 'analytics' | 'marketing';
export type ConsentCategory = 'essential' | OptionalConsentCategory;

export const OPTIONAL_CONSENT_CATEGORIES: readonly OptionalConsentCategory[] = [
  'functional',
  'analytics',
  'marketing',
];

export type ConsentChoices = Record<OptionalConsentCategory, boolean>;

/** Jurisdiction groups. Only the group is exposed to the browser, never the country. */
export type PrivacyRegion = 'EU_EEA' | 'UK' | 'US' | 'OTHER' | 'UNKNOWN';

export const PRIVACY_REGIONS: readonly PrivacyRegion[] = [
  'EU_EEA',
  'UK',
  'US',
  'OTHER',
  'UNKNOWN',
];

/**
 * opt-in: optional categories stay off until the visitor allows them.
 * opt-out: optional categories may run by default; the visitor can turn them off.
 */
export type ConsentModel = 'opt-in' | 'opt-out';

export type ConsentMethod = 'accept_all' | 'reject_all' | 'custom';

/** What is persisted in the consent cookie. Contains no identifiers. */
export interface StoredConsent extends ConsentChoices {
  version: number;
  region: PrivacyRegion;
  /** ISO timestamp of the decision. */
  timestamp: string;
  method: ConsentMethod;
}

export interface PrivacySnapshot {
  /** `pending` on the server and during hydration; nothing optional runs. */
  status: 'pending' | 'ready';
  region: PrivacyRegion;
  consentModel: ConsentModel;
  /** Effective permissions after region defaults, stored choices, and GPC. */
  choices: ConsentChoices;
  /** A stored decision for the current consent version exists. */
  hasDecision: boolean;
  /** Show the first-layer banner (opt-in regions without a current decision). */
  needsBanner: boolean;
  /** The browser sent a Global Privacy Control signal. */
  gpc: boolean;
  settingsOpen: boolean;
}
