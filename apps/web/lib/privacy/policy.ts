/**
 * Pure consent decision: region rule + stored decision + GPC → effective
 * permissions. No browser access, so every case is unit-testable.
 */

import { REGION_RULES } from '@/lib/privacy/regions';
import { CONSENT_VERSION } from '@/lib/privacy/consent-storage';
import type {
  ConsentChoices,
  PrivacyRegion,
  PrivacySnapshot,
  StoredConsent,
} from '@/lib/privacy/types';
import { OPTIONAL_CONSENT_CATEGORIES } from '@/lib/privacy/types';

export const NO_OPTIONAL_CONSENT: ConsentChoices = {
  functional: false,
  analytics: false,
  marketing: false,
};

/** Rendered on the server and during hydration: nothing optional runs. */
export const PENDING_PRIVACY_SNAPSHOT: PrivacySnapshot = {
  status: 'pending',
  region: 'UNKNOWN',
  consentModel: 'opt-in',
  choices: NO_OPTIONAL_CONSENT,
  hasDecision: false,
  needsBanner: false,
  gpc: false,
  settingsOpen: false,
};

function grantsAnything(record: StoredConsent): boolean {
  return OPTIONAL_CONSENT_CATEGORIES.some((category) => record[category]);
}

/**
 * GPC is an opt-out of sale/sharing and targeted advertising. It only ever
 * removes the marketing category; it never affects essential technology.
 */
export function applyGlobalPrivacyControl(
  choices: ConsentChoices,
  gpc: boolean
): ConsentChoices {
  return gpc ? { ...choices, marketing: false } : choices;
}

export function resolvePrivacyState(input: {
  region: PrivacyRegion;
  stored: StoredConsent | null;
  gpc: boolean;
}): Omit<PrivacySnapshot, 'settingsOpen'> {
  const rule = REGION_RULES[input.region];
  const stored = input.stored;
  // A refusal is valid under any version; a grant must match the current one.
  const current =
    stored && (stored.version === CONSENT_VERSION || !grantsAnything(stored))
      ? stored
      : null;

  let choices: ConsentChoices;
  if (current) {
    choices = {
      functional: current.functional,
      analytics: current.analytics,
      marketing: current.marketing,
    };
  } else {
    // Outdated decision: earlier opt-outs still apply, earlier grants do not.
    choices = { ...rule.defaults };
    if (stored) {
      for (const category of OPTIONAL_CONSENT_CATEGORIES) {
        if (!stored[category]) choices[category] = false;
      }
    }
  }

  return {
    status: 'ready',
    region: input.region,
    consentModel: rule.consentModel,
    choices: applyGlobalPrivacyControl(choices, input.gpc),
    hasDecision: current !== null,
    needsBanner: rule.showBanner && current === null,
    gpc: input.gpc,
  };
}
