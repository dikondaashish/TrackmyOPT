/**
 * Jurisdiction groups and their consent rules — the only place privacy
 * behavior differs by location. Pure module: used by proxy.ts and the browser.
 */

import type {
  ConsentChoices,
  ConsentModel,
  PrivacyRegion,
} from '@/lib/privacy/types';
import { PRIVACY_REGIONS } from '@/lib/privacy/types';

/** EU member states, their ISO-coded outermost regions, and EEA (IS, LI, NO). */
const EU_EEA_COUNTRIES = new Set([
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
  'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
  'SI', 'ES', 'SE',
  // Outermost regions / autonomous areas that carry their own ISO codes.
  'GF', 'GP', 'MQ', 'RE', 'YT', 'MF', 'AX',
  // EEA
  'IS', 'LI', 'NO',
]);

const UK_COUNTRIES = new Set(['GB', 'UK']);

// U.S. territories (PR, GU, VI, AS, MP) are intentionally left in OTHER
// (opt-in) until their rules are reviewed.
const US_COUNTRIES = new Set(['US']);

export interface RegionRule {
  consentModel: ConsentModel;
  /** Show the first-layer banner until the visitor decides. */
  showBanner: boolean;
  /** Effective choices before any decision (GPC is applied on top). */
  defaults: ConsentChoices;
}

const NOTHING_OPTIONAL: ConsentChoices = {
  functional: false,
  analytics: false,
  marketing: false,
};

const OPT_IN: RegionRule = {
  consentModel: 'opt-in',
  showBanner: true,
  defaults: NOTHING_OPTIONAL,
};

/**
 * Unknown and unlisted countries use the opt-in rule, so a missing or
 * unexpected geolocation never results in tracking without permission.
 *
 * LEGAL REVIEW: the U.S. opt-out defaults below have not been reviewed
 * state by state. Change them here only; nothing else encodes region behavior.
 */
export const REGION_RULES: Record<PrivacyRegion, RegionRule> = {
  EU_EEA: OPT_IN,
  UK: OPT_IN,
  US: {
    consentModel: 'opt-out',
    showBanner: false,
    defaults: { functional: true, analytics: true, marketing: true },
  },
  OTHER: OPT_IN,
  UNKNOWN: OPT_IN,
};

/** Map an ISO 3166-1 alpha-2 code (e.g. Vercel's x-vercel-ip-country) to a group. */
export function classifyCountry(country: string | null | undefined): PrivacyRegion {
  const code = country?.trim().toUpperCase();
  if (!code || !/^[A-Z]{2}$/.test(code)) return 'UNKNOWN';
  if (EU_EEA_COUNTRIES.has(code)) return 'EU_EEA';
  if (UK_COUNTRIES.has(code)) return 'UK';
  if (US_COUNTRIES.has(code)) return 'US';
  return 'OTHER';
}

/** Validate an untrusted region value (cookie, query parameter). */
export function parsePrivacyRegion(value: string | null | undefined): PrivacyRegion | null {
  if (!value) return null;
  const normalized = value.trim().toUpperCase();
  if (normalized === 'EU' || normalized === 'EEA') return 'EU_EEA';
  return (PRIVACY_REGIONS as readonly string[]).includes(normalized)
    ? (normalized as PrivacyRegion)
    : null;
}
