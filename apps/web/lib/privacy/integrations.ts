/**
 * Script controller: the only code that starts or stops non-essential
 * browser integrations. The privacy manager calls `applyIntegrations` with the
 * effective permissions; nothing here runs before that call.
 *
 * Vercel Web Analytics / Speed Insights are React components and are gated in
 * components/privacy/PrivacyProvider.tsx. AdSense units render through
 * components/blog/AdSenseInArticle.tsx only while marketing is allowed.
 */

import { setPostHogAnalyticsConsent } from '@/lib/posthog/posthog-browser';
import { deleteCookiesWithPrefix } from '@/lib/privacy/consent-storage';
import type { ConsentChoices } from '@/lib/privacy/types';

/** Public measurement ID; set NEXT_PUBLIC_GA_MEASUREMENT_ID to override. */
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || 'G-SC3M6PN10V';

const GA_SCRIPT_ID = 'ga4-script';
const ADSENSE_SCRIPT_ID = 'adsense-script';
/** First-party cookies the providers set on our domain. */
const ANALYTICS_COOKIE_PREFIXES = ['_ga', '_gid', '_gat', 'ph_'] as const;
const MARKETING_COOKIE_PREFIXES = ['__gads', '__gpi', '__eoi'] as const;

type GoogleWindow = Window & {
  gtag?: (...args: unknown[]) => void;
  dataLayer?: unknown[];
};

let googleConsentDefaulted = false;
let analyticsStarted = false;

function gtag(...args: unknown[]): void {
  const googleWindow = window as GoogleWindow;
  googleWindow.dataLayer ??= [];
  googleWindow.gtag ??= function () {
    // gtag's queue expects Arguments objects, not ordinary arrays.
    // eslint-disable-next-line prefer-rest-params
    googleWindow.dataLayer!.push(arguments);
  };
  googleWindow.gtag(...args);
}

/** Google Consent Mode v2: denied by default, updated from our categories. */
function updateGoogleConsent(choices: ConsentChoices): void {
  const state = (granted: boolean) => (granted ? 'granted' : 'denied');
  if (!googleConsentDefaulted) {
    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    });
    googleConsentDefaulted = true;
  }
  gtag('consent', 'update', {
    ad_storage: state(choices.marketing),
    ad_user_data: state(choices.marketing),
    ad_personalization: state(choices.marketing),
    analytics_storage: state(choices.analytics),
  });
}

function setGoogleAnalyticsDisabled(disabled: boolean): void {
  // Google's documented per-property opt-out flag; stops gtag hits immediately.
  (window as unknown as Record<string, unknown>)[`ga-disable-${GA_MEASUREMENT_ID}`] =
    disabled;
}

function loadGoogleAnalytics(): void {
  setGoogleAnalyticsDisabled(false);
  if (document.getElementById(GA_SCRIPT_ID)) return;
  try {
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID);
    const script = document.createElement('script');
    script.id = GA_SCRIPT_ID;
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  } catch (error) {
    // Blocked by extensions or networks; expected, so not reported.
    console.warn('Third-party init failed: GA4', error);
  }
}

/** PostHog mirrors its identity cookie in localStorage (`ph_<token>_posthog`). */
function removePostHogLocalStorage(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (key?.startsWith('ph_')) keys.push(key);
    }
    keys.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Storage unavailable: nothing was persisted there.
  }
}

export interface IntegrationResult {
  /** A loaded script cannot be stopped in place; reload to finish revoking. */
  reloadRequired: boolean;
}

export function applyIntegrations(choices: ConsentChoices): IntegrationResult {
  if (typeof window === 'undefined') return { reloadRequired: false };

  updateGoogleConsent(choices);

  try {
    setPostHogAnalyticsConsent(choices.analytics);
  } catch (error) {
    console.warn('Third-party init failed: PostHog consent', error);
  }

  if (choices.analytics) {
    loadGoogleAnalytics();
    analyticsStarted = true;
  } else if (analyticsStarted) {
    setGoogleAnalyticsDisabled(true);
    deleteCookiesWithPrefix(ANALYTICS_COOKIE_PREFIXES);
    removePostHogLocalStorage();
    analyticsStarted = false;
  }

  let reloadRequired = false;
  if (!choices.marketing) {
    // AdSense (and any Auto ads configured in its console) keeps running once
    // its script is in the page, so a refusal reloads without it.
    reloadRequired = document.getElementById(ADSENSE_SCRIPT_ID) !== null;
    deleteCookiesWithPrefix(MARKETING_COOKIE_PREFIXES);
  }
  return { reloadRequired };
}

/** Test-only reset of module state. */
export function resetIntegrationsForTests(): void {
  googleConsentDefaulted = false;
  analyticsStarted = false;
}
