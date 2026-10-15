import { describe, expect, it } from 'vitest';
import { classifyCountry, parsePrivacyRegion, REGION_RULES } from '@/lib/privacy/regions';
import { resolvePrivacyState } from '@/lib/privacy/policy';
import { CONSENT_VERSION } from '@/lib/privacy/consent-storage';
import type { PrivacyRegion, StoredConsent } from '@/lib/privacy/types';

function stored(overrides: Partial<StoredConsent> = {}): StoredConsent {
  return {
    version: CONSENT_VERSION,
    functional: false,
    analytics: false,
    marketing: false,
    region: 'EU_EEA',
    timestamp: new Date().toISOString(),
    method: 'custom',
    ...overrides,
  };
}

const none = { functional: false, analytics: false, marketing: false };
const all = { functional: true, analytics: true, marketing: true };

describe('classifyCountry', () => {
  it.each([
    ['DE', 'EU_EEA'],
    ['fr', 'EU_EEA'],
    ['NO', 'EU_EEA'],
    ['RE', 'EU_EEA'],
    ['GB', 'UK'],
    ['US', 'US'],
    ['IN', 'OTHER'],
    ['CH', 'OTHER'],
    ['PR', 'OTHER'],
    [null, 'UNKNOWN'],
    ['', 'UNKNOWN'],
    ['XX1', 'UNKNOWN'],
  ])('%s → %s', (country, region) => {
    expect(classifyCountry(country)).toBe(region);
  });

  it('accepts only known region names from untrusted input', () => {
    expect(parsePrivacyRegion('eu')).toBe('EU_EEA');
    expect(parsePrivacyRegion('US')).toBe('US');
    expect(parsePrivacyRegion('US; Secure')).toBeNull();
    expect(parsePrivacyRegion(undefined)).toBeNull();
  });
});

describe('resolvePrivacyState', () => {
  it.each<PrivacyRegion>(['EU_EEA', 'UK', 'OTHER', 'UNKNOWN'])(
    '%s without a decision: banner, nothing optional',
    (region) => {
      const state = resolvePrivacyState({ region, stored: null, gpc: false });
      expect(state.consentModel).toBe('opt-in');
      expect(state.needsBanner).toBe(true);
      expect(state.hasDecision).toBe(false);
      expect(state.choices).toEqual(none);
    }
  );

  it('EU accept all enables every optional category', () => {
    const state = resolvePrivacyState({
      region: 'EU_EEA',
      stored: stored({ ...all, method: 'accept_all' }),
      gpc: false,
    });
    expect(state.choices).toEqual(all);
    expect(state.needsBanner).toBe(false);
  });

  it('EU rejection keeps optional categories off without re-asking', () => {
    const state = resolvePrivacyState({
      region: 'EU_EEA',
      stored: stored({ method: 'reject_all' }),
      gpc: false,
    });
    expect(state.choices).toEqual(none);
    expect(state.needsBanner).toBe(false);
    expect(state.hasDecision).toBe(true);
  });

  it('EU analytics-only choice enables only analytics', () => {
    const state = resolvePrivacyState({
      region: 'EU_EEA',
      stored: stored({ analytics: true }),
      gpc: false,
    });
    expect(state.choices).toEqual({ functional: false, analytics: true, marketing: false });
  });

  it('US defaults to opt-out without a banner', () => {
    const state = resolvePrivacyState({ region: 'US', stored: null, gpc: false });
    expect(state.consentModel).toBe('opt-out');
    expect(state.needsBanner).toBe(false);
    expect(state.choices).toEqual(REGION_RULES.US.defaults);
  });

  it('US opt-out of marketing is honored', () => {
    const state = resolvePrivacyState({
      region: 'US',
      stored: stored({ region: 'US', functional: true, analytics: true }),
      gpc: false,
    });
    expect(state.choices.marketing).toBe(false);
    expect(state.choices.analytics).toBe(true);
  });

  it('GPC turns marketing off but leaves other categories alone', () => {
    const us = resolvePrivacyState({ region: 'US', stored: null, gpc: true });
    expect(us.gpc).toBe(true);
    expect(us.choices).toEqual({ functional: true, analytics: true, marketing: false });

    const euAccepted = resolvePrivacyState({
      region: 'EU_EEA',
      stored: stored(all),
      gpc: true,
    });
    expect(euAccepted.choices).toEqual({ functional: true, analytics: true, marketing: false });
  });

  it('GPC disabled leaves a marketing grant in place', () => {
    const state = resolvePrivacyState({ region: 'US', stored: null, gpc: false });
    expect(state.choices.marketing).toBe(true);
  });

  it('an outdated grant is asked again and grants nothing meanwhile', () => {
    const state = resolvePrivacyState({
      region: 'EU_EEA',
      stored: stored({ ...all, version: CONSENT_VERSION - 1 }),
      gpc: false,
    });
    expect(state.needsBanner).toBe(true);
    expect(state.hasDecision).toBe(false);
    expect(state.choices).toEqual(none);
  });

  it('an outdated refusal remains valid', () => {
    const state = resolvePrivacyState({
      region: 'EU_EEA',
      stored: stored({ version: 1 }),
      gpc: false,
    });
    expect(state.needsBanner).toBe(false);
    expect(state.choices).toEqual(none);
  });

  it('an outdated partial decision keeps its opt-outs under US defaults', () => {
    const state = resolvePrivacyState({
      region: 'US',
      stored: stored({ version: 1, analytics: true }),
      gpc: false,
    });
    expect(state.choices).toEqual({ functional: false, analytics: true, marketing: false });
  });
});
