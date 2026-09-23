import { WEBSITE_URL } from './config.js';
import { getIdToken } from './token-store';

export type VerifiedUnemploymentClock = {
  active: true;
  used: number;
  max: 90 | 150;
  remaining: number;
  phase: 'initial' | 'stem';
};

export type UnemploymentClockSummary = {
  headline: string;
  usage: string;
  phaseLabel: string;
};

export function summarizeUnemploymentClock(
  clock: VerifiedUnemploymentClock,
): UnemploymentClockSummary {
  return {
    headline: `${clock.remaining} days remaining`,
    usage:
      clock.phase === 'stem'
        ? `${clock.used} / ${clock.max} cumulative unemployment days used`
        : `${clock.used} / ${clock.max} unemployment days used`,
    phaseLabel:
      clock.phase === 'stem'
        ? 'STEM OPT cumulative limit'
        : 'Initial OPT limit',
  };
}

export function parseVerifiedUnemploymentClockResponse(value: unknown): VerifiedUnemploymentClock | null {
  if (typeof value !== 'object' || value === null) return null;
  const clock = (
    value as {
      data?: { unemployment_clock?: unknown } | null;
    }
  ).data?.unemployment_clock;
  if (typeof clock !== 'object' || clock === null) return null;
  const candidate = clock as Record<string, unknown>;
  const used = candidate.used;
  const remaining = candidate.remaining;
  const max = candidate.max;
  const phase = candidate.phase;
  if (
    candidate.active !== true ||
    typeof used !== 'number' ||
    typeof remaining !== 'number' ||
    typeof max !== 'number' ||
    !Number.isInteger(used) ||
    used < 0 ||
    !Number.isInteger(remaining) ||
    remaining < 0 ||
    (max !== 90 && max !== 150) ||
    (phase !== 'initial' && phase !== 'stem') ||
    (phase === 'initial' && max !== 90) ||
    (phase === 'stem' && max !== 150) ||
    remaining !== Math.max(0, max - used)
  ) {
    return null;
  }
  return candidate as unknown as VerifiedUnemploymentClock;
}

export async function loadVerifiedUnemploymentClock(): Promise<VerifiedUnemploymentClock | null> {
  const token = await getIdToken();
  const request = async (authorization?: string) => {
    const response = await fetch(`${WEBSITE_URL}/api/opt/calculator`, {
      method: 'GET',
      credentials: authorization ? 'omit' : 'include',
      headers: {
        Accept: 'application/json',
        ...(authorization ? { Authorization: authorization } : {}),
      },
    });
    if (!response.ok) return null;
    return parseVerifiedUnemploymentClockResponse(await response.json());
  };

  if (token) {
    const fromToken = await request(`Bearer ${token}`);
    if (fromToken) return fromToken;
  }
  return request();
}
