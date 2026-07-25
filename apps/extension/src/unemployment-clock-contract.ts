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

function parseClockResponse(value: unknown): VerifiedUnemploymentClock | null {
  if (typeof value !== 'object' || value === null) return null;
  const clock = (
    value as {
      data?: { unemployment_clock?: unknown } | null;
    }
  ).data?.unemployment_clock;
  if (typeof clock !== 'object' || clock === null) return null;
  const candidate = clock as Record<string, unknown>;
  if (
    candidate.active !== true ||
    !Number.isFinite(candidate.used) ||
    !Number.isFinite(candidate.remaining) ||
    (candidate.max !== 90 && candidate.max !== 150) ||
    (candidate.phase !== 'initial' && candidate.phase !== 'stem')
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
    return parseClockResponse(await response.json());
  };

  if (token) {
    const fromToken = await request(`Bearer ${token}`);
    if (fromToken) return fromToken;
  }
  return request();
}
