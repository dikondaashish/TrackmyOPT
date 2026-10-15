import { afterEach, describe, expect, it } from 'vitest';
import {
  CONSENT_COOKIE,
  CONSENT_VERSION,
  deleteCookiesWithPrefix,
  parseStoredConsent,
  readStoredConsent,
  writeStoredConsent,
} from '@/lib/privacy/consent-storage';

function clearCookies() {
  for (const part of document.cookie.split(';')) {
    const name = part.split('=')[0]?.trim();
    if (name) document.cookie = `${name}=; Path=/; Max-Age=0`;
  }
}

afterEach(() => {
  clearCookies();
  localStorage.clear();
});

describe('consent storage', () => {
  it('round-trips a decision through the first-party cookie', () => {
    writeStoredConsent({ functional: false, analytics: true, marketing: false }, 'EU_EEA', 'custom');
    const record = readStoredConsent();
    expect(record).toMatchObject({
      version: CONSENT_VERSION,
      functional: false,
      analytics: true,
      marketing: false,
      region: 'EU_EEA',
      method: 'custom',
    });
    expect(Number.isNaN(Date.parse(record!.timestamp))).toBe(false);
  });

  it('stores no identifiers, only categories and metadata', () => {
    writeStoredConsent({ functional: true, analytics: true, marketing: true }, 'US', 'accept_all');
    const raw = document.cookie.split('; ').find((c) => c.startsWith(`${CONSENT_COOKIE}=`))!;
    const keys = Object.keys(JSON.parse(decodeURIComponent(raw.split('=')[1]!))).sort();
    expect(keys).toEqual(
      ['analytics', 'functional', 'marketing', 'method', 'region', 'timestamp', 'version'].sort()
    );
  });

  it.each([
    ['not json', '{"version":2'],
    ['wrong types', JSON.stringify({ version: 2, functional: 'yes', analytics: true, marketing: true, region: 'US', timestamp: new Date().toISOString() })],
    ['unknown region', JSON.stringify({ version: 2, functional: true, analytics: true, marketing: true, region: 'MARS', timestamp: new Date().toISOString() })],
    ['expired', JSON.stringify({ version: 2, functional: true, analytics: true, marketing: true, region: 'US', timestamp: '2020-01-01T00:00:00Z' })],
    ['oversized', 'x'.repeat(600)],
  ])('rejects tampered or invalid cookie values: %s', (_label, raw) => {
    expect(parseStoredConsent(raw)).toBeNull();
  });

  it('reads the former banner choice as a version-1 decision', () => {
    localStorage.setItem('trackmyopt_cookie_consent', 'declined');
    localStorage.setItem('trackmyopt_cookie_consent_ts', String(Date.now()));
    expect(readStoredConsent()).toMatchObject({
      version: 1,
      functional: false,
      analytics: false,
      marketing: false,
    });
  });

  it('removes the former localStorage keys once a new decision is saved', () => {
    localStorage.setItem('trackmyopt_cookie_consent', 'accepted');
    localStorage.setItem('trackmyopt_cookie_consent_ts', String(Date.now()));
    writeStoredConsent({ functional: false, analytics: false, marketing: false }, 'UK', 'reject_all');
    expect(localStorage.getItem('trackmyopt_cookie_consent')).toBeNull();
    expect(readStoredConsent()?.version).toBe(CONSENT_VERSION);
  });

  it('expires tracker cookies by prefix without touching auth or consent cookies', () => {
    document.cookie = '_ga=GA1.1.1; Path=/';
    document.cookie = 'ph_phc_test_posthog=x; Path=/';
    document.cookie = 'sb-project-auth-token=keep; Path=/';
    writeStoredConsent({ functional: false, analytics: false, marketing: false }, 'UK', 'reject_all');
    deleteCookiesWithPrefix(['_ga', 'ph_']);
    expect(document.cookie).not.toContain('_ga=');
    expect(document.cookie).not.toContain('ph_phc_test_posthog');
    expect(document.cookie).toContain('sb-project-auth-token=keep');
    expect(document.cookie).toContain(`${CONSENT_COOKIE}=`);
  });
});
