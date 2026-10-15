/**
 * Consent persistence. The decision lives in a first-party cookie so it
 * survives navigation and is readable by the client-side consent UI.
 * The cookie is untrusted input: it is validated on every read and never used
 * for authorization.
 */

import type {
  ConsentChoices,
  ConsentMethod,
  PrivacyRegion,
  StoredConsent,
} from '@/lib/privacy/types';
import { parsePrivacyRegion } from '@/lib/privacy/regions';
import { safeStorageGet, safeStorageRemove } from '@/lib/safe-storage';

/**
 * Bump when categories or the services in a category change materially.
 * Older decisions that granted anything are asked again; refusals persist.
 * v1 = the former localStorage "Accept All / Essential Only" banner.
 */
export const CONSENT_VERSION = 2;

export const CONSENT_COOKIE = 'tmo_consent';
/** Set by proxy.ts. Holds only the jurisdiction group, never the country. */
export const PRIVACY_REGION_COOKIE = 'tmo_privacy_region';

const CONSENT_MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

const LEGACY_CONSENT_KEY = 'trackmyopt_cookie_consent';
const LEGACY_CONSENT_TIMESTAMP_KEY = 'trackmyopt_cookie_consent_ts';

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  try {
    for (const part of document.cookie.split(';')) {
      const separator = part.indexOf('=');
      if (separator < 0) continue;
      if (part.slice(0, separator).trim() === name) {
        return decodeURIComponent(part.slice(separator + 1).trim());
      }
    }
  } catch {
    // Cookie access throws in some sandboxed frames; treat as absent.
  }
  return null;
}

/** Validate a decoded cookie value. Returns null for anything malformed. */
export function parseStoredConsent(raw: string | null): StoredConsent | null {
  if (!raw || raw.length > 512) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const region = parsePrivacyRegion(
    typeof record.region === 'string' ? record.region : null
  );
  const timestamp = typeof record.timestamp === 'string' ? record.timestamp : '';
  const time = Date.parse(timestamp);
  if (
    !Number.isInteger(record.version) ||
    typeof record.functional !== 'boolean' ||
    typeof record.analytics !== 'boolean' ||
    typeof record.marketing !== 'boolean' ||
    !region ||
    Number.isNaN(time) ||
    Date.now() - time > CONSENT_MAX_AGE_SECONDS * 1000
  ) {
    return null;
  }
  const method = record.method;
  return {
    version: record.version as number,
    functional: record.functional,
    analytics: record.analytics,
    marketing: record.marketing,
    region,
    timestamp,
    method:
      method === 'accept_all' || method === 'reject_all' || method === 'custom'
        ? method
        : 'custom',
  };
}

/** The former binary banner, read so earlier refusals keep applying. */
function readLegacyConsent(): StoredConsent | null {
  const status = safeStorageGet(LEGACY_CONSENT_KEY);
  const time = Number.parseInt(safeStorageGet(LEGACY_CONSENT_TIMESTAMP_KEY) ?? '', 10);
  if ((status !== 'accepted' && status !== 'declined') || !Number.isFinite(time)) {
    return null;
  }
  if (Date.now() - time > CONSENT_MAX_AGE_SECONDS * 1000) return null;
  const granted = status === 'accepted';
  return {
    version: 1,
    functional: granted,
    analytics: granted,
    marketing: granted,
    region: 'UNKNOWN',
    timestamp: new Date(time).toISOString(),
    method: granted ? 'accept_all' : 'reject_all',
  };
}

export function readStoredConsent(): StoredConsent | null {
  return parseStoredConsent(readCookie(CONSENT_COOKIE)) ?? readLegacyConsent();
}

export function readRegionCookie(): PrivacyRegion | null {
  return parsePrivacyRegion(readCookie(PRIVACY_REGION_COOKIE));
}

function secureAttribute(): string {
  return typeof location !== 'undefined' && location.protocol === 'https:'
    ? '; Secure'
    : '';
}

/** Returns the record that was written (also kept in memory if cookies are blocked). */
export function writeStoredConsent(
  choices: ConsentChoices,
  region: PrivacyRegion,
  method: ConsentMethod
): StoredConsent {
  const record: StoredConsent = {
    version: CONSENT_VERSION,
    functional: choices.functional,
    analytics: choices.analytics,
    marketing: choices.marketing,
    region,
    timestamp: new Date().toISOString(),
    method,
  };
  if (typeof document !== 'undefined') {
    try {
      document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(
        JSON.stringify(record)
      )}; Path=/; Max-Age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax${secureAttribute()}`;
    } catch {
      // Storage blocked: the choice still applies for this page session.
    }
  }
  safeStorageRemove(LEGACY_CONSENT_KEY);
  safeStorageRemove(LEGACY_CONSENT_TIMESTAMP_KEY);
  return record;
}

/** Expire first-party cookies set by a tracker that was just turned off. */
export function deleteCookiesWithPrefix(prefixes: readonly string[]): void {
  if (typeof document === 'undefined') return;
  try {
    const names = document.cookie
      .split(';')
      .map((part) => part.split('=')[0]?.trim() ?? '')
      .filter((name) => prefixes.some((prefix) => name.startsWith(prefix)));
    if (names.length === 0) return;
    // Trackers often scope cookies to the registrable domain (.example.com).
    const labels = location.hostname.split('.');
    const domains = [''];
    for (let i = 0; i < labels.length - 1; i += 1) {
      domains.push(`; Domain=.${labels.slice(i).join('.')}`);
    }
    for (const name of names) {
      for (const domain of domains) {
        document.cookie = `${name}=; Path=/; Max-Age=0${domain}`;
      }
    }
  } catch {
    // Best effort: cookies the browser will not let us touch expire on their own.
  }
}
