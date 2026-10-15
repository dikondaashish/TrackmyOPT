/**
 * Request-time jurisdiction detection for proxy.ts.
 *
 * Vercel adds `x-vercel-ip-country` (ISO 3166-1 alpha-2) to every request and
 * overwrites any client-supplied value. `@vercel/functions` `geolocation()`
 * reads the same header; it is read directly to avoid a dependency for one
 * field. Next.js 15+ no longer provides `request.geo`. Only the coarse group
 * leaves this module: no IP, city, or country is stored or logged.
 */

import type { NextRequest, NextResponse } from 'next/server';
import { PRIVACY_REGION_COOKIE } from '@/lib/privacy/consent-storage';
import { classifyCountry, parsePrivacyRegion } from '@/lib/privacy/regions';
import type { PrivacyRegion } from '@/lib/privacy/types';

export const COUNTRY_HEADER = 'x-vercel-ip-country';
/** Development only: `?privacy_region=EU_EEA|UK|US|OTHER|UNKNOWN`. */
export const REGION_OVERRIDE_PARAM = 'privacy_region';
const REGION_OVERRIDE_COOKIE = 'tmo_privacy_region_override';

const REGION_COOKIE_MAX_AGE_SECONDS = 24 * 60 * 60;

interface RegionDetection {
  region: PrivacyRegion;
  /** Dev override to remember (null clears it); undefined leaves it unchanged. */
  override?: PrivacyRegion | null;
}

function overridesAllowed(): boolean {
  return process.env.NODE_ENV !== 'production';
}

export function detectPrivacyRegion(request: NextRequest): RegionDetection {
  if (overridesAllowed()) {
    const param = request.nextUrl.searchParams.get(REGION_OVERRIDE_PARAM);
    if (param !== null) {
      const region = parsePrivacyRegion(param);
      if (region) return { region, override: region };
      if (param === '' || param.toLowerCase() === 'auto') {
        return { region: classifyCountry(request.headers.get(COUNTRY_HEADER)), override: null };
      }
    }
    const remembered =
      parsePrivacyRegion(request.cookies.get(REGION_OVERRIDE_COOKIE)?.value) ??
      parsePrivacyRegion(process.env.PRIVACY_REGION_OVERRIDE);
    if (remembered) return { region: remembered };
  }
  return { region: classifyCountry(request.headers.get(COUNTRY_HEADER)) };
}

/** Expose the jurisdiction group to the browser when it changed. */
export function applyPrivacyRegionCookie(
  request: NextRequest,
  response: NextResponse,
  detection: RegionDetection
): void {
  const secure = request.nextUrl.protocol === 'https:';
  if (request.cookies.get(PRIVACY_REGION_COOKIE)?.value !== detection.region) {
    response.cookies.set(PRIVACY_REGION_COOKIE, detection.region, {
      path: '/',
      maxAge: REGION_COOKIE_MAX_AGE_SECONDS,
      sameSite: 'lax',
      secure,
      // The client-side consent UI must read it; it carries no secret.
      httpOnly: false,
    });
  }
  if (!overridesAllowed() || detection.override === undefined) return;
  if (detection.override === null) {
    response.cookies.delete(REGION_OVERRIDE_COOKIE);
  } else {
    response.cookies.set(REGION_OVERRIDE_COOKIE, detection.override, {
      path: '/',
      sameSite: 'lax',
      secure,
      httpOnly: true,
    });
  }
}
