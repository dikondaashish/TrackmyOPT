import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const postHogConsent = vi.hoisted(() => vi.fn());
vi.mock('@/lib/posthog/posthog-browser', () => ({
  setPostHogAnalyticsConsent: postHogConsent,
}));

import {
  acceptAllOptional,
  getPrivacySnapshot,
  hasConsent,
  openPrivacySettings,
  rejectAllOptional,
  resetPrivacyManagerForTests,
  saveConsent,
  startPrivacyManager,
} from '@/lib/privacy/privacy-manager';
import { GA_MEASUREMENT_ID, resetIntegrationsForTests } from '@/lib/privacy/integrations';

type TestWindow = Window & { dataLayer?: IArguments[]; gtag?: unknown } & Record<string, unknown>;
const testWindow = () => window as unknown as TestWindow;

const reload = vi.fn();

function setRegion(region: string) {
  document.cookie = `tmo_privacy_region=${region}; Path=/`;
}

function setGpc(enabled: boolean | undefined) {
  Object.defineProperty(navigator, 'globalPrivacyControl', {
    configurable: true,
    get: () => enabled,
  });
}

function gaScript() {
  return document.getElementById('ga4-script');
}

function lastConsentUpdate() {
  const updates = (testWindow().dataLayer ?? [])
    .map((entry) => Array.from(entry))
    .filter((args) => args[0] === 'consent' && args[1] === 'update');
  return updates.at(-1)?.[2];
}

beforeEach(() => {
  for (const part of document.cookie.split(';')) {
    const name = part.split('=')[0]?.trim();
    if (name) document.cookie = `${name}=; Path=/; Max-Age=0`;
  }
  localStorage.clear();
  document.head.innerHTML = '';
  delete testWindow().dataLayer;
  delete testWindow().gtag;
  delete testWindow()[`ga-disable-${GA_MEASUREMENT_ID}`];
  setGpc(undefined);
  postHogConsent.mockReset();
  reload.mockReset();
  resetIntegrationsForTests();
  resetPrivacyManagerForTests(reload);
});

afterEach(() => {
  setGpc(undefined);
});

describe('privacy manager', () => {
  it('EU visitor with no consent: analytics and marketing are blocked', () => {
    setRegion('EU_EEA');
    startPrivacyManager();
    expect(getPrivacySnapshot().needsBanner).toBe(true);
    expect(hasConsent('analytics')).toBe(false);
    expect(hasConsent('marketing')).toBe(false);
    expect(hasConsent('essential')).toBe(true);
    expect(gaScript()).toBeNull();
    expect(postHogConsent).toHaveBeenCalledWith(false);
    expect(postHogConsent).not.toHaveBeenCalledWith(true);
    expect(lastConsentUpdate()).toEqual({
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
    });
  });

  it('unknown region falls back to the protective rule', () => {
    startPrivacyManager();
    expect(getPrivacySnapshot().region).toBe('UNKNOWN');
    expect(getPrivacySnapshot().needsBanner).toBe(true);
    expect(gaScript()).toBeNull();
  });

  it('EU accept all starts analytics after the decision', () => {
    setRegion('EU_EEA');
    startPrivacyManager();
    acceptAllOptional();
    expect(postHogConsent).toHaveBeenLastCalledWith(true);
    expect(gaScript()?.getAttribute('src')).toContain(GA_MEASUREMENT_ID);
    expect(lastConsentUpdate()).toMatchObject({ analytics_storage: 'granted', ad_storage: 'granted' });
    expect(getPrivacySnapshot().needsBanner).toBe(false);
  });

  it('EU reject keeps optional integrations off and persists', () => {
    setRegion('EU_EEA');
    startPrivacyManager();
    rejectAllOptional();
    expect(gaScript()).toBeNull();
    expect(document.cookie).toContain('tmo_consent=');

    resetPrivacyManagerForTests(reload);
    expect(getPrivacySnapshot().needsBanner).toBe(false);
    expect(hasConsent('analytics')).toBe(false);
  });

  it('EU analytics-only grants analytics but keeps Google ad signals denied', () => {
    setRegion('EU_EEA');
    saveConsent({ functional: false, analytics: true, marketing: false }, 'custom');
    expect(gaScript()).not.toBeNull();
    expect(lastConsentUpdate()).toEqual({
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'granted',
    });
    expect(hasConsent('marketing')).toBe(false);
  });

  it('UK visitor behaves like EU', () => {
    setRegion('UK');
    expect(getPrivacySnapshot().consentModel).toBe('opt-in');
    expect(getPrivacySnapshot().needsBanner).toBe(true);
  });

  it('US visitor: no banner, analytics start by default', () => {
    setRegion('US');
    startPrivacyManager();
    expect(getPrivacySnapshot().needsBanner).toBe(false);
    expect(gaScript()).not.toBeNull();
    expect(postHogConsent).toHaveBeenCalledWith(true);
  });

  it('US visitor with GPC: marketing off, analytics unaffected', () => {
    setRegion('US');
    setGpc(true);
    startPrivacyManager();
    expect(getPrivacySnapshot().gpc).toBe(true);
    expect(hasConsent('marketing')).toBe(false);
    expect(hasConsent('analytics')).toBe(true);
    expect(lastConsentUpdate()).toMatchObject({ ad_storage: 'denied', analytics_storage: 'granted' });
  });

  it('GPC overrides an explicit marketing grant', () => {
    setRegion('EU_EEA');
    setGpc(true);
    acceptAllOptional();
    expect(hasConsent('marketing')).toBe(false);
  });

  it('revoking analytics stops GA and removes first-party analytics cookies', () => {
    setRegion('EU_EEA');
    acceptAllOptional();
    document.cookie = '_ga=GA1.1.123; Path=/';
    saveConsent({ functional: true, analytics: false, marketing: true }, 'custom');
    expect(testWindow()[`ga-disable-${GA_MEASUREMENT_ID}`]).toBe(true);
    expect(document.cookie).not.toContain('_ga=');
    expect(postHogConsent).toHaveBeenLastCalledWith(false);
    expect(reload).not.toHaveBeenCalled();
  });

  it('revoking marketing after AdSense loaded reloads without it', () => {
    setRegion('EU_EEA');
    acceptAllOptional();
    const adsense = document.createElement('script');
    adsense.id = 'adsense-script';
    document.head.appendChild(adsense);
    rejectAllOptional();
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('changing consent later replaces the stored decision', () => {
    setRegion('EU_EEA');
    rejectAllOptional();
    openPrivacySettings();
    expect(getPrivacySnapshot().settingsOpen).toBe(true);
    saveConsent({ functional: true, analytics: true, marketing: false }, 'custom');
    expect(getPrivacySnapshot().settingsOpen).toBe(false);
    resetPrivacyManagerForTests(reload);
    expect(getPrivacySnapshot().choices).toEqual({
      functional: true,
      analytics: true,
      marketing: false,
    });
  });

  it('an outdated stored grant asks again and grants nothing', () => {
    setRegion('EU_EEA');
    localStorage.setItem('trackmyopt_cookie_consent', 'accepted');
    localStorage.setItem('trackmyopt_cookie_consent_ts', String(Date.now()));
    startPrivacyManager();
    expect(getPrivacySnapshot().needsBanner).toBe(true);
    expect(gaScript()).toBeNull();
  });
});
